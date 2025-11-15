import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { QueuesModule } from '../queues/queues.module';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';

@Module({
  imports: [PrismaModule, QueuesModule],
  providers: [BillingService],
  controllers: [BillingController],
  exports: [BillingService]
})
export class BillingModule {}
