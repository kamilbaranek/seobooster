import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';

const projectRoot = resolve(__dirname, '../../..');
process.env.PROJECT_ROOT = projectRoot;

['.env', '.env.local'].forEach((envFile, index) => {
  const fullPath = resolve(projectRoot, envFile);
  if (existsSync(fullPath)) {
    loadEnv({ path: fullPath, override: index > 0 });
  }
});

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  const webOrigin = process.env.WEB_APP_URL ?? 'http://localhost:3000';
  app.enableCors({
    origin: webOrigin,
    credentials: false
  });
  const assetDriver = (process.env.ASSET_STORAGE_DRIVER ?? 'local').toLowerCase();
  if (assetDriver === 'local') {
    const assetPath = resolve(
      projectRoot,
      process.env.ASSET_STORAGE_LOCAL_PATH ?? './storage/website-assets'
    );
    app.use(
      '/assets',
      (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET');
        next();
      },
      express.static(assetPath, { index: false, maxAge: '1d' })
    );
  }
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
  await app.listen(process.env.PORT ? parseInt(process.env.PORT, 10) : 3333);
};

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
