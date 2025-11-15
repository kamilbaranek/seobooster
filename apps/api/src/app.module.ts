import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import type { RedisOptions } from 'ioredis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { QueuesModule } from './queues/queues.module';
import { WebsModule } from './webs/webs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env']
    }),
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
          connection: redisOptions
        };
      }
    }),
    QueuesModule,
    AuthModule,
    BillingModule,
    WebsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
