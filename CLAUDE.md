# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SEO Booster is a TypeScript monorepo SaaS that automatically generates and publishes SEO-optimized content to WordPress sites. The system uses AI to analyze websites, create content strategies, generate articles, and publish them via WordPress integration.

**Monorepo structure:**
- `apps/api` – NestJS backend (auth, billing, Prisma, queues)
- `apps/web` – Next.js frontend
- `apps/worker` – BullMQ worker processing async AI jobs
- `libs/shared-types` – shared TypeScript types
- `libs/queue-types` – BullMQ job payload contracts
- `libs/ai-types` – AI orchestrator interfaces
- `libs/ai-providers` – AI provider implementations (OpenRouter, Google AI, mock)
- `libs/ai-prompts` – prompt template management
- `libs/storage` – asset storage abstraction (local, S3 placeholder, Vercel Blob)
- `libs/article-renderer` – markdown to HTML rendering
- `libs/wp-client` – WordPress REST API client

## Development Commands

### Starting Services
```bash
npm run dev:api        # Start NestJS API (port 3333)
npm run dev:web        # Start Next.js frontend (port 3000)
npm run dev:worker     # Start BullMQ worker
```

### Building
```bash
npm run build          # Build all workspaces in dependency order
npm run build:worker   # Build worker only
```

### Database Operations
```bash
npm run db:validate    # Validate Prisma schema
npm run db:generate    # Generate Prisma client (runs after npm install)
npm run db:migrate     # Run migrations (prisma migrate dev)

```

### Superadmin Setup
```bash
npm run seed:superadmin  # Create superadmin user from .env.local
```

### Linting & Testing
```bash
npm run lint           # Lint API, worker, web, and libs
npm test              # Run tests for API and web workspaces
```

### Production
Use PM2 with the provided `ecosystem.config.js`:
```bash
pm2 start ecosystem.config.js --env production
```

## Architecture & Key Concepts

### AI Pipeline Flow

The system processes websites through a 4-phase AI pipeline orchestrated via BullMQ queues:

1. **Scan** (`SCAN_WEBSITE_QUEUE`) – Extracts website metadata, keywords, technologies
2. **Analyze** (`ANALYZE_BUSINESS_QUEUE`) – Builds business profile (audience, mission, differentiators)
3. **Strategy** (`CREATE_SEO_STRATEGY_QUEUE`) – Creates topic clusters with pillar pages and supporting articles
4. **Generate** (`GENERATE_ARTICLE_QUEUE`) – Generates article markdown + HTML from strategy

Each phase is a separate BullMQ job that stores results in the database and enqueues the next phase. The worker (`apps/worker/src/main.ts`) processes all jobs.

### Queue System

**BullMQ queues** (defined in `libs/queue-types`):
- `scan-website` → `analyze-business` → `create-seo-strategy` → `generate-article`
- `publish-article` – Publishes articles to WordPress
- `fetch-favicon` – Fetches and processes favicons
- `generate-screenshot` – Captures homepage screenshots via Playwright
- `generate-article-image` – Generates featured images via AI

Jobs are processed by workers in `apps/worker/src/main.ts`. The API enqueues jobs via the `QueuesModule`.

### AI Provider System

The AI orchestrator (`libs/ai-providers`) uses a provider abstraction (`AiProvider` interface from `libs/ai-types`) to support multiple AI services:

**Current providers:**
- `OpenRouterProvider` – Default, uses OpenRouter API (supports all major models, image generation via Pollinations AI)
- `GoogleAiProvider` – Google AI (Gemini models for text, Gemini 2.0 Flash Experimental for image generation)
- `MockProvider` – Testing/development

**Provider selection:**
1. Per-task overrides in `AiPromptConfig` (superadmin UI)
2. Global `AI_PROVIDER` env var (defaults to `openrouter`)

**Model configuration:**
- `AI_MODEL_SCAN`, `AI_MODEL_ANALYZE`, `AI_MODEL_STRATEGY`, `AI_MODEL_ARTICLE`, `AI_MODEL_ARTICLE_IMAGE` – Model identifiers per task
- Can be overridden per task in superadmin prompt editor

### Prompt Management

AI prompts are stored in the database (`AiPromptConfig` model) and can be customized via superadmin UI (`/admin/prompts`):

- Default prompts defined in `libs/ai-prompts/src/defaults.ts`
- Supports Handlebars templating with variables (e.g., `{{business.name}}`, `{{article.title}}`)
- Each task (`scan`, `analyze`, `strategy`, `article`, `article_image`) has separate system/user prompts
- Superadmin can preview prompts with real data and reset to defaults

### Asset Storage

The `AssetStorage` abstraction (`libs/storage`) supports multiple backends:

