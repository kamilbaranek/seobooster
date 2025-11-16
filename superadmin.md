# Superadmin & AI Prompts – Implementation Plan

## Proč to děláme

AI orchestrátor aktuálně používá „natvrdo“ zadrátované prompty (systémové i uživatelské) v kódu. To je v začátku v pohodě, ale:

- ladění promptů je pomalé (musí se editovat kód a redeployovat),
- není možné mít různé prompty pro různá prostředí (dev / staging / prod),
- není jednoduché debugovat jednotlivé kroky pipeline (scan → analýza → strategie → článek).

Cílem je:

- mít **Superadmin účet**, který má vlastní **admin menu v dashboardu**,
- umožnit Superadminovi **pro každý krok pipeline**:
  - měnit `systemPrompt` (instrukce modelu),
  - měnit `userPrompt` (konkrétní vstup),
  - a mít k dispozici proměnné (`variables`) z předchozích kroků, které lze do promptu vkládat.
- mít vše konfigurovatelné z UI, aby běžný provoz nevyžadoval změny kódu.

Každý krok níže:

- implementuj po částech,
- po dokončení kroku vždy spusť `npm run build`,
- až když build projde, udělej `git commit`,
- teprve pak přejdi na další krok.

Plán je psaný tak, aby ho zvládl junior vývojář bez dlouhého přemýšlení – stačí postupovat krok za krokem.

---

## M0 – Stav, ze kterého vycházíme (už hotovo)

Jen pro kontext, nic neděláš:

- V DB máme model `AiPromptConfig`:
  - `task: string` (unikátní pro každý krok pipeline, např. `"scan"`, `"analyze"`, `"strategy"`, `"article"`),
  - `systemPrompt: string`,
  - `userPrompt: string`.
- V `libs/ai-types` existuje typ `AiTaskType = 'scan' | 'analyze' | 'strategy' | 'article'`.
- Worker (`apps/worker/src/main.ts`) už při každém kroku:
  - načítá z DB `AiPromptConfig` pro daný task,
  - a pokud existuje, používá tyto texty místo default promptů z `OpenRouterProvider`.

Teď budeme navazovat.

---

## M1 – Superadmin role & přístup k admin rozhraní

### M1.1 Backend – Role guard

Cíl: Mít možnost označit endpointy, které smí volat jen Superadmin.

- [x] **roles.decorator.ts**  
  V `apps/api/src/auth` vytvoř soubor `roles.decorator.ts`, použij `SetMetadata` a exportuj helper `@Roles(...)`.

- [x] **roles.guard.ts**  
  V `apps/api/src/auth/guards` vytvoř guard, který načte požadované role z metadata a povolí přístup jen pokud `request.user.role` je v seznamu; jinak vyhodí `ForbiddenException`.

- [x] **Registrace guardu**  
  V `apps/api/src/app.module.ts` přidej `RolesGuard` jako globální guard přes `APP_GUARD`.

- [x] **Build + commit**  
  `npm run build --workspace @seobooster/api` a poté commit `feat: add roles guard for SUPERADMIN`.

### M1.2 Backend – Superadmin seed / bootstrap

Cíl: Umět si vytvořit prvního superadmina bez ručního psaní SQL.

- [x] **Seed skript**  
  V rootu přidej `scripts/seed-superadmin.ts`, který načte `.env`, použije `PrismaClient` + `bcrypt`, a vytvoří nebo aktualizuje uživatele s emailem z `SUPERADMIN_EMAIL` na roli `SUPERADMIN`.

- [x] **NPM script**  
  Do `package.json` přidej příkaz `seed:superadmin` spouštějící `ts-node -r tsconfig-paths/register scripts/seed-superadmin.ts`.

- [x] **README sekce**  
  Popsáno, jak nastavit `SUPERADMIN_EMAIL`/`SUPERADMIN_PASSWORD` a spustit seed.

- [x] **Build + commit**  
  `npm run build` → commit `feat: add superadmin seed script`.

### M1.3 Frontend – rozpoznání superadmina

Cíl: Na dashboardu vědět, že přihlášený uživatel je superadmin.

- [x] `GET /api/me` vrací `user.role` (v `apps/api/src/me/me.controller.ts`).

