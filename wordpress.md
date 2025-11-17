# WordPress publikace – návrh implementace

Tento dokument popisuje, jakým způsobem bude systém SEO Booster publikovat články na WordPress, a to:

- automaticky (bez zásahu uživatele),
- manuálně po jednom článku,
- manuálně dávkově (batch).

Každý web (projekt) má vlastní nastavení integrace na WordPress včetně `username` a `Application Password`. Publikace probíhá přes WordPress REST API.

---

## 1. Cíle a režimy publikace

Pipeline „Article → WordPress“ musí umět:

- **Automatická publikace**
  - Po vygenerování článku se rovnou publikuje na WordPress (`status=publish`).
- **Automatické vytvoření draftu + manuální schválení**
  - Po vygenerování se vytvoří WP draft.
  - Uživatel dostane e‑mail s náhledem a approve linkem, po schválení se draft publikuje.
- **Pouze draft v systému / WordPressu**
  - Články se vytvářejí jen jako drafty (lokálně a/nebo na WP) a uživatel publikuje ručně přímo ve WordPressu.
- **Manuální publish (single & batch)**
  - Uživatel může z dashboardu ručně poslat jeden konkrétní článek na WP.
  - U WP‑integrovaných webů může vybrat více článků a publikační job zařadit dávkově.

---

## 2. Konfigurace na úrovni webu (WordPress settings)

Konfigurace je per‑web (per projekt) a navazuje na stávající schéma:

- `Web.integrationType` (Prisma enum `IntegrationType`):
  - `WORDPRESS_APPLICATION_PASSWORD` – web je napojen na WordPress přes Application Password.
  - `NONE` – žádná integrace, články se nepublikují na WP (jen lokální DB).
- `WebCredentials.encryptedJson` – JSON s konkrétním WP nastavením pro daný web.

Navržený tvar JSON uloženého v `credentials` pro WordPress:

```jsonc
{
  "type": "wordpress_application_password",
  "baseUrl": "https://example.com",
  "username": "wp-user",
  "applicationPassword": "app-password-here",
  "autoPublishMode": "draft_only" // nebo "manual_approval" | "auto_publish"
}
```

Pole:

- `type` – identifikace typu integrace (usnadnění rozšíření do budoucna).
- `baseUrl` – základní URL WordPress webu (bez trailing slash).
- `username` – WordPress uživatel, který má Application Password.
- `applicationPassword` – samotný Application Password (Basic Auth).
- `autoPublishMode` – publikační režim:
  - `draft_only`
    - články se pouze vytvářejí jako WP drafty (žádné auto‑publish),
    - uživatel publikuje ručně přímo ve WordPressu.
  - `manual_approval`
    - po vygenerování článku se vytvoří WP draft,
    - po vygenerování se vytvoří `ArticleApprovalToken` a odešle e‑mail s approve linkem,
    - po kliknutí na approve link se WP draft publikuje.
  - `auto_publish`
    - po vygenerování článku se rovnou vytvoří a publikuje WP post (`status=publish`),
    - není potřeba e‑mail ani manuální zásah.

### 2.1 UI v dashboardu

Na frontendu (Next.js) bude mít každý web stránku „Settings“/„Integrace“:

- formulář pro zadání:
  - `baseUrl`,
  - `username`,
  - `applicationPassword`,
  - výběr `autoPublishMode` (radio / select),
- uložené přes:
  - `PATCH /api/webs/:id` – nastavení `integrationType = WORDPRESS_APPLICATION_PASSWORD`,
  - `PUT /api/webs/:id/credentials` – uložení JSON do `WebCredentials.encryptedJson`.

---

## 3. WordPress klient (libs + použití)

Pro volání WP API vznikne nový sdílený modul, např. `libs/wp-client`:

- Hlavní funkce:
  - `createPost(credentials, payload)` – vytvoří nový WP post.
  - `updatePost(credentials, postId, payload)` – aktualizuje existující WP post.
