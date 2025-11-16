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
import { aiProvider, aiModelMap } from './services/ai-orchestrator';
import type { AiTaskType, BusinessProfile, ProviderName, ScanResult, SeoStrategy } from '@seobooster/ai-types';
import { DEFAULT_PROMPTS, renderPromptTemplate } from '@seobooster/ai-prompts';
import { buildAiProviderFromEnv } from '@seobooster/ai-providers';

const logger = createLogger('worker');
const AI_DEBUG_LOG_PROMPTS = process.env.AI_DEBUG_LOG_PROMPTS === 'true';

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

type PromptConfig = {
  systemPrompt: string | null;
  userPrompt: string | null;
  provider?: string | null;
  model?: string | null;
} | null;

const renderPromptsForTask = (
  task: AiTaskType,
  prompts: PromptConfig,
  variables: Record<string, unknown>
) => {
  const defaults = DEFAULT_PROMPTS[task];
  const systemTemplate = prompts?.systemPrompt ?? defaults.systemPrompt;
  const userTemplate = prompts?.userPrompt ?? defaults.userPrompt;

  return {
    systemPrompt: renderPromptTemplate(systemTemplate, variables) ?? systemTemplate,
    userPrompt: renderPromptTemplate(userTemplate, variables) ?? userTemplate
  };
};

type AiCallLogInput = {
  webId?: string;
  task: AiTaskType;
  provider: string;
  model: string;
  variables: Record<string, unknown>;
  systemPrompt: string;
  userPrompt: string;
  responseRaw?: unknown;
  responseParsed?: unknown;
  status: 'SUCCESS' | 'ERROR';
  errorMessage?: string;
};

const recordAiCall = async (payload: AiCallLogInput) => {
  if (!AI_DEBUG_LOG_PROMPTS) {
    return;
  }

  try {
    await prisma.aiCallLog.create({
      data: {
        webId: payload.webId,
        task: payload.task,
        provider: payload.provider,
        model: payload.model,
        variables: payload.variables as Prisma.InputJsonValue,
        systemPrompt: payload.systemPrompt,
        userPrompt: payload.userPrompt,
        responseRaw: payload.responseRaw as Prisma.InputJsonValue,
        responseParsed: payload.responseParsed as Prisma.InputJsonValue,
        status: payload.status,
        errorMessage: payload.errorMessage ?? null
      }
    });
  } catch (error) {
    logger.error({ error, task: payload.task, webId: payload.webId }, 'Failed to persist AI call log');
  }
};

