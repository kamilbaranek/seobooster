import { config as loadEnv } from 'dotenv';
import { createDecipheriv } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const resolveProjectRoot = () => {
  const candidates = [
    process.env.PROJECT_ROOT,
    resolve(__dirname, '../../..'),
    resolve(__dirname, '../../../../..'),
    resolve(process.cwd(), '..', '..'),
    process.cwd()
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const pkgPath = resolve(candidate, 'package.json');
    if (!existsSync(pkgPath)) {
      continue;
    }
    try {
      const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf8')) as { workspaces?: unknown };
      if (pkgJson?.workspaces) {
        return candidate;
      }
    } catch {
      // ignore malformed package.json candidates
    }
  }

  return candidates[0] ?? process.cwd();
};

const projectRoot = resolveProjectRoot();
process.env.PROJECT_ROOT = projectRoot;

['.env', '.env.local'].forEach((envFile, index) => {
  const fullPath = resolve(projectRoot, envFile);
  if (existsSync(fullPath)) {
    loadEnv({ path: fullPath, override: index > 0 });
  }
});
import { Queue, QueueEvents, Worker } from 'bullmq';
import { fetch } from 'undici';
import { ArticlePlanStatus, AssetStatus, IntegrationType, Prisma, PrismaClient } from '@prisma/client';
import {
  ANALYZE_BUSINESS_QUEUE,
  CREATE_SEO_STRATEGY_QUEUE,
  FETCH_FAVICON_QUEUE,
  GENERATE_ARTICLE_QUEUE,
  GENERATE_SCREENSHOT_QUEUE,
  GENERATE_ARTICLE_IMAGE_QUEUE,
  PUBLISH_ARTICLE_QUEUE,
  SCAN_WEBSITE_QUEUE,
  AnalyzeBusinessJob,
  CreateSeoStrategyJob,
  FetchFaviconJob,
  GenerateArticleJob,
  GenerateHomepageScreenshotJob,
  GenerateArticleImageJob,
  PublishArticleJob,
  ScanWebsiteJob
} from '@seobooster/queue-types';
import { createLogger } from './logger';
import { aiProvider, aiModelMap } from './services/ai-orchestrator';
import type { AiTaskType, BusinessProfile, ProviderName, ScanResult, SeoStrategy } from '@seobooster/ai-types';
import { DEFAULT_PROMPTS, renderPromptTemplate } from '@seobooster/ai-prompts';
import { buildAiProviderFromEnv } from '@seobooster/ai-providers';
import { createAssetStorage, type AssetStorageDriver } from '@seobooster/storage';
import { fetchAndStoreFavicon } from './services/favicon';
import { captureScreenshot, shutdownRenderer } from './services/rendering-service';
import { renderArticleMarkdown } from '@seobooster/article-renderer';
import {
  createPost,
  updatePost,
  WordpressClientError,
  fetchTags,
  createTag,
  uploadMedia
} from '@seobooster/wp-client';
import type {
  WordpressPublishMode,
  WordpressCredentials,
  WordpressPostPayload,
  WordpressPostResponse
} from '@seobooster/wp-client';
import { EmailService, getArticleGeneratedEmail } from '@seobooster/email';
import { randomBytes } from 'crypto';
const logger = createLogger('worker');
const formatUnknownError = (error: unknown) =>
  error instanceof Error
    ? { message: error.message, stack: error.stack }
    : { raw: typeof error === 'string' ? error : JSON.stringify(error) };
const AI_DEBUG_LOG_PROMPTS = process.env.AI_DEBUG_LOG_PROMPTS === 'true';

const redisConnection = {
  host: process.env.REDIS_HOST ?? '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  ...(process.env.REDIS_USERNAME ? { username: process.env.REDIS_USERNAME } : {}),
  ...(process.env.REDIS_PASSWORD ? { password: process.env.REDIS_PASSWORD } : {}),
  ...(process.env.REDIS_USE_TLS === 'true' ? { tls: { rejectUnauthorized: false } } : {})
} as const;

const resolveAssetStorage = () => {
  const driver = (process.env.ASSET_STORAGE_DRIVER ?? 'local').toLowerCase() as AssetStorageDriver;

  if (driver === 'local') {
    const rootPath = process.env.ASSET_STORAGE_LOCAL_PATH ?? './storage/website-assets';
    const publicUrl = process.env.ASSET_PUBLIC_BASE_URL ?? 'http://localhost:3333/api/assets';
    return createAssetStorage({
      driver,
      local: {
        rootPath,
        publicBaseUrl: publicUrl
      }
    });
  }

  if (driver === 'vercel-blob') {
    const publicUrl = process.env.ASSET_PUBLIC_BASE_URL;
    if (!publicUrl) {
      throw new Error('ASSET_PUBLIC_BASE_URL is required for Vercel Blob asset storage');
    }
    return createAssetStorage({
      driver,
      vercelBlob: {
        publicBaseUrl: publicUrl,
        token: process.env.BLOB_READ_WRITE_TOKEN
      }
    });
  }

  throw new Error(`Unsupported asset storage driver in worker: ${driver}`);
};

const assetStorage = resolveAssetStorage();
const assetPublicBaseUrl = (process.env.ASSET_PUBLIC_BASE_URL ?? 'http://localhost:3333/api/assets').replace(
  /\/$/,
  ''
);

const storagePathFromPublicUrl = (url?: string | null) => {
  if (!url) {
    return null;
  }
  const normalized = url.replace(/\/$/, '');
  if (normalized.startsWith(`${assetPublicBaseUrl}/`)) {
    return normalized.slice(assetPublicBaseUrl.length + 1);
  }
  return null;
};

const resolveEncryptionKey = () => {
  const envKey = process.env.ENCRYPTION_KEY;
  if (!envKey) {
    logger.warn('ENCRYPTION_KEY is not set; WordPress credentials cannot be decrypted.');
    return null;
  }
  try {
    const buffer = Buffer.from(envKey, 'base64');
    if (buffer.length !== 32) {
      logger.warn('ENCRYPTION_KEY must be a 32-byte base64 string; credentials will be ignored.');
      return null;
    }
    return buffer;
  } catch (error) {
    logger.warn({ error }, 'Failed to parse ENCRYPTION_KEY; WordPress credentials will be ignored.');
    return null;
  }
};

const encryptionKey = resolveEncryptionKey();

