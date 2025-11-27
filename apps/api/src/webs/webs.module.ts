import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { QueuesModule } from '../queues/queues.module';
import { CryptoModule } from '../crypto/crypto.module';
import { BillingModule } from '../billing/billing.module';
import { WebsService } from './webs.service';
import { WebsController } from './webs.controller';
import { GithubStrategy } from '../auth/strategies/github.strategy';

@Module({
  imports: [PrismaModule, QueuesModule, CryptoModule, BillingModule, PassportModule],
  providers: [WebsService, GithubStrategy],
  controllers: [WebsController]
})
export class WebsModule { }
