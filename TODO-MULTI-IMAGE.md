# TODO: Multi-Image Generation System Implementation

## ✅ Completed
- [x] DB Schema: ArticleImage model created
- [x] DB Schema: Subscription.imageGenerationLimit added (default: 1)
- [x] Prisma client generated with new models
- [x] Schema changes committed and pushed

## 🔴 Critical - Must be done first

### 1. Run Database Migration on Server
```bash
# SSH to production server
ssh your-server

# Navigate to project
cd /var/www/seobooster

# Run migration
npx prisma migrate dev --name add_article_images_and_subscription_limit

# OR if that fails, manually apply SQL:
# See MIGRATION.sql file below
```

### 2. Update Worker - Article Image Generation Handler
**File:** `apps/worker/src/main.ts` (line ~1197-1350)

**Changes needed:**
```typescript
// REMOVE these lines (1230-1236):
if (article.featuredImageUrl && !job.data.force) {
  logger.info({ jobId: job.id, articleId: article.id },
    'Article already has featured image; skipping generation');
  return;
}

// ADD limit check:
const subscription = await prisma.subscription.findUnique({
  where: { id: article.web.subscriptionId },
  select: { imageGenerationLimit: true }
});

const existingImagesCount = await prisma.articleImage.count({
  where: {
    articleId: article.id,
    status: { in: ['PENDING', 'SUCCESS'] }
  }
});

if (existingImagesCount >= (subscription?.imageGenerationLimit ?? 1) && !job.data.force) {
  logger.info(
    { jobId: job.id, articleId: article.id, limit: subscription?.imageGenerationLimit },
    'Image generation limit reached'
  );
  return;
}

// CHANGE: Instead of updating Article.featuredImageUrl
// CREATE ArticleImage record:
const position = await prisma.articleImage.count({
  where: { articleId: article.id }
});

const articleImage = await prisma.articleImage.create({
  data: {
    articleId: article.id,
    status: 'PENDING',
    prompt: renderedPrompts.userPrompt,
    provider: providerName,
    model: modelName,
    position,
    isFeatured: existingImagesCount === 0 // First image is featured
  }
});

// After successful generation:
try {
  const publicUrl = await assetStorage.saveFile(
    buildArticleImagePath(article.web.id, article.id, articleImage.id),
    imageResult.data,
    imageResult.mimeType
  );

  await prisma.articleImage.update({
    where: { id: articleImage.id },
    data: {
      status: 'SUCCESS',
      imageUrl: publicUrl
    }
  });

  // Update Article.featuredImageUrl if this is featured
  if (articleImage.isFeatured) {
    await prisma.article.update({
      where: { id: article.id },
      data: { featuredImageUrl: publicUrl }
    });
  }

  logger.info({
    jobId: job.id,
    articleId: article.id,
    imageId: articleImage.id,
    imageUrl: publicUrl
  }, 'Article image generated successfully');

} catch (error) {
  await prisma.articleImage.update({
    where: { id: articleImage.id },
    data: {
      status: 'FAILED',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    }
  });
  throw error;
}
```

**Also update storage path helper:**
```typescript
// Add new function near buildFaviconPath (~line 150)
const buildArticleImagePath = (webId: string, articleId: string, imageId: string) => {
  return `webs/${webId}/articles/${articleId}/images/${imageId}.jpg`;
};
```

## 🟡 High Priority - API Layer

### 3. Create ArticlesImagesController
**File:** `apps/api/src/articles/articles-images.controller.ts` (new file)

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { GENERATE_ARTICLE_IMAGE_QUEUE, GenerateArticleImageJob } from '@seobooster/queue-types';

