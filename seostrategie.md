Níže je návrh architektury, která splňuje tvoje 3 požadavky a navazuje na současný stav repo. Popíšu to po vrstvách (data model → pipeline → scheduler → prompty → API/UI) a u každého bodu uvedu, jak naplňuje konkrétní požadavek.

---

**1. Datový model: normalizace SEO strategie (splnění požadavku 1)**

Cíl: po návratu SEO strategie ji rozbít z JSONu do relační struktury, která umí:

- reprezentovat celou strategii pro konkrétní web,
- mít explicitní vazby: strategie → topic clustery → podpůrné články,
- navázat plánované články (scheduler) na konkrétní podpůrné články.

Navrhované entity a vazby:

- `SeoStrategy`  
  - 1 : 1 k `Web` (aktuálně platná strategie pro web; případně historizace přes `version` / `isActive`).
  - Pole: `id`, `webId`, `generatedAt`, `model`, `rawJson` (kopie původní AI odpovědi pro debug), případně agregované info z `business` (name, description, targetAudience).
- `SeoTopicCluster`  
  - 1 : N od `SeoStrategy`.
  - Pole: `id`, `strategyId`, `orderIndex` (pořadí v původním JSON), `pillarPage`, `pillarKeywords` (JSON/string[]), `clusterIntent`, `funnelStage`.
- `SeoSupportingArticle`  
  - 1 : N od `SeoTopicCluster`.
  - Pole: `id`, `clusterId`, `orderIndex`, `title`, `keywords` (JSON/string[]), `intent`, `funnelStage`, `metaDescription`.
- (Volitelné) `SeoStrategyBusiness`  
  - Pokud chceš mít `business` část strategie odděleně, ale to může klidně být přímo na `SeoStrategy`.

Stávající `WebAnalysis.seoStrategy`:

- Buď se:
  - zachová jako „raw“ kopie (přejmenuje se na něco jako `seoStrategyRaw`),  
  - nebo se přestane používat a místo ní se bude používat `SeoStrategy.rawJson`.
- Pro debug endpoint `/webs/:id/pipeline-debug` můžeš:
  - buď dál vracet raw JSON z `SeoStrategy.rawJson`,
  - nebo složit JSON zpět z normalizovaných tabulek (strategie + clustery + supporting_articles).

Tím plníme požadavek 1: topic clustery, pillars, keywords a articles mají normální vazby přes cizí klíče, ne jen vnořené v jednom JSON.

---

**2. Změna kroku „CreateSeoStrategy“: z parsování do DB + plánování článků (1 + 2)**

Dnes:

- Worker po volání modelu uloží strategii jako JSON k `WebAnalysis` a okamžitě spuští `GenerateArticle`.

Nové chování po návratu modelu:

1. **Transakční uložení strategie a clusterů**
   - V rámci jedné DB transakce:
     - vytvořit/aktualizovat `SeoStrategy` pro daný `webId` (nastavit `generatedAt`, `model`, `rawJson` + business info),
     - smazat/invalidovat staré clustery a supporting articles pro tuto strategii/web (nebo označit jako neaktivní),
     - pro každý `topic_cluster` z JSON:
       - vložit `SeoTopicCluster` s `orderIndex` = index v poli,
       - pro každý `supporting_article` vložit `SeoSupportingArticle` s `orderIndex` = index v clusteru.
   - Po transakci je celá strategie normalizovaná v DB.

