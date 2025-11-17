# Development Plan

## 1. Project Overview

This SaaS platform automatically analyzes a user's website, extracts business and audience insights, generates a full SEO strategy (pillar pages, topic clusters, keywords), and then produces daily AI‑generated articles that are pushed to WordPress as drafts. Users receive each draft via email and can publish with a single approval click.

The system is designed for minimum user input while maintaining high reliability, strong data isolation, and a scalable architecture.

---

## 2. Core Requirements

### 2.1 Must‑Have
- Stripe paywall immediately after entering website + user info
- Job queue for asynchronous processing (web scanning, analysis, SEO strategy creation, article generation)
- Data isolation between tenants (users/websites)
- Configurable AI models for each processing phase
- Future‑proof website authentication (WordPress Application Passwords, OAuth, API key integrations)
- Zero‑Docker deployment (pure VM/server setup)

### 2.2 Nice‑to‑Have
- External API for third‑party integrations
- Localization support
- API endpoints for future mobile app

---

## 3. Technology Stack (Chosen for reliability and developer efficiency)

### 3.1 Backend
- **Node.js + TypeScript**
- **NestJS** framework (modular architecture, DI, validation, testing)
- Validation: `class-validator` or `zod`

### 3.2 Frontend
- **Next.js (React + TypeScript)**
- Shared types between frontend & backend
- SSR for dashboard, static marketing pages

### 3.3 Database
- **PostgreSQL**
- JSONB for AI‑generated structured data

### 3.4 Queue / Background Jobs
- **Redis** + **BullMQ**
- Dedicated worker processes

### 3.5 Integrations
- Stripe Billing
- WordPress REST API
- Email provider (Postmark / SES / SendGrid)
- AI providers: Perplexity, Claude, OpenAI (via unified AI Orchestrator)

### 3.6 Deployment (No Docker)
- Nginx reverse proxy
- Node processes via PM2 or systemd
- Redis + PostgreSQL running natively or as managed services

---

## 4. High‑Level Architecture

```
Client (Browser)
        │
        ▼
Next.js Frontend ─────► NestJS API ─────► PostgreSQL
                               │
                               ├────► Redis Queue
                               │
                               ├────► Stripe
                               │
                               └────► Email Provider

Redis Queue ─────► Workers ─────► AI Providers
                                     │
                                     ▼
                               WordPress Sites
```

Implementation details for favicon handling and homepage screenshots (rendering service, workers, storage abstraction) are described in `screenshots.md`.

---

## 5. User Flow

### 5.1 Onboarding + Paywall
1. User enters website URL + email
2. System creates pending website record
3. Stripe Checkout session is created
4. After successful payment, subscription is activated
5. Queue receives job: **ScanWebsite(web_id)**

### 5.2 Daily Article Generation
1. Scheduler triggers daily job
2. For each active website: enqueue **GenerateArticle(web_id)**
3. Worker fetches SEO strategy → chooses topic → generates article
4. Worker pushes article to WordPress as draft
5. User receives email with article content + approval link
6. User clicks “Publish” → article becomes published on WP

---

## 6. Backend Modules (NestJS)

### 6.1 Auth & Users Module
- JWT authentication
- User management
- Role‑based access control (`user`, `admin`)

### 6.2 Billing Module
- Stripe Checkout integration
- Webhooks: subscription updated, payment succeeded, cancellation
- Mapping customers & subscriptions to user accounts

### 6.3 Websites (Tenancy) Module
- Manages website records
- Integration credentials (encrypted)
- Status: pending_payment, active, paused, error

### 6.4 AI Orchestrator Module
- Unified interface for:
  - Website scanning
  - Business analysis
  - SEO strategy generation
  - Article generation
- Supports dynamic provider switching (Perplexity, Claude, OpenAI)
- Configuration stored in DB

### 6.5 SEO Strategy Module
- Stores pillar pages, topic clusters, keyword sets
- Provides topic selection logic for article scheduling

### 6.6 Article Generation Module
- Selecting topics
- Generating prompts
- Generating AI article drafts
- Pushing drafts to WordPress

### 6.7 WordPress Integration Module
- Encrypted storage for WP credentials
- Draft creation + publish operations via REST API
- Retry system with exponential backoff

### 6.8 Email & Approval Module
- Localized templates
- Full article content via email
- Tokenized approval links
- Secure publish endpoint

---

## 7. Database Schema (Simplified)

### `users`
Stores user accounts and Stripe customer references.

### `subscriptions`
Links each user to their Stripe subscription.

### `webs`
Stores website metadata and integration mode.

### `web_credentials`
Encrypted WP/OAuth credentials.

### `web_analysis`
Stores scan results, business profile, SEO strategy.

### `articles`
AI‑generated articles, statuses, WP IDs, metadata.

### `article_approval_tokens`
Tokens for secure publishing links.

---

## 8. Security & Data Isolation
- Tenant isolation by `user_id` and `web_id` scoping
- WordPress credentials encrypted at rest (AES)
- JWT access control
- Rate limiting on public API endpoints
- Admin panel access restricted to `admin` role

---

## 9. Admin Panel
- Manage users & websites
- Change AI provider per phase
- Queue monitoring (failed jobs, retries)
- View SEO strategy data and article logs

---

## 10. External API (Optional)
- API keys per user
- Endpoints for retrieving articles, approving them, managing websites
- Intended for automation tools or mobile apps

---

## 11. Localization
- Next.js i18n for UI
- Articles generated in the user‑selected language
- Email templates localized

---

## 12. Deployment Plan (No Docker)

### 12.1 Server Setup
- Ubuntu VPS
- Nginx + certbot
- Node.js LTS
- Redis + PostgreSQL

### 12.2 Processes
- `pm2 start api` (NestJS)
- `pm2 start web` (Next.js)
- `pm2 start worker` (BullMQ worker)

### 12.3 Cron / Scheduler
- Use NestJS Scheduler or system cron calling internal route

---

## 13. Roadmap

### Phase 1 (MVP)
- Website onboarding + paywall
- Web scanning
- Business analysis
- SEO strategy generation
- Daily article generation + WP drafts
- Email + publish workflow

### Phase 2
- Admin panel refinement
- Provider switching UI
- Queue monitoring
- Error reporting

### Phase 3
- External API
- Mobile app support
- Additional CMS integrations

---

## End of Document
