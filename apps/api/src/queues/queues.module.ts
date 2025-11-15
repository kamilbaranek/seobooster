import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobQueueService } from './queues.service';
import {
  ANALYZE_BUSINESS_QUEUE,
  CREATE_SEO_STRATEGY_QUEUE,
  GENERATE_ARTICLE_QUEUE,
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
      { name: PUBLISH_ARTICLE_QUEUE }
    )
  ],
  providers: [JobQueueService],
  exports: [JobQueueService]
})
export class QueuesModule {}