2. **Vytvoření plánu článků (Article schedule)**
   - Po normalizaci vytvořit záznamy „plánu článků“ (nová entita, např. `ArticlePlan`):

     - `ArticlePlan`
       - `id`
       - `webId`
       - `strategyId`
       - `clusterId` (→ `SeoTopicCluster`)
       - `supportingArticleId` (→ `SeoSupportingArticle`)
       - `plannedPublishAt` (resp. `plannedGenerationAt`, viz níže)
       - `status` (PLANNED, GENERATED, PUBLISHED, SKIPPED)
       - `articleId` (FK na `Article`, nullable – doplní se po vygenerování).

   - Algoritmus plánování:
     - vezmi clustery v pořadí `orderIndex` (tím plníme „nejprve celý topic cluster, pak další“),
     - pro každý cluster vezmi supporting articles opět podle `orderIndex`,
     - vygeneruj sekvenční index `n` (0,1,2,…) pro články v pořadí:
       - cluster 1: article 1…k
       - cluster 2: article 1…m
       - atd.
     - pro každý `n` spočítej `plannedPublishAt`:
       - `t0` = základní start (např. „zítra“ po vygenerování strategie; přesné pravidlo si zvolíš – viz níže),
       - `den = n` (n-tý den po `t0`),
       - `baseTime` = jedno z rozumných časových oken (např. 9–17 hod. lokálního času),
       - `jitter` = náhodný offset ± X minut/hodin, ale:
         - stále uvnitř ~24h okna,
         - ne fixně na :00, :15 – ideálně uniformně v nějakém intervalu (např. ±60 minut).
       - `plannedPublishAt = t0 + den * 1 den + jitter`.

   - Volba startu `t0`:
     - např. `t0 = now + 1 den` a čas v okně 9–11 hod (s jitterem),
     - nebo `t0 = nejbližší další den v 9:00` atd.
     - Toto je business rozhodnutí – architektonicky stačí, že je to funkce `(generatedAt, n) -> datetime + náhodný jitter`.

3. **Zrušení okamžitého spuštění `GenerateArticle`**
   - V ne-debug režimu už *nebudeme* okamžitě enqueovat `GenerateArticle`.
   - Místo toho worker po úspěšném založení plánu jen:
     - uloží AI call log jako dnes,
     - skončí (celkový plán článků je v `ArticlePlan`).

Tím plníme:

- požadavek 1: kompletní parsování strategie do struktur,
- požadavek 2 (první část): „v DB bude existovat topic pro článek a uvidím jej v plánu“ – `ArticlePlan` je právě tento plán.

---

**3. Scheduler pro denní generování článků (splnění požadavku 2 – „reálný“ scheduling)**

Cíl: pravidelně spouštět generování článků podle plánu v DB:

- článek se vygeneruje až ve svůj den,
- články jdou po clusterech (dle plánovacího algoritmu),
- čas v rámci dne má náhodný jitter → nevypadá roboticky.

Navrhovaná architektura scheduleru:

1. **Cron/Scheduler proces**

   - V rámci worker aplikace (NestJS) přidat scheduler, který běží třeba každých 10–15 minut:
     - lze použít `@nestjs/schedule` (Cron) nebo obecný interval.
   - Každý běh:
     - najde všechny `ArticlePlan` pro všechny aktivní weby, kde:
       - `status = PLANNED`,
       - `plannedPublishAt <= now`,
     - pro každý takový záznam:
       - nastaví stav na „ENQUEUED“ nebo „IN_PROGRESS“ (aby se job nespustil dvakrát),
       - zařadí do fronty `GenerateArticle` job, který ponese `plannedArticleId` (ID plánu).

2. **Změna signatury `GenerateArticle` jobu**

   - Dnes worker bere jen `webId` a sám si vybírá první příležitost ze SEO strategie.
   - Nově:
     - job by měl mít `plannedArticleId` (a `webId` lze odvodit z plánu),
     - worker načte:
       - `ArticlePlan` podle `plannedArticleId`,
       - přes vazby: `SeoSupportingArticle` + `SeoTopicCluster` + `SeoStrategy`,
       - případně `Web` a `User` (pro URL a ownera) a `WebAnalysis.businessProfile` (pro audience).
     - Tím získá přesně ten topic, který má být vygenerován *teď*.

3. **Stavy v `ArticlePlan`**

   - `PLANNED` – vytvořen, čeká na datum.
   - `QUEUED`/`IN_PROGRESS` – scheduler enqueoval job, worker ještě neběží/neběžel (jen ochrana proti duplicitám).
   - `GENERATED` – článek v DB existuje a je ve stavu `DRAFT`; `ArticlePlan.articleId` vyplněno.
   - `PUBLISHED` – až se propojí s WordPress publish workflow (později).
   - `SKIPPED` – pro případy, kdy se článek rozhodne negenerovat vůbec.

4. **Denní rytmus a „24h interval, ale ne na minutu“**

   - Denní rytmus je primárně daný `plannedPublishAt` z kroku plánování.
   - Díky jitteru (např. ±1 hodina) v rámci 24hod okna:
     - články nebudou vznikat v absolutně stejný čas,
     - zároveň pořád „jeden článek za den“ per web.
   - Scheduler běžící každých X minut není problém – pokud článek „propadne“ o trochu později (např. 10 minut po plánovaném čase), je to stále přirozené.

