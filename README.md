# seobooster

Monorepo for the SEO Booster SaaS:

- `apps/api` – NestJS backend (auth, billing, Prisma, queues).
- `apps/web` – Next.js frontend.
- `apps/worker` – BullMQ worker processing async jobs.
- `libs/shared-types` – shared TypeScript types between backend and frontend.
- `libs/queue-types` – shared queue constants + job payload contracts.
- `libs/ai-types` – shared AI orchestrator interfaces used by API, worker, and future frontend features.

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

See `development_plan.md` and `implementation_plan.md` for the full product and implementation specification.
- `npm run start:worker` – run the compiled worker (after `npm run build --workspace @seobooster/worker`).

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
