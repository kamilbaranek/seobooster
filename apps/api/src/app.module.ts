import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import type { RedisOptions } from 'ioredis';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { QueuesModule } from './queues/queues.module';
import { WebsModule } from './webs/webs.module';
import { MeModule } from './me/me.module';
import { AdminPromptsModule } from './admin/prompts/admin-prompts.module';
import { RolesGuard } from './auth/guards/roles.guard';
import { AdminAiLogsModule } from './admin/ai-logs/admin-ai-logs.module';
import { AssetStorageModule } from './storage/asset-storage.module';
import { ArticlesModule } from './articles/articles.module';
import { MagicLinksModule } from './magic-links/magic-links.module';
import { AdminStatsModule } from './admin/stats/admin-stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    BullModule.forRootAsync({
      useFactory: () => {
        const redisOptions: RedisOptions = {
          host: process.env.REDIS_HOST ?? 'localhost',
          port: parseInt(process.env.REDIS_PORT ?? '6379', 10)
        };

        if (process.env.REDIS_USERNAME) {
          redisOptions.username = process.env.REDIS_USERNAME;
        }
        if (process.env.REDIS_PASSWORD) {
          redisOptions.password = process.env.REDIS_PASSWORD;
        }
        if (process.env.REDIS_USE_TLS === 'true') {
          redisOptions.tls = { rejectUnauthorized: false };
        }

        return {
          connection: {
            ...redisOptions,
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            retryStrategy: (times: number) => {
              // Exponential backoff with a cap of 10 seconds
              const delay = Math.min(times * 50, 10000);
              return delay;
            },
            reconnectOnError: (err) => {
              const targetError = 'READONLY';
              if (err.message.includes(targetError)) {
                // Only reconnect when the error starts with "READONLY"
                return true;
              }
              if (err.message.includes('max requests limit exceeded')) {
                // If we hit the rate limit, we should probably wait a bit longer, 
                // but returning true triggers a reconnect.
                // The retryStrategy will determine the delay.
                return true;
              }
              return false;
            }
          }
        };
      }
    }),
    QueuesModule,
    AuthModule,
    BillingModule,
    WebsModule,
    MeModule,
    AdminPromptsModule,
    AdminAiLogsModule,
    AssetStorageModule,
    AssetStorageModule,
    ArticlesModule,
    MagicLinksModule,
    AdminStatsModule
  ],
  controllers: [AppController],
  providers: [AppService, RolesGuard]
})
export class AppModule { }