Tím plníme:

- požadavek 2 (druhá část): články se negenerují ihned, ale podle plánu; clustery se zpracují sekvenčně; časy nejsou roboticky stejné.

---

**4. Vstupní data pro article prompt (splnění požadavku 3)**

Cíl: pro generování článku dát modelu co nejbohatší kontext:

- topic cluster,
- pillars,
- keywords,
- web audience,
- web URL,
- web owner.

Navrhovaná struktura vstupních proměnných pro `article` task:

1. **Data, která má worker načíst před voláním modelu**

   Z `ArticlePlan` + vazeb:

   - `supportingArticle` (z `SeoSupportingArticle`):
     - `title`, `keywords`, `intent`, `funnelStage`, `metaDescription`.
   - `topicCluster` (z `SeoTopicCluster`):
     - `pillarPage`, `pillarKeywords`, `clusterIntent`, `funnelStage`, `orderIndex`.
   - `strategyBusiness` (z `SeoStrategy` nebo z původního JSONu):
     - `name`, `description`, `targetAudience`.
   - `web` (z `Web`):
     - `url`, případně `nickname`.
   - `owner` (z `User` navázaného na `Web`):
     - např. `email` a/nebo `name` (pokud přidáš).
   - `webAudience`:
     - primárně z `BusinessProfile.audience` (z `WebAnalysis.businessProfile`),
     - případně doplnit o `SeoStrategy.business.target_audience`.

2. **Proměnné pro prompt templating**

   Místo generického `strategy` a `cluster` bych navrhl logicky strukturovaný objekt, např.:

   - `topicCluster` – obsah `SeoTopicCluster` (pillar page, keywords, intent, funnel stage).
   - `supportingArticle` – konkrétní článek v rámci clusteru.
   - `business` – `name`, `description`, `targetAudience`.
   - `web` – `url`, `nickname`.
   - `webAudience` – pole z `BusinessProfile.audience`.
   - `webOwner` – např. `ownerName`/`ownerEmail`.

   V prompt template pro `article` tak máš explicitně:

   - „topic cluster: …“ (pillar + cluster intent),
   - „pillars: …“ (pillar page + pillar keywords),
   - „keywords pro článek: …“ (z `supportingArticle.keywords`),
   - „web audience: …“ (doslova cílové publikum),
   - „web URL: …“ (pro zasazení do kontextu webu),
   - „web owner: …“ (může pomoci při tónu – B2B vs freelancer atd.).

Aktuální `userPrompt` pro `article` můžeš přepsat tak, aby tyto proměnné čitelně využíval; architektonicky stačí, že worker vždy sestaví objekt proměnných v tomto tvaru a předá ho do `renderPromptsForTask('article', ...)`.

---

**5. API a dashboard – práce s plánem**

Aby byl plán článků vidět a použitelný:

1. **API rozšíření**

   - `GET /webs/:id/overview`:
     - rozšířit `articles` o:
       - `plannedArticles` – seznam nejbližších plánovaných článků (z `ArticlePlan`),
       - případně počty: `plannedCount`, `generatedCount`, `publishedCount`.
   - Nový endpoint:
     - `GET /webs/:id/article-plan` – paginovaný seznam `ArticlePlan` (datum, topic, status).
     - Volitelně `PATCH /article-plan/:id` pro posunutí/pozastavení/skip.

2. **Dashboard UI**

   - V pipeline panelu:
     - kromě info, že strategie existuje, i info typu „naplánováno X článků do Y data“.
   - V sekci „Poslední články“:
     - doplnit pod/vedle o „Plánované články“ s datem a topicem (název supporting article / clusteru).
   - Debug sekce:
     - může navíc zobrazovat normalizované clustery a plány.

---

**6. Re-run strategie, edge cases, multi‑tenant chování**

Je dobré předem vyřešit:

- **Re‑generování strategie pro stejný web**
  - Co se stane s existujícím plánem?
    - buď vše zneplatnit (`ArticlePlan` status = SKIPPED) a vytvořit nový plán od „teď+1 den“,
    - nebo ponechat existující plán a novou strategii použít až po vyčerpání.
  - To je business rozhodnutí, architektonicky je ale potřeba:
    - mít referenci `strategyId` na `ArticlePlan`,
    - vědět, podle které verze strategie byl plán vytvořen.

