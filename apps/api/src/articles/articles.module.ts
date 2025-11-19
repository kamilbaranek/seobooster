import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CryptoModule } from '../crypto/crypto.module';
import { QueuesModule } from '../queues/queues.module';
import { ArticlesController } from './articles.controller';
import { WordpressMetadataController } from './wordpress-metadata.controller';
import { ArticlesImagesController } from './articles-images.controller';
import { ArticlesService } from './articles.service';

@Module({
  imports: [PrismaModule, CryptoModule, QueuesModule],
  providers: [ArticlesService],
  controllers: [ArticlesController, WordpressMetadataController, ArticlesImagesController]
})
export class ArticlesModule {}