- `credentials`:
  - struktura podle JSONu z kapitoly 2 (po dešifrování z `WebCredentials`),
  - autentizace přes Basic Auth `username:applicationPassword`.
- `payload`:
  - `title: string`,
  - `content: string` (HTML),
  - `status: 'draft' | 'publish'`,
  - volitelně `slug`, `categories`, `tags`, `excerpt` atd.
- Endpoints:
  - `POST {baseUrl}/wp-json/wp/v2/posts` – create,
  - `POST|PUT {baseUrl}/wp-json/wp/v2/posts/{id}` – update (dle verze WP/konfigurace).

Chování při chybách:

- 4xx (např. `401`, `403`, `404`):
  - job failne bez retry (chybná konfigurace nebo postId),
  - log + případně uložení chyby do DB (pro zobrazení v UI).
- 5xx / síťové chyby:
  - job failne tak, aby BullMQ použil retry (exponential backoff),
  - po vyčerpání pokusů se označí článek jako „publish failed“ (UX detail definujeme v další iteraci).

---

## 4. Napojení na existující pipeline (GenerateArticle → DB)

Aktuální stav:

- Worker (`apps/worker/src/main.ts`) v jobu `GenerateArticle`:
  - vezme `ArticlePlan`,
  - zavolá AI provider `generateArticle`,
  - vytvoří `Article` v DB s:
    - `webId`,
    - `title`,
    - `markdown`,
    - `html` (prozatím stejný jako markdown),
    - `status = 'DRAFT'`,
  - aktualizuje `ArticlePlan.status = GENERATED` a nastaví `articleId`.

Tato část zůstane – WordPress integrace se staví na hotový DB článek.

---

## 5. Publish / push job (PUBLISH_ARTICLE_QUEUE)

K publikaci / pushnutí článku na WordPress se použije existující queue `PUBLISH_ARTICLE_QUEUE` a `PublishArticleJob`.

### 5.1 Payload jobu

Rozšířený payload jobu (logický návrh; konkrétní TS typ se doplní v `libs/queue-types`):

```ts
type PublishArticleJob = {
  articleId: string;
  targetStatus: 'draft' | 'publish';
  trigger: 'auto' | 'manual' | 'email';
};
```

- `articleId` – ID článku v DB.
- `targetStatus`:
  - `draft` – vytvořit/aktualizovat WP post jako draft.
  - `publish` – publikovat WP post (buď nově, nebo změnou statusu existujícího draftu).
- `trigger`:
  - `auto` – automatická akce (např. po vygenerování článku nebo rámci scheduleru).
  - `manual` – publish vyvolaný uživatelem z dashboardu.
  - `email` – publish vyvolaný approve linkem z e‑mailu.

### 5.2 Logika workeru PublishArticle

Worker (BullMQ `Worker`) pro `PUBLISH_ARTICLE_QUEUE`:

1. **Načtení dat**
   - Načíst `Article` (`articleId`) včetně navázaného `Web` a `WebCredentials`.
   - Validace:
     - `web.integrationType === WORDPRESS_APPLICATION_PASSWORD`,
     - credentials existují, jdou dešifrovat a mají `baseUrl`, `username`, `applicationPassword`.
2. **Rozhodnutí „create vs update“**
   - Pokud `article.wordpressPostId` je `null`:
     - volat `createPost(credentials, { title, content: article.html, status: targetStatus })`,
     - uložit `wordpressPostId` z odpovědi.
   - Pokud `article.wordpressPostId` není `null`:
     - volat `updatePost(credentials, wordpressPostId, { title, content, status: targetStatus })`.
3. **Aktualizace DB po úspěchu**
   - `Article.status`:
     - pokud `targetStatus = 'publish'` → `Article.status = PUBLISHED`, `publishedAt = now()`,
     - pokud `targetStatus = 'draft'` → `Article.status = DRAFT`.
   - `ArticlePlan.status`:
     - při `targetStatus = 'publish'` → `ArticlePlan.status = PUBLISHED` (pokud existuje navázaný plan),
     - při `targetStatus = 'draft'` může zůstat `GENERATED` (draft je připraven k publikaci).
