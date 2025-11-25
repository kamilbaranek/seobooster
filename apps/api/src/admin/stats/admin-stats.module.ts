import { Module } from '@nestjs/common';
import { AdminStatsController } from './admin-stats.controller';

@Module({
    controllers: [AdminStatsController]
})
export class AdminStatsModule { }
