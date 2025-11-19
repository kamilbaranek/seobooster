# Plán integrace generování obrázků k článkům

Branch: `image-generation`  
Cíl: Do stávající pipeline přidat poslední krok – generování obrázku pro článek, jeho dočasné uložení ve storage a následnou synchronizaci s WordPressem (featured image).

---

## 1. Flow pipeline a triggery

- Zachovat současný flow:
  - scan webu → business/SEO analýza → plán článků → `generate-article` → uložit článek (markdown + HTML) → enqueue `publish-article`.
- Nový krok po vygenerování článku:
  - po úspěšném jobu `generate-article` (poté, co je článek uložen do DB) enqueue nový job do fronty `GENERATE_ARTICLE_IMAGE_QUEUE` (nový typ jobu, vstup = `articleId`).
- Generování obrázku je **asynchronní**:
  - nesmí blokovat generování článku ani WordPress publish;
  - pokud generování selže, článek se dál chová jako dnes (bez obrázku).

---

## 2. Prompt + model (admin /admin/prompts)

- Přidat nový AI task, např. `article_image`:
  - nová konfigurace v `AiPromptConfig` (DB) a UI v `/admin/prompts`.
- Prompt musí mít k dispozici proměnné z předchozích kroků:
  - `{businessName}`, `{webUrl}`, `{businessDescription}` / `{targetAudience}`,
  - `{clusterName}`, `{supportingArticleTitle}`, `{keywords}`,
  - `{articleTitle}`, případně zkrácený obsah `{articleSummary}`.
- Orchestrátor:
  - do mapování tasků přidat `article_image` → image model (OpenAI / OpenRouter / jiný image provider);
  - model a případné parametry (velikost, styl) řízené přes admin UI bez nutnosti měnit kód.

---

## 3. Datový model a storage

- Využít existující pole `Article.featuredImageUrl`:
  - při **lokálním / blob** uloženém obrázku: obsahuje veřejnou URL (např. `https://.../assets/...`),
  - po úspěšném uploadu do WordPressu: nahradit hodnotu **vzdáleným** URL (`source_url` z WP).
- Případný rozšířený stav (volitelné, později):
  - `featuredImageStatus: 'PENDING' | 'READY' | 'FAILED'` – pokud se ukáže jako potřebné pro UI.
- Storage vrstva:
  - použít existující `@seobooster/storage` (stejně jako pro favicony / screenshoty),
  - generátor obrázku vrátí binární data nebo URL,
  - worker je uloží přes storage driver (local / Vercel Blob / jiný backend),
  - získá `publicUrl` (uloží do `Article.featuredImageUrl`)
  - a případně interní `path` (pro pozdější mazání po uploadu na WP).

---

## 4. Worker – generování obrázku

### 4.1 Queue typ

- V `libs/queue-types` přidat:
  - `GENERATE_ARTICLE_IMAGE_QUEUE` (string konstantu),
  - typ jobu `GenerateArticleImageJob` (obsahuje minimálně `articleId`, případně `forceRegenerate`).

### 4.2 Worker implementace

- V `apps/worker` přidat worker:
  - `createWorker<GenerateArticleImageJob>(GENERATE_ARTICLE_IMAGE_QUEUE, handler)`.
- V handleru:
  - načíst z DB:
    - `Article` (markdown, html, title, tags, featuredImageUrl, …),
    - `Web` (url, business info přes `WebAnalysis`, integration type, atd.),
    - související SEO data (cluster, supporting article) – pokud jsou potřeba jako proměnné.
  - sestavit payload pro orchestrátor pro task `article_image`:
    - `businessName`, `businessDescription`, `targetAudience`,
    - `articleTitle`, `articleSummary` (krátké shrnutí z markdownu nebo SEO dat),
    - `keywords` / `tags`.
  - zavolat AI orchestrátor:
    - `aiProvider.run('article_image', variables)` nebo ekvivalent,
    - podle poskytovatele očekávat buď:
      - přímo image data (base64 / binary URL),
      - nebo URL ke stažení.
  - uložit výsledný obrázek přes `assetStorage`:
    - pokud je base64 / buffer: zapsat jako soubor přes `assetStorage`,
    - pokud je URL: stáhnout a uložit do storage (kvůli jednotnému přístupu a mazání).
  - zapsat do DB:
    - `Article.featuredImageUrl = publicUrl` ze storage.