- **Více článků denně / změna frekvence**
  - Současný návrh počítá s jedním článkem denně per web.
  - Pokud do budoucna budeš chtít více (např. 3× týdně), můžeš upravit plánovací funkci tak, aby pro index `n` neznamenal „den“, ale „slot“ podle zvolené frekvence.

- **Time zone**
  - Časy v DB ukládej v UTC,
  - pro plánování můžeš vzít time zone podle uživatele nebo webu (atribut `timeZone` na `Web` nebo `User`),
  - jitter by měl být aplikován vůči „lokálnímu“ času, ale uložený v UTC.

---

**Shrnutí**

- Normalizace SEO strategie (strategie → clustery → supporting články) + přidání `ArticlePlan` ti dá pevný základ pro plánování.
- Worker `CreateSeoStrategy` bude dělat tři věci: uložit AI log, normalizovat strategii do DB, spočítat plán článků (s jitterem a cluster-first pořadím).
- Denní scheduler už jen čte `ArticlePlan` a spouští `GenerateArticle` pro ty položky, kterým „už odbil čas“.
- `GenerateArticle` už nebude vybírat první příležitost z JSONu, ale vždy dostane konkrétní `plannedArticleId` a kontext (cluster, pillar, keywords, audience, URL, owner).
- Prompty pro article získají explicitní, bohatý kontext, který odpovídá tvému požadavku 3.

---

## IMPLEMENTAČNÍ PLÁN – SEO STRATEGIE A SCHEDULING

> Tento plán je psaný tak, aby ho zvládl i juniorní vývojář. Každá fáze má jasné „proč“, „jak“ a kritéria dokončení.
>
> **Kritické pravidlo pro všechny fáze:**  
> Fáze je považována za hotovou a předatelnou **pouze pokud projde build bez chyb** – tj. `npm run build` doběhne úspěšně (a ideálně také `npm run test` a `npm run lint`, pokud už jsou zavedné).  
> Po dokončení každé fáze:
> - v tomto dokumentu u názvu fáze můžeš ručně označit `[x]`,  
> - udělej samostatný commit s jasnou zprávou (např. `feat: add seo strategy models`).

---

### [x] Fáze 0 – Příprava a orientace

**Proč:**  
Aby junior chápal, jak spolu souvisí API, worker, databáze a frontend, než začne dělat změny. Snižuje to riziko, že rozbije existující flow.

**Jak:**

- Přečti si:
  - `development_plan.md` – celkový koncept produktu.
  - `implementation_plan.md` – rozpad větších celků na úkoly.
  - `mvp-implementation.md` – jak vypadá současný MVP flow / dashboard.
  - Tento soubor `seostrategie.md` – architektura + implementační plán.
- Projdi kód na těchto místech:
  - `apps/worker/src/main.ts` – aktuální pipeline `scan → analyze → strategy → article`.
  - `apps/api/src/webs` – API pro weby, overview a debug.
  - `apps/api/src/admin/prompts` – jak se používají prompty a strategie v admin nástroji.
  - `prisma/schema.prisma` – současné DB modely (hlavně `Web`, `WebAnalysis`, `Article`).
  - `apps/web/pages/dashboard/index.tsx` – jak se pipeline zobrazuje uživateli.
- Zkontroluj, že dokážeš spustit build:
  - `npm install` (pokud už není hotové),
  - `npm run build` – musí doběhnout bez chyb.

**Kritéria dokončení Fáze 0:**

- Máš základní přehled, kde co v kódu je.
- `npm run build` doběhne bez chyby.
- Commmit: např. `chore: confirm baseline build for seo strategy work`.

---

### [x] Fáze 1 – Datový model a migrace (SeoStrategy, clustery, ArticlePlan)

**Proč:**  
Potřebujeme uložit SEO strategii v normalizované podobě (strategie → topic clustery → supporting články) a mít tabulku plánů článků (`ArticlePlan`). Bez toho nejde postavit chytrý scheduler.

**Jak:**

