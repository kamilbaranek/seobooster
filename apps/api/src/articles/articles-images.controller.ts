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

  // GET /api/webs/:webId/articles/:articleId/images
  @Get()
  async listImages(
    @Param('webId') webId: string,
    @Param('articleId') articleId: string,
    @Req() req: any
  ) {
    // Verify user owns the web
    const web = await this.prisma.web.findFirst({
      where: { id: webId, userId: req.user.id }
    });
    if (!web) {
      throw new HttpException('Website not found', HttpStatus.NOT_FOUND);
    }

    const article = await this.prisma.article.findFirst({
      where: { id: articleId, webId },
      include: {
        web: {
          include: { subscription: { select: { imageGenerationLimit: true } } }
        },
        images: {
          orderBy: [{ isFeatured: 'desc' }, { position: 'asc' }]
        }
      }
    });

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    const limit = article.web.subscription?.imageGenerationLimit ?? 3;
    const generatedCount = article.images.filter((img) => img.status !== 'FAILED').length;

    return {
      images: article.images,
      limit,
      generated: generatedCount,
      remaining: Math.max(0, limit - generatedCount)
    };
  }

  // POST /api/webs/:webId/articles/:articleId/images/generate
  @Post('generate')
  async generateImage(
    @Param('webId') webId: string,
    @Param('articleId') articleId: string,
    @Req() req: any,
    @Body() body: { force?: boolean } = {}
  ) {
    // Verify user owns the web
    const web = await this.prisma.web.findFirst({
      where: { id: webId, userId: req.user.id }
    });
    if (!web) {
      throw new HttpException('Website not found', HttpStatus.NOT_FOUND);
    }

    const article = await this.prisma.article.findFirst({
      where: { id: articleId, webId },
      include: {
        web: {
          include: { subscription: { select: { imageGenerationLimit: true } } }
        },
        images: {
          where: { status: { in: ['PENDING', 'SUCCESS'] } }
        }
      }
    });

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    const limit = article.web.subscription?.imageGenerationLimit ?? 3;
    if (article.images.length >= limit && !body.force) {
      throw new HttpException(`Image generation limit reached (${limit} images per article)`, HttpStatus.TOO_MANY_REQUESTS);
    }

    // Create ArticleImage record with PENDING status
    const position = article.images.length;
    const newImage = await this.prisma.articleImage.create({
      data: {
        articleId,
        status: 'PENDING',
        prompt: '', // Will be set by worker
        position,
        isFeatured: article.images.length === 0 // First image is featured
      }
    });

    // Queue the generation job
    await this.imageQueue.add('generate-image', {
      articleId,
      force: body.force ?? false,
      imageId: newImage.id
    });

    return { success: true, image: newImage };
  }

  // PATCH /api/webs/:webId/articles/:articleId/images/:imageId/featured
  @Patch(':imageId/featured')
  async setFeatured(
    @Param('webId') webId: string,
    @Param('articleId') articleId: string,
    @Param('imageId') imageId: string,
    @Req() req: any
  ) {
    // Verify user owns the web
    const web = await this.prisma.web.findFirst({
      where: { id: webId, userId: req.user.id }
    });
    if (!web) {
      throw new HttpException('Website not found', HttpStatus.NOT_FOUND);
    }

    const image = await this.prisma.articleImage.findFirst({
      where: { id: imageId, articleId },
      include: { article: true }
    });

    if (!image || image.article.webId !== webId) {
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

  // DELETE /api/webs/:webId/articles/:articleId/images/:imageId
  @Delete(':imageId')
  async deleteImage(
    @Param('webId') webId: string,
    @Param('articleId') articleId: string,
    @Param('imageId') imageId: string,
    @Req() req: any
  ) {
    // Verify user owns the web
    const web = await this.prisma.web.findFirst({
      where: { id: webId, userId: req.user.id }
    });
    if (!web) {
      throw new HttpException('Website not found', HttpStatus.NOT_FOUND);
    }

    const image = await this.prisma.articleImage.findFirst({
      where: { id: imageId, articleId },
      include: { article: true }
    });

    if (!image || image.article.webId !== webId) {
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
