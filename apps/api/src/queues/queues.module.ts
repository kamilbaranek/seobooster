import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobQueueService } from './queues.service';
import { AssetRefreshService } from './asset-refresh.service';
import {
  ANALYZE_BUSINESS_QUEUE,
  CREATE_SEO_STRATEGY_QUEUE,
  FETCH_FAVICON_QUEUE,
  GENERATE_ARTICLE_QUEUE,
  GENERATE_SCREENSHOT_QUEUE,
  PUBLISH_ARTICLE_QUEUE,
  SCAN_WEBSITE_QUEUE
} from '@seobooster/queue-types';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: SCAN_WEBSITE_QUEUE },
      { name: ANALYZE_BUSINESS_QUEUE },
      { name: CREATE_SEO_STRATEGY_QUEUE },
      { name: GENERATE_ARTICLE_QUEUE },
      { name: PUBLISH_ARTICLE_QUEUE },
      { name: FETCH_FAVICON_QUEUE },
      { name: GENERATE_SCREENSHOT_QUEUE }
    )
  ],
  providers: [JobQueueService, AssetRefreshService],
  exports: [JobQueueService]
})
export class QueuesModule {}