4. **Chybové stavy**
   - Při 4xx chybě od WordPressu:
     - worker loguje chybu a job failne bez dalšího retry (příčina je pravděpodobně v konfiguraci).
   - Při 5xx / síťových chybách:
     - nechá job failnout tak, aby se uplatnil retry/backoff (viz konfigurace queue),
     - po vyčerpání retry lze nastavit např. `Article.status = QUEUED` a ukázat chybu v UI.

---

## 6. Napojení PublishArticleJob na GenerateArticle

Po vygenerování článku (`GenerateArticle` job) se rovnou rozhodne, zda enqueue‑nout `PublishArticleJob` a s jakým `targetStatus`:

1. Načíst `web.integrationType` a dešifrovat `WebCredentials` (pokud existují).
2. Pokud:
   - `integrationType !== WORDPRESS_APPLICATION_PASSWORD`, nebo
   - nejsou validní WP credentials,
   → **žádný PublishArticleJob se neenqueueuje**, článek zůstane pouze v DB (`status = DRAFT`).
3. Pokud je integrace validní:
   - podle `credentials.autoPublishMode`:
     - `draft_only`
       - enqueue `PublishArticleJob` s `targetStatus = 'draft'`, `trigger = 'auto'`,
       - článek vznikne ve WordPressu jako draft,
       - uživatel publikuje ručně ve WP.
     - `manual_approval`
       - enqueue `PublishArticleJob` s `targetStatus = 'draft'`, `trigger = 'auto'`,
       - následné kroky řeší Email & Approval workflow (viz níže),
       - publikace se spustí až po kliknutí na approve link.
     - `auto_publish`
       - enqueue `PublishArticleJob` s `targetStatus = 'publish'`, `trigger = 'auto'`,
       - článek je po vygenerování rovnou publikovaný na WordPressu.

---

## 7. Manuální publish – single a batch

Kromě automatické pipeline je potřeba dát uživateli kontrolu z dashboardu.

### 7.1 Single publish endpoint

- Nový API endpoint (NestJS, v `WebsController` nebo samostatný `ArticlesController`), např.:
  - `POST /api/webs/:webId/articles/:articleId/publish`
- Chování:
  - Ověření JWT (uživatel přihlášen).
  - Kontrola, že:
    - článek existuje,
    - patří k webu `webId`,
    - web patří aktuálnímu uživateli.
  - Validace stavu článku:
    - rozumný default: povolit publish, pokud `Article.status` je `DRAFT` nebo `QUEUED`.
  - Enqueue `PublishArticleJob` s:
    - `articleId`,
    - `targetStatus = 'publish'`,
    - `trigger = 'manual'`.
  - Response: `{ queued: true }`.

UI:

- V dashboardu (detail webu) v seznamu článků tlačítko „Publikovat na WordPress“ vedle každého draftu.
- Po kliknutí volá výše uvedený endpoint.

### 7.2 Batch publish endpoint

- Nový endpoint, např.:
  - `POST /api/webs/:webId/articles/publish-batch`
- Request body:

```jsonc
{
  "articleIds": ["id1", "id2", "id3"]
}
```

- Chování:
  - Ověření JWT + vlastnictví webu.
  - Filtrování článků:
    - jen ty, které patří k danému webu a mají stav vhodný k publish (např. `DRAFT`, `QUEUED`).
  - Pro každý validní článek:
    - enqueue `PublishArticleJob` (`targetStatus = 'publish'`, `trigger = 'manual'`).
  - Response: např. `{ queued: count }`.

UI:

- V dashboardu vícenásobný výběr článků (checkboxy) + akce „Publikovat vybrané“ volající batch endpoint.

---

## 8. Email & Approval workflow (navázání na WordPress)

Tato část je nadstavba nad režimem `manual_approval` a propojuje WordPress drafty s e‑mailovým schválením.

### 8.1 Vytvoření tokenu a e‑mailu

