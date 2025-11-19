import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  ANALYZE_BUSINESS_QUEUE,
  CREATE_SEO_STRATEGY_QUEUE,
  FETCH_FAVICON_QUEUE,
  GENERATE_ARTICLE_IMAGE_QUEUE,
  GENERATE_ARTICLE_QUEUE,
  GENERATE_SCREENSHOT_QUEUE,
  PUBLISH_ARTICLE_QUEUE,
  SCAN_WEBSITE_QUEUE
} from '@seobooster/queue-types';
@Injectable()
export class JobQueueService {
  constructor(
    @InjectQueue(SCAN_WEBSITE_QUEUE) private readonly scanWebsiteQueue: Queue,
    @InjectQueue(ANALYZE_BUSINESS_QUEUE) private readonly analyzeBusinessQueue: Queue,
    @InjectQueue(CREATE_SEO_STRATEGY_QUEUE) private readonly createSeoStrategyQueue: Queue,
    @InjectQueue(GENERATE_ARTICLE_QUEUE) private readonly generateArticleQueue: Queue,
    @InjectQueue(GENERATE_ARTICLE_IMAGE_QUEUE) private readonly generateArticleImageQueue: Queue,
    @InjectQueue(PUBLISH_ARTICLE_QUEUE) private readonly publishArticleQueue: Queue,
    @InjectQueue(FETCH_FAVICON_QUEUE) private readonly fetchFaviconQueue: Queue,
    @InjectQueue(GENERATE_SCREENSHOT_QUEUE) private readonly generateScreenshotQueue: Queue
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

  enqueueGenerateArticle(webId: string, plannedArticleId: string) {
    return this.generateArticleQueue.add('GenerateArticle', { webId, plannedArticleId });
  }

  enqueueGenerateArticleImage(articleId: string, force = false) {
    return this.generateArticleImageQueue.add('GenerateArticleImage', { articleId, force });
  }

  enqueuePublishArticle(
    articleId: string,
    targetStatus: 'draft' | 'publish',
    trigger: 'auto' | 'manual' | 'email'
  ) {
    return this.publishArticleQueue.add('PublishArticle', { articleId, targetStatus, trigger });
  }

  enqueueFetchFavicon(webId: string, trigger: string) {
    return this.fetchFaviconQueue.add(
      'FetchFavicon',
      { webId, trigger },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000
        }
      }
    );
  }

  enqueueGenerateScreenshot(webId: string, trigger: string, fullPage = false) {
    return this.generateScreenshotQueue.add(
      'GenerateHomepageScreenshot',
      { webId, trigger, fullPage },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 120000
        }
      }
    );
  }
}
