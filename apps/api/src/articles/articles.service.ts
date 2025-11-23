import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IntegrationType, Prisma, WebWordpressAuthor, WebWordpressCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../crypto/encryption.service';
import { ArticleListQueryDto } from './dto/article-list-query.dto';
import { ArticleMetadataDto } from './dto/article-metadata.dto';
import { WordpressDefaultsDto } from './dto/wordpress-defaults.dto';
import { JobQueueService } from '../queues/queues.service';
import {
  WordpressAuthor,
  WordpressCategory,
  WordpressClientError,
  WordpressCredentials,
  fetchAuthors,
  fetchCategories
} from '@seobooster/wp-client';

type ArticleWithWordpressRelations = Prisma.ArticleGetPayload<{
  include: {
    wordpressCategory: true;
    wordpressAuthor: true;
    images: true;
  };
}>;

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly jobQueueService: JobQueueService
  ) {}

  async listArticles(userId: string, webId: string, query: ArticleListQueryDto) {
    await this.ensureWebOwnedByUser(userId, webId);

    const where: Prisma.ArticleWhereInput = { webId };
    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }

    const page = Math.max(query.page ?? 1, 1);
    const take = Math.min(query.limit ?? 20, 100);

    const articlePromise = this.prisma.article.findMany({
      where,
      include: {
        wordpressCategory: true,
        wordpressAuthor: true,
        images: {
          orderBy: { position: 'asc' },
          select: {
            imageUrl: true,
            isFeatured: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * take,
      take
    });
    const [total, articles] = await Promise.all([this.prisma.article.count({ where }), articlePromise]);
    const normalizedArticles = articles as ArticleWithWordpressRelations[];

    return {
      items: normalizedArticles.map((article) => this.mapArticleListItem(article)),
      page,
      limit: take,
      total
    };
  }

  async getArticle(userId: string, webId: string, articleId: string) {
    await this.ensureWebOwnedByUser(userId, webId);
    const article = (await this.prisma.article.findFirst({
      where: { id: articleId, webId },
      include: {
        wordpressCategory: true,
        wordpressAuthor: true
      }
    })) as ArticleWithWordpressRelations | null;
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return this.mapArticleDetail(article);
  }

  async updateArticleMetadata(userId: string, webId: string, articleId: string, dto: ArticleMetadataDto) {
    await this.ensureWebOwnedByUser(userId, webId);
    const article = await this.prisma.article.findFirst({ where: { id: articleId, webId } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const data: Prisma.ArticleUpdateInput = {};
    if (Object.prototype.hasOwnProperty.call(dto, 'wordpressCategoryId')) {
      if (dto.wordpressCategoryId) {
        await this.ensureCategoryBelongsToWeb(webId, dto.wordpressCategoryId);
        data.wordpressCategory = {
          connect: { id: dto.wordpressCategoryId }
        };
      } else {
        data.wordpressCategory = {
          disconnect: true
        };
      }
    }
    if (Object.prototype.hasOwnProperty.call(dto, 'wordpressAuthorId')) {
      if (dto.wordpressAuthorId) {
        await this.ensureAuthorBelongsToWeb(webId, dto.wordpressAuthorId);
        data.wordpressAuthor = {
          connect: { id: dto.wordpressAuthorId }
        };
      } else {
        data.wordpressAuthor = {
          disconnect: true
        };
      }
    }
    if (Object.prototype.hasOwnProperty.call(dto, 'tags')) {
      if (dto.tags) {
        data.tags = dto.tags as Prisma.InputJsonValue;
      } else {
        data.tags = [];
      }
    }

    await this.prisma.article.update({ where: { id: article.id }, data });
    return this.getArticle(userId, webId, articleId);
  }

  async enqueueArticleImage(userId: string, webId: string, articleId: string, force = false) {
    await this.ensureWebOwnedByUser(userId, webId);
    const article = await this.prisma.article.findFirst({ where: { id: articleId, webId } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    await this.jobQueueService.enqueueGenerateArticleImage(article.id, force);
    return { queued: true };
  }

  async getWordpressMetadata(userId: string, webId: string) {
    const web = await this.prisma.web.findFirst({
      where: { id: webId, userId },
      include: {
        wordpressCategories: {
          orderBy: { name: 'asc' }
        },
        wordpressAuthors: {
          orderBy: { name: 'asc' }
        }
      }
    });
    if (!web) {
      throw new NotFoundException('Website not found');
    }
    return this.mapWordpressMetadata(web);
  }

  async refreshWordpressMetadata(userId: string, webId: string) {
    const web = await this.prisma.web.findFirst({
      where: { id: webId, userId },
      include: { credentials: true }
    });
    if (!web) {
      throw new NotFoundException('Website not found');
    }
    if (web.integrationType !== IntegrationType.WORDPRESS_APPLICATION_PASSWORD) {
      throw new BadRequestException('WordPress integration is not enabled for this website.');
    }
    if (!web.credentials) {
      throw new BadRequestException('WordPress credentials are not configured.');
    }
    const credentials = this.parseWordpressCredentials(web.credentials.encryptedJson);

    let categories: WordpressCategory[];
    let authors: WordpressAuthor[];
    try {
      [categories, authors] = await Promise.all([
        fetchCategories(credentials),
        fetchAuthors(credentials)
      ]);
    } catch (error) {
      if (error instanceof WordpressClientError) {
        const details =
          typeof error.responseBody === 'string'
            ? error.responseBody
            : JSON.stringify(error.responseBody);
        throw new BadRequestException(
          `Failed to load metadata from WordPress (status ${error.status}): ${details}`
        );
      }
      throw new BadRequestException('Failed to load metadata from WordPress.');
    }

    await this.prisma.$transaction([
      ...categories.map((category) =>
        this.prisma.webWordpressCategory.upsert({
          where: {
            webId_remoteId: { webId: web.id, remoteId: category.id }
          },
          update: {
            name: category.name,
            slug: category.slug ?? null
          },
          create: {
            webId: web.id,
            remoteId: category.id,
            name: category.name,
            slug: category.slug ?? null
          }
        })
      ),
      ...authors.map((author) =>
        this.prisma.webWordpressAuthor.upsert({
          where: {
            webId_remoteId: { webId: web.id, remoteId: author.id }
          },
          update: {
            name: author.name,
            slug: author.slug ?? null
          },
          create: {
            webId: web.id,
            remoteId: author.id,
            name: author.name,
            slug: author.slug ?? null
          }
        })
      )
    ]);

    return this.getWordpressMetadata(userId, webId);
  }

  async updateWordpressDefaults(userId: string, webId: string, dto: WordpressDefaultsDto) {
    const web = await this.ensureWebOwnedByUser(userId, webId);
    const data: Prisma.WebUpdateInput = {};
    if (dto.defaultCategoryId !== undefined) {
      if (dto.defaultCategoryId) {
        await this.ensureCategoryBelongsToWeb(webId, dto.defaultCategoryId);
        data.defaultWordpressCategory = {
          connect: { id: dto.defaultCategoryId }
        };
      } else {
        data.defaultWordpressCategory = {
          disconnect: true
        };
      }
    }
    if (dto.defaultAuthorId !== undefined) {
      if (dto.defaultAuthorId) {
        await this.ensureAuthorBelongsToWeb(webId, dto.defaultAuthorId);
        data.defaultWordpressAuthor = {
          connect: { id: dto.defaultAuthorId }
        };
      } else {
        data.defaultWordpressAuthor = {
          disconnect: true
        };
      }
    }
    if (dto.tagsMode !== undefined) {
      data.wordpressTagsMode = dto.tagsMode;
    }
    const updated = await this.prisma.web.update({ where: { id: web.id }, data });
    return {
      defaultWordpressCategoryId: updated.defaultWordpressCategoryId,
      defaultWordpressAuthorId: updated.defaultWordpressAuthorId,
      tagsMode: updated.wordpressTagsMode
    };
  }

  private mapArticleListItem(article: ArticleWithWordpressRelations) {
    const featuredFromImages = article.images
      ?.find((img) => img.isFeatured && img.status === 'SUCCESS' && img.imageUrl)
      ?.imageUrl;
    const firstImage = article.images?.find((img) => img.status === 'SUCCESS' && img.imageUrl)?.imageUrl;
    const resolvedFeatured = featuredFromImages || article.featuredImageUrl || firstImage || null;

    return {
      id: article.id,
      title: article.title,
      status: article.status,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      publishedAt: article.publishedAt,
      wordpressPostId: article.wordpressPostId,
      featuredImageUrl: resolvedFeatured,
      category: this.mapCategory(article.wordpressCategory),
      author: this.mapAuthor(article.wordpressAuthor),
      tags: this.resolveTags(article.tags)
    };
  }

  private mapArticleDetail(article: ArticleWithWordpressRelations) {
    return {
      id: article.id,
      title: article.title,
      status: article.status,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      publishedAt: article.publishedAt,
      wordpressPostId: article.wordpressPostId,
      featuredImageUrl: article.featuredImageUrl,
      markdown: article.markdown,
      html: article.html,
      category: this.mapCategory(article.wordpressCategory),
      author: this.mapAuthor(article.wordpressAuthor),
      tags: this.resolveTags(article.tags)
    };
  }

  private mapCategory(category: WebWordpressCategory | null) {
    if (!category) {
      return null;
    }
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      remoteId: category.remoteId
    };
  }

  private mapAuthor(author: WebWordpressAuthor | null) {
    if (!author) {
      return null;
    }
    return {
      id: author.id,
      name: author.name,
      slug: author.slug,
      remoteId: author.remoteId
    };
  }

  private mapWordpressMetadata(web: Prisma.WebGetPayload<{ include: { wordpressCategories: true; wordpressAuthors: true } }>) {
    return {
      categories: web.wordpressCategories.map((category) => this.mapCategory(category)),
      authors: web.wordpressAuthors.map((author) => this.mapAuthor(author)),
      defaultWordpressCategoryId: web.defaultWordpressCategoryId,
      defaultWordpressAuthorId: web.defaultWordpressAuthorId,
      tagsMode: web.wordpressTagsMode
    };
  }

  private resolveTags(value: unknown) {
    if (Array.isArray(value)) {
      return value.filter((item) => typeof item === 'string');
    }
    return [];
  }

  private async ensureWebOwnedByUser(userId: string, webId: string) {
    const web = await this.prisma.web.findFirst({ where: { id: webId, userId } });
    if (!web) {
      throw new NotFoundException('Website not found');
    }
    return web;
  }

  private async ensureCategoryBelongsToWeb(webId: string, categoryId: string) {
    const category = await this.prisma.webWordpressCategory.findFirst({
      where: { id: categoryId, webId }
    });
    if (!category) {
      throw new BadRequestException('WordPress category not found.');
    }
    return category;
  }

  private async ensureAuthorBelongsToWeb(webId: string, authorId: string) {
    const author = await this.prisma.webWordpressAuthor.findFirst({
      where: { id: authorId, webId }
    });
    if (!author) {
      throw new BadRequestException('WordPress author not found.');
    }
    return author;
  }

  private parseWordpressCredentials(encryptedJson: string): WordpressCredentials {
    try {
      const decrypted = this.encryptionService.decrypt(encryptedJson);
      const parsed = JSON.parse(decrypted) as WordpressCredentials;
      if (parsed.type !== 'wordpress_application_password') {
        throw new Error('Unsupported credential type');
      }
      return parsed;
    } catch (_error) {
      throw new BadRequestException('WordPress credentials cannot be decrypted.');
    }
  }
}