**Drivers:**
- `local` (default) – Filesystem storage, served via `/api/assets` static route
- `vercel-blob` – Vercel Blob storage for production
- `s3` – Placeholder (not implemented)

**Configuration:**
- `ASSET_STORAGE_DRIVER` – `local` | `vercel-blob` | `s3`
- `ASSET_STORAGE_LOCAL_PATH` – Local storage root (default: `./storage/website-assets`)
- `ASSET_PUBLIC_BASE_URL` – Base URL for public asset URLs
- `BLOB_READ_WRITE_TOKEN` – Vercel Blob token (for `vercel-blob` driver)

**Asset types:**
- Favicons (fetched from website, resized to 16/32/64px)
- Screenshots (Playwright-rendered homepage captures, 1280×720 JPEG)
- Article featured images (AI-generated)

### WordPress Integration

WordPress publishing uses Application Password authentication (`libs/wp-client`):

**Credentials:**
- Stored encrypted in `WebCredentials.encryptedJson` (AES-256-GCM)
- Decrypted by worker using `ENCRYPTION_KEY` from env
- Contains `baseUrl`, `username`, `applicationPassword`, `autoPublishMode`

**Publishing modes:**
- `draft_only` – Always create/update as draft
- `manual_approval` – Create draft, await manual publish
- `auto_publish` – Publish immediately

**Features:**
- Auto-uploads featured images to WordPress media library
- Resolves categories/authors (article override → web default)
- Auto-creates tags from article keywords or SEO metadata
- Updates existing posts by `wordpressPostId`

### Article Scheduling

The worker runs a scheduler (`startArticlePlanScheduler`) that:
1. Polls for `ArticlePlan` records with `status=PLANNED` and `plannedPublishAt <= now`
2. Claims plans by updating to `status=QUEUED`
3. Enqueues `GenerateArticleJob` for each claimed plan
4. Runs every 10 minutes (configurable via `ARTICLE_PLAN_POLL_INTERVAL_MS`)

Plans are created when an SEO strategy is generated, distributed across days within a configurable time window (9am-5pm UTC by default).

### Database Schema

**Core models:**
- `User` – Auth + Stripe customer ID
- `Subscription` – Stripe subscription tracking
- `Web` – User websites (URL, nickname, status, integration type)
- `WebAnalysis` – Stores scan/analyze/strategy results as JSON
- `SeoStrategy` → `SeoTopicCluster` → `SeoSupportingArticle` – Normalized strategy structure
- `ArticlePlan` – Scheduled article generation tasks
- `Article` – Generated articles (markdown, HTML, WordPress post ID)
- `WebCredentials` – Encrypted integration credentials
- `AiPromptConfig` – Custom AI prompts per task
- `AiCallLog` – Debug logging for AI requests/responses (when `AI_DEBUG_LOG_PROMPTS=true`)

**Enums:**
- `UserRole` – `USER` | `ADMIN` | `SUPERADMIN`
- `WebStatus` – `PENDING_PAYMENT` | `ACTIVE` | `PAUSED` | `ERROR`
- `IntegrationType` – `NONE` | `WORDPRESS_APPLICATION_PASSWORD` | `WORDPRESS_OAUTH` | `CUSTOM_API`
- `ArticleStatus` – `DRAFT` | `QUEUED` | `PUBLISHED`
- `ArticlePlanStatus` – `PLANNED` | `QUEUED` | `GENERATED` | `PUBLISHED` | `SKIPPED`
- `AssetStatus` – `PENDING` | `SUCCESS` | `FAILED`

### Environment Variables

**Required:**
- `DATABASE_URL` – PostgreSQL connection string
- `JWT_SECRET` – Secret for signing JWTs
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` – Stripe integration
- `ENCRYPTION_KEY` – Base64-encoded 32-byte key for encrypting credentials
- `OPENROUTER_API_KEY` – OpenRouter API key (default provider)

**Optional:**
- `REDIS_HOST`, `REDIS_PORT` – Redis for BullMQ (defaults: `localhost`, `6379`)
- `REDIS_USERNAME`, `REDIS_PASSWORD`, `REDIS_USE_TLS` – Redis auth + TLS
- `AI_PROVIDER` – `openrouter` | `google` | `openai` | `anthropic` | `perplexity` (default: `openrouter`)
- `GOOGLE_AI_API_KEY` – Google AI (Gemini) API key for text and image generation
- `AI_MODEL_SCAN`, `AI_MODEL_ANALYZE`, `AI_MODEL_STRATEGY`, `AI_MODEL_ARTICLE`, `AI_MODEL_ARTICLE_IMAGE` – Model IDs per task (for Gemini image generation use `gemini-2.0-flash-exp`)
- `WEB_APP_URL` – Frontend URL for CORS (default: `http://localhost:3000`)
- `NEXT_PUBLIC_API_BASE_URL` – API URL for frontend (default: `http://localhost:3333/api`)
- `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD` – Superadmin credentials for seeding
- `AI_DEBUG_PIPELINE` – Enable debug endpoints in non-local environments
- `AI_DEBUG_LOG_PROMPTS` – Log AI prompts/responses to console + database
- `SCREENSHOT_REFRESH_DAYS` – Days before screenshot refresh (default: 14)
- `ARTICLE_PLAN_POLL_INTERVAL_MS` – Scheduler interval (default: 600000 = 10 minutes)
- `ARTICLE_PLAN_BATCH_SIZE` – Max plans to process per poll (default: 10)

