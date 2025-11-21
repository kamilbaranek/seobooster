import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ArticlePlanStatus, AssetStatus, IntegrationType, WebCredentials, WebStatus } from '@prisma/client';
import type { WordpressPublishMode } from '@seobooster/wp-client';
import { PrismaService } from '../prisma/prisma.service';
import { JobQueueService } from '../queues/queues.service';
import { EncryptionService } from '../crypto/encryption.service';
import { CreateWebDto } from './dto/create-web.dto';
import { UpdateWebDto } from './dto/update-web.dto';
import { UpsertCredentialsDto } from './dto/upsert-credentials.dto';

@Injectable()
export class WebsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobQueueService: JobQueueService,
    private readonly encryptionService: EncryptionService
  ) { }

  async create(userId: string, dto: CreateWebDto) {
    const existing = await this.prisma.web.findUnique({ where: { url: dto.url } });
    if (existing && existing.userId !== userId) {
      throw new BadRequestException('Website already assigned to another account');
    }

    const web = await this.prisma.web.create({
      data: {
        url: dto.url,
        userId,
        nickname: dto.nickname,
        integrationType: dto.integrationType ?? IntegrationType.NONE,
        status: WebStatus.PENDING_PAYMENT,
        faviconStatus: AssetStatus.PENDING,
        screenshotStatus: AssetStatus.PENDING
      }
    });

    await Promise.all([
      this.jobQueueService.enqueueFetchFavicon(web.id, 'onboarding'),
      this.jobQueueService.enqueueGenerateScreenshot(web.id, 'onboarding')
    ]);

    return web;
  }

  findAll(userId: string) {
    return this.prisma.web.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(userId: string, id: string) {
    const web = await this.prisma.web.findFirst({
      where: { id, userId }
    });
    if (!web) {
      throw new NotFoundException('Website not found');
    }
    return web;
  }

  async update(userId: string, id: string, dto: UpdateWebDto) {
    const web = await this.prisma.web.findFirst({
      where: { id, userId }
    });
    if (!web) {
      throw new NotFoundException('Website not found');
    }

    const updated = await this.prisma.web.update({
      where: { id },
      data: {
        url: dto.url ?? web.url,
        nickname: dto.nickname ?? web.nickname,
        status: dto.status ?? web.status,
        integrationType: dto.integrationType ?? web.integrationType,
        articleImageGenerationEnabled:
          dto.articleImageGenerationEnabled ?? web.articleImageGenerationEnabled
      }
    });

    if (web.status !== WebStatus.ACTIVE && updated.status === WebStatus.ACTIVE) {
      await this.jobQueueService.enqueueScanWebsite(updated.id);
    }

    return updated;
  }

  async remove(userId: string, id: string) {
    const web = await this.prisma.web.findFirst({
      where: { id, userId }
    });
    if (!web) {
      throw new NotFoundException('Website not found');
    }
    if (web.status === WebStatus.ACTIVE) {
      throw new BadRequestException('Active website cannot be deleted. Pause or cancel it first.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.articleApprovalToken.deleteMany({
        where: {
          article: {
            webId: id
          }
        }
      });

      await tx.articlePlan.deleteMany({
        where: {
          webId: id
        }
      });

      await tx.article.deleteMany({
        where: {
          webId: id
        }
      });

      await tx.webAnalysis.deleteMany({
        where: { webId: id }
      });

      await tx.webCredentials.deleteMany({
        where: { webId: id }
      });

      await tx.aiCallLog.deleteMany({
        where: { webId: id }
      });

      await tx.seoSupportingArticle.deleteMany({
        where: {
          cluster: {
            strategy: {
              webId: id
            }
          }
        }
      });

      await tx.seoTopicCluster.deleteMany({
        where: {
          strategy: {
            webId: id
          }
        }
      });

      await tx.seoStrategy.deleteMany({
        where: { webId: id }
      });

      await tx.web.delete({ where: { id } });
    });

    return { deleted: true };
  }

  async upsertCredentials(userId: string, id: string, dto: UpsertCredentialsDto) {
    const web = await this.prisma.web.findFirst({
      where: { id, userId }
    });
    if (!web) {
      throw new NotFoundException('Website not found');
    }

    let encryptedJson: string;
    try {
      encryptedJson = this.encryptionService.encrypt(JSON.stringify(dto.credentials));
    } catch (_error) {
      throw new BadRequestException('Credential encryption is not configured');
    }
    await this.prisma.webCredentials.upsert({
      where: { webId: id },
      update: { encryptedJson },
      create: {
        webId: id,
        encryptedJson
      }
    });

    return { saved: true };
  }

  async getCredentials(userId: string, id: string) {
    const record = await this.prisma.webCredentials.findFirst({
      where: {
        webId: id,
        web: {
          userId
        }
      }
    });
    if (!record) {
      return { hasCredentials: false };
    }
    let decrypted;
    try {
      decrypted = JSON.parse(this.encryptionService.decrypt(record.encryptedJson));
    } catch (_error) {
      throw new BadRequestException('Credential encryption is not configured');
    }
    return {
      hasCredentials: true,
      credentials: decrypted
    };
  }

  async deleteCredentials(userId: string, id: string) {
    const record = await this.prisma.webCredentials.findFirst({
      where: {
        webId: id,
        web: {
          userId
        }
      }
    });
    if (!record) {
      throw new NotFoundException('Credentials not found');
    }
    await this.prisma.webCredentials.delete({ where: { id: record.id } });
    return { deleted: true };
  }

  async getOverview(userId: string, id: string) {
    const web = await this.prisma.web.findFirst({
      where: { id, userId },
      include: {
        analysis: true,
        credentials: true,
        articles: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        articlePlans: {
          where: {
            status: {
              in: [ArticlePlanStatus.PLANNED, ArticlePlanStatus.QUEUED]
            }
          },
          orderBy: { plannedPublishAt: 'asc' },
          take: 5,
          include: {
            supportingArticle: true,
            cluster: true
          }
        }
      }
    });

    if (!web) {
      throw new NotFoundException('Website not found');
    }

    const analysis = web.analysis;
    const [plannedCount, queuedCount, generatedCount, publishedCount] = await Promise.all([
      this.prisma.articlePlan.count({ where: { webId: web.id, status: ArticlePlanStatus.PLANNED } }),
      this.prisma.articlePlan.count({ where: { webId: web.id, status: ArticlePlanStatus.QUEUED } }),
      this.prisma.articlePlan.count({ where: { webId: web.id, status: ArticlePlanStatus.GENERATED } }),
      this.prisma.articlePlan.count({ where: { webId: web.id, status: ArticlePlanStatus.PUBLISHED } })
    ]);
    const upcomingPlans = web.articlePlans.map((plan) => ({
      id: plan.id,
      status: plan.status,
      plannedPublishAt: plan.plannedPublishAt,
      supportingArticleTitle: plan.supportingArticle.title,
      clusterName: plan.cluster.pillarPage
    }));

    return {
      web: {
        id: web.id,
        url: web.url,
        status: web.status,
        nickname: web.nickname,
        createdAt: web.createdAt,
        faviconUrl: web.faviconUrl,
        faviconStatus: web.faviconStatus,
        screenshotUrl: web.screenshotUrl,
        screenshotStatus: web.screenshotStatus,
        screenshotLastGeneratedAt: web.screenshotLastGeneratedAt,
        faviconLastFetchedAt: web.faviconLastFetchedAt,
        screenshotWidth: web.screenshotWidth,
        screenshotHeight: web.screenshotHeight,
        integrationType: web.integrationType,
        hasWordpressCredentials: Boolean(web.credentials),
        autoPublishMode: this.resolveAutoPublishMode(web.credentials ?? null),
        articleImageGenerationEnabled: web.articleImageGenerationEnabled
      },
      analysis: {
        lastScanAt: analysis?.lastScanAt ?? null,
        hasScanResult: Boolean(analysis?.scanResult),
        hasBusinessProfile: Boolean(analysis?.businessProfile),
        hasSeoStrategy: Boolean(analysis?.seoStrategy)
      },
      articles: web.articles.map((article) => ({
        id: article.id,
        title: article.title,
        status: article.status,
        createdAt: article.createdAt
      })),
      plan: {
        upcoming: upcomingPlans,
        stats: {
          planned: plannedCount + queuedCount,
          generated: generatedCount,
          published: publishedCount
        },
        nextPlannedAt: upcomingPlans[0]?.plannedPublishAt ?? null
      }
    };
  }

  async publishArticle(userId: string, webId: string, articleId: string) {
    const web = await this.prisma.web.findFirst({
      where: { id: webId, userId },
      select: { id: true, integrationType: true }
    });
    if (!web) {
      throw new NotFoundException('Website not found');
    }
    if (web.integrationType !== IntegrationType.WORDPRESS_APPLICATION_PASSWORD) {
      throw new BadRequestException('Website is not configured for WordPress publishing.');
    }
    const article = await this.prisma.article.findFirst({
      where: { id: articleId, webId }
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    await this.jobQueueService.enqueuePublishArticle(article.id, 'publish', 'manual');
    return { queued: true };
  }

  async publishArticles(userId: string, webId: string, articleIds: string[]) {
    const web = await this.prisma.web.findFirst({
      where: { id: webId, userId },
      select: { id: true, integrationType: true }
    });
    if (!web) {
      throw new NotFoundException('Website not found');
    }
    if (web.integrationType !== IntegrationType.WORDPRESS_APPLICATION_PASSWORD) {
      throw new BadRequestException('Website is not configured for WordPress publishing.');
    }
    const articles = await this.prisma.article.findMany({
      where: {
        id: { in: articleIds },
        webId
      }
    });
    await Promise.all(
      articles.map((article) =>
        this.jobQueueService.enqueuePublishArticle(article.id, 'publish', 'manual')
      )
    );
    return { queued: articles.length };
  }

  private resolveAutoPublishMode(credentials: WebCredentials | null): WordpressPublishMode | null {
    if (!credentials) {
      return null;
    }
    try {
      const decrypted = this.encryptionService.decrypt(credentials.encryptedJson);
      const parsed = JSON.parse(decrypted) as Record<string, unknown>;
      if (parsed.type !== 'wordpress_application_password') {
        return null;
      }
      return this.normalizePublishMode(parsed.autoPublishMode);
    } catch {
      return null;
    }
  }

  private normalizePublishMode(value: unknown): WordpressPublishMode {
    if (value === 'auto_publish' || value === 'manual_approval' || value === 'draft_only') {
      return value;
    }
    return 'draft_only';
  }

  async getArticlePlans(userId: string, id: string) {
    const web = await this.prisma.web.findFirst({
      where: { id, userId }
    });

    if (!web) {
      throw new NotFoundException('Website not found');
    }

    const articlePlans = await this.prisma.articlePlan.findMany({
      where: {
        webId: id,
        status: {
          in: [ArticlePlanStatus.PLANNED, ArticlePlanStatus.QUEUED, ArticlePlanStatus.GENERATED]
        }
      },
      orderBy: { plannedPublishAt: 'asc' },
      include: {
        supportingArticle: {
          select: {
            id: true,
            title: true,
            keywords: true,
            intent: true,
            funnelStage: true
          }
        },
        cluster: {
          select: {
            id: true,
            pillarPage: true,
            clusterIntent: true,
            funnelStage: true
          }
        },
        article: {
          select: {
            id: true,
            featuredImageUrl: true,
            html: true,
            markdown: true
          }
        }
      }
    });

    return articlePlans.map((plan) => ({
      id: plan.id,
      status: plan.status,
      plannedPublishAt: plan.plannedPublishAt,
      articleTitle: plan.supportingArticle.title,
      articleKeywords: plan.supportingArticle.keywords,
      articleIntent: plan.supportingArticle.intent,
      articleFunnelStage: plan.supportingArticle.funnelStage || plan.cluster.funnelStage,
      clusterName: plan.cluster.pillarPage,
      clusterIntent: plan.cluster.clusterIntent,
      featuredImageUrl: plan.article?.featuredImageUrl ?? null,
      articleHtml: plan.article?.html ?? null,
      articleMarkdown: plan.article?.markdown ?? null
    }));
  }

  async refreshFavicon(userId: string, id: string) {
    const web = await this.prisma.web.findFirst({ where: { id, userId } });
    if (!web) {
      throw new NotFoundException('Website not found');
    }
    await this.prisma.web.update({
      where: { id },
      data: { faviconStatus: AssetStatus.PENDING }
    });
    await this.jobQueueService.enqueueFetchFavicon(id, 'manual');
    return { queued: true };
  }

  async refreshScreenshot(userId: string, id: string) {
    const web = await this.prisma.web.findFirst({ where: { id, userId } });
    if (!web) {
      throw new NotFoundException('Website not found');
    }
    await this.prisma.web.update({
      where: { id },
      data: { screenshotStatus: AssetStatus.PENDING }
    });
    await this.jobQueueService.enqueueGenerateScreenshot(id, 'manual');
    return { queued: true };
  }

  async triggerArticleGeneration(userId: string, id: string) {
    const web = await this.prisma.web.findFirst({
      where: { id, userId }
    });
    if (!web) {
      throw new NotFoundException('Website not found');
    }
    const plan = await this.prisma.articlePlan.findFirst({
      where: {
        webId: web.id,
        status: {
          in: [ArticlePlanStatus.PLANNED, ArticlePlanStatus.QUEUED]
        },
        strategy: {
          isActive: true
        }
      },
      orderBy: { plannedPublishAt: 'asc' }
    });
    if (!plan) {
      throw new BadRequestException('Žádný článek není aktuálně naplánován.');
    }
    await this.prisma.articlePlan.update({
      where: { id: plan.id },
      data: { status: ArticlePlanStatus.QUEUED }
    });
    await this.jobQueueService.enqueueGenerateArticle(web.id, plan.id);
    return { queued: true, planId: plan.id };
  }

  async triggerScan(userId: string, id: string) {
    const web = await this.prisma.web.findFirst({
      where: { id, userId }
    });
    if (!web) {
      throw new NotFoundException('Website not found');
    }
    await this.jobQueueService.enqueueScanWebsiteDebug(web.id);
    return { queued: true };
  }

  async triggerAnalysis(userId: string, id: string) {
    const web = await this.prisma.web.findFirst({
      where: { id, userId }
    });
    if (!web) {
      throw new NotFoundException('Website not found');
    }
    const lastScanLog = await this.prisma.aiCallLog.findFirst({
      where: {
        webId: id,
        task: 'scan'
      },
      orderBy: { createdAt: 'desc' }
    });

    let rawScanOutput: string | null = null;
    if (lastScanLog) {
      const variables = lastScanLog.variables as unknown as { rawScanOutput?: unknown } | null;
      if (variables && typeof variables === 'object' && 'rawScanOutput' in variables) {
        const value = (variables as any).rawScanOutput;
        rawScanOutput = typeof value === 'string' ? value : JSON.stringify(value);
      } else if (lastScanLog.responseRaw) {
        const raw = lastScanLog.responseRaw as any;
        if (typeof raw === 'string') {
          rawScanOutput = raw;
        } else if (raw && Array.isArray(raw.choices)) {
          const content = raw.choices[0]?.message?.content;
          rawScanOutput = typeof content === 'string' ? content : null;
        }
      }
    }

    await this.jobQueueService.enqueueAnalyzeBusinessDebug(web.id, rawScanOutput);
    return { queued: true };
  }

  async triggerStrategy(userId: string, id: string) {
    const web = await this.prisma.web.findFirst({
      where: { id, userId }
    });
    if (!web) {
      throw new NotFoundException('Website not found');
    }
    await this.jobQueueService.enqueueCreateSeoStrategyDebug(web.id);
    return { queued: true };
  }

  async getPipelineDebug(userId: string, id: string) {
    const web = await this.prisma.web.findFirst({
      where: { id, userId },
      include: {
        analysis: true,
        articles: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!web) {
      throw new NotFoundException('Website not found');
    }

    const lastScanLog = await this.prisma.aiCallLog.findFirst({
      where: {
        webId: id,
        task: 'scan'
      },
      orderBy: { createdAt: 'desc' }
    });

    let rawScanOutput: string | null = null;
    if (lastScanLog) {
      const variables = lastScanLog.variables as unknown as { rawScanOutput?: unknown } | null;
      if (variables && typeof variables === 'object' && 'rawScanOutput' in variables) {
        const value = (variables as any).rawScanOutput;
        rawScanOutput = typeof value === 'string' ? value : JSON.stringify(value);
      } else if (lastScanLog.responseRaw) {
        const raw = lastScanLog.responseRaw as any;
        if (typeof raw === 'string') {
          rawScanOutput = raw;
        } else if (raw && Array.isArray(raw.choices)) {
          const content = raw.choices[0]?.message?.content;
          rawScanOutput = typeof content === 'string' ? content : null;
        }
      }
    }

    return {
      scanResult: web.analysis?.scanResult ?? null,
      businessProfile: web.analysis?.businessProfile ?? null,
      seoStrategy: web.analysis?.seoStrategy ?? null,
      latestArticle: web.articles[0] ?? null,
      rawScanOutput
    };
  }
}
