# Multi-Step Prompt Execution — Implementation Plan

Goal: dokončit plnou multi-step exekuci promptů v workeru (scan → analyze → strategy → article → article_image) s předáváním `previousStepOutput/stepXOutput`, retry logikou a spolehlivým logováním.

## Klíčové dohody
- Finální krok `article_image` vždy používá `generateImage` (ne chat).
- AI volání se loguje vždy (minimálně finální krok); do budoucna bude přepínatelné v settings.
- Pokud krok očekává JSON a není parsovatelný, job selže.
- Po úpravách přegenerovat Prisma client.
- Krátký manuální smoke test: multi-step scan/analyze a 2‑krokový article_image (text prompt → image).

## Milestones & proč to děláme (pro juniora)

### Fáze 1 – Provider bootstrap
- **O co jde:** Správně zvolit AI providera a modely už při startu workeru.
- **Proč:** Bez korektní inicializace může worker padat (chybějící klíč) nebo použije špatný model.
- **Co tím docílíme:** Spolehlivý default provider (OpenRouter pokud je klíč, jinak Google) a správné mapování modelů.

### Fáze 2 – Obecný multi-step runner
- **O co jde:** Jedno místo, které umí sekvenčně volat kroky, skládat proměnné a dělat retry/parsing/logy.
- **Proč:** Zabrání duplikaci kódu v pěti jobech; snazší údržba a menší chybovost.
- **Co tím docílíme:** Opakovatelný, robustní průběh kroků s předáváním `previousStepOutput/stepXOutput`.

### Fáze 3 – Napojení jednotlivých jobů
- **O co jde:** Použít runner ve `scan`, `analyze`, `strategy`, `article` a `article_image`.
- **Proč:** Až zde se multi-step reálně projeví v produkčních tocích.
- **Co tím docílíme:** Každý úkol využije více prompt kroků a předá si výstupy dál; finální `article_image` končí `generateImage`.

### Fáze 4 – Logging režim
- **O co jde:** Logovat AI volání i bez `AI_DEBUG_LOG_PROMPTS`.
- **Proč:** Multi-step má více kroků; potřebujeme audit a debug bez ručního zapínání flagu.
- **Co tím docílíme:** Úplné logy (SUCCESS/ERROR, raw/parsed, step index), nastavitelné později v settings.

### Fáze 5 – Prisma client
- **O co jde:** Přegenerovat Prisma client po změnách schématu.
- **Proč:** Typy v generovaném klientovi musí sedět na `orderIndex` a další pole; jinak build padne.
- **Co tím docílíme:** Konsistentní typy v runtime i kompilaci.

### Fáze 6 – Testy a ověření
- **O co jde:** Ověřit build a ruční smoke testy multi-step flow.
- **Proč:** Chceme zachytit chyby v retry, parsování a předávání kroků dřív než v produkci.
- **Co tím docílíme:** Jistotu, že nové flow funguje a je reprodukovatelné.

## Podrobný checklist po fázích

### Fáze 1 – Provider bootstrap
- [x] Upravit `ai-orchestrator.ts` (nebo centrálně v `main.ts`) na `buildAiProviderFromEnv({ providerOverride: DEFAULT_PROVIDER })`.
- [x] Odstranit mrtvou proměnnou `provider` v `apps/worker/src/main.ts`.
- [x] Kontrola: projdi `resolveProviderForTask`, že využívá nový init.
- [x] Spustit `npm run build --workspace @seobooster/worker`.
- [x] Commit (např. `chore: fix ai provider bootstrap`) a označit fázi jako splněnou.

### Fáze 2 – Obecný multi-step runner
- [x] Přidat helper `runPromptSteps` (nebo podobně pojmenovaný) do `apps/worker/src/main.ts`:
     - [x] Sestavení `variables` s `previousStepOutput` a `stepXOutput`.
     - [x] Render promptů (`renderPromptsForTask`), výběr provider/model per krok (`resolveProviderForTask`).
     - [x] Volání `executeWithRetry` na `provider.chat`.
     - [x] Parse JSON při `forceJsonResponse`; strip code fences; při chybě throw.
     - [x] Uložení `stepOutputs`, posun `previousStepOutput`.
     - [x] Log přes `recordAiCall` s `__stepIndex`, `responseRaw/Parsed`, `status`.
- [x] Spustit `npm run build --workspace @seobooster/worker`.
- [x] Commit (`feat: add multi step runner`) a označit fázi.

### Fáze 3 – Napojení jobů
- [x] Scan job: použít runner; `baseVariables={url}`; finální output → `ScanResult`; uložit `rawScanOutput`.
- [x] Analyze job: `variables={url, scanResult, rawScanOutput}`; výstup `BusinessProfile` (povinná pole).
- [x] Strategy job: `variables={businessProfile}`; výstup `SeoStrategy`.
- [x] Article job: zachovat dnešní variables; výstup `ArticleDraft` (title + bodyMarkdown povinné).
- [x] Article_image job: intermediate kroky přes runner; finální krok `generateImage` s doplněnými step outputs.
- [x] Spustit `npm run build --workspace @seobooster/worker`.
- [x] Commit (`feat: wire jobs to multistep`) a označit fázi.

### Fáze 4 – Logging režim
- [x] Upravit `recordAiCall`, aby se volal i bez `AI_DEBUG_LOG_PROMPTS` (alespoň finální krok; ideálně všechny).
- [x] Status, errorMessage, variables, system/user prompt, responseRaw/Parsed, step index.
- [x] Spustit `npm run build --workspace @seobooster/worker`.
- [x] Commit (`chore: enable ai call logging by default`) a označit fázi.

### Fáze 5 – Prisma client
- [x] Spustit `npm run db:generate`.
- [x] Spustit `npm run build --workspace @seobooster/worker` (nebo full `npm run build`).
- [ ] Commit (`chore: regenerate prisma client`) a označit fázi.

### Fáze 6 – Testy a ověření
- [ ] Build: `npm run build --workspace @seobooster/worker` (případně full build).
- [ ] Smoke test 1: 2‑krokový `article_image` (chat prompt → generateImage) – ověř logy a uložený obrázek.
- [ ] Smoke test 2: multi-step `scan` + `analyze` s JSON on – ověř uložení do DB a AiCallLog.
- [ ] Ověřit retry (simulovat error, sledovat backoff v logu).
- [ ] Commit (`test: verify multistep flows`) a označit fázi.

## Poznámky k chování
- Pokud `forceJsonResponse`=false u strukturovaných kroků (scan/analyze/strategy/article) a parse selže, job se ukončí chybou (aby nedošlo k neúplným datům v downstream krocích).
- Při generování obrázku respektovat limit počtu obrázků, stávající logiku limitů ponechat.
