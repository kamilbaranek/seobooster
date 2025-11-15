# MVP Implementation Plan (Landing → Onboarding → Paywall → Dashboard)

This document refines the global `implementation_plan.md` into a concrete, execution‑ready plan for the first local MVP:
from landing page, through onboarding and Stripe paywall, to a basic tenant dashboard powered by the existing pipeline.

The focus is:

- One primary path: `/` → `/onboarding` → Stripe Checkout → `/dashboard`.
- Minimal but real integration with Supabase Postgres, Upstash Redis, Stripe, and OpenRouter.
- Everything else (email, WordPress publish, admin, etc.) is treated as post‑MVP.

---

## 0. Target MVP Flow

1. Visitor hits `/` (landing page).
2. Clicks CTA → `/onboarding`.
3. Onboarding:
   - Step 1: enters website URL, email, password.
   - Backend: `POST /api/auth/register` creates user + initial `Web` and issues JWT.
4. Redirect to `/onboarding/payment`:
   - Calls `POST /api/billing/checkout-session` with `webId`, `successUrl`, `cancelUrl`.
   - Redirects to Stripe Checkout.
5. Stripe redirect to `successUrl` (Next.js route):
   - Frontend polls API (`/api/webs/:id/overview`) until `Web.status === ACTIVE`.
6. On success, redirect to `/dashboard`:
   - User sees list of websites + simple pipeline status (Scan / Strategy / Draft ready).

---

## P1 – Landing Page & Onboarding (Highest Priority)

- [x] Implement landing in `apps/web/pages/index.tsx`:
  - Hero section (headline, subheadline).
  - Short “How it works” (Scan → Strategy → Daily articles).
  - Primary CTA button “Začít” → navigates to `/onboarding`.
- [x] Keep styling minimal but clean (basic Tailwind or CSS‑in‑JS is fine).

### P1.2 Auth UI & Onboarding Step 1

**Goal:** Capture website URL, email, and password and create user+web.

- [x] Add `/login` page:
  - Form: `email`, `password`.
  - Calls `POST /api/auth/login`.
  - On success: store JWT (MVP: `localStorage` + in‑memory, post‑MVP: httpOnly cookie).
  - Redirect to `/dashboard` if user already has an active web.
- [x] Add `/onboarding/index.tsx` (or `/onboarding/step-1.tsx`):
  - Form fields: `websiteUrl`, `email`, `password`.
  - On submit:
    - `POST /api/auth/register` with `{ email, password, websiteUrl }`.
    - On success:
      - Capture JWT from response.
      - Extract `webId` and `user` from response payload.
      - Save token client‑side and `webId` in route state or query param.
    - Redirect to `/onboarding/payment?webId=...`.

**Backend alignment:**  
`/auth/register` already creates `User` + `Web` + returns a JWT + user + webs; ensure the response shape is convenient for frontend (it already returns user + webs; we can derive `webId` from `user.webs[0]`).

### P1.3 Paywall & Stripe Checkout

**Goal:** Take the user to Stripe Checkout, and back to a success/cancel page.

_Backend (NestJS – `BillingModule`)_

- [x] Confirm/adjust `BillingService.createCheckoutSession`:
  - Input: `userId` (from JWT), `CreateCheckoutSessionDto` `{ webId, successUrl, cancelUrl }`.
  - Adds Stripe `metadata` + `subscription_data.metadata` with `userId`, `webId`.
  - Returns `{ checkoutUrl }`.
- [x] Ensure Stripe webhook (`/api/billing/webhook`) correctly:
  - Maps subscription → `subscriptions` table (`Subscription` model).
  - Updates `web.subscriptionId` and sets `Web.status = ACTIVE` on successful checkout / subscription activation.
  - Enqueues `ScanWebsite` job via `JobQueueService.enqueueScanWebsite(webId)`.

_Frontend (Next.js)_

- [x] Add `/onboarding/payment.tsx`:
  - Reads `webId` from `router.query`.
  - Button “Pokračovat k platbě”:
    - Calls `POST /api/billing/checkout-session` with `webId`, `successUrl`, `cancelUrl`.
    - On success: `window.location.href = checkoutUrl`.
- [x] Add `/onboarding/success.tsx`:
  - Reads `webId` from query.
  - Polls API (new endpoint `GET /api/webs/:id/overview` – see P2.1) every 2–3 s:
    - If `Web.status === ACTIVE` → redirect `/dashboard`.
    - If timeout (např. 60 s) → zobrazit info, že zpracování běží déle, a nabídnout přechod na dashboard.