### 4.3 Idempotence

- Pokud článek už má `featuredImageUrl` a job není označen jako `forceRegenerate`:
  - worker ukončit bez akce (idempotentní chování).
- Pro debug / ruční regeneraci:
  - job může nést `forceRegenerate: true`, v tom případě:
    - případně smazat starý lokální soubor (pokud není WP URL),
    - přepsat `featuredImageUrl` novým obrázkem.

---

## 5. Worker – integrace s WordPressem (featured image)

### 5.1 WP klient

- Rozšířit `@seobooster/wp-client` o media endpoint:
  - `uploadMedia(credentials, fileBuffer, options): Promise<{ id: number; source_url: string; ... }>`,
  - `options` obsahuje např. `filename`, `mimeType`, `title`.
- Rozšířit create/update post tak, aby podporoval `featured_media`:
  - `WordpressPostPayload` už nyní obsahuje obsah a metadata;
  - doplnit nepovinné pole `featured_media?: number`.

### 5.2 Napojení do publish workeru

- V `publish-article` workeru (v `apps/worker/src/main.ts`):
  - před sestavením `WordpressPostPayload`:
    - pokud `article.featuredImageUrl` existuje a je **lokální** URL z naší storage:
      - načíst binární obsah z asset storage (např. podle path odvozené z URL),
      - zavolat `uploadMedia` v `@seobooster/wp-client`,
      - získat `mediaId` + `source_url`.
    - nastavit `payload.featured_media = mediaId`.
  - po úspěšném publish / update postu:
    - aktualizovat článek v DB:
      - `featuredImageUrl = source_url` z WordPressu,
    - pokud storage driver je lokální disk:
      - smazat lokální soubor (aby duplicitně nezabíral místo).
- Failover chování:
  - pokud upload selže:
    - zalogovat chybu + `articleId`, `webId`,
    - **neblokovat** publish článku – post se publikuje bez featured image,
    - `featuredImageUrl` zůstává lokálním odkazem (možnost pozdějšího retry).

---

## 6. API + UI – manuální generování / debug

### 6.1 API endpoint

- V API (`apps/api`):
  - přidat endpoint `POST /webs/:webId/articles/:articleId/image`:
    - ověří, že `webId` patří aktuálnímu uživateli,
    - ověří existenci článku s daným `articleId` a `webId`,
    - enqueue job do `GENERATE_ARTICLE_IMAGE_QUEUE`:
      - defaultně `forceRegenerate = false`,
      - volitelně query param `force=true`.
    - response: `{ queued: true }` případně se základní informací pro UI.

### 6.2 Web UI (dashboard detail článku)

- Na stránce detailu článku `/dashboard/webs/[webId]/articles/[articleId]`:
  - nahradit placeholder akci „Vygenerovat obrázek“ tak, aby:
    - volala výše uvedený endpoint,
    - zobrazila krátký stav („Job zařazen do fronty“ / „Chyba při zařazení“).
  - náhled:
    - stávající render `featuredImageUrl` zachovat,
    - po úspěšné akci nabídnout „Obnovit“ (refetch detailu) pro zobrazení nového obrázku.

---

## 7. Bezpečnost, náklady, fallbacky

- Konfigurace:
  - v adminu (nebo per web) přidat možnost zapnout/vypnout generování obrázků,
  - případně nastavit „image provider“ per web, pokud časem přidáme víc providerů.
- Rate‑limity a náklady:
  - v workeru přidat jednoduchou ochranu:
    - např. limit obrázků za den / web,
    - nebo dodatečnou kontrolu, že na stejný článek neběží víc aktivních image jobů.