1. **Navrhni tabulky podle architektury**
   - V `prisma/schema.prisma` přidej nové modely:
     - `SeoStrategy` – navázaná na `Web` (FK `webId`), obsahuje metadata a `rawJson`.
     - `SeoTopicCluster` – navázaná na `SeoStrategy`, obsahuje `orderIndex`, `pillarPage`, `pillarKeywords`, `clusterIntent`, `funnelStage`.
     - `SeoSupportingArticle` – navázaná na `SeoTopicCluster`, obsahuje `orderIndex`, `title`, `keywords`, `intent`, `funnelStage`, `metaDescription`.
     - `ArticlePlan` – navázaná na `Web` + `SeoStrategy` + `SeoTopicCluster` + `SeoSupportingArticle`, obsahuje `plannedPublishAt`, `status`, `articleId`.
   - U každého modelu si do komentáře (jen pro sebe nebo do docs) napiš, k čemu slouží – pomůže to při pozdějších úpravách.

2. **Rozhodni se, co s existujícím `WebAnalysis.seoStrategy`**
   - Zatím ho **neměň** – necháme ho jako kompatibilní místo, odkud budeme číst „starý“ JSON. Přesun/odstranění může přijít později.
   - Jen si poznamenej, že nové tabulky budou dlouhodobě pravdivým zdrojem, `WebAnalysis.seoStrategy` bude buď raw kopie nebo se časem zahodí.

3. **Vytvoř migraci a vygeneruj klienta**
   - Vytvoř novou migraci:
     - `npm run db:migrate` (budeš vyzván k pojmenování migrace, např. `add_seo_strategy_models`).
   - Vygeneruj Prisma klienta:
     - `npm run db:generate`.
   - Ujisti se, že migrace proběhla (zkontroluj tabulky v DB, pokud máš nástroje).

4. **Ověř build**
   - Spusť `npm run build`.
   - Pokud něco spadne na typech kvůli přidání modelů, oprav definice (např. importy Prisma typů).

**Kritéria dokončení Fáze 1:**

- V DB existují nové tabulky (`SeoStrategy`, `SeoTopicCluster`, `SeoSupportingArticle`, `ArticlePlan`).
- `npm run build` doběhne bez chyby.
- Commit: např. `feat: add seo strategy and article plan models`.

---

### [x] Fáze 2 – Úprava `CreateSeoStrategy` workeru (parsování + tvorba plánu)

**Proč:**  
Dnes `CreateSeoStrategy` jen uloží JSON do `WebAnalysis` a hned spustí generování článku. Potřebujeme místo toho:
- rozparsovat strategii do nových tabulek,
- vytvořit `ArticlePlan` záznamy pro každý podpůrný článek,
- **ne**generovat článek hned, ale jen naplánovat.

**Jak:**

1. **Najdi logiku `CreateSeoStrategy`**
   - Soubor: `apps/worker/src/main.ts`.
   - Najdi worker `createWorker<CreateSeoStrategyJob>(CREATE_SEO_STRATEGY_QUEUE, async (job) => { ... })`.

2. **Doplň parsování do nových tabulek**
   - Po úspěšném získání `strategy: SeoStrategy`:
     - V jedné DB transakci:
       - vytvoř nebo aktualizuj záznam `SeoStrategy` pro daný `webId` (ulož `rawJson` – tedy celou strategii – pro debug),
       - smaž existující clustery a supporting articles pro tuto strategii/web,
       - vlož `SeoTopicCluster` z `strategy.topic_clusters` (nezapomeň na `orderIndex` = pozice v poli),
       - pro každý cluster vlož odpovídající `SeoSupportingArticle` (opět s `orderIndex`).
   - Dbej na to, aby transakce buď proběhla celá, nebo neproběhla vůbec (žádné částečně uložené strategie).

3. **Vytvoř `ArticlePlan` záznamy**
   - V té samé nebo navazující transakci:
     - pro každý `SeoSupportingArticle` vytvoř `ArticlePlan`:
       - nastav `webId`, `strategyId`, `clusterId`, `supportingArticleId`,
       - spočítej `plannedPublishAt` podle algoritmu z návrhu (sekvenční dny + náhodný jitter),
       - nastav `status = PLANNED`.
   - Zajisti, že každý podpůrný článek má maximálně jeden `ArticlePlan` záznam pro aktuální strategii (pozor při regeneraci strategie).

4. **Uprav flow – už nespouštěj `GenerateArticle` hned**
   - V závěru workeru:
     - ponech logování AI callu,
     - odstraň nebo zakomentuj (a později smaž) část, kde se ručně enqueuje `GenerateArticle` po vytvoření strategie (mimo debug).
   - U debug režimu si rozmysli:
     - jestli má také vytvářet plán, nebo jen aktualizovat strategii – doporučení: i debug by měl generovat konzistentní data, takže klidně plán vytvářej také.