- [x] Dashboard ukazuje superadmin link: v `apps/web/pages/dashboard/index.tsx` definuj `const isSuperadmin = profile?.user.role === 'SUPERADMIN';` a pokud je true, zobraz v sidebaru odkaz na `/admin/prompts`.

3. `npm run build --workspace @seobooster/web`  
   - Commit: `git commit -m "feat: expose superadmin role in dashboard"`  

---

## M2 – API pro správu promptů

### M2.1 AdminPromptsModule + controller

Cíl: REST API, přes které superadmin uvidí a změní prompty.

1. V `apps/api/src/admin/prompts` vytvoř:
   - `admin-prompts.module.ts`
   - `admin-prompts.controller.ts`

2. Modul:
   - Importuj `PrismaModule`.
   - Exportuje `AdminPromptsController`.

3. Controller (`@Controller('admin/prompts')`):
   - Označ `@UseGuards(JwtAuthGuard, RolesGuard)` a `@Roles('SUPERADMIN')`.
   - Endpoint `GET /api/admin/prompts`:
     - Použij `prisma.aiPromptConfig.findMany({ orderBy: { task: 'asc' } })`.
     - Vrať pole objektů obsahující `task`, `systemPrompt`, `userPrompt`, `updatedAt`.

4. Přidej modul do `AppModule` (`apps/api/src/app.module.ts`).
5. `npm run build --workspace @seobooster/api`, commit:  
   `git commit -m "feat: add admin prompts list API"`

### M2.2 Detail + upsert + delete

- [x] `GET /api/admin/prompts/:task` vrací detail (nebo prázdné stringy, pokud neexistuje).
- [x] `PUT /api/admin/prompts/:task` používá `UpdatePromptDto` a `upsert` v DB.
- [x] `DELETE /api/admin/prompts/:task` odstraní záznam (nebo mlčky succeedne, pokud neexistuje).
- [x] `npm run build --workspace @seobooster/api` + commit `feat: add admin prompt detail and upsert endpoints`.

---

## M3 – Superadmin UI v dashboardu

### M3.1 Routing & ochrana

- [x] V `apps/web/pages/admin/prompts.tsx` vytvoř novou stránku:
  - Při mountu:
    - Zkontroluj token (`getToken()`), pokud chybí → redirect `/login`.
    - Zavolej `GET /api/me`.
    - Pokud `user.role !== 'SUPERADMIN'` → redirect `/dashboard`.

- [x] Stránka může používat stejný základní layout jako dashboard (nebo jednoduchý panel).

- [x] `npm run build --workspace @seobooster/web`  
  - Commit: `git commit -m "feat: add superadmin prompts page skeleton"`  

### M3.2 UI – seznam a editor

- [x] Na `/admin/prompts`:
  - Nech stránku načíst `GET /api/admin/prompts`.
  - Vykresli seznam tasků v tabulce nebo seznamu:
    - Např. „Scan (scan)“, „Analyze (analyze)“, atd.
    - U každého tasku zobraz, zda má vlastní config (`custom`), nebo používá default (`default`).

- [x] Přidej možnost kliknout na task:
  - Po kliknutí:
    - Zavolej `GET /api/admin/prompts/:task`.
    - Naplň formulář:
      - Textarea pro `systemPrompt`.
      - Textarea pro `userPrompt`.
  - Přidej tlačítka:
    - „Uložit“ → `PUT /api/admin/prompts/:task`.
    - „Reset na default“ → `DELETE /api/admin/prompts/:task`.
  - Po úspěchu zobraz krátkou zprávu („Uloženo“) a/nebo reloadni seznam.

- [x] `npm run build --workspace @seobooster/web`  
  - Commit: `git commit -m "feat: implement superadmin prompts UI"`  

---

## M4 – Proměnné & preview (bez volání AI)

### M4.1 Dokumentace proměnných v UI

- [x] Na stránce `/admin/prompts` pod formulářem zobraz blok „Dostupné proměnné“:
  - Pro `scan`:
    - `{{url}}`
  - Pro `analyze`:
    - `{{url}}`, `{{scanResult}}`
  - Pro `strategy`:
    - `{{businessProfile}}`
  - Pro `article`:
    - `{{strategy}}`, `{{cluster}}`

Zatím je to jen textová dokumentace – nepotřebuješ měnit backend.

- [x] `npm run build --workspace @seobooster/web`  
  - Commit: `git commit -m "docs: show available AI variables per task in UI"`  

