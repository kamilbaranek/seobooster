import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IntegrationType, WebStatus } from '@prisma/client';
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
  ) {}

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
        status: WebStatus.PENDING_PAYMENT
      }
    });

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
        integrationType: dto.integrationType ?? web.integrationType
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
    await this.prisma.web.delete({ where: { id } });
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
    } catch (error) {
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
    } catch (error) {
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
        articles: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!web) {
      throw new NotFoundException('Website not found');
    }

    const analysis = web.analysis;

    return {
      web: {
        id: web.id,
        url: web.url,
        status: web.status,
        nickname: web.nickname,
        createdAt: web.createdAt
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
      }))
    };
  }

  async triggerArticleGeneration(userId: string, id: string) {
    const web = await this.prisma.web.findFirst({
      where: { id, userId }
    });
    if (!web) {
      throw new NotFoundException('Website not found');
    }
    await this.jobQueueService.enqueueGenerateArticle(web.id);
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
    await this.jobQueueService.enqueueAnalyzeBusinessDebug(web.id);
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