Po vygenerování článku a zakládání WP draftu (`targetStatus = 'draft'`):

1. Po úspěšném `PublishArticleJob` (draft):
   - vytvořit záznam v `ArticleApprovalToken`:
     - `articleId`,
     - `token` (secure random),
     - `expiresAt`,
     - `consumedAt = null`.
2. Enqueue e‑mail job:
   - e‑mail obsahuje:
     - náhled článku (z `Article.markdown`/`html`),
     - link `https://app.example.com/api/articles/approve?token=...` nebo frontend route, která volá API approve endpoint.

### 8.2 Approve endpoint

- API endpoint, např. `POST /api/articles/approve` nebo `GET /api/articles/approve?token=...`.
- Chování:
  - najít `ArticleApprovalToken` podle tokenu,
  - ověřit, že:
    - token existuje,
    - neexpiroval,
    - `consumedAt` je `null`,
  - označit token jako použitý (`consumedAt = now()`),
  - enqueue `PublishArticleJob` s:
    - `articleId` (z tokenu),
    - `targetStatus = 'publish'`,
    - `trigger = 'email'`.

Tím se dokončí řetězec: **GenerateArticle → WP draft → e‑mail → approve → WP publish**.

---

## 9. Stavové modely a UX v dashboardu

### 9.1 Datové modely

- `Article.status` (Prisma enum `ArticleStatus`):
  - `DRAFT` – vygenerovaný článek, může nebo nemusí být už jako draft ve WordPressu,
  - `QUEUED` – (volitelné) článek čeká v publish queue; vhodné pro UX,
  - `PUBLISHED` – článek je publikovaný (na WP).
- `Article.wordpressPostId`:
  - `null` – článek zatím nebyl pushnut na WordPress,
  - string – ID postu ve WordPressu (lze použít v admin náhledu / debug).
- `ArticlePlan.status` (Prisma enum `ArticlePlanStatus`):
  - po vygenerování: `GENERATED`,
  - po úspěšném publish na WordPress: `PUBLISHED`.

### 9.2 Dashboard (Next.js)

- V přehledu webu zobrazovat:
  - počet plánovaných, vygenerovaných a publikovaných článků (už dnes existuje),
  - informaci o publikačním módu (`autoPublishMode`),
  - pro jednotlivé články:
    - stav (Draft / Queued / Published),
    - indikátor, zda už má `wordpressPostId` (např. ikonka WordPress).
- Akce:
  - „Publikovat na WordPress“ pro jednotlivé články,
  - „Publikovat vybrané“ pro batch,
  - v budoucnu možná i „Otevřít ve WordPressu“ (link na `baseUrl/wp-admin/post.php?post={wordpressPostId}&action=edit`).

---

## 10. Implementační kroky (high‑level)

1. **WordPress klient (`libs/wp-client`)**
   - vytvořit modul s funkcemi `createPost` a `updatePost`,
   - otestovat proti testovacímu WP webu.
2. **Rozšíření queue typů a workeru**
   - doplnit `targetStatus` a `trigger` do `PublishArticleJob` typu,
   - implementovat logiku v `PUBLISH_ARTICLE_QUEUE` workeru podle kap. 5.
3. **Napojení na GenerateArticle**
   - po vytvoření `Article` načíst konfiguraci webu a podle `autoPublishMode` enqueue‑nout `PublishArticleJob`.
4. **API pro manuální publish (single + batch)**
   - přidat endpoints pro ruční publish jednoho článku a dávky,
   - integrovat do dashboardu (Next.js).
5. **Email & Approval workflow**
   - implementovat `ArticleApprovalToken` flow (create token, approve endpoint),
   - napojit na e‑mail modul a `PublishArticleJob` (`trigger = 'email'`).
6. **UX a monitoring**
   - upravit dashboard pro viditelnost WP stavu,
   - přidat logování chyb do admin/debug sekce (raději než jen do konzole workeru).

