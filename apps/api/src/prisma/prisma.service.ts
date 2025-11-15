import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly databaseUrl: string | null;

  constructor(private readonly configService: ConfigService) {
    const databaseUrl =
      configService.get<string>('DATABASE_URL') ??
      'postgresql://localhost:5432/seobooster?schema=public';
    super({
      datasources: {
        db: { url: databaseUrl }
      }
    });
    this.databaseUrl = configService.get<string>('DATABASE_URL') ?? null;
    if (!this.databaseUrl) {
      // eslint-disable-next-line no-console
      console.warn('DATABASE_URL is not set. Prisma will run in dry mode.');
    }
  }

  async onModuleInit(): Promise<void> {
    if (!this.databaseUrl) {
      return;
    }
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.databaseUrl) {
      return;
    }
    await this.$disconnect();
  }
}
