import { Module } from '@nestjs/common';
import { MagicLinksController } from './magic-links.controller';

import { QueuesModule } from '../queues/queues.module';

@Module({
    imports: [QueuesModule],
    controllers: [MagicLinksController],
})
export class MagicLinksModule { }
