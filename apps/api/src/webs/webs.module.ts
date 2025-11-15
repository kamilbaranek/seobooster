import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { QueuesModule } from '../queues/queues.module';
import { CryptoModule } from '../crypto/crypto.module';
import { WebsService } from './webs.service';
import { WebsController } from './webs.controller';

@Module({
  imports: [PrismaModule, QueuesModule, CryptoModule],
  providers: [WebsService],
  controllers: [WebsController]
})
export class WebsModule {}
