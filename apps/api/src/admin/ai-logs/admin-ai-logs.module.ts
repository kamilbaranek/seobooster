import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminAiLogsController } from './admin-ai-logs.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AdminAiLogsController]
})
export class AdminAiLogsModule {}