const decryptWordpressCredentials = (encrypted: string) => {
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY is not configured');
  }
  const buffer = Buffer.from(encrypted, 'base64');
  if (buffer.length < 28) {
    throw new Error('Encrypted payload is too short');
  }
  const iv = buffer.subarray(0, 12);
  const authTag = buffer.subarray(12, 28);
  const ciphertext = buffer.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
};

const normalizePublishMode = (value: unknown): WordpressPublishMode => {
  if (value === 'auto_publish' || value === 'manual_approval' || value === 'draft_only') {
    return value;
  }
  return 'draft_only';
};

const parseWordpressCredentials = (encryptedRecord?: string | null): WordpressCredentials | null => {
  if (!encryptedRecord) {
    return null;
  }
  if (!encryptionKey) {
    return null;
  }
  let plaintext: string;
  try {
    plaintext = decryptWordpressCredentials(encryptedRecord);
  } catch (error) {
    logger.warn({ error }, 'Unable to decrypt WordPress credentials');
    return null;
  }
  try {
    const parsed = JSON.parse(plaintext) as Partial<WordpressCredentials>;
    if (
      parsed?.type !== 'wordpress_application_password' ||
      typeof parsed.baseUrl !== 'string' ||
      typeof parsed.username !== 'string' ||
      typeof parsed.applicationPassword !== 'string'
    ) {
      logger.warn('WordPress credentials are missing required fields');
      return null;
    }
    return {
      type: 'wordpress_application_password',
      baseUrl: parsed.baseUrl,
      username: parsed.username,
      applicationPassword: parsed.applicationPassword,
      autoPublishMode: normalizePublishMode(parsed.autoPublishMode)
    };
  } catch (error) {
    logger.warn({ error }, 'Unable to parse WordPress credentials JSON');
    return null;
  }
};

const prisma = new PrismaClient();
const scanQueue = new Queue(SCAN_WEBSITE_QUEUE, { connection: redisConnection });
const analyzeQueue = new Queue(ANALYZE_BUSINESS_QUEUE, { connection: redisConnection });
const strategyQueue = new Queue(CREATE_SEO_STRATEGY_QUEUE, { connection: redisConnection });
const generateQueue = new Queue(GENERATE_ARTICLE_QUEUE, { connection: redisConnection });
const publishQueue = new Queue(PUBLISH_ARTICLE_QUEUE, { connection: redisConnection });
const faviconQueue = new Queue(FETCH_FAVICON_QUEUE, { connection: redisConnection });
const screenshotQueue = new Queue(GENERATE_SCREENSHOT_QUEUE, { connection: redisConnection });
const articleImageQueue = new Queue(GENERATE_ARTICLE_IMAGE_QUEUE, { connection: redisConnection });

const emailService = new EmailService({
  apiKey: process.env.MAILGUN_API_KEY || '',
  domain: process.env.MAILGUN_DOMAIN || '',
  host: process.env.MAILGUN_HOST,
  fromEmail: process.env.MAILGUN_FROM_EMAIL || `noreply@${process.env.MAILGUN_DOMAIN || 'example.com'}`,
  fromName: 'Budliki budliki'
});

logger.info({
  apiKeyPresent: !!process.env.MAILGUN_API_KEY,
  apiKeyLength: process.env.MAILGUN_API_KEY?.length,
  domain: process.env.MAILGUN_DOMAIN,
  host: process.env.MAILGUN_HOST,
  fromEmail: process.env.MAILGUN_FROM_EMAIL
}, 'EmailService initialized');

let redisLimitExceeded = false;

const handleRedisError = (source: string, name: string, err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);

  if (message.includes('max requests limit exceeded')) {
    if (redisLimitExceeded) {
      return;
    }
    redisLimitExceeded = true;
    logger.error({ source, name, err }, 'Redis max requests limit exceeded, stopping worker');
    // V tomto stavu nemá smysl dál bombardovat Upstash, proces ukončíme.
    setTimeout(async () => {
      try {
        await stop();
      } catch (stopError) {
        logger.error({ stopError }, 'Failed to perform graceful shutdown after Redis limit');
      }
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }, 0);
    return;
  }

  logger.error({ source, name, err }, 'Redis error from BullMQ');
};