- Logování:
  - strukturované logy pro:
    - start/úspěch/selhání `GenerateArticleImageJob`,
    - upload media do WordPressu (včetně `mediaId`, `articleId`, `webId`),
    - mazání lokálních souborů (pro audit, případně debug).

---

## 8. Návrh inkrementů (pro implementaci v další fázi)

> Tohle je pouze návrh rozfázování, implementace přijde až po schválení plánu.

1. **Schema + WP metadata sync**
   - zkontrolovat, že `Article.featuredImageUrl` a WP metadata jsou ve všech prostředích v konsistentním stavu,
   - případně doplnit jednoduchý status (pokud se ukáže potřeba).
2. **Queue a worker pro generování obrázků**
   - definice `GENERATE_ARTICLE_IMAGE_QUEUE`, `GenerateArticleImageJob`,
   - worker v `apps/worker` + napojení na orchestrátor (`article_image` prompt),
   - uložení do storage + zápis `featuredImageUrl`.
3. **WP klient + publish integrace**
   - rozšíření `@seobooster/wp-client` o upload media + `featured_media`,
   - rozšíření publish workeru o upload obrázku a přepsání `featuredImageUrl` na WP URL + smazání lokálu.
4. **API a UI**
   - endpoint `POST /webs/:webId/articles/:articleId/image`,
   - úprava `/dashboard/webs/[webId]/articles/[articleId]` – reálné volání, stav, refresh.
5. **Konfigurace a ochrany**
   - toggly v adminu, rate‑limity, případné další logování a metriky.

Po schválení tohoto dokumentu můžeme začít s implementací podle výše uvedených kroků v branchi `image-generation`.

---

## 9. Implementační plán (pro juniorního vývojáře)

Níže je rozpad na konkrétní, malé úkoly, které lze řešit postupně v několika PR. U každého bodu je jasné **co**, **proč** a **jak**.  
Každá fáze musí skončit takto:

- build(y) bez chyb (`npm run build` nebo konkrétní workspace),
- změny zapsané v Git historii (commit s rozumnou zprávou),
- v tomto dokumentu lze dané úkoly označit jako hotové (`[x]`).

### Fáze 1 – Schema + WP klient (příprava modelů a kontraktů)

**Cíl:** Mít kompletní datový model pro featured image a připravený WordPress klient pro práci s media endpointem, ale nic ještě „nedrátovat“ do workerů.

- [x] 1.1 Zreviduj Prisma schema a migrace
  - **Co:** Ověř, že `Article.featuredImageUrl` a nové WP tabulky (kategorie, autoři) jsou v `prisma/schema.prisma` i v DB (migrace jsou nasazené).
  - **Proč:** Nechceme implementovat obrázky na rozbitém nebo nekompletním schematu.
  - **Jak:**
    - projdi `prisma/schema.prisma` a migraci `20251117200500_add_wp_metadata`,
    - pokud něco chybí, sjednoť schema a migraci (ale *neměň* existující sloupce bez domluvy),
    - spusť `npx prisma format` a `npx prisma generate`,
    - ověř build: `npm run build --workspace @seobooster/api`.

- [x] 1.2 Přidej image typ do WP klienta
  - **Co:** V `libs/wp-client` rozšiř typy o rozumný výsledek z `wp/v2/media` (např. `WordpressMediaResponse`).
  - **Proč:** Ať máme typově ošetřený návrat z uploadu media (potřebujeme `id` a `source_url`).
  - **Jak:**
    - v `libs/wp-client/src/index.ts` přidej nový interface `WordpressMediaResponse` (podobně jako `WordpressPostResponse`),
    - zatím žádná funkce jako `uploadMedia` – ta přijde ve Fázi 3,
    - build: `npm run build --workspace @seobooster/wp-client`.

