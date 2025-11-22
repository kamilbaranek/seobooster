import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseEnumPipe,
  Post,
  Put,
  UseGuards
} from '@nestjs/common';
import { BusinessProfile, ScanResult, SeoStrategy } from '@seobooster/ai-types';
import { DEFAULT_PROMPTS, renderPromptTemplate } from '@seobooster/ai-prompts';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { UpdatePromptDto } from './update-prompt.dto';
import { PreviewPromptDto } from './preview-prompt.dto';

export enum PromptTask {
  Scan = 'scan',
  Analyze = 'analyze',
  Strategy = 'strategy',
  Article = 'article',
  ArticleImage = 'article_image'
}

const FALLBACK_SCAN_RESULT: ScanResult = {
  url: 'https://example.com',
  title: 'Example Scan',
  description: 'Demonstration scan output.',
  keywords: ['example'],
  detectedTechnologies: []
};

const FALLBACK_BUSINESS_PROFILE: BusinessProfile = {
  name: 'Example Company',
  tagline: 'Demo profile for preview purposes',
  mission: 'Describe the mission here.',
  audience: ['Demo audience'],
  differentiators: ['Demo differentiator']
};

const FALLBACK_STRATEGY: SeoStrategy = {
  business: {
    name: 'Example Company',
    description: 'Example business description for preview purposes.',
    target_audience: 'Demo audience (SEO, marketing)'
  },
  topic_clusters: [
    {
      pillar_page: 'Demo pillar page',
      pillar_keywords: ['demo keyword'],
      cluster_intent: 'informational',
      funnel_stage: 'TOFU',
      supporting_articles: [
        {
          title: 'Demo article',
          keywords: ['demo keyword'],
          intent: 'informational',
          funnel_stage: 'TOFU',
          meta_description: 'Demo article meta description.'
        }
      ]
    }
  ],
  total_clusters: 1
};

const FALLBACK_CLUSTER = FALLBACK_STRATEGY.topic_clusters?.[0]?.supporting_articles?.[0];

const jsonArrayToStrings = (value: Prisma.JsonValue | null | undefined): string[] => {
  if (!value || !Array.isArray(value)) {
    return [];
  }
  return value.map((item) => (typeof item === 'string' ? item : String(item)));
};