5. **Ověř build**
   - `npm run build`.
   - Pokud narazíš na chyby typů (např. nové importy Prisma modelů), uprav je.

**Kritéria dokončení Fáze 2:**

- Po běhu `CreateSeoStrategy` (na testovacím webu) se v DB objeví:
  - `SeoStrategy`,
  - odpovídající `SeoTopicCluster` a `SeoSupportingArticle`,
  - `ArticlePlan` záznamy s `status = PLANNED`.
- `GenerateArticle` už se automaticky neenqueueuje po vytvoření strategie.
- `npm run build` doběhne bez chyby.
- Commit: např. `feat: persist seo strategy and create article plans`.

---

### [x] Fáze 3 – Scheduler pro denní generování článků

**Proč:**  
Potřebujeme proces, který každý den (respektive v pravidelných intervalech) zkontroluje plán (`ArticlePlan`) a spustí generování článku v době, kdy „už odbil čas“.

**Jak:**

1. **Rozhodni, kde scheduler poběží**
   - Nejlogičtější je dát scheduler do `apps/worker`:
     - Worker už umí komunikovat s frontami a DB.
   - Použij např. `@nestjs/schedule` (pokud je v projektu), nebo jednoduchý interval v bootstrapu.

2. **Napiš logiku „najdi ArticlePlan, které mají být spuštěny“**
   - V scheduleru:
     - každých X minut (např. 10–15 min) udělej dotaz do DB:
       - `status = PLANNED`,
       - `plannedPublishAt <= now`.
     - Pro každý takový záznam:
       - nastav mezistav (např. `status = QUEUED`), aby se nespustil dvakrát,
       - enqueuj nový job do `GENERATE_ARTICLE_QUEUE` s parametrem `plannedArticleId`.

3. **Ošetři idempotenci**
   - Zajisti, že:
     - pokud scheduler spadne uprostřed, nedojde k duplikaci jobů po restartu,
     - můžeš použít transakci: změna stavu `ArticlePlan` na `QUEUED` + enqueue jobu.

4. **Ověř scheduler lokálně**
   - V dev režimu:
     - vytvoř testovací strategii a plán (příp. přes debug endpointy),
     - dočasně nastav `plannedPublishAt` na čas „za chvíli“,
     - sleduj logy workeru, jestli scheduler najde plán a zařadí `GenerateArticle`.

5. **Ověř build**
   - `npm run build`.

**Kritéria dokončení Fáze 3:**

- Scheduler pravidelně prochází `ArticlePlan` a pro záznamy s `plannedPublishAt <= now` zařazuje `GenerateArticle` job.
- Stav `ArticlePlan` se správně mění (PLANNED → QUEUED).
- `npm run build` doběhne bez chyby.
- Commit: např. `feat: add article plan scheduler`.

---

### [x] Fáze 4 – Úprava `GenerateArticle` workeru (kontext z plánu a strategie)

**Proč:**  
Aktuální `GenerateArticle` si sám vybírá první příležitost z `seoStrategy` v JSONu. Potřebujeme, aby:
- pracoval s konkrétním `ArticlePlan` (tj. konkrétní podpůrný článek),
- dostal bohatý kontext (cluster, pillars, keywords, audience, url, owner),
- po vygenerování článku aktualizoval `ArticlePlan`.

**Jak:**

1. **Rozšiř signaturu jobu**
   - V typové definici jobu (`libs/queue-types/src/index.ts`) přidej do `GenerateArticleJob` pole `plannedArticleId`.
   - V místech, kde se job enqueuje:
     - z web API (`triggerArticleGeneration`) – rozhodni, zda:
       - bude ruční generování používat existující `ArticlePlan`, nebo
       - bude mít separátní flow (např. okamžitá generace mimo plán).  
       Doporučení: preferuj použití `ArticlePlan`, aby vše šlo přes stejný mechanismus.
     - ze scheduleru – vždy enqueuj s `plannedArticleId`.

2. **Uprav worker `GenerateArticle`**
   - Místo toho, aby:
     - načítal `web` a bral první příležitost z `web.analysis.seoStrategy`,
   - bude:
     - načítat `ArticlePlan` podle `plannedArticleId`,
     - přes relace načte:
       - `SeoSupportingArticle` (konkrétní článek),
       - `SeoTopicCluster` (topic cluster),
       - `SeoStrategy` (business info + rawJson, pokud je potřeba),
       - `Web` + `User` (url, owner),
       - `WebAnalysis.businessProfile` (audience).