Tento dokument slouží jako referenční návrh pro implementaci WordPress publikace na úrovni backendu, workeru a dashboardu. Po implementaci by se měl udržovat v souladu se skutečným chováním systému.

---

## 11. Implementační checklist (detailní úkoly)

Níže je rozpad návrhu na konkrétní úkoly pro vývojáře. Každý blok má jasné „hotovo“, které lze ověřit minimálně pomocí:

- `npm run lint`
- `npm run build`

Při dokončení úkolu vždy:

- zkontroluj, že build i lint projdou,
- označ příslušné checkboxy v tomto dokumentu.

### 11.1 WordPress klient (`libs/wp-client`)

- [x] Vytvořit nový workspace `libs/wp-client` (ověřeno: `npm run lint`, `npm run build --workspace @seobooster/wp-client`)
  - [x] Přidat složku `libs/wp-client` s klasickou strukturou (např. `src/index.ts`).
  - [x] Aktualizovat `tsconfig.base.json` a případné path aliasy tak, aby bylo možné importovat klienta jako `@seobooster/wp-client`.
  - [x] Spustit `npm run lint` a `npm run build` – musí projít bez chyb.

- [x] Definovat rozhraní pro WordPress credentials a payload
  - [x] V `libs/wp-client/src/index.ts` (nebo ekvivalentu) přidat TS typy:
    - `WordpressCredentials` – odpovídá JSON struktuře popsané v kapitole 2.
    - `CreatePostPayload` / `UpdatePostPayload` – obsahují `title`, `content`, `status`, volitelně `slug`, `categories`, `tags`.
  - [x] Zajistit, že typy neporušují existující build (pouze exporty, žádná runtime závislost).
  - [x] Spustit `npm run lint` a `npm run build`.

- [x] Implementovat základní funkce klienta
  - [x] Implementovat funkci `createPost(credentials, payload)`:
    - používá `fetch`/`axios` (dle standardu v repo) s Basic Auth `username:applicationPassword`,
    - volá `POST {baseUrl}/wp-json/wp/v2/posts`,
    - na úspěch vrací objekt obsahující minimálně `id` (WP post ID) a status.
  - [x] Implementovat funkci `updatePost(credentials, postId, payload)`:
    - volá `POST`/`PUT {baseUrl}/wp-json/wp/v2/posts/{postId}`,
    - chová se obdobně jako `createPost`.
  - [x] Ošetřit základní chyby (4xx/5xx) tak, aby caller dostal smysluplnou JS chybu.
  - [x] Spustit `npm run lint` a `npm run build`.

> Ověřeno: `npm run lint`, `npm run build --workspace @seobooster/wp-client`

### 11.2 Rozšíření queue typů a PublishArticle workeru

- [x] Rozšířit typ `PublishArticleJob` v `libs/queue-types/src/index.ts`
  - [x] Do typu `PublishArticleJob` přidat pole:
    - `targetStatus: 'draft' | 'publish'`,
    - `trigger: 'auto' | 'manual' | 'email'`.
  - [x] Zajistit, že všechny existující použití `PublishArticleJob` (pokud nějaké) se upraví tak, aby předávala nová pole.
  - [x] Spustit `npm run lint` a `npm run build`.

- [x] Implementovat logiku PublishArticle workeru v `apps/worker/src/main.ts`
  - [x] Najít definici `createWorker<PublishArticleJob>(PUBLISH_ARTICLE_QUEUE, ...)`.
  - [x] Nahradit současný stub tak, aby:
    - načetl `Article` podle `articleId` včetně `Web` a `WebCredentials`,
    - validoval, že `web.integrationType === WORDPRESS_APPLICATION_PASSWORD`,
    - dešifroval `WebCredentials.encryptedJson` přes existující `EncryptionService` ekvivalent v workeru, nebo samostatnou utilitu (podle vzoru v API),
    - z dešifrovaného JSON extrahoval `baseUrl`, `username`, `applicationPassword`, `autoPublishMode`.
  - [x] Rozhodnutí create vs update:
    - když `article.wordpressPostId` je `null` → volat `createPost` z `@seobooster/wp-client`,
    - jinak volat `updatePost` s daným `postId`.
  - [x] Aktualizace DB po úspěchu:
    - nastavit `article.wordpressPostId` (pokud šlo o create),
    - nastavit `Article.status` podle `targetStatus`,
    - pokud `targetStatus = 'publish'`:
      - nastavit `Article.publishedAt`,
      - nastavit `ArticlePlan.status = PUBLISHED` (pokud existuje navázaný plan).
  - [x] Ošetření chyb:
    - při 4xx chybách z WP vracet error bez retry (job failne),
    - při 5xx/timeout chybách ponechat možnost retry (BullMQ).
  - [x] Spustit `npm run lint` a `npm run build`.

