import { Module } from '@nestjs/common';
import { MagicLinksController } from './magic-links.controller';

@Module({
    controllers: [MagicLinksController],
})
export class MagicLinksModule { }