- [x] 1.3 Ujasni si API kontrakty v kódu
  - **Co:** Do `articleimage.md` v krátké podsekci popiš očekávané signatury:
    - `uploadMedia(credentials, fileBuffer, options)`,
    - jaké pole z `WordpressMediaResponse` budeme používat.
  - **Proč:** Ať je dopředu jasné, jak bude WP klient vypadat a junior se má čeho držet.
  - **Jak:**
    - doplň stručné typové náčrty (jen dokumentace, ne implementace),
    - commit: např. `docs: clarify wp media api contract`.

#### WP media API kontrakt (pro Task 1.3)

```ts
type UploadMediaOptions = {
  filename: string;
  mimeType: string;
  title?: string;
  altText?: string;
};

async function uploadMedia(
  credentials: WordpressCredentials,
  fileBuffer: Buffer,
  options: UploadMediaOptions
): Promise<WordpressMediaResponse>;

interface WordpressMediaResponse {
  id: number;
  source_url: string; // používáme pro nahrazení Article.featuredImageUrl
  media_type?: string;
  mime_type?: string;
  alt_text?: string;
  title?: { rendered: string } | string;
}
```

> `WordpressMediaResponse` je uložený v `libs/wp-client/src/index.ts`; implementace `uploadMedia` přijde až ve Fázi 3.

> Fáze 1 končí, když:  
> - všechny buildy pro `@seobooster/api` a `@seobooster/wp-client` projdou,  
> - změny jsou commitnuté v branchi `image-generation`.

### Fáze 2 – Queue + worker pro generování obrázků

**Cíl:** Mít frontu a worker, který umí pro daný článek vygenerovat obrázek a uložit ho do storage + DB jako `featuredImageUrl`. Nic zatím nepřipojuje k WordPress publish kroku.

- [x] 2.1 Definuj nový job typ a frontu
  - **Co:** V `libs/queue-types` přidat:
    - konstantu `GENERATE_ARTICLE_IMAGE_QUEUE`,
    - typ `GenerateArticleImageJob` (obsahuje např. `articleId`, později i `forceRegenerate`).
  - **Proč:** Queue typy sdílíme mezi API a workerem – musí být jasně definované.
  - **Jak:**
    - postupuj podle existujících jobů (např. `GENERATE_ARTICLE_QUEUE`),
    - build: `npm run build --workspace @seobooster/queue-types`.

- [x] 2.2 Přidej worker do `apps/worker`
  - **Co:** V `apps/worker/src/main.ts` (nebo separátní službě) definuj `createWorker<GenerateArticleImageJob>(GENERATE_ARTICLE_IMAGE_QUEUE, ...)`.
  - **Proč:** Worker bude centrální místo, kde se obrázek generuje a ukládá.
  - **Jak:**
    - připoj se na Redis stejně jako ostatní workery,
    - handler prozatím může jen zalogovat, že job dorazil (v první iteraci),
    - build: `npm run build --workspace @seobooster/worker`.

- [x] 2.3 Napoj handler na AI orchestrátor
  - **Co:** V handleru článkového image workeru:
    - načti potřebná data z DB (článek, web, SEO data),
    - připrav objekt proměnných pro task `article_image`,
    - zavolej orchestrátor (`aiProvider`) a získej výsledek.
  - **Proč:** Abychom měli skutečně text→image prompt řízený přes `/admin/prompts`.
  - **Jak:**
    - podívej se, jak se volá orchestrátor u jiných tasků (např. generování článku),
    - použij stejný pattern pro logging, error handling,
    - zatím ukládej výsledek jen do logu nebo do dočasné konstanty (bez storage).

- [x] 2.4 Ulož image do storage a do DB
  - **Co:** Propojit výsledek generování s `@seobooster/storage`:
    - uložit soubor přes storage driver,
    - vzít `publicUrl` a zapsat ho do `Article.featuredImageUrl`.
  - **Proč:** Aby UI mohlo obrázek zobrazit ještě před uploadem do WP.
  - **Jak:**
    - inspiruj se favicon/screenshot workerem (už používá `assetStorage`),
    - aktualizuj článek přes Prisma (`prisma.article.update`),
    - přidej idempotentní logiku: pokud `featuredImageUrl` existuje a není `forceRegenerate`, worker skončí bez změny.