@Controller('articles/:articleId/images')
@UseGuards(JwtAuthGuard)
export class ArticlesImagesController {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(GENERATE_ARTICLE_IMAGE_QUEUE)
    private readonly imageQueue: Queue<GenerateArticleImageJob>
  ) {}

  // GET /api/articles/:articleId/images
  @Get()
  async listImages(@Param('articleId') articleId: string, @Req() req: any) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: {
        web: {
          include: { subscription: { select: { imageGenerationLimit: true } } }
        },
        images: {
          orderBy: [
            { isFeatured: 'desc' },
            { position: 'asc' }
          ]
        }
      }
    });

    if (!article || article.web.userId !== req.user.id) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    return {
      images: article.images,
      limit: article.web.subscription?.imageGenerationLimit ?? 1,
      remaining: Math.max(0, (article.web.subscription?.imageGenerationLimit ?? 1) - article.images.filter(img => img.status !== 'FAILED').length)
    };
  }

  // POST /api/articles/:articleId/images/generate
  @Post('generate')
  async generateImage(@Param('articleId') articleId: string, @Req() req: any, @Body() body: { force?: boolean }) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: {
        web: {
          include: { subscription: { select: { imageGenerationLimit: true } } }
        },
        images: {
          where: { status: { in: ['PENDING', 'SUCCESS'] } }
        }
      }
    });

    if (!article || article.web.userId !== req.user.id) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    const limit = article.web.subscription?.imageGenerationLimit ?? 1;
    if (article.images.length >= limit && !body.force) {
      throw new HttpException(
        `Image generation limit reached (${limit} images per article)`,
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    await this.imageQueue.add('generate-image', {
      articleId,
      force: body.force ?? false
    });

    return { success: true, message: 'Image generation queued' };
  }

  // PATCH /api/articles/:articleId/images/:imageId/featured
  @Patch(':imageId/featured')
  async setFeatured(@Param('articleId') articleId: string, @Param('imageId') imageId: string, @Req() req: any) {
    const image = await this.prisma.articleImage.findUnique({
      where: { id: imageId },
      include: { article: { include: { web: true } } }
    });

    if (!image || image.articleId !== articleId || image.article.web.userId !== req.user.id) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }

    if (image.status !== 'SUCCESS') {
      throw new HttpException('Cannot set failed/pending image as featured', HttpStatus.BAD_REQUEST);
    }

    // Unset all other featured images for this article
    await this.prisma.articleImage.updateMany({
      where: { articleId, isFeatured: true },
      data: { isFeatured: false }
    });

    // Set this image as featured
    await this.prisma.articleImage.update({
      where: { id: imageId },
      data: { isFeatured: true }
    });

    // Update Article.featuredImageUrl
    await this.prisma.article.update({
      where: { id: articleId },
      data: { featuredImageUrl: image.imageUrl }
    });

    return { success: true };
  }

  // DELETE /api/articles/:articleId/images/:imageId
  @Delete(':imageId')
  async deleteImage(@Param('articleId') articleId: string, @Param('imageId') imageId: string, @Req() req: any) {
    const image = await this.prisma.articleImage.findUnique({
      where: { id: imageId },
      include: { article: { include: { web: true } } }
    });

    if (!image || image.articleId !== articleId || image.article.web.userId !== req.user.id) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }

    if (image.isFeatured) {
      throw new HttpException('Cannot delete featured image. Set another image as featured first.', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.articleImage.delete({
      where: { id: imageId }
    });

    return { success: true };
  }
}
```

### 4. Register Controller in ArticlesModule
**File:** `apps/api/src/articles/articles.module.ts`

```typescript
import { ArticlesImagesController } from './articles-images.controller';

@Module({
  controllers: [ArticlesController, ArticlesImagesController],
  // ...
})
```

## 🟢 Medium Priority - Frontend

### 5. Update Article Detail Page
**File:** `apps/web/pages/webs/[id]/articles/[articleId].tsx` (or similar)

Add images section with:
- Grid of images with status badges
- Generate button with limit display
- Featured star toggle
- Delete button
- Polling for PENDING images (every 5s)

Example component structure:
```tsx
<section className="article-images">
  <div className="header">
    <h3>Obrázky článku</h3>
    <div className="limit-info">
      {generatedCount} / {limit} vygenerováno
    </div>
  </div>

  <div className="images-grid">
    {images.map(img => (
      <ImageCard
        key={img.id}
        image={img}
        onSetFeatured={() => setFeatured(img.id)}
        onDelete={() => deleteImage(img.id)}
      />
    ))}
  </div>

  <button
    disabled={generatedCount >= limit}
    onClick={handleGenerate}
  >
    {generatedCount >= limit
      ? 'Limit vyčerpán'
      : 'Vygenerovat další obrázek'
    }
  </button>
</section>
```

## 📝 Migration SQL (if auto-migration fails)

```sql
-- Add imageGenerationLimit to Subscription
ALTER TABLE "Subscription"
ADD COLUMN "imageGenerationLimit" INTEGER NOT NULL DEFAULT 1;

-- Create ArticleImage table
CREATE TABLE "ArticleImage" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "status" "AssetStatus" NOT NULL DEFAULT 'PENDING',
    "imageUrl" TEXT,
    "prompt" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "provider" TEXT,
    "model" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleImage_pkey" PRIMARY KEY ("id")
);

-- Add foreign key
ALTER TABLE "ArticleImage" ADD CONSTRAINT "ArticleImage_articleId_fkey"
FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add indexes
CREATE INDEX "ArticleImage_articleId_idx" ON "ArticleImage"("articleId");
CREATE INDEX "ArticleImage_articleId_isFeatured_idx" ON "ArticleImage"("articleId", "isFeatured");
CREATE INDEX "ArticleImage_articleId_position_idx" ON "ArticleImage"("articleId", "position");
```

## 🎯 Testing Checklist

- [ ] Run migration on server successfully
- [ ] Generate first image for article (should auto-set as featured)
- [ ] Generate second image (should respect limit if limit=1)
- [ ] Change featured image selection
- [ ] Delete non-featured image
- [ ] Try to delete featured image (should fail)
- [ ] UI polling updates status in real-time
- [ ] Limit counter displays correctly
- [ ] Generate button disables at limit

## 📚 Notes

- Limit is subscription-based, can be 1/3/5 based on tier
- First successful image auto-sets as featured
- Featured image updates Article.featuredImageUrl for WordPress compatibility
- CASCADE delete ensures orphaned images are removed
- Position field allows custom ordering in future
