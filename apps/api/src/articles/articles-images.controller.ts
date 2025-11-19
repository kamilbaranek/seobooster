import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { GENERATE_ARTICLE_IMAGE_QUEUE, GenerateArticleImageJob } from '@seobooster/queue-types';

@Controller('webs/:webId/articles/:articleId/images')
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
          orderBy: [{ isFeatured: 'desc' }, { position: 'asc' }]
        }
      }
    });

    if (!article || article.web.userId !== req.user.id) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    const limit = article.web.subscription?.imageGenerationLimit ?? 1;
    const generatedCount = article.images.filter((img) => img.status !== 'FAILED').length;

    return {
      images: article.images,
      limit,
      generated: generatedCount,
      remaining: Math.max(0, limit - generatedCount)
    };
  }

  // POST /api/articles/:articleId/images/generate
  @Post('generate')
  async generateImage(@Param('articleId') articleId: string, @Req() req: any, @Body() body: { force?: boolean } = {}) {
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
      throw new HttpException(`Image generation limit reached (${limit} images per article)`, HttpStatus.TOO_MANY_REQUESTS);
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