> Fáze 2 končí, když:  
> - worker pro image job úspěšně uloží obrázek do storage a `Article.featuredImageUrl`,  
> - build pro `@seobooster/worker` i `@seobooster/queue-types` prochází,  
> - změny jsou commitnuté (např. `feat: add article image queue and worker`).

### Fáze 3 – WordPress upload + featured image v publish kroku

**Cíl:** Pokud má článek lokální `featuredImageUrl`, publish worker jej před odesláním na WP nahraje jako media, přiřadí jako featured image a v DB nahradí URL za WP URL.

- [x] 3.1 Implementuj `uploadMedia` v `@seobooster/wp-client`
  - **Co:** Přidat funkci, která:
    - vezme `credentials`, binární obsah obrázku a metadata (`filename`, `mimeType`, `title`),
    - zavolá `wp-json/wp/v2/media` (POST multipart nebo vhodný formát),
    - vrátí `WordpressMediaResponse`.
  - **Proč:** Bez toho nevíme, jak obrázky dostat do WordPress knihovny médií.
  - **Jak:**
    - použij stávající helper `sendRequest` jako inspiraci, případně přidáš variantu pro upload,
    - ošetři chyby pomocí `WordpressClientError` (stejný styl jako posts),
    - build: `npm run build --workspace @seobooster/wp-client`.

- [x] 3.2 Rozšíř payload o `featured_media`
  - **Co:** V `WordpressPostPayload` přidej nepovinné pole `featured_media?: number`.
  - **Proč:** WordPress očekává ID média jako číslo, které se použije jako featured image.
  - **Jak:**
    - aktualizuj typ v `libs/wp-client/src/index.ts`,
    - ověř, že to nenaruší existující volání create/update post (pole je volitelné).

- [x] 3.3 Napoj upload do publish workeru
  - **Co:** V `publish-article` workeru:
    - pokud `article.featuredImageUrl` vypadá jako lokální asset (např. začíná na naší `ASSET_PUBLIC_BASE_URL`),
      - načti binární obsah ze storage,
      - zavolej `uploadMedia`,
      - nastav `featured_media` v `WordpressPostPayload`.
  - **Proč:** Tím se obrázek fyzicky přenese do WP a naváže k příslušnému článku.
  - **Jak:**
    - přidej pomocnou funkci na detekci „lokální vs. vzdálená“ URL,
    - zachovej stávající log flow (WordpressClientError, další chyby),
    - pokud upload selže, loguj a pokračuj bez `featured_media`.

- [x] 3.4 Po publish přepiš URL a smaž lokální soubor
  - **Co:** Po úspěšném publish:
    - vezmi `source_url` z `WordpressMediaResponse`,
    - aktualizuj `Article.featuredImageUrl` na WP URL,
    - smaž lokální soubor (pokud storage driver je lokální).
  - **Proč:** Nechceme dlouhodobě držet duplicitní kopii obrázku; chcete, aby zdroj pravdy byl WordPress.
  - **Jak:**
    - v DB update je podobný jako u změny statusu/publishedAt,
    - pro mazání použij odpovídající metodu ze storage (případně doplnit do `@seobooster/storage`),
    - ošetři chybu mazání jen logem – nezneplatňuj publish.

> Fáze 3 končí, když:  
> - publish worker umí nahrát obrázek na WP a nastavit featured image,  
> - po publish má článek v DB WP URL, ne lokální,  
> - buildy pro `@seobooster/wp-client` a `@seobooster/worker` jsou čisté a změny jsou commitnuté.

### Fáze 4 – API + UI hook pro manuální generování

**Cíl:** Umožnit z dashboardu (detailu článku) ručně spustit generování obrázku a vidět jeho výsledek.

