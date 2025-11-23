# Implementation Plan

This document translates the system architecture into a detailed, actionable implementation plan. Each major work item is broken into tasks/subtasks appropriate for a junior developer. Every task includes a requirement to **run tests/build and commit only if successful**.

---

# 1. Repository Structure Setup

## Task 1.1 — Initialize Monorepo
**Goal:** Create a monorepo structure for API, frontend, and shared libraries.

### Subtasks
- Create root directory structure:
  - `/apps/api` (NestJS)
  - `/apps/web` (Next.js)
  - `/libs/shared-types`
- Add TypeScript project references.
- Configure eslint + prettier shared configs.
- Add baseline README.
- **Test:** Run build for both `api` and `web`.
- **Commit only if build passes.**

---

# 2. Backend (NestJS) Setup

## Task 2.1 — Initialize NestJS API
**Goal:** Bootstrap NestJS project.

### Subtasks
- Create NestJS project in `/apps/api`.
- Configure basic modules: `AppModule`, `ConfigModule`.
- Add `.env` loader using `@nestjs/config`.
- Setup TS path aliases.
- **Test:** `npm run build`.
- **Commit if no errors.**

## Task 2.2 — Setup Global Middleware & Pipes
**Goal:** Add global validation and error handling.

### Subtasks
- Enable global validation pipe (`whitelist`, `forbidNonWhitelisted`).
- Add global exception filter.
- Create unified response interceptor.
- **Test:** Start dev server and hit a sample test endpoint.
- **Commit if successful.**

---

# 3. Database Layer

## Task 3.1 — Sequelize/TypeORM/Prisma Setup (Choose Prisma)
**Goal:** Implement Prisma ORM.

### Subtasks
- Install Prisma + PostgreSQL client.
- Initialize Prisma schema.
- Create database connection.
- Add scripts for `prisma migrate` and `prisma generate`.
- **Test:** Run `prisma validate`.
- **Commit if no errors.**

## Task 3.2 — Create Core DB Models
**Goal:** Implement models from development-plan.

### Models:
- `User`
- `Subscription`
- `Web`
- `WebCredentials`
- `WebAnalysis`
- `Article`
- `ArticleApprovalToken`

### Subtasks
- Add fields and relations per specification.
- Add enum fields: `status`, `integration_type`, `article_status`.
- Ensure cascading rules.
- **Test:** `prisma migrate dev`.
- **Commit if migration succeeds.**

---

# 4. Authentication Module

## Task 4.1 — Auth Module Skeleton
**Goal:** Setup JWT auth.

### Subtasks
- Implement `AuthModule`, `AuthService`, `AuthController`.
- Setup JWT access + refresh tokens.
- Add guard + strategy.
- Implement `/auth/login` and `/auth/register`.
- **Test:** Manually test registration/login via Postman.
- **Commit if working.**

## Task 4.2 — Password Hashing
**Goal:** Add bcrypt for password hashing.

### Subtasks
- Add bcrypt service.
- Apply hashing on user creation.
- Validate passwords during login.
- **Test:** Register + login flow.
- **Commit if working.**

---

# 5. Billing Module (Stripe)

## Task 5.1 — Stripe Integration Setup
**Goal:** Configure Stripe client and webhook handler.

### Subtasks
- Add Stripe SDK.
- Create `BillingModule`.
- Implement endpoint for creating Checkout Session.
- Implement webhook endpoint.
- Validate webhook signature.
- **Test:** Hit test webhook and ensure signature validation.
- **Commit if successful.**

## Task 5.2 — Map Stripe → DB
**Goal:** Handle subscription lifecycle.

### Subtasks
- On successful payment: create/update Subscription DB entry.
- Bind subscription to user.
- Activate associated website record.
- Handle cancellation + expiration.
- **Test:** Use Stripe CLI to send events.
- **Commit if correct.**

---

# 6. Web (Tenant) Management Module

## Task 6.1 — CRUD Endpoints for Websites
**Goal:** Implement website CRUD.

### Subtasks
- Create `WebsModule`, `WebsService`, `WebsController`.
- POST `/webs` to create pending website.
- Bind website to user.
- Validation for URL.
- **Test:** Create/update operations.
- **Commit if no errors.**

## Task 6.2 — Integration Credentials
**Goal:** Store encrypted credentials.

### Subtasks
- Implement encryption helper using AES.
- CRUD for credentials.
- Ensure credentials never leak in logs.
- **Test:** Create + read credentials.
- **Commit if fully functional.**

---

# 7. AI Orchestrator Module

## Task 7.1 — Unified Interfaces
**Goal:** Define TS interfaces for all AI tasks.

### Subtasks
- Create interfaces:
  - `AiProvider`
  - `ScanResult`
  - `BusinessProfile`
  - `SeoStrategy`
  - `ArticleDraft`
- Store configuration in DB.
- **Test:** TypeScript builds successfully.
- **Commit if no type errors.**

## Task 7.2 — Providers Implementation
**Goal:** Implement wrapper classes.

### Subtasks
- Providers:
  - `PerplexityProvider`
  - `ClaudeProvider`
  - `OpenAiProvider`
- Map unified interface → actual API requests.
- Add retry logic.
- **Test:** Mock API requests.
- **Commit once passing.**

## Task 7.3 — Orchestrator Engine
**Goal:** Select provider dynamically.

### Subtasks
- Read provider type from DB.
- Instantiate correct provider.
- Route tasks based on phase.
- **Test:** Change provider in DB → verify behavior.
- **Commit if correct.**

---

# 8. SEO Strategy Module

