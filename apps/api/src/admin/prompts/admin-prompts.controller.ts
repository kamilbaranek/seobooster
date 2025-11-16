import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Put,
  UseGuards
} from '@nestjs/common';
import {
  ArticleDraft,
  BusinessProfile,
  ScanResult,
  SeoStrategy
} from '@seobooster/ai-types';
import { UserRole } from '@prisma/client';
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
  Article = 'article'
}

const DEFAULT_PROMPTS: Record<PromptTask, { systemPrompt: string; userPrompt: string }> = {
  [PromptTask.Scan]: {
    systemPrompt:
      'You extract structured metadata about websites. Always return JSON object { success: boolean, data: ScanResult }.',
    userPrompt:
      'Analyze the website {{url}} and provide title, short description, keywords array, and detected technologies.'
  },
  [PromptTask.Analyze]: {
    systemPrompt:
      'You convert website scan data into a business profile. Return JSON { success, data } where data is BusinessProfile.',
    userPrompt: 'Scan Result: {{scanResult}}\nCreate a concise business profile.'
  },
  [PromptTask.Strategy]: {
    systemPrompt: 'You design SEO strategies with pillars and topic clusters. Respond with JSON { success, data }.',
    userPrompt:
      'Business profile: {{businessProfile}}\nGenerate an initial SEO strategy with at least one pillar and cluster keywords.'
  },
  [PromptTask.Article]: {
    systemPrompt: 'You write high quality SEO articles. Always return JSON { success, data } with ArticleDraft fields.',
    userPrompt:
      'SEO Strategy: {{strategy}}\nSelected cluster: {{cluster}}\nTone: Professional\nProduce a detailed outline, markdown body, keywords, and CTA.'
  }
};

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
  pillars: [
    {
      name: 'Demo pillar',
      description: 'Example description',
      clusters: [
        {
          name: 'Demo cluster',
          keywords: ['demo keyword'],
          cadenceDays: 7
        }
      ]
    }
  ],
  targetTone: 'Professional'
};

const FALLBACK_CLUSTER = FALLBACK_STRATEGY.pillars?.[0]?.clusters?.[0];

@Controller('admin/prompts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN)
export class AdminPromptsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.aiPromptConfig.findMany({
      orderBy: { task: 'asc' }
    });
  }

  @Get(':task')
  async getOne(@Param('task', new ParseEnumPipe(PromptTask)) task: PromptTask) {
    const prompt = await this.prisma.aiPromptConfig.findUnique({ where: { task } });
    if (prompt) {
      return prompt;
    }
    return {
      task,
      systemPrompt: '',
      userPrompt: ''
    };
  }

  @Post(':task/preview')
  async preview(
    @Param('task', new ParseEnumPipe(PromptTask)) task: PromptTask,
    @Body() payload: PreviewPromptDto
  ) {
    const overrides = await this.prisma.aiPromptConfig.findUnique({ where: { task } });
    const prompts = DEFAULT_PROMPTS[task];

    const variables = await this.resolvePreviewVariables(task, payload);

    return {
      variables,
      systemPrompt: overrides?.systemPrompt ?? prompts.systemPrompt,
      userPrompt: overrides?.userPrompt ?? prompts.userPrompt
    };
  }

  @Put(':task')
  async upsert(
    @Param('task', new ParseEnumPipe(PromptTask)) task: PromptTask,
    @Body() payload: UpdatePromptDto
  ) {
    return this.prisma.aiPromptConfig.upsert({
      where: { task },
      update: {
        systemPrompt: payload.systemPrompt,
        userPrompt: payload.userPrompt
      },
      create: {
        task,
        systemPrompt: payload.systemPrompt,
        userPrompt: payload.userPrompt
      }
    });
  }

  @Delete(':task')
  async remove(@Param('task', new ParseEnumPipe(PromptTask)) task: PromptTask) {
    try {
      await this.prisma.aiPromptConfig.delete({
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

    const analysisList = await this.prisma.webAnalysis.findMany({
      where: payload?.webId ? { webId: payload.webId } : undefined,
      orderBy: { updatedAt: 'desc' },
      take: 5
    });
    const withStrategy = analysisList.find((item) => item.seoStrategy !== null);

    const strategy = (withStrategy?.seoStrategy as SeoStrategy | null) ?? FALLBACK_STRATEGY;
    const cluster = strategy?.pillars?.[0]?.clusters?.[0] ?? FALLBACK_CLUSTER ?? {
      name: 'Demo cluster',
      keywords: ['demo keyword'],
      cadenceDays: 7
    };

    return {
      strategy,
      cluster
    };
  }
}
