import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminPromptsController } from './admin-prompts.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AdminPromptsController]
})
export class AdminPromptsModule {}

