import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CryptoModule } from '../crypto/crypto.module';
import { ArticlesController } from './articles.controller';
import { WordpressMetadataController } from './wordpress-metadata.controller';
import { ArticlesService } from './articles.service';

@Module({
  imports: [PrismaModule, CryptoModule],
  providers: [ArticlesService],
  controllers: [ArticlesController, WordpressMetadataController]
})
export class ArticlesModule {}
