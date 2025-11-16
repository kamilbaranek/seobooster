import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  ANALYZE_BUSINESS_QUEUE,
  CREATE_SEO_STRATEGY_QUEUE,
  GENERATE_ARTICLE_QUEUE,
  PUBLISH_ARTICLE_QUEUE,
  SCAN_WEBSITE_QUEUE
} from '@seobooster/queue-types';
@Injectable()
export class JobQueueService {
  constructor(
    @InjectQueue('scan-website') private readonly scanWebsiteQueue: Queue,
    @InjectQueue('analyze-business') private readonly analyzeBusinessQueue: Queue,
    @InjectQueue('create-seo-strategy') private readonly createSeoStrategyQueue: Queue,
    @InjectQueue('generate-article') private readonly generateArticleQueue: Queue,
    @InjectQueue('publish-article') private readonly publishArticleQueue: Queue
  ) {}

  enqueueScanWebsite(webId: string) {
    return this.scanWebsiteQueue.add('ScanWebsite', { webId });
  }

  enqueueScanWebsiteDebug(webId: string) {
    return this.scanWebsiteQueue.add('ScanWebsiteDebug', { webId, debug: true });
  }

  enqueueAnalyzeBusiness(webId: string, rawScanOutput?: string | null) {
    return this.analyzeBusinessQueue.add('AnalyzeBusiness', { webId, rawScanOutput: rawScanOutput ?? null });
  }

  enqueueAnalyzeBusinessDebug(webId: string, rawScanOutput?: string | null) {
    return this.analyzeBusinessQueue.add('AnalyzeBusinessDebug', {
      webId,
      debug: true,
      rawScanOutput: rawScanOutput ?? null
    });
  }

  enqueueCreateSeoStrategy(webId: string) {
    return this.createSeoStrategyQueue.add('CreateSeoStrategy', { webId });
  }

  enqueueCreateSeoStrategyDebug(webId: string) {
    return this.createSeoStrategyQueue.add('CreateSeoStrategyDebug', { webId, debug: true });
  }

  enqueueGenerateArticle(webId: string) {
    return this.generateArticleQueue.add('GenerateArticle', { webId });
  }

  enqueuePublishArticle(articleId: string) {
    return this.publishArticleQueue.add('PublishArticle', { articleId });
  }
}