### Project Root Resolution

Both API and worker resolve `PROJECT_ROOT` to handle compiled vs source paths:

**API** (`apps/api/src/main.ts`):
- Checks `process.env.PROJECT_ROOT`
- Fallback: `resolve(__dirname, '../../../..')` (assumes `dist/apps/api/src/main.js`)

**Worker** (`apps/worker/src/main.ts`):
- Searches for `package.json` with `workspaces` field in candidate paths
- Falls back to `process.cwd()`

Both load `.env` and `.env.local` from resolved project root.

## Common Workflows

### Adding a New AI Provider

1. Create provider in `libs/ai-providers/src/providers/` implementing `AiProvider` interface
2. Export from `libs/ai-providers/src/index.ts`
3. Update `buildAiProviderFromEnv` in `libs/ai-providers/src/index.ts` to support new provider name
4. Add provider-specific env vars to README.md environment section
5. Update `ProviderName` type in `libs/ai-types/src/index.ts`

### Adding a New Queue/Job Type

1. Define queue name constant and job type in `libs/queue-types/src/index.ts`
2. Add queue to worker's `bootstrap()` in `apps/worker/src/main.ts`:
   - Register queue events
   - Create worker with job processor
3. Inject queue in API via BullMQ's `@InjectQueue()` decorator
4. Enqueue job via `queue.add(jobName, payload)`

### Modifying AI Prompts

**For development:**
- Edit defaults in `libs/ai-prompts/src/defaults.ts`
- Rebuild `ai-prompts` lib: `npm run build --workspace @seobooster/ai-prompts`

**For production:**
- Use superadmin UI at `/admin/prompts`
- Preview with real data from database
- Reset to defaults if needed

### Adding a New Asset Type

1. Add storage path helper to `apps/worker/src/main.ts` (e.g., `buildArticleImagePath`)
2. Create BullMQ job type in `libs/queue-types`
3. Implement worker processor with:
   - Asset generation/fetch logic
   - `assetStorage.saveFile()` call
   - Database update with public URL
4. Update Prisma schema with asset URL fields + status enum
5. Run `npm run db:migrate`

## Code Patterns & Conventions

### Module Organization (NestJS)

- Each feature has its own module (e.g., `AuthModule`, `WebsModule`, `ArticlesModule`)
- Modules are imported in `AppModule` (`apps/api/src/app.module.ts`)
- Use dependency injection via constructors
- Guards are applied globally (`RolesGuard`) or per-route (`@UseGuards()`)

### Error Handling

- API uses `HttpExceptionFilter` for consistent error responses
- All responses wrapped by `ResponseEnvelopeInterceptor` (format: `{ success, data?, error? }`)
- Worker logs errors via `pino` logger and lets BullMQ handle retries
- WordPress client errors use `WordpressClientError` with status codes

### Database Access

- Use Prisma Client via `PrismaService` (injected as `@Injectable()`)
- Prisma schema is in `prisma/schema.prisma`
- Always run `npm run db:generate` after schema changes
- Migrations stored in `prisma/migrations/`

### Type Safety Across Boundaries

- Queue job payloads typed in `libs/queue-types`
- AI interfaces in `libs/ai-types`
- Frontend/backend share types via `libs/shared-types`
- Use `as unknown as PrismaType` when storing/retrieving JSON fields (e.g., `scanResult`, `seoStrategy`)

### Rendering & Screenshots

- Article markdown rendered via `renderArticleMarkdown` from `@seobooster/article-renderer`
- Screenshots use Playwright Chromium with `captureScreenshot` from `apps/worker/src/services/rendering-service.ts`
- Browser lifecycle managed by worker (single instance, reused across jobs)
- Call `shutdownRenderer()` on worker shutdown

## Testing Notes

- No test configurations currently in repository root
- `npm test` delegates to workspace-specific test scripts
- Individual workspaces may have their own Jest/Vitest configs

## Documentation References

- See `README.md` for environment variable reference and API endpoints
- Check `development_plan.md` and `implementation_plan.md` for product specifications (if available in repo)
- Superadmin workflow documented in `superadmin.md` (if available)