> Ověřeno: `npm run lint`, `npm run build`

### 11.3 Napojení na GenerateArticle (automatický push/publish)

- [x] Upravit `GenerateArticle` worker v `apps/worker/src/main.ts`
  - [x] Po vytvoření `Article` (použití `prisma.article.create`) načíst `Web` a případné `WebCredentials` (pokud ještě nejsou v `plan.web` includu).
  - [x] Pokud:
    - `web.integrationType !== WORDPRESS_APPLICATION_PASSWORD`, nebo
    - chybí/nejdou dešifrovat credentials,
    → **neenqueueovat** žádný `PublishArticleJob` (zachovat současné chování).
  - [x] Pokud integrace existuje:
    - z credentials vytáhnout `autoPublishMode`,
    - podle hodnoty:
      - `draft_only` → enqueue `PublishArticleJob` s `targetStatus = 'draft'`, `trigger = 'auto'`,
      - `manual_approval` → enqueue `PublishArticleJob` s `targetStatus = 'draft'`, `trigger = 'auto'`,
      - `auto_publish` → enqueue `PublishArticleJob` s `targetStatus = 'publish'`, `trigger = 'auto'`.
  - [x] Spustit `npm run lint` a `npm run build`.

> Ověřeno: `npm run lint`, `npm run build`

### 11.4 API pro manuální publish (single)

- [x] Vytvořit nebo rozšířit controller pro články
  - [x] Buď:
    - přidat metodu do `apps/api/src/webs/webs.controller.ts`, nebo
    - vytvořit nový `ArticlesController` (např. `apps/api/src/articles/articles.controller.ts`) s JWT guardem.
  - [x] Endpoint: `POST /api/webs/:webId/articles/:articleId/publish`.

- [x] Implementace služby
  - [x] V příslušném service (např. `WebsService` nebo novém `ArticlesService`):
    - ověřit, že web `webId` patří přihlášenému uživateli,
    - ověřit, že článek `articleId` patří k danému webu,
    - zkontrolovat, že stav článku umožňuje publish (např. `DRAFT` nebo `QUEUED`),
    - použít `JobQueueService.enqueuePublishArticle(...)` a předat `articleId`, `targetStatus = 'publish'`, `trigger = 'manual'` (podle nové signatury),
    - vrátit `{ queued: true }`.
  - [x] Spustit `npm run lint` a `npm run build`.

> Ověřeno: `npm run lint`, `npm run build`

### 11.5 API pro manuální batch publish

- [x] Přidat endpoint pro batch publish
  - [x] Endpoint: `POST /api/webs/:webId/articles/publish-batch`.
  - [x] Request body DTO (např. `PublishBatchDto`) s polem `articleIds: string[]` a základní validací (není prázdné pole).

- [x] Implementace v service
  - [x] Vyfiltrovat zadané `articleIds` tak, aby:
    - patřily k webu `webId`,
    - patřily k aktuálnímu uživateli,
    - měly stav vhodný k publikaci (např. `DRAFT`/`QUEUED`).
  - [x] Pro každý validní článek enqueue‑nout `PublishArticleJob` s `targetStatus = 'publish'`, `trigger = 'manual'`.
  - [x] Vrátit např. `{ queued: count }`.
  - [x] Spustit `npm run lint` a `npm run build`.

