import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { assetStorageFactory } from './asset-storage.factory';
import { ASSET_STORAGE } from './storage.constants';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: ASSET_STORAGE,
      inject: [ConfigService],
      useFactory: assetStorageFactory
    }
  ],
  exports: [ASSET_STORAGE]
})
export class AssetStorageModule {}