### M4.2 Preview endpoint (bez volání modelu)

Cíl: Superadmin vidí, co se do promptu pošle, aniž by volal reálný model.

- [x] V `AdminPromptsController` přidej endpoint:
  - `POST /api/admin/prompts/:task/preview`
  - Na základě tasku:
    - načti jeden „vzorek“ dat z DB:
      - `scan`: stačí URL z payloadu (`{ url: string }`) nebo první web.
      - `analyze`: `scanResult` z `web_analysis` pro nějaký web.
      - `strategy`: `businessProfile`.
      - `article`: `seoStrategy` + první cluster.
  - Z DB vytáhni (nebo fallback do defaultu) `systemPrompt` a `userPrompt`.
  - Vrať JSON s `variables`, `systemPrompt`, `userPrompt`.
  - Žádné volání OpenRouteru – jen složení dat.

- [x] V UI přidej tlačítko „Zobrazit náhled“:
  - Zavolej preview endpoint.
  - Výsledek zobraz ve `<pre>` blocích.

- [x] `npm run build`  
  - Commit: `git commit -m "feat: add prompt preview without AI call"`  

---

## M5 – Seed default promptů & dokumentace

### M5.1 Seed default promptů

- [x] Rozšiř seed skript (nebo vytvoř nový) tak, aby:
  - pro každé `task` v `AiTaskType`:
    - pokud v `AiPromptConfig` není záznam, vloží defaultní prompty (kopie toho, co je v `OpenRouterProvider`).

- [x] `npm run build`, commit:  
  `git commit -m "feat: seed default prompts and apply templating"`  

### M5.2 Dokumentace

- [x] Aktualizuj `README.md`:
  - Krátká sekce „Superadmin & AI prompts“.
  - Jak se přihlásit jako superadmin.
  - Kde hledat admin UI (`/admin/prompts`).

- [x] Pokud používáme `mvp-implementation.md`, přidej reference na tento soubor `superadmin.md`.
- [x] `npm run build` (rychlá kontrola), commit:  
  `git commit -m "docs: document superadmin prompt management"`  

---

---

## M6 – Per-request AI logy (AiCallLog + UI)

-### M6.1 Datový model pro logy

**Cíl:** Mít per-request historii AI volání tak, aby Superadmin viděl, co se opravdu poslalo na poskytovatele a jaká byla odpověď.

- [x] Rozšiř `prisma/schema.prisma` o model `AiCallLog`, např.:
  - `id: String @id @default(cuid())`
  - `webId: String?` (relace na `Web`, pro přiřazení konkrétnímu webu – může být null pro globální testy).
  - `task: String` (hodnoty z `AiTaskType` – `scan/analyze/strategy/article`).
  - `provider: String` (např. `openrouter`, `openai`, `anthropic`).
  - `model: String` (ID modelu použitého v requestu).
  - `variables: Json` (snapshot proměnných použitých při templatingu).
  - `systemPrompt: String` (finální system prompt, po dosazení proměnných).
  - `userPrompt: String` (finální user prompt, po dosazení proměnných).
  - `responseRaw: Json` (raw JSON odpovědi z provideru nebo parsovaný objekt před mapováním na `ScanResult/...`).
  - `responseParsed: Json?` (volitelné: kopie parsed `ScanResult/BusinessProfile/...`).
  - `status: String` (`SUCCESS` / `ERROR`).
  - `errorMessage: String?`.
  - `createdAt: DateTime @default(now())`.
- [x] Spusť `npm run db:migrate` s popisným názvem migrace (`add_ai_call_log`). *(pozn.: kvůli omezením připojení k DB byla migrace vyhotovena manuálně jako SQL soubor a Prisma Client zregenerován)*
- [x] `npm run build` + commit: `feat: add ai call log model`.

### M6.2 Worker – ukládání logů

**Cíl:** Každý AI krok uloží záznam do `AiCallLog`, ale jen pokud je zapnutý debug flag.

- [x] V `apps/worker/src/main.ts` doplň helper pro zápis logu:
  - Funkce např. `logAiCall({ webId, task, provider, model, variables, systemPrompt, userPrompt, responseRaw, responseParsed, status, errorMessage })`.
  - Tato funkce:
    - přečte `process.env.AI_DEBUG_LOG_PROMPTS`,
    - pokud není `true`, nic neudělá (aby se logy daly vypnout),
    - jinak zapíše záznam do `AiCallLog` přes Prisma.
