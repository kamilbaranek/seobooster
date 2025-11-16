import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminPromptsController } from './admin-prompts.controller';
import { AdminModelsController } from '../models/admin-models.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AdminPromptsController, AdminModelsController]
})
export class AdminPromptsModule {}
