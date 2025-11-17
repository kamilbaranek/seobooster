# seobooster

Monorepo for the SEO Booster SaaS:

- `apps/api` – NestJS backend (auth, billing, Prisma, queues).
- `apps/web` – Next.js frontend.
- `apps/worker` – BullMQ worker processing async jobs.
- `libs/shared-types` – shared TypeScript types between backend and frontend.
- `libs/queue-types` – shared queue constants + job payload contracts.
- `libs/ai-types` – shared AI orchestrator interfaces used by API, worker, and future frontend features.
- `libs/storage` – asset storage abstraction (local filesystem driver + future S3 driver).

## Scripts

- `npm run dev:api` – start the NestJS API (requires DB + Redis configuration).
- `npm run dev:web` – start the Next.js frontend.
- `npm run dev:worker` – start the BullMQ worker.
- `npm run build` – build API, frontend, and worker workspaces.
- `npm run db:validate` – validate Prisma schema.
- `npm run db:generate` – generate Prisma client.
- `npm run db:migrate` – run `prisma migrate dev` against the database.
- `npm run start:worker` – run the compiled worker (after `npm run build --workspace @seobooster/worker`).

## Database workflow

1. Export `DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/seobooster?schema=public`.
2. Run `npm run db:validate` to make sure the schema compiles.
3. Apply migrations locally with `npm run db:migrate` (uses files in `prisma/migrations/`).
4. Regenerate the Prisma client via `npm run db:generate` whenever the schema changes.

## API Surface (so far)

- `POST /api/auth/register` – create account + initial website (body: `email`, `password`, `websiteUrl`).
- `POST /api/auth/login` – email/password login returning JWT.
- `GET/POST/PATCH/DELETE /api/webs` – JWT-protected CRUD for user websites.
- `GET/PUT/DELETE /api/webs/:id/credentials` – manage encrypted integration credentials for a website.
- `POST /api/billing/checkout-session` – creates Stripe Checkout session (JWT required).
- `POST /api/billing/webhook` – Stripe webhook handler (configure secret in deployment).

## Environment

Backend expects these environment variables (for local dev, put them in a non‑committed `.env.local` or similar):

- `DATABASE_URL` – PostgreSQL connection string used by Prisma.
- `REDIS_HOST` / `REDIS_PORT` – Redis connection for BullMQ queues (defaults: `localhost`, `6379`).
- `REDIS_USERNAME` / `REDIS_PASSWORD` / `REDIS_USE_TLS` – optional credentials & TLS flag (set `true` for Upstash or other managed Redis).
- `ASSET_STORAGE_DRIVER` – `local` (default) or `s3`; controls which `AssetStorage` implementation is resolved in both API and worker.
- `ASSET_STORAGE_LOCAL_PATH` – root folder for local driver (defaults to `./storage/website-assets`).
- `ASSET_PUBLIC_BASE_URL` – base URL used when returning favicon/screenshot links (e.g., `http://localhost:3333/assets`).
- `ASSET_S3_BUCKET` / `ASSET_S3_REGION` – future configuration for S3 driver (ignored while driver = `local`).
- `JWT_SECRET` – secret for signing JWTs (will be used when auth is implemented).
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_ID` – Stripe credentials + price id for billing (used by the billing module).
- `ENCRYPTION_KEY` – base64-encoded 32-byte key for encrypting website credentials.
- `AI_PROVIDER` – defaults to `openrouter`, keeps the orchestrator extensible for future providers.
- `OPENROUTER_API_KEY` / `OPENROUTER_SITE_URL` / `OPENROUTER_APP_NAME` / `OPENROUTER_BASE_URL` – OpenRouter credentials + metadata required by their API.
- `AI_MODEL_SCAN` / `AI_MODEL_ANALYZE` / `AI_MODEL_STRATEGY` / `AI_MODEL_ARTICLE` – model identifiers (via OpenRouter) used per orchestrator phase.
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `PERPLEXITY_API_KEY` – reserved for future providers.
- `WEB_APP_URL` – allowed origin for CORS (defaults to `http://localhost:3000`, set to production frontend URL in prod).
- `NEXT_PUBLIC_API_BASE_URL` – Frontend volá API přes tuto adresu (pro lokální vývoj `http://localhost:3333/api`).
- `NEXT_PUBLIC_DEBUG_PIPELINE` – Nastav na `true`, pokud chceš v dashboardu vidět debug panel se stavem jednotlivých fází.
- `AI_DEBUG_PIPELINE` – pokud nastavíš na `true`, zpřístupní se `/webs/:id/pipeline-debug` a debug endpointy i mimo lokální prostředí.
- `AI_DEBUG_LOG_PROMPTS` – pokud nastavíš na `true`, worker bude logovat do konzole finální `systemPrompt`/`userPrompt`, `variables` a výsledky pro každý AI krok.
- `SCREENSHOT_REFRESH_DAYS` / `SCREENSHOT_REFRESH_BATCH` – volitelné parametry pro denní cron, který enqueuje refreshe screenshotů (výchozí 14 dní / 20 webů).

See `development_plan.md` and `implementation_plan.md` for the full product and implementation specification.

## Asset pipeline

- Backend používá abstrakci `AssetStorage` (`libs/storage`), která se konfiguruje přes `ASSET_STORAGE_DRIVER`. MVP driver ukládá soubory do `./storage/website-assets` a API je zpřístupňuje přes route `/assets/*`.
- Při vytvoření webu se automaticky enqueuje `FetchFaviconJob` + `GenerateHomepageScreenshotJob`. Oba joby spravuje worker (`apps/worker`):
  - favicon worker parsuje `<link rel="icon">`, stahuje asset, vytváří varianty 16/32/64 px (sharp) a ukládá je do `AssetStorage` (s fallbackem generovaným z názvu domény),
  - screenshot worker používá Playwright (Chromium) s viewportem 1280×720, ukládá JPEG náhled a aktualizuje DB (`screenshotUrl`, rozměry, statusy).
- Cron (`AssetRefreshService`) běží v API pomocí `@nestjs/schedule` a jednou denně znovu zařadí screenshoty starší než `SCREENSHOT_REFRESH_DAYS`.
- Frontend dashboard ukazuje `faviconStatus`/`screenshotStatus`, náhledy a má tlačítka „Obnovit faviconu/screenshot“, která volají nové API endpointy.

## Superadmin Setup

1. Do `.env.local` přidej:
   ```env
   SUPERADMIN_EMAIL=admin@example.com
   SUPERADMIN_PASSWORD=nějaké-heslo
   ```
2. Spusť seed skript:
   ```bash
   npm run seed:superadmin
   ```
3. Přihlas se na `/login` s těmito údaji – v dashboardu uvidíš odkaz „Superadmin: prompty“, kde můžeš spravovat AI prompty pro jednotlivé fáze pipeline.
4. Detailní plán a workflow je popsán v `superadmin.md` (UI, preview, templated variables).
5. V dev prostředí otevři `/admin/prompts`:
   - Vidíš všechny pipeline kroky + status (default/custom).
   - Můžeš editovat `systemPrompt` / `userPrompt`, resetovat na výchozí hodnoty a zobrazit náhled s reálnými daty z DB.
   - Navíc lze pro každý krok zvolit poskytovatele (OpenRouter / OpenAI / Anthropic) a konkrétní model, případně zůstat u globálního nastavení.