const resolveProviderForTask = (
  task: AiTaskType,
  prompts: PromptConfig
) => {
  const providerOverride = prompts?.provider as ProviderName | undefined;
  const modelOverride = prompts?.model ?? undefined;

  if (!providerOverride && !modelOverride) {
    return { provider: aiProvider, model: aiModelMap[task] };
  }

  const overrides = modelOverride ? { [task]: modelOverride } : undefined;
  const { provider, modelMap } = buildAiProviderFromEnv({
    providerOverride,
    modelOverrides: overrides
  });

  return { provider, model: modelMap[task] };
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
    const renderedPrompts = renderPromptsForTask('scan', prompts, variables);
    const providerSelection = resolveProviderForTask('scan', prompts);
    const providerForCall = providerSelection.provider;
    const providerName = providerForCall.name;
    const modelName = providerSelection.model;

    if (AI_DEBUG_LOG_PROMPTS) {
      logger.info({ webId: web.id, variables, renderedPrompts }, 'AI debug: scan request');
    }

    const isDebug = Boolean(job.data.debug);

    let scanResult: ScanResult;
    try {
      scanResult = (await providerForCall.scanWebsite(web.url, {
        task: 'scan',
        systemPrompt: renderedPrompts.systemPrompt,
        userPrompt: renderedPrompts.userPrompt,
        variables
      })) as ScanResult;

      if (AI_DEBUG_LOG_PROMPTS) {
        logger.info({ webId: web.id, result: scanResult }, 'AI debug: scan response');
      }

      const rawResponse = typeof providerForCall.getLastRawResponse === 'function' ? providerForCall.getLastRawResponse() : undefined;
      await recordAiCall({
        webId: web.id,
        task: 'scan',
        provider: providerName,
        model: modelName,
        variables,
        systemPrompt: renderedPrompts.systemPrompt,
        userPrompt: renderedPrompts.userPrompt,
        responseRaw: rawResponse ?? scanResult,
        responseParsed: scanResult,
        status: 'SUCCESS'
      });
    } catch (error) {
      const rawResponse = typeof providerForCall.getLastRawResponse === 'function' ? providerForCall.getLastRawResponse() : undefined;
      await recordAiCall({
        webId: web.id,
        task: 'scan',
        provider: providerName,
        model: modelName,
        variables,
        systemPrompt: renderedPrompts.systemPrompt,
        userPrompt: renderedPrompts.userPrompt,
        responseRaw: rawResponse ?? (error instanceof Error ? { message: error.message } : { error: 'Unknown error' }),
        status: 'ERROR',
        errorMessage: error instanceof Error ? error.message : undefined
      });
      throw error;
    }

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

    if (!isDebug) {
      await analyzeQueue.add('AnalyzeBusiness', { webId: web.id });
    }
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
    const renderedPrompts = renderPromptsForTask('analyze', prompts, variables);
    const providerSelection = resolveProviderForTask('analyze', prompts);
    const providerForCall = providerSelection.provider;
    const providerName = providerForCall.name;
    const modelName = providerSelection.model;

    if (AI_DEBUG_LOG_PROMPTS) {
      logger.info({ webId: job.data.webId, variables, renderedPrompts }, 'AI debug: analyze request');
    }

    const isDebug = Boolean(job.data.debug);

    let profile: BusinessProfile;
    try {
      profile = (await providerForCall.analyzeBusiness(scan, {
        task: 'analyze',
        systemPrompt: renderedPrompts.systemPrompt,
        userPrompt: renderedPrompts.userPrompt,
        variables
      })) as BusinessProfile;

      const rawResponse = typeof providerForCall.getLastRawResponse === 'function' ? providerForCall.getLastRawResponse() : undefined;
      await recordAiCall({
        webId: job.data.webId,
        task: 'analyze',
        provider: providerName,
        model: modelName,
        variables,
        systemPrompt: renderedPrompts.systemPrompt,
        userPrompt: renderedPrompts.userPrompt,
        responseRaw: rawResponse ?? profile,
        responseParsed: profile,
        status: 'SUCCESS'
      });
    } catch (error) {
      const rawResponse = typeof providerForCall.getLastRawResponse === 'function' ? providerForCall.getLastRawResponse() : undefined;
      await recordAiCall({
        webId: job.data.webId,
        task: 'analyze',
        provider: providerName,
        model: modelName,
        variables,
        systemPrompt: renderedPrompts.systemPrompt,
        userPrompt: renderedPrompts.userPrompt,
        responseRaw: rawResponse ?? (error instanceof Error ? { message: error.message } : { error: 'Unknown error' }),
        status: 'ERROR',
        errorMessage: error instanceof Error ? error.message : undefined
      });
      throw error;
    }

    if (AI_DEBUG_LOG_PROMPTS) {
      logger.info({ webId: job.data.webId, result: profile }, 'AI debug: analyze response');
    }
    await prisma.webAnalysis.update({
      where: { webId: job.data.webId },
      data: { businessProfile: profile as unknown as Prisma.InputJsonValue }
    });

    if (!isDebug) {
      await strategyQueue.add('CreateSeoStrategy', { webId: job.data.webId });
    }
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
    const renderedPrompts = renderPromptsForTask('strategy', prompts, variables);
    const providerSelection = resolveProviderForTask('strategy', prompts);
    const providerForCall = providerSelection.provider;
    const providerName = providerForCall.name;
    const modelName = providerSelection.model;

    if (AI_DEBUG_LOG_PROMPTS) {
      logger.info({ webId: job.data.webId, variables, renderedPrompts }, 'AI debug: strategy request');
    }

    const isDebug = Boolean(job.data.debug);

    let strategy: SeoStrategy;
    try {
      strategy = (await providerForCall.buildSeoStrategy(businessProfile, {
        task: 'strategy',
        systemPrompt: renderedPrompts.systemPrompt,
        userPrompt: renderedPrompts.userPrompt,
        variables
      })) as SeoStrategy;

      const rawResponse = typeof providerForCall.getLastRawResponse === 'function' ? providerForCall.getLastRawResponse() : undefined;
      await recordAiCall({
        webId: job.data.webId,
        task: 'strategy',
        provider: providerName,
        model: modelName,
        variables,
        systemPrompt: renderedPrompts.systemPrompt,
        userPrompt: renderedPrompts.userPrompt,
        responseRaw: rawResponse ?? strategy,
        responseParsed: strategy,
        status: 'SUCCESS'
      });
    } catch (error) {
      const rawResponse = typeof providerForCall.getLastRawResponse === 'function' ? providerForCall.getLastRawResponse() : undefined;
      await recordAiCall({
        webId: job.data.webId,
        task: 'strategy',
        provider: providerName,
        model: modelName,
        variables,
        systemPrompt: renderedPrompts.systemPrompt,
        userPrompt: renderedPrompts.userPrompt,
        responseRaw: rawResponse ?? (error instanceof Error ? { message: error.message } : { error: 'Unknown error' }),
        status: 'ERROR',
        errorMessage: error instanceof Error ? error.message : undefined
      });
      throw error;
    }

    if (AI_DEBUG_LOG_PROMPTS) {
      logger.info({ webId: job.data.webId, result: strategy }, 'AI debug: strategy response');
    }

    await prisma.webAnalysis.update({
      where: { webId: job.data.webId },
      data: { seoStrategy: strategy as unknown as Prisma.InputJsonValue }
    });

    if (!isDebug) {
      await generateQueue.add('GenerateArticle', { webId: job.data.webId });
    }
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
    const renderedPrompts = renderPromptsForTask('article', prompts, variables);
    const providerSelection = resolveProviderForTask('article', prompts);
    const providerForCall = providerSelection.provider;
    const providerName = providerForCall.name;
    const modelName = providerSelection.model;

    if (AI_DEBUG_LOG_PROMPTS) {
      logger.info({ webId: job.data.webId, variables, renderedPrompts }, 'AI debug: article request');
    }

    let draft;
    try {
      draft = await providerForCall.generateArticle(
        strategy,
        {
          clusterName: targetCluster.name,
          targetTone: strategy.targetTone
        },
        {
          task: 'article',
          systemPrompt: renderedPrompts.systemPrompt,
          userPrompt: renderedPrompts.userPrompt,
          variables
        }
      );

      if (AI_DEBUG_LOG_PROMPTS) {
        logger.info({ webId: job.data.webId, result: draft }, 'AI debug: article response');
      }

      const rawResponse = typeof providerForCall.getLastRawResponse === 'function' ? providerForCall.getLastRawResponse() : undefined;
      await recordAiCall({
        webId: job.data.webId,
        task: 'article',
        provider: providerName,
        model: modelName,
        variables,
        systemPrompt: renderedPrompts.systemPrompt,
        userPrompt: renderedPrompts.userPrompt,
        responseRaw: rawResponse ?? draft,
        responseParsed: draft,
        status: 'SUCCESS'
      });
    } catch (error) {
      const rawResponse = typeof providerForCall.getLastRawResponse === 'function' ? providerForCall.getLastRawResponse() : undefined;
      await recordAiCall({
        webId: job.data.webId,
        task: 'article',
        provider: providerName,
        model: modelName,
        variables,
        systemPrompt: renderedPrompts.systemPrompt,
        userPrompt: renderedPrompts.userPrompt,
        responseRaw: rawResponse ?? (error instanceof Error ? { message: error.message } : { error: 'Unknown error' }),
        status: 'ERROR',
        errorMessage: error instanceof Error ? error.message : undefined
      });
      throw error;
    }

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