3. **Sestav kontext proměnných pro prompt**
   - Vytvoř objekt proměnných, který obsahuje:
     - `topicCluster` (pillar page, pillar keywords, intent, funnel stage),
     - `supportingArticle` (title, keywords, intent, funnel stage, meta description),
     - `business` (name, description, targetAudience),
     - `web` (url, nickname),
     - `webAudience` (z business profile),
     - `webOwner` (např. email / jméno).
   - Tento objekt předej do `renderPromptsForTask('article', ...)` jako `variables`.
   - Podle toho můžeš upravit prompt šablonu v `libs/ai-prompts/src/default-prompts.ts` (tak, aby explicitně tyto proměnné využívala).

4. **Po vygenerování článku aktualizuj `ArticlePlan`**
   - Po vytvoření `Article`:
     - nastav `ArticlePlan.articleId` na ID vytvořeného článku,
     - změň `ArticlePlan.status` na `GENERATED`.

5. **Ověř build**
   - `npm run build`.

**Kritéria dokončení Fáze 4:**

- `GenerateArticle` už nevybírá téma z raw JSONu ve `WebAnalysis`, ale pracuje s konkrétním `ArticlePlan`.
- Model pro článek dostává proměnné: topic cluster, pillars, keywords, web audience, web url, web owner.
- Po vygenerování článku se aktualizuje `ArticlePlan` na `GENERATED` + `articleId` je vyplněno.
- `npm run build` doběhne bez chyby.
- Commit: např. `feat: generate articles from article plans with rich context`.

---

### [x] Fáze 5 – Úpravy promptů a superadmin nástrojů

**Proč:**  
Když se změní forma kontextu pro article prompt (nové proměnné), je potřeba tomu přizpůsobit šablony i superadmin nástroje, které zobrazují preview.

**Jak:**

1. **Aktualizuj article prompt**
   - Soubor: `libs/ai-prompts/src/default-prompts.ts`.
   - Upravit `userPrompt` a případně `systemPrompt` pro task `article` tak, aby:
     - popisoval, že dostává strukturované proměnné (`topicCluster`, `supportingArticle`, `business`, `web`, `webAudience`, `webOwner`),
     - jasně řekl modelu, jak je má použít.

2. **Úprava superadmin preview**
   - Soubor: `apps/api/src/admin/prompts/admin-prompts.controller.ts`.
   - Metoda `resolvePreviewVariables` pro `PromptTask.Article`:
     - místo vracení `strategy` a `cluster` vrať proměnné ve stejném tvaru, jaký používá `GenerateArticle` worker.
   - Tím se zajistí, že superadmin náhled používá stejný kontext jako reálný worker.

3. **Ověř, že existující UI funguje**
   - V `apps/web/pages/admin/prompts.tsx` zkontroluj, že zobrazuje preview se správnými proměnnými (nemusíš měnit kód, pokud jen předáváš JSON).

4. **Ověř build**
   - `npm run build`.

**Kritéria dokončení Fáze 5:**

- Article prompt reflektuje nové proměnné a kontext.
- Superadmin preview pro article prompty používá stejný tvar proměnných jako worker.
- `npm run build` doběhne bez chyby.
- Commit: např. `feat: align article prompts with new seo context`.

---

### [x] Fáze 6 – API a dashboard: práce s plánem článků

**Proč:**  
Uživatel musí vidět, že existuje plán článků (na základě SEO strategie), a mít základní přehled: co už je vygenerované a co se teprve chystá.

**Jak:**

1. **Rozšíř API `GET /webs/:id/overview`**
   - Soubor: `apps/api/src/webs/webs.service.ts` (metoda `getOverview`).
   - Do response přidej informace z `ArticlePlan`, např.:
     - `plannedArticles` – nejbližší plánované články (např. top 5 podle `plannedPublishAt`),
     - souhrnné počty: `plannedCount`, `generatedCount`, `publishedCount`.

2. **Případný nový endpoint pro detailní plán**
   - Přidej endpoint: `GET /webs/:id/article-plan`:
     - vrací paginovaný seznam `ArticlePlan` (status, `plannedPublishAt`, název topicu).

