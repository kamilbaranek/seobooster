import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ArticlePlanStatus, AssetStatus, IntegrationType, WebCredentials, WebStatus } from '@prisma/client';
import type { AssetStorage } from '@seobooster/storage';
import { ASSET_STORAGE } from '../storage/storage.constants';
import type { WordpressPublishMode } from '@seobooster/wp-client';
import { PrismaService } from '../prisma/prisma.service';
import { JobQueueService } from '../queues/queues.service';
import { EncryptionService } from '../crypto/encryption.service';
import { BillingService } from '../billing/billing.service';
import { CreateWebDto } from './dto/create-web.dto';
import { UpdateWebDto } from './dto/update-web.dto';
import { UpsertCredentialsDto } from './dto/upsert-credentials.dto';
import { getPlanById } from '../config/subscription-plans.config';

@Injectable()
export class WebsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobQueueService: JobQueueService,
    private readonly encryptionService: EncryptionService,
    private readonly billingService: BillingService,
    @Inject(ASSET_STORAGE) private readonly storage: AssetStorage
  ) { }

  async create(userId: string, dto: CreateWebDto) {
    const canCreateWeb = await this.billingService.checkLimit(userId, 'webs');
    if (!canCreateWeb) {
      throw new BadRequestException('Dosáhli jste limitu počtu webů pro váš plán. Prosím upgradujte.');
    }

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
        screenshotStatus: AssetStatus.PENDING,
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days trial
      }
    });

    await Promise.all([
      this.jobQueueService.enqueueFetchFavicon(web.id, 'onboarding'),
      this.jobQueueService.enqueueGenerateScreenshot(web.id, 'onboarding')
    ]);

    return web;
  }

  async findAll(userId: string) {
    const webs = await this.prisma.web.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        seoStrategies: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!webs.length) {
      return [];
    }

    const lastArticles = await Promise.all(
      webs.map((web) =>
        this.prisma.article.findFirst({
          where: { webId: web.id },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true }
        })
      )
    );

    const articleCounts = await Promise.all(
      webs.map((web) =>
        this.prisma.article.count({
          where: { webId: web.id }
        })
      )
    );

    const publishedCounts = await Promise.all(
      webs.map((web) =>
        this.prisma.article.count({
          where: { webId: web.id, status: 'PUBLISHED' }
        })
      )
    );

    return webs.map((web, index) => ({
      ...web,
      lastArticleCreatedAt: lastArticles[index]?.createdAt ?? null,
      articleCount: articleCounts[index] ?? 0,
      articlePublishedCount: publishedCounts[index] ?? 0
    }));
  }

  async findOne(userId: string, id: string) {
    const web = await this.prisma.web.findFirst({
      where: { id, userId },
      include: {
        seoStrategies: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
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
          dto.articleImageGenerationEnabled ?? web.articleImageGenerationEnabled,
        publicationSchedule: dto.publicationSchedule ?? web.publicationSchedule,
        timezone: dto.timezone ?? web.timezone,
        language: dto.language ?? web.language,
        country: dto.country ?? web.country,
        onboardingStep: dto.onboardingStep ?? web.onboardingStep,
        projectType: dto.projectType ?? web.projectType,
        webAge: dto.webAge ?? web.webAge,
        platform: dto.platform ?? web.platform,
        businessGoal: dto.businessGoal ?? web.businessGoal,
        audience: dto.audience ?? web.audience ?? undefined,
        competitors: dto.competitors ?? web.competitors ?? undefined,
        conversionGoal: dto.conversionGoal ?? web.conversionGoal
      }
    });

    if (dto.businessDescription !== undefined) {
      const activeStrategy = await this.prisma.seoStrategy.findFirst({
        where: { webId: id, isActive: true },
        orderBy: { createdAt: 'desc' }
      });

      if (activeStrategy) {
        await this.prisma.seoStrategy.update({
          where: { id: activeStrategy.id },
          data: { businessDescription: dto.businessDescription }
        });
      }
    }

    if (dto.businessTargetAudience !== undefined) {
      const activeStrategy = await this.prisma.seoStrategy.findFirst({
        where: { webId: id, isActive: true },
        orderBy: { createdAt: 'desc' }
      });

      if (activeStrategy) {
        await this.prisma.seoStrategy.update({
          where: { id: activeStrategy.id },
          data: { businessTargetAudience: dto.businessTargetAudience }
        });
      }
    }

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
      select: { id: true, integrationType: true, credentials: true }
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

    const autoPublishMode = this.resolveAutoPublishMode(web.credentials);
    const targetStatus = autoPublishMode === 'auto_publish' ? 'publish' : 'draft';

    await this.jobQueueService.enqueuePublishArticle(article.id, targetStatus, 'manual');
    return { queued: true, targetStatus };
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
      webId: plan.webId,
      articleId: plan.articleId,
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

  async updateArticlePlanDate(userId: string, webId: string, planId: string, payload: { plannedPublishAt: string }) {
    const web = await this.prisma.web.findFirst({ where: { id: webId, userId } });
    if (!web) {
      throw new NotFoundException('Website not found');
    }

    const plan = await this.prisma.articlePlan.findFirst({
      where: {
        id: planId,
        webId
      }
    });

    if (!plan) {
      throw new NotFoundException('Article plan not found');
    }

    const parsedDate = new Date(payload.plannedPublishAt);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Invalid plannedPublishAt value');
    }

    const updated = await this.prisma.articlePlan.update({
      where: { id: planId },
      data: { plannedPublishAt: parsedDate }
    });

    return {
      id: updated.id,
      plannedPublishAt: updated.plannedPublishAt
    };
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

  async uploadFavicon(userId: string, id: string, file: Express.Multer.File) {
    const web = await this.prisma.web.findFirst({ where: { id, userId } });
    if (!web) {
      throw new NotFoundException('Website not found');
    }

    const extension = file.mimetype.split('/')[1] || 'png';
    const path = `webs/${web.id}/favicon.${extension}`;

    const url = await this.storage.saveFile(path, file.buffer, file.mimetype);

    await this.prisma.web.update({
      where: { id },
      data: {
        faviconUrl: url,
        faviconStatus: AssetStatus.SUCCESS,
        faviconLastFetchedAt: new Date()
      }
    });

    return { url };
  }

  async deleteFavicon(userId: string, id: string) {
    const web = await this.prisma.web.findFirst({ where: { id, userId } });
    if (!web) {
      throw new NotFoundException('Website not found');
    }

    await this.prisma.web.update({
      where: { id },
      data: {
        faviconUrl: null,
        faviconStatus: AssetStatus.PENDING
      }
    });

    return { deleted: true };
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
    const canGenerateArticle = await this.billingService.checkLimit(userId, 'articles');
    if (!canGenerateArticle) {
      throw new BadRequestException('Dosáhli jste měsíčního limitu článků. Prosím upgradujte nebo počkejte na další období.');
    }

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

  async rescanWebsite(userId: string, id: string) {
    const web = await this.prisma.web.findFirst({
      where: { id, userId }
    });
    if (!web) {
      throw new NotFoundException('Website not found');
    }
    await this.jobQueueService.enqueueScanWebsite(web.id);
    return { queued: true };
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

  async regenerateArticle(userId: string, webId: string, planId: string) {
    // Verify ownership
    const web = await this.prisma.web.findFirst({
      where: { id: webId, userId }
    });

    if (!web) {
      throw new NotFoundException('Website not found');
    }

    // Get user with subscriptions
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get article plan
    const plan = await this.prisma.articlePlan.findFirst({
      where: { id: planId, webId }
    });

    if (!plan) {
      throw new NotFoundException('Article plan not found');
    }

    // Check subscription tier (must be TIER2+)
    const subscription = user.subscriptions[0];
    if (!subscription || !subscription.planId) {
      throw new BadRequestException('No active subscription found');
    }

    const planConfig = getPlanById(subscription.planId);
    if (!planConfig || planConfig.limits.regenerations === 0) {
      throw new BadRequestException('Article regeneration is not available on your current plan. Please upgrade to Pro or Agency.');
    }

    // Check regeneration limit
    if (plan.regenerationCount >= planConfig.limits.regenerations) {
      throw new BadRequestException(`You have reached the regeneration limit (${planConfig.limits.regenerations}) for this article.`);
    }

    // Enqueue GenerateArticle job
    // Note: regenerationCount will be incremented by the worker after successful generation
    await this.jobQueueService.enqueueGenerateArticle(webId, planId);

    return {
      success: true,
      remainingRegenerations: planConfig.limits.regenerations - plan.regenerationCount
    };
  }
}
