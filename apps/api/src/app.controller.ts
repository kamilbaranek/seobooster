import { Controller, Get } from '@nestjs/common';
import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('debug-assets')
  getDebugAssets() {
    const resolveProjectRoot = () => {
      if (process.env.PROJECT_ROOT) {
        return process.env.PROJECT_ROOT;
      }
      return resolve(__dirname, '../../../..');
    };

    const projectRoot = resolveProjectRoot();
    const assetPath = resolve(
      projectRoot,
      process.env.ASSET_STORAGE_LOCAL_PATH ?? './storage/website-assets'
    );

    let files = [];
    let error = null;
    try {
      if (existsSync(assetPath)) {
        files = readdirSync(assetPath);
      } else {
        error = 'Directory does not exist';
      }
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }

    return {
      projectRoot,
      assetPath,
      exists: existsSync(assetPath),
      files,
      error,
      env: {
        PROJECT_ROOT: process.env.PROJECT_ROOT,
        ASSET_STORAGE_DRIVER: process.env.ASSET_STORAGE_DRIVER,
        ASSET_STORAGE_LOCAL_PATH: process.env.ASSET_STORAGE_LOCAL_PATH,
        NODE_ENV: process.env.NODE_ENV
      }
    };
  }
}