const stop = async () => {
  logger.info('Shutting down worker...');
  await Promise.all([
    scanQueue.close(),
    analyzeQueue.close(),
    strategyQueue.close(),
    generateQueue.close(),
    publishQueue.close(),
    faviconQueue.close(),
    screenshotQueue.close()
  ]);
  await prisma.$disconnect();
  await shutdownRenderer().catch((error) => {
    logger.warn({ error }, 'Failed to shutdown rendering service');
  });
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
  events.on('error', (err) => {
    handleRedisError('events', queueName, err);
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
) => {
  const worker = new Worker(
    queueName,
    async (job) => {
      logger.info({ queueName, jobId: job.id }, 'Processing job');
      await processor(job);
    },
    { connection: redisConnection }
  );

  worker.on('error', (err) => {
    handleRedisError('worker', queueName, err);
  });

  return worker;
};

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

const PLAN_WINDOW_START_HOUR = 9;
const PLAN_WINDOW_END_HOUR = 17;

const getInitialPlanStartDate = () => {
  const base = new Date();
  base.setUTCDate(base.getUTCDate() + 1);
  base.setUTCHours(PLAN_WINDOW_START_HOUR, 0, 0, 0);
  base.setUTCMinutes(0);
  base.setUTCSeconds(0);
  base.setUTCMilliseconds(0);
  return base;
};

const getPlannedDateForIndex = (startDate: Date, index: number) => {
  const date = new Date(startDate);
  date.setUTCDate(date.getUTCDate() + index);
  const hourWindow = Math.max(1, PLAN_WINDOW_END_HOUR - PLAN_WINDOW_START_HOUR);
  const randomHourOffset = Math.floor(Math.random() * hourWindow);
  const baseMinutes = Math.floor(Math.random() * 60);
  const jitterMinutes = Math.floor(Math.random() * 90);
  const jitterDirection = Math.random() > 0.5 ? 1 : -1;
  date.setUTCHours(PLAN_WINDOW_START_HOUR + randomHourOffset, baseMinutes, 0, 0);
  date.setUTCMinutes(date.getUTCMinutes() + jitterDirection * jitterMinutes);
  return date;
};

const jsonArrayToStringArray = (value: Prisma.JsonValue | null | undefined) => {
  if (!value || !Array.isArray(value)) {
    return [];
  }
  return value.map((item) => (typeof item === 'string' ? item : String(item)));
};

const toBuffer = (input: ArrayBuffer | Uint8Array | Buffer): Buffer => {
  if (Buffer.isBuffer(input)) {
    return input;
  }
  if (input instanceof ArrayBuffer) {
    return Buffer.from(input);
  }
  return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
};

const getImageExtensionFromMime = (mimeType?: string | null) => {
  const normalized = mimeType?.toLowerCase() ?? '';
  if (normalized.includes('jpeg') || normalized.includes('jpg')) {
    return 'jpg';
  }
  if (normalized.includes('webp')) {
    return 'webp';
  }
  return 'png';
};

const buildArticleImagePath = (webId: string, articleId: string, imageId: string) =>
  `webs/${webId}/articles/${articleId}/images/${imageId}.jpg`;

const getMimeTypeFromExtension = (extension?: string) => {
  const normalized = (extension ?? '').toLowerCase();
  if (normalized === 'jpg' || normalized === 'jpeg') {
    return 'image/jpeg';
  }
  if (normalized === 'webp') {
    return 'image/webp';
  }
  return 'image/png';
};

type DownloadedImage = {
  buffer: Buffer;
  mimeType: string;
  filename: string;
};

const downloadFeaturedImageBinary = async (
  publicUrl: string | null | undefined,
  localPath: string | null
): Promise<DownloadedImage | null> => {
  if (!publicUrl) {
    return null;
  }

  if (localPath) {
    try {
      const buffer = await assetStorage.getFile(localPath);
      const filename = localPath.split('/').pop() ?? 'featured-image.png';
      const ext = filename.includes('.') ? filename.split('.').pop() ?? 'png' : 'png';
      return {
        buffer,
        mimeType: getMimeTypeFromExtension(ext),
        filename
      };
    } catch (error) {
      logger.warn(
        { localPath, error: formatUnknownError(error) },
        'Failed to read featured image from asset storage'
      );
    }
  }

  try {
    const response = await fetch(publicUrl);
    if (!response.ok) {
      throw new Error(`Image download responded with status ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const filenameFromUrl = publicUrl.split('/').pop()?.split('?')[0] ?? 'featured-image';
    const ext = filenameFromUrl.includes('.') ? filenameFromUrl.split('.').pop() ?? 'png' : 'png';
    const mimeType = response.headers.get('content-type') ?? getMimeTypeFromExtension(ext);
    return {
      buffer: Buffer.from(arrayBuffer),
      mimeType,
      filename: filenameFromUrl
    };
  } catch (error) {
    logger.warn(
      { url: publicUrl, error: formatUnknownError(error) },
      'Failed to download featured image over HTTP'
    );
    return null;
  }
};

const buildArticleImageJobOptions = (articleId: string, force?: boolean) => ({
  jobId: force ? `article-image-${articleId}-${Date.now()}` : `article-image-${articleId}`,
  removeOnComplete: true,
  removeOnFail: true
});

const persistSeoStrategyArtifacts = async (
  webId: string,
  strategy: SeoStrategy,
  modelName?: string | null
) => {
  const topicClusters = strategy.topic_clusters ?? [];
  const planStartDate = getInitialPlanStartDate();

  const existingStrategies = await prisma.seoStrategy.findMany({
    where: { webId, isActive: true },
    select: { id: true }
  });

  if (existingStrategies.length > 0) {
    const strategyIds = existingStrategies.map((item) => item.id);
    await prisma.articlePlan.updateMany({
      where: {
        strategyId: { in: strategyIds },
        status: { in: [ArticlePlanStatus.PLANNED, ArticlePlanStatus.QUEUED] }
      },
      data: { status: ArticlePlanStatus.SKIPPED }
    });
  }

  await prisma.seoStrategy.updateMany({
    where: { webId, isActive: true },
    data: { isActive: false }
  });

  const storedStrategy = await prisma.seoStrategy.create({
    data: {
      webId,
      model: modelName ?? null,
      rawJson: strategy as unknown as Prisma.InputJsonValue,
      businessName: strategy.business?.name ?? null,
      businessDescription: strategy.business?.description ?? null,
      businessTargetAudience: strategy.business?.target_audience ?? null,
      isActive: true
    }
  });

  type ClusterRecord = {
    clusterId: string;
    supportingArticles: string[];
  };

  const clusterRecords: ClusterRecord[] = [];

  for (let i = 0; i < topicClusters.length; i += 1) {
    const cluster = topicClusters[i];
    const createdCluster = await prisma.seoTopicCluster.create({
      data: {
        strategyId: storedStrategy.id,
        orderIndex: i,
        pillarPage: cluster.pillar_page ?? `Pillar ${i + 1}`,
        pillarKeywords: (cluster.pillar_keywords ?? []) as Prisma.InputJsonValue,
        clusterIntent: cluster.cluster_intent ?? 'informational',
        funnelStage: cluster.funnel_stage ?? 'TOFU'
      }
    });

    const supportingArticles = cluster.supporting_articles ?? [];
    const supportingArticleIds: string[] = [];

    for (let j = 0; j < supportingArticles.length; j += 1) {
      const supportingArticle = supportingArticles[j];
      const createdSupporting = await prisma.seoSupportingArticle.create({
        data: {
          clusterId: createdCluster.id,
          orderIndex: j,
          title: supportingArticle.title ?? `Supporting article ${j + 1}`,
          keywords: (supportingArticle.keywords ?? []) as Prisma.InputJsonValue,
          intent: supportingArticle.intent ?? 'informational',
          funnelStage: supportingArticle.funnel_stage ?? cluster.funnel_stage ?? 'TOFU',
          metaDescription: supportingArticle.meta_description ?? null
        }
      });
      supportingArticleIds.push(createdSupporting.id);
    }

    clusterRecords.push({
      clusterId: createdCluster.id,
      supportingArticles: supportingArticleIds
    });
  }

  let planIndex = 0;
  for (const record of clusterRecords) {
    for (const supportingArticleId of record.supportingArticles) {
      const plannedPublishAt = getPlannedDateForIndex(planStartDate, planIndex);
      planIndex += 1;
      await prisma.articlePlan.create({
        data: {
          webId,
          strategyId: storedStrategy.id,
          clusterId: record.clusterId,
          supportingArticleId,
          plannedPublishAt
        }
      });
    }
  }
};

const ARTICLE_PLAN_POLL_INTERVAL_MS = parseInt(process.env.ARTICLE_PLAN_POLL_INTERVAL_MS ?? '600000', 10);
const ARTICLE_PLAN_BATCH_SIZE = parseInt(process.env.ARTICLE_PLAN_BATCH_SIZE ?? '10', 10);

const processDueArticlePlans = async () => {
  const now = new Date();
  const duePlans = await prisma.articlePlan.findMany({
    where: {
      status: ArticlePlanStatus.PLANNED,
      plannedPublishAt: { lte: now },
      strategy: { isActive: true }
    },
    orderBy: { plannedPublishAt: 'asc' },
    take: ARTICLE_PLAN_BATCH_SIZE
  });

  for (const plan of duePlans) {
    const claimed = await prisma.articlePlan.updateMany({
      where: { id: plan.id, status: ArticlePlanStatus.PLANNED },
      data: { status: ArticlePlanStatus.QUEUED }
    });

    if (!claimed.count) {
      continue;
    }

    await generateQueue.add('GenerateArticle', {
      webId: plan.webId,
      plannedArticleId: plan.id
    });

    logger.info(
      { planId: plan.id, webId: plan.webId, plannedPublishAt: plan.plannedPublishAt },
      'Queued article generation from plan'
    );
  }
};

const startArticlePlanScheduler = () => {
  const runScheduler = async () => {
    try {
      await processDueArticlePlans();
    } catch (error) {
      logger.error({ error }, 'Failed to process scheduled article plans');
    }
  };

  runScheduler().catch((error) => logger.error({ error }, 'Initial article plan processing failed'));
  setInterval(runScheduler, ARTICLE_PLAN_POLL_INTERVAL_MS);
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
    registerQueueEvents(GENERATE_ARTICLE_IMAGE_QUEUE),
    registerQueueEvents(PUBLISH_ARTICLE_QUEUE),
    registerQueueEvents(FETCH_FAVICON_QUEUE),
    registerQueueEvents(GENERATE_SCREENSHOT_QUEUE)
  ]);

  startArticlePlanScheduler();

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
    const forceJsonResponse = prompts?.forceJsonResponse !== false;

    if (AI_DEBUG_LOG_PROMPTS) {
      logger.info({ webId: web.id, variables, renderedPrompts }, 'AI debug: scan request');
    }

    const isDebug = Boolean(job.data.debug);

    let scanResult: ScanResult;
    let rawScanText: string | undefined;
    try {
      scanResult = (await providerForCall.scanWebsite(web.url, {
        task: 'scan',
        systemPrompt: renderedPrompts.systemPrompt,
        userPrompt: renderedPrompts.userPrompt,
        variables,
        forceJsonResponse
      })) as ScanResult;

      if (AI_DEBUG_LOG_PROMPTS) {
        logger.info({ webId: web.id, result: scanResult }, 'AI debug: scan response');
      }

      const rawResponse = typeof providerForCall.getLastRawResponse === 'function' ? providerForCall.getLastRawResponse() : undefined;
      rawScanText =
        typeof (providerForCall as { getLastMessageContent?: () => string | undefined }).getLastMessageContent ===
          'function'
          ? (providerForCall as { getLastMessageContent?: () => string | undefined }).getLastMessageContent?.()
          : undefined;
      await recordAiCall({
        webId: web.id,
        task: 'scan',
        provider: providerName,
        model: modelName,
        variables,
        systemPrompt: renderedPrompts.systemPrompt,
        userPrompt: renderedPrompts.userPrompt,
        responseRaw: rawResponse ?? rawScanText ?? scanResult,
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
      await analyzeQueue.add('AnalyzeBusiness', {
        webId: web.id,
        rawScanOutput: rawScanText ?? null
      });
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
    const renderedPrompts = renderPromptsForTask('analyze', prompts, {
      ...variables,
      rawScanOutput: job.data.rawScanOutput ?? null
    });
    const providerSelection = resolveProviderForTask('analyze', prompts);
    const providerForCall = providerSelection.provider;
    const providerName = providerForCall.name;
    const modelName = providerSelection.model;
    const forceJsonResponse = prompts?.forceJsonResponse !== false;

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
        variables: {
          ...variables,
          rawScanOutput: job.data.rawScanOutput ?? null
        },
        forceJsonResponse
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
    const forceJsonResponse = prompts?.forceJsonResponse !== false;

    if (AI_DEBUG_LOG_PROMPTS) {
      logger.info({ webId: job.data.webId, variables, renderedPrompts }, 'AI debug: strategy request');
    }

    let strategy: SeoStrategy;
    try {
      strategy = (await providerForCall.buildSeoStrategy(businessProfile, {
        task: 'strategy',
        systemPrompt: renderedPrompts.systemPrompt,
        userPrompt: renderedPrompts.userPrompt,
        variables,
        forceJsonResponse
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

    await persistSeoStrategyArtifacts(job.data.webId, strategy, modelName);

  });

  createWorker<GenerateArticleJob>(GENERATE_ARTICLE_QUEUE, async (job) => {
    if (!job.data.plannedArticleId) {
      logger.warn({ jobId: job.id }, 'GenerateArticle job missing plannedArticleId');
      return;
    }

    const plan = await prisma.articlePlan.findUnique({
      where: { id: job.data.plannedArticleId },
      include: {
        strategy: true,
        cluster: true,
        supportingArticle: true,
        web: {
          include: {
            analysis: true,
            user: true,
            credentials: true
          }
        }
      }
    });

    if (!plan) {
      logger.warn({ jobId: job.id, planId: job.data.plannedArticleId }, 'Article plan not found');
      return;
    }

    if (!plan.strategy.rawJson && !plan.web.analysis?.seoStrategy) {
      logger.warn({ planId: plan.id, webId: plan.webId }, 'No stored SEO strategy JSON available');
      return;
    }

    const seoStrategyPayload = (plan.strategy.rawJson ??
      plan.web.analysis?.seoStrategy) as unknown as SeoStrategy | null;

    if (!seoStrategyPayload) {
      logger.warn({ planId: plan.id, webId: plan.webId }, 'Unable to parse SEO strategy payload');
      return;
    }

    const businessProfile = plan.web.analysis?.businessProfile as BusinessProfile | null;
    const pillarKeywords = jsonArrayToStringArray(plan.cluster.pillarKeywords);
    const supportingKeywords = jsonArrayToStringArray(plan.supportingArticle.keywords);

    const promptVariables = {
      topicCluster: {
        pillarPage: plan.cluster.pillarPage,
        pillarKeywords,
        intent: plan.cluster.clusterIntent,
        funnelStage: plan.cluster.funnelStage,
        order: plan.cluster.orderIndex
      },
      supportingArticle: {
        title: plan.supportingArticle.title,
        keywords: supportingKeywords,
        intent: plan.supportingArticle.intent,
        funnelStage: plan.supportingArticle.funnelStage,
        metaDescription: plan.supportingArticle.metaDescription
      },
      business: {
        name: plan.strategy.businessName ?? businessProfile?.name ?? plan.web.nickname ?? plan.web.url,
        description: plan.strategy.businessDescription ?? businessProfile?.mission ?? null,
        targetAudience:
          plan.strategy.businessTargetAudience ?? businessProfile?.audience?.join(', ') ?? null
      },
      web: {
        url: plan.web.url,
        nickname: plan.web.nickname
      },
      webAudience: businessProfile?.audience ?? [],
      webOwner: {
        email: plan.web.user.email
      }
    };

    const prompts = await prisma.aiPromptConfig.findUnique({
      where: { task: 'article' }
    });
    const renderedPrompts = renderPromptsForTask('article', prompts, promptVariables);
    const providerSelection = resolveProviderForTask('article', prompts);
    const providerForCall = providerSelection.provider;
    const providerName = providerForCall.name;
    const modelName = providerSelection.model;
    const forceJsonResponse = prompts?.forceJsonResponse !== false;

    if (AI_DEBUG_LOG_PROMPTS) {
      logger.info(
        { planId: plan.id, variables: promptVariables, renderedPrompts },
        'AI debug: article request'
      );
    }

    let draft;
    try {
      draft = await providerForCall.generateArticle(
        seoStrategyPayload,
        {
          clusterName: plan.supportingArticle.title,
          targetTone: 'Professional'
        },
        {
          task: 'article',
          systemPrompt: renderedPrompts.systemPrompt,
          userPrompt: renderedPrompts.userPrompt,
          variables: promptVariables,
          forceJsonResponse
        }
      );

      if (AI_DEBUG_LOG_PROMPTS) {
        logger.info({ planId: plan.id, result: draft }, 'AI debug: article response');
      }

      const rawResponse = typeof providerForCall.getLastRawResponse === 'function' ? providerForCall.getLastRawResponse() : undefined;
      await recordAiCall({
        webId: plan.webId,
        task: 'article',
        provider: providerName,
        model: modelName,
        variables: promptVariables,
        systemPrompt: renderedPrompts.systemPrompt,
        userPrompt: renderedPrompts.userPrompt,
        responseRaw: rawResponse ?? draft,
        responseParsed: draft,
        status: 'SUCCESS'
      });
    } catch (error) {
      const rawResponse = typeof providerForCall.getLastRawResponse === 'function' ? providerForCall.getLastRawResponse() : undefined;
      await recordAiCall({
        webId: plan.webId,
        task: 'article',
        provider: providerName,
        model: modelName,
        variables: promptVariables,
        systemPrompt: renderedPrompts.systemPrompt,
        userPrompt: renderedPrompts.userPrompt,
        responseRaw: rawResponse ?? (error instanceof Error ? { message: error.message } : { error: 'Unknown error' }),
        status: 'ERROR',
        errorMessage: error instanceof Error ? error.message : undefined
      });
      throw error;
    }

    if (typeof draft.bodyMarkdown !== 'string' || draft.bodyMarkdown.trim().length === 0) {
      throw new Error('Invalid ArticleDraft: missing bodyMarkdown');
    }

    const html = await renderArticleMarkdown(draft.bodyMarkdown);

    const article = await prisma.article.create({
      data: {
        webId: plan.webId,
        title: draft.title,
        markdown: draft.bodyMarkdown,
        html,
        status: 'DRAFT'
      }
    });

    await prisma.articlePlan.update({
      where: { id: plan.id },
      data: {
        status: ArticlePlanStatus.GENERATED,
        articleId: article.id
      }
    });

    let publishOptions: { targetStatus: 'draft' | 'publish'; trigger: 'auto' | 'manual' | 'email' } | undefined;

    if (plan.web.integrationType === IntegrationType.WORDPRESS_APPLICATION_PASSWORD && plan.web.credentials?.encryptedJson) {
      const credentials = parseWordpressCredentials(plan.web.credentials.encryptedJson);
      if (credentials) {
        const publishMode = credentials.autoPublishMode ?? 'draft_only';
        const targetStatus = publishMode === 'auto_publish' ? 'publish' : 'draft';
        publishOptions = {
          targetStatus,
          trigger: 'auto'
        };
      }
    }

    if (plan.web.articleImageGenerationEnabled !== false) {
      await articleImageQueue.add(
        'GenerateArticleImage',
        {
          articleId: article.id,
          force: false,
          publishOptions
        },
        buildArticleImageJobOptions(article.id)
      );
      logger.info({ jobId: job.id, articleId: article.id }, 'Enqueued GenerateArticleImage job');
    } else {
      logger.info(
        { jobId: job.id, articleId: article.id, webId: plan.webId },
        'Skipping article image generation because it is disabled for this web'
      );

      if (publishOptions) {
        await publishQueue.add('PublishArticle', {
          articleId: article.id,
          targetStatus: publishOptions.targetStatus,
          trigger: publishOptions.trigger
        });
        logger.info({ jobId: job.id, articleId: article.id }, 'Enqueued PublishArticle job directly');
      }
    }

    logger.info({ jobId: job.id, articleId: article.id, planId: plan.id }, 'Article draft stored');
  });

  createWorker<GenerateArticleImageJob>(GENERATE_ARTICLE_IMAGE_QUEUE, async (job) => {
    const article = await prisma.article.findUnique({
      where: { id: job.data.articleId },
      include: {
        web: {
          include: {
            analysis: true,
            user: true,
            subscription: {
              select: { imageGenerationLimit: true }
            }
          }
        },
        plan: {
          include: {
            supportingArticle: true,
            cluster: true,
            strategy: true
          }
        }
      }
    });

    if (!article) {
      logger.warn({ jobId: job.id, articleId: job.data.articleId }, 'Article not found for image generation');
      return;
    }

    if (article.web.articleImageGenerationEnabled === false && !job.data.force) {
      logger.info(
        { jobId: job.id, articleId: article.id, webId: article.webId },
        'Article image generation disabled; skipping job'
      );
      return;
    }

    // Check subscription limit
    const imageGenerationLimit = article.web.subscription?.imageGenerationLimit ?? 1;
    const existingImagesCount = await prisma.articleImage.count({
      where: {
        articleId: article.id,
        status: { in: ['PENDING', 'SUCCESS'] }
      }
    });

    if (existingImagesCount >= imageGenerationLimit && !job.data.force) {
      logger.info(
        { jobId: job.id, articleId: article.id, limit: imageGenerationLimit, existing: existingImagesCount },
        'Image generation limit reached'
      );
      return;
    }

    const businessProfile = article.web.analysis?.businessProfile as BusinessProfile | null;
    const supportingKeywords = article.plan?.supportingArticle
      ? jsonArrayToStringArray(article.plan.supportingArticle.keywords as Prisma.JsonValue)
      : [];
    const articleTags = jsonArrayToStringArray(article.tags as Prisma.JsonValue);
    const articleKeywords = articleTags.length > 0 ? articleTags : supportingKeywords;
    const articleSummary = article.markdown.replace(/\s+/g, ' ').trim().slice(0, 500);

    const promptVariables = {
      business: {
        name: businessProfile?.name ?? article.web.nickname ?? article.web.url,
        description: businessProfile?.mission ?? null,
        targetAudience: businessProfile?.audience ?? []
      },
      web: {
        url: article.web.url,
        nickname: article.web.nickname ?? article.web.url
      },
      article: {
        title: article.title,
        summary: articleSummary,
        keywords: articleKeywords
      },
      supportingArticle: article.plan?.supportingArticle ?? null,
      seoCluster: article.plan?.cluster ?? null
    };

    const prompts = await prisma.aiPromptConfig.findUnique({
      where: { task: 'article_image' }
    });
    const renderedPrompts = renderPromptsForTask('article_image', prompts, promptVariables);
    if (!renderedPrompts.userPrompt) {
      throw new Error('Article image prompt template produced an empty user prompt');
    }
    const providerSelection = resolveProviderForTask('article_image', prompts);
    const providerForCall = providerSelection.provider;
    const providerName = providerForCall.name;
    const modelName = providerSelection.model;

    // Get or update ArticleImage record
    if (!job.data.imageId) {
      logger.error({ jobId: job.id, articleId: article.id, data: job.data }, 'Missing imageId in job data');
      return;
    }

    let articleImage = await prisma.articleImage.findUnique({
      where: { id: job.data.imageId }
    });

    if (!articleImage) {
      throw new Error(`ArticleImage not found: ${job.data.imageId}`);
    }

    // Update with prompt, provider, model
    articleImage = await prisma.articleImage.update({
      where: { id: articleImage.id },
      data: {
        prompt: renderedPrompts.userPrompt,
        provider: providerName,
        model: modelName
      }
    });

    logger.info(
      { jobId: job.id, articleId: article.id, imageId: articleImage.id, isFeatured: articleImage.isFeatured },
      'ArticleImage record updated with generation details'
    );

    let imageResult;
    try {
      imageResult = await providerForCall.generateImage(
        {
          prompt: renderedPrompts.userPrompt,
          size: 'landscape',
          suggestedFileName: `${article.id} - featured`
        },
        {
          task: 'article_image',
          systemPrompt: renderedPrompts.systemPrompt,
          userPrompt: renderedPrompts.userPrompt,
          variables: promptVariables
        }
      );
      const rawResponse =
        typeof providerForCall.getLastRawResponse === 'function'
          ? providerForCall.getLastRawResponse()
          : undefined;
      await recordAiCall({
        webId: article.webId,
        task: 'article_image',
        provider: providerName,
        model: modelName,
        variables: promptVariables,
        systemPrompt: renderedPrompts.systemPrompt ?? '',
        userPrompt: renderedPrompts.userPrompt,
        responseRaw: rawResponse ?? { source: imageResult.source },
        responseParsed: { source: imageResult.source },
        status: 'SUCCESS'
      });
    } catch (error) {
      const rawResponse =
        typeof providerForCall.getLastRawResponse === 'function'
          ? providerForCall.getLastRawResponse()
          : undefined;
      await recordAiCall({
        webId: article.webId,
        task: 'article_image',
        provider: providerName,
        model: modelName,
        variables: promptVariables,
        systemPrompt: renderedPrompts.systemPrompt ?? '',
        userPrompt: renderedPrompts.userPrompt,
        responseRaw: rawResponse ?? (error instanceof Error ? { message: error.message } : undefined),
        status: 'ERROR',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      // Update ArticleImage to FAILED status
      await prisma.articleImage.update({
        where: { id: articleImage.id },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      logger.error(
        { jobId: job.id, articleId: article.id, imageId: articleImage.id, error: error instanceof Error ? error.message : 'Unknown error' },
        'Article image generation failed'
      );

      throw error;
    }

    const imageBuffer = toBuffer(imageResult.data);
    const mimeType = imageResult.mimeType || 'image/png';
    const extension = getImageExtensionFromMime(mimeType);
    const storagePath = buildArticleImagePath(article.webId, article.id, articleImage.id);
    const publicUrl = await assetStorage.saveFile(storagePath, imageBuffer, mimeType);

    // Update ArticleImage to SUCCESS status with imageUrl
    await prisma.articleImage.update({
      where: { id: articleImage.id },
      data: {
        status: 'SUCCESS',
        imageUrl: publicUrl
      }
    });

    // Update Article.featuredImageUrl only if this image is featured
    if (articleImage.isFeatured) {
      await prisma.article.update({
        where: { id: article.id },
        data: {
          featuredImageUrl: publicUrl
        }
      });
    }

    logger.info(
      { jobId: job.id, articleId: article.id, imageId: articleImage.id, publicUrl, isFeatured: articleImage.isFeatured },
      'Article image stored'
    );

    if (job.data.publishOptions) {
      await publishQueue.add('PublishArticle', {
        articleId: article.id,
        targetStatus: job.data.publishOptions.targetStatus,
        trigger: job.data.publishOptions.trigger
      });
      logger.info({ jobId: job.id, articleId: article.id }, 'Enqueued PublishArticle job after image generation');
    }
  });

  createWorker<PublishArticleJob>(PUBLISH_ARTICLE_QUEUE, async (job) => {
    const { articleId, targetStatus, trigger } = job.data;
    logger.info({ jobId: job.id, articleId, targetStatus, trigger }, 'Publishing article job started');

    const article = (await (prisma as unknown as { article: { findUnique: (args: unknown) => Promise<unknown> } }).article.findUnique({
      where: { id: articleId },
      include: {
        web: {
          include: {
            credentials: true,
            defaultWordpressCategory: true,
            defaultWordpressAuthor: true,
            analysis: true,
            user: true
          }
        },
        plan: {
          include: {
            supportingArticle: true
          }
        },
        wordpressCategory: true,
        wordpressAuthor: true
      }
    })) as any;

    if (!article) {
      logger.warn({ jobId: job.id, articleId }, 'Article not found');
      return;
    }

    const web = article.web;
    if (!web || web.integrationType !== IntegrationType.WORDPRESS_APPLICATION_PASSWORD) {
      logger.warn(
        { jobId: job.id, articleId, integrationType: web?.integrationType },
        'Web does not support WordPress publishing'
      );
      return;
    }

    const credentials = parseWordpressCredentials(web.credentials?.encryptedJson ?? null);
    if (!credentials) {
      logger.warn({ jobId: job.id, articleId }, 'Missing or invalid WordPress credentials');
      return;
    }

    try {
      const renderedHtml = await renderArticleMarkdown(article.markdown);
      const htmlContent =
        renderedHtml.trim().length > 0
          ? renderedHtml
          : article.html?.trim().length
            ? article.html
            : article.markdown;
      // Resolve WordPress category (article override -> web default)
      const categoryRemoteId =
        article.wordpressCategory?.remoteId ?? article.web.defaultWordpressCategory?.remoteId ?? null;
      const categories = categoryRemoteId ? [categoryRemoteId] : undefined;

      // Resolve WordPress author (article override -> web default)
      const authorRemoteId =
        article.wordpressAuthor?.remoteId ?? article.web.defaultWordpressAuthor?.remoteId ?? undefined;

      let featuredMediaId: number | undefined;
      let featuredMediaSourceUrl: string | undefined;
      const localFeaturedImagePath = storagePathFromPublicUrl(article.featuredImageUrl);
      if (localFeaturedImagePath) {
        const downloaded = await downloadFeaturedImageBinary(
          article.featuredImageUrl,
          localFeaturedImagePath
        );
        if (downloaded) {
          try {
            const media = await uploadMedia(credentials, downloaded.buffer, {
              filename: downloaded.filename,
              mimeType: downloaded.mimeType,
              title: article.title,
              altText: article.title
            });
            featuredMediaId = media.id;
            featuredMediaSourceUrl = media.source_url;
            try {
              await assetStorage.deleteFile(localFeaturedImagePath);
            } catch (deleteError) {
              logger.warn(
                { jobId: job.id, articleId, localFeaturedImagePath, error: formatUnknownError(deleteError) },
                'Failed to delete local featured image after upload'
              );
            }
          } catch (uploadError) {
            logger.warn(
              { jobId: job.id, articleId, error: formatUnknownError(uploadError) },
              'Failed to upload featured image to WordPress'
            );
          }
        }
      }

      // Resolve tags from article or SEO keywords
      const resolveArticleTags = (): string[] => {
        const explicit = jsonArrayToStringArray(article.tags as unknown as Prisma.JsonValue);
        if (explicit.length > 0) {
          return explicit;
        }
        if (article.web.wordpressTagsMode !== 'AUTO_FROM_KEYWORDS') {
          return [];
        }
        const keywords =
          article.plan?.supportingArticle?.keywords ??
          article.web.analysis?.seoStrategy ??
          null;
        return jsonArrayToStringArray(keywords as Prisma.JsonValue);
      };

      const tagNames = resolveArticleTags();
      let tagIds: number[] | undefined;

      if (tagNames.length > 0) {
        const uniqueNames = Array.from(
          new Set(
            tagNames
              .map((name) => name.trim())
              .filter((name) => name.length > 0)
          )
        );

        const resolvedIds: number[] = [];
        for (const name of uniqueNames) {
          try {
            const existing = await fetchTags(credentials, name);
            const exactMatch = existing.find(
              (tag) =>
                tag.name.toLowerCase() === name.toLowerCase() ||
                tag.slug.toLowerCase() === name.toLowerCase()
            );
            if (exactMatch) {
              resolvedIds.push(exactMatch.id);
              continue;
            }
            const created = await createTag(credentials, name);
            resolvedIds.push(created.id);
          } catch (err) {
            logger.warn(
              { jobId: job.id, articleId, tagName: name, error: (err as Error).message },
              'Failed to resolve WordPress tag'
            );
          }
        }
        if (resolvedIds.length > 0) {
          tagIds = resolvedIds;
        }
      }

      const payload: WordpressPostPayload = {
        title: article.title,
        content: htmlContent,
        status: targetStatus,
        author: authorRemoteId,
        categories,
        tags: tagIds
      };
      if (featuredMediaId) {
        payload.featured_media = featuredMediaId;
      }

      let response: WordpressPostResponse;
      try {
        response = article.wordpressPostId
          ? await updatePost(credentials, article.wordpressPostId, payload)
          : await createPost(credentials, payload);
      } catch (error) {
        if (
          error instanceof WordpressClientError &&
          error.status === 404 &&
          article.wordpressPostId
        ) {
          logger.warn(
            { jobId: job.id, articleId, wordpressPostId: article.wordpressPostId },
            'WordPress post not found; retrying as new post'
          );
          response = await createPost(credentials, payload);
        } else {
          throw error;
        }
      }

      const updateData: Prisma.ArticleUpdateInput = {
        status: targetStatus === 'publish' ? 'PUBLISHED' : 'DRAFT',
        wordpressPostId: String(response.id)
      };
      if (featuredMediaSourceUrl) {
        updateData.featuredImageUrl = featuredMediaSourceUrl;
      }

      if (targetStatus === 'publish') {
        updateData.publishedAt = new Date();
      }

      await prisma.article.update({
        where: { id: article.id },
        data: {
          ...updateData,
          html: htmlContent
        }
      });

      if (targetStatus === 'publish' && article.plan?.id) {
        await prisma.articlePlan.update({
          where: { id: article.plan.id },
          data: { status: ArticlePlanStatus.PUBLISHED }
        });
      }

      logger.info({ jobId: job.id, articleId, targetStatus }, 'WordPress publish succeeded');

      // Generate Magic Links and Send Email
      try {
        // Check if magic links already exist to avoid duplicates if job retries? 
        // Actually, new tokens for new notification is fine, but let's check if we want to reuse.
        // For simplicity, generate new ones.

        const publishToken = randomBytes(32).toString('hex');
        const feedbackToken = randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

        logger.info({ jobId: job.id, articleId, publishToken, feedbackToken }, 'Generated magic link tokens');

        await (prisma as any).magicLink.create({
          data: {
            token: publishToken,
            webId: article.webId,
            articleId: article.id,
            type: 'PUBLISH',
            expiresAt
          }
        });

        await (prisma as any).magicLink.create({
          data: {
            token: feedbackToken,
            webId: article.webId,
            articleId: article.id,
            type: 'FEEDBACK',
            expiresAt
          }
        });

        const frontendUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
        // For published articles, "Publish" link might be "View" link?
        // The email template handles "View" vs "Publish" based on status.
        // We pass the magic link for "Publish" action (which might be used if user wants to re-publish or it's a draft).
        // But if it's ALREADY published, we might want to show the public URL.

        const publishMagicLink = `${frontendUrl}/action/${publishToken}`;
        const feedbackMagicLink = `${frontendUrl}/action/${feedbackToken}`;

        const links = {
          feedback: feedbackMagicLink,
          publish: targetStatus === 'draft' ? publishMagicLink : undefined,
          view: targetStatus === 'publish' && response.link ? response.link : undefined,
          edit: response.link ? response.link.replace(/\/$/, '') + '/wp-admin/post.php?post=' + response.id + '&action=edit' : undefined // Rough guess, or just link to WP admin
          // Better to just use generic WP admin or if we have the edit link. 
          // WordPress API response usually has 'link' (permalink). Edit link is not standard in response but we can construct it if we knew the admin URL.
          // Let's stick to what we have. If we don't have edit link, omit it.
        };

        // If we don't have a direct edit link, maybe we can construct it from web url?
        // web.url + /wp-admin/post.php?post=ID&action=edit
        if (!links.edit && web.url && response.id) {
          const adminBase = web.url.replace(/\/$/, '') + '/wp-admin';
          links.edit = `${adminBase}/post.php?post=${response.id}&action=edit`;
        }

        // Extract excerpt (first paragraph or first 200 chars)
        let excerpt = '';
        if (article.markdown) {
          // Simple regex to find first paragraph
          const match = article.markdown.match(/^(?!#)(.+)$/m);
          if (match) {
            excerpt = match[1].substring(0, 300) + (match[1].length > 300 ? '...' : '');
          } else {
            excerpt = article.markdown.substring(0, 300) + '...';
          }
        }

        const emailContent = getArticleGeneratedEmail(
          article.title,
          excerpt,
          targetStatus === 'publish' ? 'PUBLISHED' : 'DRAFT',
          links
        );

        // Send to user email
        const recipientEmail = web.user?.email;

        if (process.env.MAILGUN_API_KEY && recipientEmail) {
          await emailService.sendEmail({
            to: recipientEmail,
            subject: emailContent.subject,
            html: emailContent.html
          });
          logger.info({ jobId: job.id, articleId: article.id, recipient: recipientEmail }, 'Notification email sent');
        } else {
          logger.warn({ jobId: job.id, articleId: article.id }, 'Skipping email: Missing API key or recipient');
        }

      } catch (emailError) {
        logger.error({ jobId: job.id, articleId: article.id, error: formatUnknownError(emailError) }, 'Failed to send notification email');
      }

    } catch (error) {
      if (error instanceof WordpressClientError && error.status >= 400 && error.status < 500) {
        logger.error({ jobId: job.id, articleId, status: error.status, response: error.responseBody }, 'WordPress client error');
      } else {
        logger.error({ jobId: job.id, articleId, error: formatUnknownError(error) }, 'WordPress publish failed');
      }
      throw error;
    }
  });

  createWorker<FetchFaviconJob>(FETCH_FAVICON_QUEUE, async (job) => {
    const web = await prisma.web.findUnique({ where: { id: job.data.webId } });
    if (!web) {
      logger.warn({ jobId: job.id, webId: job.data.webId }, 'Web not found for favicon job');
      return;
    }

    try {
      const result = await fetchAndStoreFavicon(web.id, web.url, assetStorage, logger);
      await prisma.web.update({
        where: { id: web.id },
        data: {
          faviconUrl: result.url,
          faviconSourceUrl: result.sourceUrl,
          faviconStatus: AssetStatus.SUCCESS,
          faviconLastFetchedAt: new Date()
        }
      });
      logger.info({ jobId: job.id, webId: web.id, source: result.sourceUrl }, 'Favicon stored');
    } catch (error) {
      logger.error({ jobId: job.id, webId: web.id, error }, 'Failed to store favicon');
      await prisma.web.update({
        where: { id: web.id },
        data: {
          faviconStatus: AssetStatus.FAILED,
          faviconLastFetchedAt: new Date()
        }
      });
      throw error;
    }
  });

  createWorker<GenerateHomepageScreenshotJob>(GENERATE_SCREENSHOT_QUEUE, async (job) => {
    const web = await prisma.web.findUnique({ where: { id: job.data.webId } });
    if (!web) {
      logger.warn({ jobId: job.id, webId: job.data.webId }, 'Web not found for screenshot job');
      return;
    }

    const width = 1280;
    const height = 720;

    try {
      const screenshot = await captureScreenshot(web.url, {
        width,
        height,
        fullPage: Boolean(job.data.fullPage),
        waitAfterLoadMs: 3000
      });
      const url = await assetStorage.saveFile(
        `projects / ${web.id} / screenshot - home - ${width}x${height}.jpg`,
        screenshot,
        'image/jpeg'
      );
      await prisma.web.update({
        where: { id: web.id },
        data: {
          screenshotUrl: url,
          screenshotStatus: AssetStatus.SUCCESS,
          screenshotLastGeneratedAt: new Date(),
          screenshotWidth: width,
          screenshotHeight: height
        }
      });
      logger.info({ jobId: job.id, webId: web.id }, 'Screenshot stored');
    } catch (error) {
      const err = error as Error;
      logger.error(
        {
          jobId: job.id,
          webId: web.id,
          errorName: err.name,
          errorMessage: err.message,
          errorStack: err.stack
        },
        'Screenshot generation failed'
      );
      await prisma.web.update({
        where: { id: web.id },
        data: {
          screenshotStatus: AssetStatus.FAILED,
          screenshotLastGeneratedAt: new Date()
        }
      });
      throw error;
    }
  });

  logger.info('Worker ready. Listening for jobs...');
};

bootstrap().catch(async (err) => {
  logger.error({ err }, 'Worker bootstrap failed');
  await stop();
  process.exit(1);
});
