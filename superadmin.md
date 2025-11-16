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

1. V `admin-prompts.controller.ts`:
   - `GET /api/admin/prompts/:task`:
     - Vezmi `task` z `@Param('task')` (ověř, že je jedním z `'scan'|'analyze'|'strategy'|'article'`, můžeš si udělat helper).
     - Najdi `AiPromptConfig` podle `task`.
     - Pokud není, vrať prázdný objekt s implicitním `task` a prázdnými stringy.
   - `PUT /api/admin/prompts/:task`:
     - DTO `UpdatePromptDto` (pole `systemPrompt`, `userPrompt`, oba `@IsString()`).
     - `upsert` do `aiPromptConfig`.
   - `DELETE /api/admin/prompts/:task`:
     - Smaž záznam podle `task`.
     - Pokud neexistuje, vrať 204 (nebo klidně 200 s `{ deleted: false }`).

2. `npm run build --workspace @seobooster/api`  
   - Commit: `git commit -m "feat: add admin prompt detail and upsert endpoints"`  

---

## M3 – Superadmin UI v dashboardu

### M3.1 Routing & ochrana

1. V `apps/web/pages/admin/prompts.tsx` vytvoř novou stránku:
   - Při mountu:
     - Zkontroluj token (`getToken()`), pokud chybí → redirect `/login`.
     - Zavolej `GET /api/me`.
     - Pokud `user.role !== 'SUPERADMIN'` → redirect `/dashboard`.

2. Stránka může používat stejný základní layout jako dashboard (nebo jednoduchý panel).

3. `npm run build --workspace @seobooster/web`  
   - Commit: `git commit -m "feat: add superadmin prompts page skeleton"`  

### M3.2 UI – seznam a editor

1. Na `/admin/prompts`:
   - Nech stránku načíst `GET /api/admin/prompts`.
   - Vykresli seznam tasků v tabulce nebo seznamu:
     - Např. „Scan (scan)“, „Analyze (analyze)“, atd.
     - U každého tasku zobraz, zda má vlastní config (`custom`), nebo používá default (`default`).

2. Přidej možnost kliknout na task:
   - Po kliknutí:
     - Zavolej `GET /api/admin/prompts/:task`.
     - Naplň formulář:
       - Textarea pro `systemPrompt`.
       - Textarea pro `userPrompt`.
   - Přidej tlačítka:
     - „Uložit“ → `PUT /api/admin/prompts/:task`.
     - „Reset na default“ → `DELETE /api/admin/prompts/:task`.
   - Po úspěchu zobraz krátkou zprávu („Uloženo“) a/nebo reloadni seznam.

3. `npm run build --workspace @seobooster/web`  
   - Commit: `git commit -m "feat: implement superadmin prompts UI"`  

---

## M4 – Proměnné & preview (bez volání AI)

### M4.1 Dokumentace proměnných v UI

1. Na stránce `/admin/prompts` pod formulářem zobraz blok „Dostupné proměnné“:
   - Pro `scan`:
     - `{{url}}`
   - Pro `analyze`:
     - `{{url}}`, `{{scanResult}}`
   - Pro `strategy`:
     - `{{businessProfile}}`
   - Pro `article`:
     - `{{strategy}}`, `{{cluster}}`

Zatím je to jen textová dokumentace – nepotřebuješ měnit backend.

2. `npm run build --workspace @seobooster/web`  
   - Commit: `git commit -m "docs: show available AI variables per task in UI"`  

### M4.2 Preview endpoint (bez volání modelu)

Cíl: Superadmin vidí, co se do promptu pošle, aniž by volal reálný model.

1. V `AdminPromptsController` přidej endpoint:
   - `POST /api/admin/prompts/:task/preview`
   - Na základě tasku:
     - načti jeden „vzorek“ dat z DB:
       - `scan`: stačí URL z payloadu (`{ url: string }`) nebo první web.
       - `analyze`: `scanResult` z `web_analysis` pro nějaký web.
       - `strategy`: `businessProfile`.
       - `article`: `seoStrategy` + první cluster.
   - Z DB vytáhni (nebo fallback do defaultu) `systemPrompt` a `userPrompt`.
   - Vrať:
     ```jsonc
     {
       "variables": { ... },
       "systemPrompt": "....",
       "userPrompt": "...."
     }
     ```
   - Žádné volání OpenRouteru – jen složení dat.

2. V UI přidej tlačítko „Zobrazit náhled“:
   - Zavolej preview endpoint.
   - Výsledek zobraz ve `<pre>` blocích.

3. `npm run build`  
   - Commit: `git commit -m "feat: add prompt preview without AI call"`  

---

## M5 – Seed default promptů & dokumentace

### M5.1 Seed default promptů

1. Rozšiř seed skript (nebo vytvoř nový) tak, aby:
   - pro každé `task` v `AiTaskType`:
     - pokud v `AiPromptConfig` není záznam, vloží defaultní prompty (kopie toho, co je v `OpenRouterProvider`).

2. `npm run db:generate` / případně jen `npm run seed:superadmin` pokud script používáš jen pro prompty.
3. `npm run build`, commit:  
   `git commit -m "chore: seed default AI prompts"`  

### M5.2 Dokumentace

1. Aktualizuj `README.md`:
   - Krátká sekce „Superadmin & AI prompts“.
   - Jak se přihlásit jako superadmin.
   - Kde hledat admin UI (`/admin/prompts`).

2. Pokud používáme `mvp-implementation.md`, přidej reference na tento soubor `superadmin.md`.
3. `npm run build` (rychlá kontrola), commit:  
   `git commit -m "docs: document superadmin prompt management"`  

---

## Poznámka na závěr

Při implementaci se drž těchto zásad:

- Po každém logickém bloku **spusť build** (alespoň pro příslušný workspace).
- Pokud build padá, neopravuj „nějak“, ale vrať se ke změnám v tomto kroku.
- Commity dělej malé a popisné – každý commit by měl odpovídat několika odškrtaným bodům z tohoto plánu.

Když si nebudeš jistý/á, co dělá který krok, vždy se vrať k sekci „Proč to děláme a co je cílem“ – tam je popsáno, čemu má výsledek sloužit.  