> Ověřeno: `npm run lint`, `npm run build`

### 11.6 UI: WordPress settings per web

- [x] Přidat stránku / panel „WordPress nastavení“ v Next.js (`apps/web`)
  - [x] Např. nová stránka `/dashboard/webs/[id]/settings` nebo sekce v existujícím detailu webu.
  - [x] Načítat aktuální `Web` a jeho `credentials` přes:
    - `GET /api/webs/:id`,
    - `GET /api/webs/:id/credentials`.

- [x] Formulář pro úpravu credentials
  - [x] Pole pro `baseUrl`, `username`, `applicationPassword`.
  - [x] Select / radio pro `autoPublishMode` (`draft_only`, `manual_approval`, `auto_publish`).
  - [x] Na submit:
    - volat `PATCH /api/webs/:id` pro nastavení `integrationType = WORDPRESS_APPLICATION_PASSWORD`,
    - volat `PUT /api/webs/:id/credentials` s JSON strukturou dle kapitoly 2.
  - [x] Zajistit základní validaci na frontendu (neprázdné URL, username, app password).
  - [x] Spustit `npm run lint` a `npm run build`.

> Ověřeno: `npm run lint`, `npm run build`

### 11.7 UI: manuální publish (single + batch)

- [x] Zobrazit u každého článku možnost manuálního publish
  - [x] V dashboardu (např. `apps/web/pages/dashboard/index.tsx`) doplnit k článkům tlačítko „Publikovat na WordPress“.
  - [x] Na klik:
    - volat `POST /api/webs/:webId/articles/:articleId/publish`,
    - po úspěchu refreshnout overview (`GET /api/webs/:id/overview`).

- [x] Batch publish v UI
  - [x] Přidat checkboxy k řádkům článků nebo alespoň k draftům.
  - [x] Přidat hromadnou akci „Publikovat vybrané“:
    - volá `POST /api/webs/:webId/articles/publish-batch` s `articleIds`.
    - po úspěchu opět refresh overview.
  - [x] Spustit `npm run lint` a `npm run build`.

> Ověřeno: `npm run lint`, `npm run build`

### 11.8 Email & approval workflow (režim `manual_approval`)

> Tento blok je možné realizovat jako samostatnou mini‑fázi po zprovoznění základní WP integrace.

- [ ] Vytvořit service pro práci s `ArticleApprovalToken`
  - [ ] Nový service v API (např. `ArticleApprovalService`), který:
    - umí vytvořit token `ArticleApprovalToken` pro daný `articleId`,
    - umí token ověřit a označit jako `consumed`.
  - [ ] Spustit `npm run lint` a `npm run build`.

- [ ] Approve endpoint v API
  - [ ] Endpoint, např. `POST /api/articles/approve` nebo `GET /api/articles/approve?token=...`.
  - [ ] Implementace:
    - načíst token,
    - ověřit expiraci a `consumedAt`,
    - označit token jako použitý,
    - enqueue‑nout `PublishArticleJob` s `targetStatus = 'publish'`, `trigger = 'email'`.
  - [ ] Spustit `npm run lint` a `npm run build`.

- [ ] Napojení na e‑mail modul
  - [ ] Po úspěšném vytvoření WP draftu v režimu `manual_approval`:
    - zavolat e‑mailový modul (po implementaci Email Module z `implementation_plan.md`),
    - poslat uživateli e‑mail s náhledem článku a approve linkem (URL s tokenem).
  - [ ] Ověřit, že celý flow funguje end‑to‑end (lokálně):
    - vygenerovat článek,
    - zkontrolovat existenci WP draftu,
    - ručně/skriptem trefit approve endpoint s tokenem,
    - ověřit, že se článek na WP publikuje.
  - [ ] Spustit `npm run lint` a `npm run build`.

---

Tento checklist se má používat jako průvodce implementací. Po dokončení každého bloku a úspěšném `npm run lint` + `npm run build` je možné příslušné checkboxy označit jako hotové.
