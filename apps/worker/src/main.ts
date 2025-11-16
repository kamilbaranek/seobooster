import { config as loadEnv } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

const projectRoot = resolve(__dirname, '../../..');

['.env', '.env.local'].forEach((envFile, index) => {
  const fullPath = resolve(projectRoot, envFile);
  if (existsSync(fullPath)) {
    loadEnv({ path: fullPath, override: index > 0 });
  }
});
import { Queue, QueueEvents, Worker } from 'bullmq';
import { Prisma, PrismaClient } from '@prisma/client';
import {
  ANALYZE_BUSINESS_QUEUE,
  CREATE_SEO_STRATEGY_QUEUE,
  GENERATE_ARTICLE_QUEUE,
  PUBLISH_ARTICLE_QUEUE,
  SCAN_WEBSITE_QUEUE,
  AnalyzeBusinessJob,
  CreateSeoStrategyJob,
  GenerateArticleJob,
  PublishArticleJob,
  ScanWebsiteJob
} from '@seobooster/queue-types';
import { createLogger } from './logger';
import { aiProvider } from './services/ai-orchestrator';
import type { AiTaskType, BusinessProfile, ScanResult, SeoStrategy } from '@seobooster/ai-types';
import { renderPromptTemplate } from '@seobooster/ai-prompts';

const logger = createLogger('worker');

const redisConnection = {
  host: process.env.REDIS_HOST ?? '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  ...(process.env.REDIS_USERNAME ? { username: process.env.REDIS_USERNAME } : {}),
  ...(process.env.REDIS_PASSWORD ? { password: process.env.REDIS_PASSWORD } : {}),
  ...(process.env.REDIS_USE_TLS === 'true' ? { tls: { rejectUnauthorized: false } } : {})
} as const;

const prisma = new PrismaClient();
const scanQueue = new Queue(SCAN_WEBSITE_QUEUE, { connection: redisConnection });
const analyzeQueue = new Queue(ANALYZE_BUSINESS_QUEUE, { connection: redisConnection });
const strategyQueue = new Queue(CREATE_SEO_STRATEGY_QUEUE, { connection: redisConnection });
const generateQueue = new Queue(GENERATE_ARTICLE_QUEUE, { connection: redisConnection });
const publishQueue = new Queue(PUBLISH_ARTICLE_QUEUE, { connection: redisConnection });

const stop = async () => {
  logger.info('Shutting down worker...');
  await Promise.all([
    scanQueue.close(),
    analyzeQueue.close(),
    strategyQueue.close(),
    generateQueue.close(),
    publishQueue.close()
  ]);
  await prisma.$disconnect();
};

process.on('SIGINT', async () => {
  await stop();
  process.exit(0);
});

process.on('uncaughtException', async (err) => {
  logger.error({ err }, 'Uncaught exception');
  await stop();
  process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
  logger.error({ reason }, 'Unhandled rejection');
  await stop();
  process.exit(1);
});

const registerQueueEvents = (queueName: string) => {
  const events = new QueueEvents(queueName, { connection: redisConnection });
  events.on('failed', ({ jobId, failedReason }) => {
    logger.error({ queueName, jobId, failedReason }, 'Job failed');
  });
  events.on('completed', ({ jobId }) => {
    logger.info({ queueName, jobId }, 'Job completed');
  });
  return events.waitUntilReady();
};

type QueueJob<T> = {
  data: T;
  id?: string | number;
};

const createWorker = <T>(
  queueName: string,
  processor: (job: QueueJob<T>) => Promise<void>
) =>
  new Worker(
    queueName,
    async (job) => {
      logger.info({ queueName, jobId: job.id }, 'Processing job');
      await processor(job);
    },
    { connection: redisConnection }
  );

const renderOverrides = (
  prompts: { systemPrompt: string | null; userPrompt: string | null } | null,
  variables: Record<string, unknown>
) => {
  if (!prompts) {
    return {};
  }
  return {
    systemPrompt: prompts.systemPrompt ? renderPromptTemplate(prompts.systemPrompt, variables) : undefined,
    userPrompt: prompts.userPrompt ? renderPromptTemplate(prompts.userPrompt, variables) : undefined
  };
};