@Controller('admin/prompts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN)
export class AdminPromptsController {
  constructor(private readonly prisma: PrismaService) { }

  @Get()
  async list() {
    const prompts = await this.prisma.aiPromptConfig.findMany({
      orderBy: { task: 'asc' }
    });
    return prompts.map((prompt) => {
      const defaults = DEFAULT_PROMPTS[prompt.task as keyof typeof DEFAULT_PROMPTS];
      const isCustom =
        prompt.systemPrompt !== defaults.systemPrompt ||
        prompt.userPrompt !== defaults.userPrompt ||
        Boolean(prompt.provider) ||
        Boolean(prompt.model) ||
        prompt.forceJsonResponse === false;
      return {
        ...prompt,
        isCustom
      };
    });
  }

  @Get(':task')
  async getOne(@Param('task', new ParseEnumPipe(PromptTask)) task: PromptTask) {
    const prompts = await this.prisma.aiPromptConfig.findMany({
      where: { task },
      orderBy: { orderIndex: 'asc' }
    });

    if (prompts.length > 0) {
      return prompts;
    }

    const defaults = DEFAULT_PROMPTS[task];
    return [
      {
        task,
        orderIndex: 0,
        systemPrompt: defaults.systemPrompt,
        userPrompt: defaults.userPrompt,
        provider: null,
        model: null,
        forceJsonResponse: true
      }
    ];
  }

  @Post(':task/preview')
  async preview(
    @Param('task', new ParseEnumPipe(PromptTask)) task: PromptTask,
    @Body() payload: PreviewPromptDto
  ) {
    const prompts = await this.prisma.aiPromptConfig.findMany({
      where: { task },
      orderBy: { orderIndex: 'asc' }
    });

    const defaults = DEFAULT_PROMPTS[task];
    const effectivePrompts = prompts.length > 0 ? prompts : [{
      systemPrompt: defaults.systemPrompt,
      userPrompt: defaults.userPrompt
    }];

    const variables = await this.resolvePreviewVariables(task, payload);

    return effectivePrompts.map(prompt => {
      const templateSystem = prompt.systemPrompt;
      const templateUser = prompt.userPrompt;

      return {
        variables,
        systemPrompt: renderPromptTemplate(templateSystem, variables) ?? templateSystem,
        userPrompt: renderPromptTemplate(templateUser, variables) ?? templateUser
      };
    });
  }

  @Put(':task')
  async upsert(
    @Param('task', new ParseEnumPipe(PromptTask)) task: PromptTask,
    @Body(new ParseArrayPipe({ items: UpdatePromptDto })) payload: UpdatePromptDto[]
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.aiPromptConfig.deleteMany({
        where: { task }
      });

      await tx.aiPromptConfig.createMany({
        data: payload.map((item, index) => ({
          task,
          orderIndex: index,
          systemPrompt: item.systemPrompt,
          userPrompt: item.userPrompt,
          provider: item.provider ?? null,
          model: item.model ?? null,
          forceJsonResponse: item.forceJsonResponse ?? true
        }))
      });

      return tx.aiPromptConfig.findMany({
        where: { task },
        orderBy: { orderIndex: 'asc' }
      });
    });
  }

  @Delete(':task')
  async remove(@Param('task', new ParseEnumPipe(PromptTask)) task: PromptTask) {
    try {
      await this.prisma.aiPromptConfig.deleteMany({
        where: { task }
      });
    } catch {
      // ignore if not found
    }
    return { deleted: true };
  }

  private async resolvePreviewVariables(task: PromptTask, payload: PreviewPromptDto) {
    const loadWeb = async () => {
      if (payload?.webId) {
        return this.prisma.web.findUnique({ where: { id: payload.webId } });
      }
      return this.prisma.web.findFirst({ orderBy: { createdAt: 'desc' } });
    };

    if (task === PromptTask.Scan) {
      const web = await loadWeb();
      return {
        url: payload?.url ?? web?.url ?? FALLBACK_SCAN_RESULT.url
      };
    }

    if (task === PromptTask.Analyze) {
      const analysisList = await this.prisma.webAnalysis.findMany({
        where: payload?.webId ? { webId: payload.webId } : undefined,
        orderBy: { updatedAt: 'desc' },
        take: 5
      });
      const withScan = analysisList.find((item) => item.scanResult !== null);

      const web = await loadWeb();
      const url = payload?.url ?? web?.url ?? FALLBACK_SCAN_RESULT.url;
      const scanResult = (withScan?.scanResult as ScanResult | null) ?? FALLBACK_SCAN_RESULT;

      return {
        url,
        scanResult
      };
    }

    if (task === PromptTask.Strategy) {
      const analysisList = await this.prisma.webAnalysis.findMany({
        where: payload?.webId ? { webId: payload.webId } : undefined,
        orderBy: { updatedAt: 'desc' },
        take: 5
      });
      const withProfile = analysisList.find((item) => item.businessProfile !== null);

      const businessProfile = (withProfile?.businessProfile as BusinessProfile | null) ?? FALLBACK_BUSINESS_PROFILE;
      return {
        businessProfile
      };
    }

    const plan = await this.prisma.articlePlan.findFirst({
      where: payload?.webId ? { webId: payload.webId } : undefined,
      orderBy: { plannedPublishAt: 'asc' },
      include: {
        cluster: true,
        supportingArticle: true,
        strategy: true,
        web: {
          include: {
            analysis: true,
            user: true
          }
        }
      }
    });

    if (plan) {
      const businessProfile =
        (plan.web.analysis?.businessProfile as BusinessProfile | null) ?? FALLBACK_BUSINESS_PROFILE;

      return {
        topicCluster: {
          pillarPage: plan.cluster.pillarPage,
          pillarKeywords: jsonArrayToStrings(plan.cluster.pillarKeywords),
          intent: plan.cluster.clusterIntent,
          funnelStage: plan.cluster.funnelStage
        },
        supportingArticle: {
          title: plan.supportingArticle.title,
          keywords: jsonArrayToStrings(plan.supportingArticle.keywords),
          intent: plan.supportingArticle.intent,
          funnelStage: plan.supportingArticle.funnelStage,
          metaDescription: plan.supportingArticle.metaDescription
        },
        business: {
          name: plan.strategy.businessName ?? businessProfile.name,
          description: plan.strategy.businessDescription ?? businessProfile.mission,
          targetAudience:
            plan.strategy.businessTargetAudience ?? businessProfile.audience.join(', ')
        },
        web: {
          url: plan.web.url,
          nickname: plan.web.nickname
        },
        webAudience: businessProfile.audience,
        webOwner: {
          email: plan.web.user.email
        }
      };
    }

    const web = await this.prisma.web.findFirst({
      where: payload?.webId ? { id: payload.webId } : undefined,
      include: {
        analysis: true,
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const strategy =
      (web?.analysis?.seoStrategy as SeoStrategy | null) ?? FALLBACK_STRATEGY;
    const firstCluster = strategy.topic_clusters?.[0];
    const fallbackSupporting =
      firstCluster?.supporting_articles?.[0] ??
      FALLBACK_CLUSTER ?? {
        title: 'Demo article',
        keywords: ['demo keyword'],
        intent: 'informational',
        funnel_stage: 'TOFU',
        meta_description: 'Demo article meta description.'
      };
    const businessProfile =
      (web?.analysis?.businessProfile as BusinessProfile | null) ?? FALLBACK_BUSINESS_PROFILE;

    return {
      topicCluster: {
        pillarPage: firstCluster?.pillar_page ?? 'Demo pillar page',
        pillarKeywords: firstCluster?.pillar_keywords ?? ['demo keyword'],
        intent: firstCluster?.cluster_intent ?? 'informational',
        funnelStage: firstCluster?.funnel_stage ?? 'TOFU'
      },
      supportingArticle: {
        title: fallbackSupporting.title,
        keywords: fallbackSupporting.keywords ?? ['demo keyword'],
        intent: fallbackSupporting.intent ?? 'informational',
        funnelStage: fallbackSupporting.funnel_stage ?? 'TOFU',
        metaDescription: fallbackSupporting.meta_description ?? 'Demo article meta description.'
      },
      business: {
        name: strategy.business?.name ?? businessProfile.name,
        description: strategy.business?.description ?? businessProfile.mission,
        targetAudience:
          strategy.business?.target_audience ?? businessProfile.audience.join(', ')
      },
      web: {
        url: web?.url ?? FALLBACK_SCAN_RESULT.url,
        nickname: web?.nickname ?? null
      },
      webAudience: businessProfile.audience,
      webOwner: {
        email: web?.user.email ?? 'owner@example.com'
      }
    };
  }
}