## Task 8.1 — SEO Strategy Generation
**Goal:** Store pillar pages, clusters, keywords.

### Subtasks
- Implement method for saving AI output.
- Create serializer → JSONB.
- Endpoint to view SEO strategies.
- **Test:** Generate + store a mock strategy.
- **Commit if successful.**

---

# 9. Article Generation & Publishing

## Task 9.1 — Article Scheduling Logic
**Goal:** Select next topic.

### Subtasks
- Choose least-covered cluster.
- Ensure no duplicates.
- Pull metadata from SEO strategy.
- **Test:** Generate selections across test dataset.
- **Commit if logic works.**

## Task 9.2 — Article Draft Generation
**Goal:** Use AI Orchestrator to generate article.

### Subtasks
- Implement `GenerateArticleJob`.
- Generate title, body, keywords.
- Save as markdown + HTML.
- **Test:** Feed mock AI output.
- **Commit if job passes.**

## Task 9.3 — WordPress Draft Push
**Goal:** Push generated articles to WP.

### Subtasks
- Implement WP client.
- Support Application Passwords.
- Endpoint: `/wp-json/wp/v2/posts`.
- **Test:** Publish to staging WP.
- **Commit if successful.**

## Task 9.4 — Publish Approval Workflow
**Goal:** Email user with tokenized approval link.

### Subtasks
- Create token table entry.
- Implement secure approval endpoint.
- After approval: push `status=publish` to WP.
- **Test:** Approve mock articles.
- **Commit if working.**

---

# 10. Email Module

## Task 10.1 — Email Sender Setup
**Goal:** Configure transactional email provider.

### Subtasks
- Add provider SDK.
- Add template system.
- Implement sendArticleDraftEmail().
- **Test:** Send test email.
- **Commit if successful.**

---

# 11. Queue (BullMQ) Setup

## Task 11.1 — Queue Setup
- Implement Redis connection.
- Add queue definitions for:
  - ScanWebsite
  - AnalyzeBusiness
  - CreateSeoStrategy
  - GenerateArticle
  - PublishArticle
- **Test:** Queue connection.
- **Commit if stable.**

## Task 11.2 — Workers
- Create dedicated worker app.
- Implement each job processor.
- Add error retries & backoff.
- **Test:** Enqueue jobs manually.
- **Commit if jobs process correctly.**

Details of the favicon pipeline, homepage screenshot generation (rendering service) and asset storage abstraction for these jobs are documented in `screenshots.md`.

---

# 12. Frontend (Next.js) Setup

#### [MODIFY] [Sidebar.tsx](file:///Users/kamilbaranek/dev/seobooster/apps/web/components/dashboard/layout/Sidebar.tsx)
- Import `apiFetch` from `../../../lib/api-client`.
- Add state `isSuperAdmin` and `useEffect` to fetch user role from `/me`.
- Locate the "Apps" menu item (around line 1535).
- Conditionally render the menu item content:
    - If `isSuperAdmin`:
        - Change icon to `ki-setting-2` (optional, but good for Admin).
        - Change section title to "Admin".
        - Render only "Dashboard" (/dashboard/admin) and "Prompts" (/dashboard/admin/prompts) links.
    - Else:
        - Render the original "Apps" content.

## Verification Plan

### Automated Tests
- Run `make build` to ensure no type errors.

### Manual Verification
- Log in as a `SUPERADMIN` and verify the sidebar shows "Admin" with "Dashboard" and "Prompts".
- Verify that "Apps" and other items in that dropdown are NOT visible for `SUPERADMIN`.
- Log in as a regular user (if possible) or mock the role to verify they still see "Apps".
## Task 12.1 — Initialize Next.js App
- Setup `/apps/web`.
- Configure shared types.
- Add login/register forms.
- **Test:** Build and run dev.
- **Commit if clean.**

## Task 12.2 — Dashboard
- Page: `/dashboard`
- Show list of user websites + statuses.
- Add button: "Add new website".
- **Test:** UI renders data from API.
- **Commit when build passes.**

## Task 12.3 — Website Detail View
- Show web scan status, SEO strategy, article history.
- Provide CTA to update integration settings.
- **Test:** Ensure API calls succeed.
- **Commit if no errors.**

---

# 13. Admin Panel

## Task 13.1 — Admin Login & Role Check
- Implement guard for `admin` role.
- Create `/admin` route.
- **Test:** Verify non-admin blocked.
- **Commit if correct.**

## Task 13.2 — Admin Tools
- Manage users/websites.
- Change AI providers per phase.
- View queue failures.
- **Test:** Admin tools functional.
- **Commit when stable.**

---

# 14. Localization
- Add basic i18n for frontend.
- Localize email templates.
- Localize article prompts.
- **Test:** Switch languages.
- **Commit if builds.**

---

# 15. Deployment Setup (No Docker)

## Task 15.1 — Server Environment
- Configure Ubuntu server.
- Install Node.js, Redis, PostgreSQL.
- Install Nginx + certbot.
- **Test:** Ensure all services run.
- **Commit configuration scripts.**

## Task 15.2 — PM2 Process Config
- Create PM2 profiles for:
  - API
  - Frontend
  - Worker
- **Test:** PM2 reload + logs.
- **Commit if stable.**

---

# 16. Final QA

## Task 16.1 — End-to-End Test Scenarios
- Create dummy website.
- Run full pipeline manually:
  - Scan → Analyze → SEO → Article → WP draft → Email → Publish.
- **Commit test logs.**

## Task 16.2 — Performance Testing
- Run load tests for queue throughput.
- Memory profiling via Node inspector.
- **Commit improvements if needed.**

---

# End of Implementation Plan