- [x] Pro každý worker krok:
  - po vyrenderování promptu (před voláním modelu) připrav objekt s `variables`, `systemPrompt`, `userPrompt`, `provider` a `model` (přečti z konfigurace OpenRouter provideru).
  - po obdržení odpovědi:
    - do `responseRaw` ulož raw JSON (to, co vrátil OpenRouter).
    - do `responseParsed` můžeš uložit `ScanResult` / `BusinessProfile` / `SeoStrategy` / `ArticleDraft` (serializované do JSON).
    - do `status` zapiš `SUCCESS` nebo `ERROR`.
  - Zavolej `logAiCall(...)`.
- [x] `npm run build` + commit: `feat: persist ai call logs from worker`.

### M6.3 Admin API – čtení logů

**Cíl:** Superadmin uvidí historii volání filtrovateľně podle webu a tasku.

- [x] Vytvoř nový controller `AdminAiLogsController` v `apps/api/src/admin/ai-logs`:
  - Route prefix `@Controller('admin/ai-logs')`.
  - Guardy: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('SUPERADMIN')`.
- [x] Endpoint `GET /api/admin/ai-logs`:
  - Query parametry:
    - `webId?: string`,
    - `task?: string`,
    - `provider?: string`,
    - `limit?: number` (např. max 100).
  - Vrátí pole logů se základními poli:
    - `id`, `createdAt`, `webId`, `task`, `provider`, `model`, `status`.
- [x] Endpoint `GET /api/admin/ai-logs/:id`:
  - Vrátí detail jednoho logu včetně:
    - `variables`, `systemPrompt`, `userPrompt`, `responseRaw`, `responseParsed`, `errorMessage`.
- [x] Přidej modul `AdminAiLogsModule` a zaregistruj jej v `AppModule`.
- [x] `npm run build --workspace @seobooster/api` + commit: `feat: add admin AI logs API`.

### M6.4 Superadmin UI – historie v /admin/prompts

**Cíl:** Přímo u každého tasku vidět poslední volání a možnost rozkliknout detail.

- [x] V `apps/web/pages/admin/prompts.tsx`:
  - Přidej pravý panel „Historie volání“ pod existující preview sekci:
    - Použij endpoint `GET /api/admin/ai-logs?task=<selectedTask>&limit=20` po načtení tasku.
    - Zobraz tabulku:
      - sloupce: čas (`createdAt`), `webId` (zkrácený nebo URL), `provider`, `model`, `status`.
      - řádek kliknutelný → uloží `selectedLogId`.
  - Po kliknutí na řádek:
    - Zavolej `GET /api/admin/ai-logs/:id`.
    - Pod tabulkou zobraz tři `<pre>` bloky:
      - „System prompt (used)“
      - „User prompt (used)“
      - „Variables + response“
    - Pokud `status === 'ERROR'`, zobraz `errorMessage` červeně.
- [x] `npm run build --workspace @seobooster/web` + commit: `feat: show per-request AI history in superadmin`.

---

## M7 – Výběr poskytovatele a modelu per task

### M7.1 Rozšíření konfigurace v DB

**Cíl:** Pro každý krok pipeline nastavit, přes kterého poskytovatele a konkrétní model poběží.

- [x] Rozšiř `AiPromptConfig` v `prisma/schema.prisma` o pole:
  - `provider: String?` – např. `openrouter`, `openai`, `anthropic`.  
    - Pokud null → použij default z globální konfigurace (`AI_PROVIDER`).
  - `model: String?` – konkrétní model ID (např. `openrouter/deepseek-r1`, `anthropic/claude-3.5-sonnet`).  
    - Pokud null → použij defaultní mapování z `AiModelMap` (env).
- [x] Migrační skript:
  - Vytvoř migraci (např. `add_provider_model_to_ai_prompt_config`).
  - `npm run db:migrate`.
- [x] `npm run build` + commit: `feat: extend AiPromptConfig with provider and model`.

### M7.2 Backend – výběr provideru a modelu

**Cíl:** Worker pro každou fázi pipeline použije provider/model podle konfigurace `AiPromptConfig`.

- [x] V `libs/ai-providers`:
  - Zkontroluj, že existuje rozhraní, které umožňuje inicializovat různé providery (OpenRouter, OpenAI, Anthropic).  
    - Pokud ne, připrav rozhraní `AiProviderFactory`, které na základě jména poskytovatele + modelu vrátí instanci `AiProvider`.
- [x] V workeru:
  - Pro každý krok při načtení promptu `AiPromptConfig`:
    - sestav strukturu `selectedProvider = prompt.provider ?? process.env.AI_PROVIDER ?? 'openrouter'`.
    - `selectedModel = prompt.model ?? modelMap[task]` (kde `modelMap` je tvoje existující mapování z envu).
  - Před voláním `aiProvider.*`:
    - buď:
      - použij existující `aiProvider`, ale rozšiř ho tak, aby respektoval `selectedProvider` / `selectedModel`, nebo
      - použij fabriku: `const provider = aiProviderFactory(selectedProvider, selectedModel)`.
- [x] Doplň tyto informace i do `AiCallLog` (`provider`, `model`), aby historie odpovídala realitě.
- [x] `npm run build --workspace @seobooster/worker` + commit: `feat: select AI provider and model per task`.

### M7.3 Admin API – čtení / ukládání provideru a modelu

**Cíl:** Superadmin UI umí nastavit provider + model pro každý task.

- [x] V `AdminPromptsController`:
  - Rozšiř návratové DTO o `provider` a `model`.
  - U `PUT /api/admin/prompts/:task` povol v payloadu i `provider` a `model`.
  - U `GET /api/admin/prompts` přidej tyto hodnoty do seznamu (aby UI vědělo, zda je tam custom nastavení).
- [x] DTO `UpdatePromptDto` rozšiř o volitelné:
  - `provider?: string;`
  - `model?: string;`
- [x] `npm run build --workspace @seobooster/api` + commit: `feat: expose provider and model in admin prompts API`.

### M7.4 Superadmin UI – přepínač poskytovatele a modelu

**Cíl:** Na stránce `/admin/prompts` u každého tasku vidět a měnit provider + model.

- [x] V `apps/web/pages/admin/prompts.tsx`:
  - Rozšiř `PromptDto` o `provider?: string` a `model?: string`.
  - Nad textareas přidej sekci „AI provider & model“:
    - Select pro `provider` s hodnotami:
      - `default` (použít globální nastavení / env),
      - `openrouter`,
      - `openai`,
      - `anthropic` (zatím může být disabled, pokud není implementováno).
    - Select pro `model`:
      - Naplněný staticky podle provideru (**MVP**):
        - OpenRouter: několik doporučených modelů.
        - OpenAI / Anthropic: placeholder seznam pro budoucí implementaci.
      - Později lze napojit na API, které vrací dostupné modely dynamicky.
  - Při `PUT /api/admin/prompts/:task` posílej i `provider` + `model`.
- [x] V UI jasně zobraz:
  - Pokud je `provider/model` `null` → „inherit from global settings“.
  - Pokud je nastaveno → „custom provider/model for this task“.
- [x] `npm run build --workspace @seobooster/web` + commit: `feat: allow configuring provider and model per task`.

### M7.5 Dokumentace & bezpečnost

- [x] Aktualizuj `README.md`:
  - Uveď, že Superadmin může per-krok nastavovat:
    - provider (`openrouter` / další),
    - model ID.
  - Připomeň, že API klíče pro OpenAI/Anthropic musí být nastavené v env a nesmí se zobrazovat v UI.
- [x] Do `superadmin.md` přidej krátkou poznámku:
  - jaký je doporučený default provider/model pro jednotlivé kroky (např. lehčí model pro scan, robustnější pro strategy/article).
- [x] `npm run build` + commit: `docs: document per-task provider and model selection`.

---

## Poznámka na závěr

Při implementaci se drž těchto zásad:

- Po každém logickém bloku **spusť build** (alespoň pro příslušný workspace).
- Pokud build padá, neopravuj „nějak“, ale vrať se ke změnám v tomto kroku.
- Commity dělej malé a popisné – každý commit by měl odpovídat několika odškrtaným bodům z tohoto plánu.

Když si nebudeš jistý/á, co dělá který krok, vždy se vrať k sekci „Proč to děláme a co je cílem“ – tam je popsáno, čemu má výsledek sloužit.  