- [ ] 4.1 Přidej endpoint `POST /webs/:webId/articles/:articleId/image`
  - **Co:** V `apps/api` přidat do articles/webs logiky endpoint, který:
    - ověří, že `webId` patří přihlášenému uživateli,
    - ověří, že článek existuje a patří danému webu,
    - vloží job do `GENERATE_ARTICLE_IMAGE_QUEUE`.
  - **Proč:** Potřebujeme manuální spouštěč mimo automatickou pipeline.
  - **Jak:**
    - vytvoř novou metodu v `ArticlesController` nebo dedikovaný controller (podle struktury),
    - v service využij existující pattern pro enqueuování jobů (koukni, jak se to dělá u publish/scan),
    - build: `npm run build --workspace @seobooster/api`.

- [ ] 4.2 Propoj UI na detailu článku
  - **Co:** V `apps/web/pages/dashboard/webs/[webId]/articles/[articleId].tsx` napoj tlačítko „Vygenerovat obrázek“:
    - na volání API endpointu,
    - na zobrazení „job zařazen“ / „chyba“.
  - **Proč:** Uživatel musí umět obrázek dožádat, ne jen čekat na automatickou pipeline.
  - **Jak:**
    - použij existující `apiFetch`,
    - po úspěchu nastav krátkou hlášku do `statusMessage` nebo podobného stavu,
    - případně nabídni „Obnovit“ (refetch detailu).

- [ ] 4.3 Ověř zobrazení v UI
  - **Co:** Ujisti se, že:
    - pokud má článek `featuredImageUrl`, UI ho zobrazuje,
    - pokud ne, ale job je v běhu, UI aspoň ukazuje informativní text (např. „Obrázek se generuje“ – může být jen text podle stavu, který vrací API nebo worker log).
  - **Proč:** UX má být jasné – uživatel má vědět, co se děje.
  - **Jak:**
    - otestuj flow na localhostu: vygenerovat článek → spustit generování obrázku → publish → zkontrolovat, že obrázek je z WP,
    - build: `npm run build --workspace @seobooster/web`.

> Fáze 4 končí, když:  
> - ruční generování funguje end‑to‑end z UI,  
> - buildy pro `@seobooster/api` a `@seobooster/web` jsou čisté,  
> - změny jsou commitnuté.

### Fáze 5 – Konfigurace, limity, úklid

**Cíl:** Dodat ochrany před zneužitím a drobné UX/ops vylepšení.

- [ ] 5.1 Přepínače v adminu / konfiguraci
  - **Co:** Přidat možnost globálně nebo per web vypnout generování obrázků (např. flag v DB nebo v prompt configu).
  - **Proč:** Aby šlo feature postupně rolloutovat a případně rychle vypnout.
  - **Jak:**  
    - jednoduchý boolean v příslušném modelu (`Web` nebo vlastní tabulka konfigurace),  
    - kontrola flagu v image workeru před voláním AI.

- [ ] 5.2 Jednoduché rate‑limity
  - **Co:** Zavést ochranu, aby jeden web / článek negeneroval obrázky příliš často.
  - **Proč:** Ochrana nákladů a stability poskytovatele AI.
  - **Jak:**  
    - na začátku handleru image workeru zkontrolovat např. timestamp posledního generování,  
    - pokud pod hranicí (např. < X minut), job odložit nebo zahodit s logem.

- [ ] 5.3 Dokumentace a úklid
  - **Co:** Aktualizovat `development_plan.md` / `implementation_plan.md` a README, pokud je to relevantní.
  - **Proč:** Plán a realita musí zůstat v synchronu.
  - **Jak:**  
    - krátká sekce „Article image generation flow“,  
    - shrnutí, jak feature funguje a jak se konfiguruje.

> Fáze 5 končí, když:  
> - jsou doplněné přepínače / základní limity (alespoň minimální verze),  
> - dokumentace odpovídá implementaci,  
> - buildy pro celý monorepo (`npm run build`) jsou zelené a vše je commitnuté.