- [x] Add `/onboarding/cancel.tsx`:
  - Simple info page: payment cancelled, CTA zpět na `/onboarding/payment?webId=...`.

---

## P2 – Dashboard & Pipeline Overview

### P2.1 API Endpoints for Dashboard

**Goal:** Provide minimal JSON API for the dashboard to show the state of a user’s websites/pipeline.

- [ ] Add `GET /api/me`:
  - Protected by JWT guard.
  - Returns `{ user: { id, email }, webs: [...] }` with each `Web` including `status`, `nickname`, `url`, `createdAt`.
- [ ] Add `GET /api/webs/:id/overview`:
  - Protected by JWT guard.
  - Returns:
    ```jsonc
    {
      "web": { "id", "url", "status", "nickname", "createdAt" },
      "analysis": {
        "lastScanAt",
        "hasScanResult": boolean,
        "hasBusinessProfile": boolean,
        "hasSeoStrategy": boolean
      },
      "articles": [
        {
          "id",
          "title",
          "status",
          "createdAt"
        }
      ]
    }
    ```
  - Backed by `Web`, `WebAnalysis`, `Article` tables.

### P2.2 Dashboard UI

**Goal:** After payment, user can see at least one web and its pipeline status.

- [ ] Implement `/dashboard/index.tsx`:
  - On mount:
    - Calls `GET /api/me` to fetch current user and webs.
    - For active web (or first web) calls `GET /api/webs/:id/overview`.
  - Renders:
    - List of webs in a sidebar/table (url, status badge).
    - For selected web:
      - “Pipeline status” panel:
        - Scan: `hasScanResult`?
        - Analysis: `hasBusinessProfile`?
        - Strategy: `hasSeoStrategy`?
        - Draft article: existence `articles` with `status = DRAFT`.
- [ ] For now, clicking na web v seznamu přepne vybraný `webId` a znovu načte overview.

### P2.3 Basic Auth Handling in Frontend

- [ ] Implement jednoduchý auth client (React hook nebo util):
  - `login()` / `register()` ukládají JWT do `localStorage`.
  - `getToken()` vrací token.
  - Custom fetch wrapper automaticky přidá `Authorization: Bearer <token>`.
- [ ] Implementovat guard pro bariéry:
  - Pokud není token, `/dashboard` a `/onboarding/payment` přesměrují na `/login` nebo `/onboarding`.

> Později: přechod na httpOnly cookies, refresh tokeny, CSRF ochrana.

---

## P3 – Minimální Article Scheduling & Trigger

**Goal:** Pro MVP stačí možnost ručně spustit generování článku pro web, aby bylo co ukázat v dashboardu.

- [ ] API endpoint `POST /api/webs/:id/generate-article`:
  - Protected (JWT).
  - Enqueues `GenerateArticle` job for daný `webId`.
  - Může volit cluster přes jednoduchý algoritmus (např. první cluster ze strategie) – později nahradíme schedulerem.
- [ ] V dashboardu:
  - Přidat tlačítko „Vygenerovat článek“ pro vybraný web.
  - Po kliknutí: zavolat endpoint, zobrazit loading, po krátké době aktualizovat overview (nový draft).

> Později: implementovat Task 9.1 (least‑covered cluster, daily schedule) pomocí cron / Nest scheduleru nebo samostatného schedulera.

---

## P4 – Post‑MVP (Email, WordPress, Admin, etc.)

Tato část není nutná pro lokální MVP, ale navazuje na stávající architekturu.

### P4.1 Email & Approval Workflow

- Implementovat `EmailModule` (Postmark/SES/SendGrid).
- Job pro „send draft email“ po vygenerování článku.
- `ArticleApprovalToken` flow:
  - Token creation, approval endpoint, bezpečné publish.

### P4.2 WordPress Integration

- `WordpressClient` pro `createDraft` a `publishDraft`.
- Napojení na `PublishArticleJob` queue + API endpoints pro re‑push a debug.

### P4.3 Admin, Monitoring, UX

- Admin panel (`/admin`) s guardem.
- Základní queue monitoring (přehled failed jobs).
- Lepší UX, loading states, chybové obrazovky.

---

## Implementation Notes

- Vždy udržuj tento dokument v souladu s realitou kódu – pokud něco zjednodušíš nebo změníš, uprav i tento plán.
- Při dokončení větších bloků (P1, P2, …) aktualizuj checklist (v PR nebo v samostatném „docs“ commitu).