const bootstrap = async () => {
  if (!process.env.DATABASE_URL) {
    logger.warn('DATABASE_URL is not set. Worker operations may fail.');
  }

  await prisma.$connect();

  await Promise.all([
    registerQueueEvents(SCAN_WEBSITE_QUEUE),
    registerQueueEvents(ANALYZE_BUSINESS_QUEUE),
    registerQueueEvents(CREATE_SEO_STRATEGY_QUEUE),
    registerQueueEvents(GENERATE_ARTICLE_QUEUE),
    registerQueueEvents(PUBLISH_ARTICLE_QUEUE)
  ]);

  createWorker<ScanWebsiteJob>(SCAN_WEBSITE_QUEUE, async (job) => {
    const web = await prisma.web.findUnique({ where: { id: job.data.webId } });
    if (!web) {
      logger.warn({ webId: job.data.webId }, 'Web not found for scanning');
      return;
    }

    const prompts = await prisma.aiPromptConfig.findUnique({
      where: { task: 'scan' }
    });
    const variables = { url: web.url };
    const overrides = renderOverrides(prompts, variables);

    const scanResult = (await aiProvider.scanWebsite(web.url, {
      task: 'scan',
      systemPrompt: overrides.systemPrompt,
      userPrompt: overrides.userPrompt,
      variables
    })) as ScanResult;

    await prisma.webAnalysis.upsert({
      where: { webId: web.id },
      create: {
        webId: web.id,
        scanResult: scanResult as unknown as Prisma.InputJsonValue,
        lastScanAt: new Date()
      },
      update: {
        scanResult: scanResult as unknown as Prisma.InputJsonValue,
        lastScanAt: new Date()
      }
    });

    await analyzeQueue.add('AnalyzeBusiness', { webId: web.id });
  });

  createWorker<AnalyzeBusinessJob>(ANALYZE_BUSINESS_QUEUE, async (job) => {
    const analysis = await prisma.webAnalysis.findUnique({
      where: { webId: job.data.webId }
    });
    if (!analysis || !analysis.scanResult) {
      logger.warn({ webId: job.data.webId }, 'Missing scan result for analysis');
      return;
    }

    const scan = analysis.scanResult as unknown as ScanResult;

    const prompts = await prisma.aiPromptConfig.findUnique({
      where: { task: 'analyze' }
    });
    const variables = { url: scan.url, scanResult: scan };
    const overrides = renderOverrides(prompts, variables);

    const profile = (await aiProvider.analyzeBusiness(scan, {
      task: 'analyze',
      systemPrompt: overrides.systemPrompt,
      userPrompt: overrides.userPrompt,
      variables
    })) as BusinessProfile;
    await prisma.webAnalysis.update({
      where: { webId: job.data.webId },
      data: { businessProfile: profile as unknown as Prisma.InputJsonValue }
    });

    await strategyQueue.add('CreateSeoStrategy', { webId: job.data.webId });
  });

  createWorker<CreateSeoStrategyJob>(CREATE_SEO_STRATEGY_QUEUE, async (job) => {
    const analysis = await prisma.webAnalysis.findUnique({
      where: { webId: job.data.webId }
    });
    if (!analysis || !analysis.businessProfile) {
      logger.warn({ webId: job.data.webId }, 'Missing business profile for SEO strategy');
      return;
    }

    const businessProfile = analysis.businessProfile as unknown as BusinessProfile;

    const prompts = await prisma.aiPromptConfig.findUnique({
      where: { task: 'strategy' }
    });
    const variables = { businessProfile };
    const overrides = renderOverrides(prompts, variables);

    const strategy = (await aiProvider.buildSeoStrategy(businessProfile, {
      task: 'strategy',
      systemPrompt: overrides.systemPrompt,
      userPrompt: overrides.userPrompt,
      variables
    })) as SeoStrategy;

    await prisma.webAnalysis.update({
      where: { webId: job.data.webId },
      data: { seoStrategy: strategy as unknown as Prisma.InputJsonValue }
    });

    await generateQueue.add('GenerateArticle', { webId: job.data.webId });
  });

  createWorker<GenerateArticleJob>(GENERATE_ARTICLE_QUEUE, async (job) => {
    const web = await prisma.web.findUnique({
      where: { id: job.data.webId },
      include: {
        analysis: true
      }
    });

    if (!web?.analysis?.seoStrategy) {
      logger.warn({ webId: job.data.webId }, 'Missing SEO strategy for article generation');
      return;
    }

    const strategy = web.analysis.seoStrategy as unknown as SeoStrategy;
    const clusters =
      (strategy.pillars ?? []).flatMap(
        (pillar: SeoStrategy['pillars'][number]) => pillar.clusters ?? []
      );
    const targetCluster = clusters[0];

    if (!targetCluster) {
      logger.warn({ webId: job.data.webId }, 'No clusters available for article generation');
      return;
    }

    const prompts = await prisma.aiPromptConfig.findUnique({
      where: { task: 'article' }
    });
    const variables = { strategy, cluster: targetCluster };
    const overrides = renderOverrides(prompts, variables);

    const draft = await aiProvider.generateArticle(
      strategy,
      {
        clusterName: targetCluster.name,
        targetTone: strategy.targetTone
      },
      {
        task: 'article',
        systemPrompt: overrides.systemPrompt,
        userPrompt: overrides.userPrompt,
        variables
      }
    );

    const article = await prisma.article.create({
      data: {
        webId: web.id,
        title: draft.title,
        markdown: draft.bodyMarkdown,
        html: draft.bodyMarkdown,
        status: 'DRAFT'
      }
    });

    logger.info({ jobId: job.id, articleId: article.id }, 'Article draft stored');
  });

  createWorker<PublishArticleJob>(PUBLISH_ARTICLE_QUEUE, async (job) => {
    logger.info({ jobId: job.id, articleId: job.data.articleId }, 'Publishing article (stub)');
  });

  logger.info('Worker ready. Listening for jobs...');
};

bootstrap().catch(async (err) => {
  logger.error({ err }, 'Worker bootstrap failed');
  await stop();
  process.exit(1);
});
