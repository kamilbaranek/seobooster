import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AssetStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JobQueueService } from './queues.service';

@Injectable()
export class AssetRefreshService {
  private readonly logger = new Logger(AssetRefreshService.name);
  private readonly refreshWindowDays = parseInt(process.env.SCREENSHOT_REFRESH_DAYS ?? '14', 10);
  private readonly batchSize = parseInt(process.env.SCREENSHOT_REFRESH_BATCH ?? '20', 10);

  constructor(private readonly prisma: PrismaService, private readonly jobQueueService: JobQueueService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async refreshScreenshots() {
    const threshold = new Date(Date.now() - this.refreshWindowDays * 24 * 60 * 60 * 1000);
    const staleWebs = await this.prisma.web.findMany({
      where: {
        OR: [{ screenshotUrl: null }, { screenshotLastGeneratedAt: { lt: threshold } }]
      },
      orderBy: [{ screenshotLastGeneratedAt: 'asc' }],
      take: this.batchSize
    });

    if (staleWebs.length === 0) {
      return;
    }

    this.logger.log(`Refreshing screenshots for ${staleWebs.length} web(s)`);

    for (const web of staleWebs) {
      await this.prisma.web.update({
        where: { id: web.id },
        data: { screenshotStatus: AssetStatus.PENDING }
      });
      await this.jobQueueService.enqueueGenerateScreenshot(web.id, 'scheduler');
    }
  }
}
