import type { ConfigService } from '@nestjs/config';
import type { AssetStorage, AssetStorageConfig, AssetStorageDriver } from '@seobooster/storage';
import { createAssetStorage } from '@seobooster/storage';

const resolveDriver = (config: ConfigService): AssetStorageDriver => {
  const driver = (config.get<string>('ASSET_STORAGE_DRIVER') ?? 'local').toLowerCase();
  if (driver !== 'local' && driver !== 's3') {
    throw new Error(`Unknown asset storage driver: ${driver}`);
  }
  return driver;
};

const buildConfig = (config: ConfigService): AssetStorageConfig => {
  const driver = resolveDriver(config);
  if (driver === 'local') {
    const localPath = config.get<string>('ASSET_STORAGE_LOCAL_PATH') ?? './storage/website-assets';
    const publicBaseUrl = config.get<string>('ASSET_PUBLIC_BASE_URL');
    if (!publicBaseUrl) {
      throw new Error('ASSET_PUBLIC_BASE_URL is required for local asset storage');
    }
    return {
      driver,
      local: {
        rootPath: localPath,
        publicBaseUrl
      }
    };
  }

  const bucket = config.get<string>('ASSET_S3_BUCKET');
  const region = config.get<string>('ASSET_S3_REGION');
  const publicBaseUrl = config.get<string>('ASSET_PUBLIC_BASE_URL');

  if (!bucket || !region || !publicBaseUrl) {
    throw new Error('Missing S3 asset storage configuration');
  }

  return {
    driver,
    s3: {
      bucket,
      region,
      publicBaseUrl
    }
  };
};

export const assetStorageFactory = (config: ConfigService): AssetStorage => {
  const storageConfig = buildConfig(config);
  return createAssetStorage(storageConfig);
};