3. **Upravit dashboard UI**
   - Soubor: `apps/web/pages/dashboard/index.tsx`.
   - V pipeline panelu:
     - doplň informace typu „SEO strategie existuje“ a „naplánováno X článků do Y data“.
   - V sekci článků:
     - kromě „Poslední články“ přidej „Plánované články“ (např. jednoduchý seznam názvů + datum).

4. **Ověř build**
   - `npm run build`.

**Kritéria dokončení Fáze 6:**

- API vrací informace o plánovaných článcích.
- Dashboard zobrazuje plán (alespoň základní přehled).
- `npm run build` doběhne bez chyby.
- Commit: např. `feat: expose article plan in api and dashboard`.

---

### [x] Fáze 7 – Re-run strategie, edge cases a úklid

**Proč:**  
Strategie se může pro stejný web generovat víckrát. Potřebujeme vyřešit, co se stane s existujícím plánem a daty, a uklidit starou logiku, která už nedává smysl.

**Jak:**

1. **Definuj chování při nové strategii pro stejný web**
   - Rozhodni:
     - zda staré `ArticlePlan` záznamy pro daný `webId` + starší `strategyId`:
       - označíš jako `SKIPPED`, nebo
       - ponecháš, ale nové plánování začne až po nich.
   - Podle rozhodnutí uprav Fázi 2 (parsování a plánování) – např. před vytvořením nových plánů:
     - označ staré plány jako `SKIPPED` / `ARCHIVED`.

2. **Ošetři ruční generování článku**
   - Endpoint `POST /webs/:id/generate-article`:
     - Rozhodni, jestli:
       - vygeneruje článek pro nejbližší PLANNED `ArticlePlan` (předběžné spuštění), nebo
       - vytvoří jednorázový plan a hned ho zpracuje.
   - Uprav implementaci tak, aby se chovala konzistentně se zbytkem plánovací logiky.

3. **Úklid starého kódu**
   - Najdi místa, kde se ještě spoléhá čistě na `WebAnalysis.seoStrategy` jako na jediný zdroj strategie (mimo debug).
   - Postupně:
     - převeď tyto části na práci s novými tabulkami,
     - případně označ staré přístupy komentářem „deprecated“, pokud je nechceš hned mazat.

4. **Ověř build**
   - `npm run build`.

**Kritéria dokončení Fáze 7:**

- Je definované a implementované chování pro re-run strategie (co se stane s existujícími plány).
- Ruční generování článku jde přes konzistentní mechaniku (ArticlePlan, nebo jasně oddělený „manual“ mód).
- Zbytečný/duplicitní kód kolem starého `seoStrategy` JSONu je minimalizován.
- `npm run build` doběhne bez chyby.
- Commit: např. `refactor: align seo strategy reruns with article planning`.

---

### [x] Fáze 8 – Testování, dokumentace a finální předání

**Proč:**  
Chceme mít jistotu, že nový systém strategie a plánování funguje, je pochopitelný a dobře zdokumentovaný pro další vývojáře.

**Jak:**

1. **Automatické testy**
   - Pokud už existují testy pro API a worker:
     - přidej testy pro:
       - parsování SEO strategie do DB (unit/integration),
       - scheduler – že správně vybírá `ArticlePlan` podle času,
       - `GenerateArticle` – že používá `ArticlePlan` a aktualizuje jeho stav.
   - Spusť `npm run test`.

2. **Manuální test scénáře end‑to‑end**
   - Na lokální instanci:
     - založ web, projdi onboardingem, vyčkej na scan + analýzu + strategii,
     - ověř, že:
       - vznikla `SeoStrategy` + clustery + article plány,
       - scheduler po čase vytvoří články podle plánu,
       - dashboard ukazuje plán a vygenerované články.

3. **Aktualizace dokumentace**
   - Aktualizuj:
     - `seostrategie.md` – označ jednotlivé fáze jako dokončené (`[x]`),
     - případně doplň `implementation_plan.md` / `mvp-implementation.md`, aby reflektovaly nový stav.

4. **Ověř build**
   - `npm run build`.

**Kritéria dokončení Fáze 8:**

- Existují základní automatické testy pro klíčové části nové logiky (pokud to dává smysl v rámci projektu).
- Scénář „nový web → strategie → plán → články“ funguje end‑to‑end.
- Dokumentace je aktualizovaná.
- `npm run build` doběhne bez chyby.
- Commit: např. `chore: finalize seo strategy scheduling and docs`.
