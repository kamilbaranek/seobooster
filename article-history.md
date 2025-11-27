# Article History Widget – Implementační plán

Tento dokument popisuje krok‑za‑krokem implementaci nové logiky pro kartu **„Shipment History“** na `/dashboard`, která bude zobrazovat poslední stavy článků napříč všemi weby uživatele. Plán je psaný pro juniorního vývojáře, všechny úkoly jsou jako checklist.

---

## Fáze 0 – Pochopení kontextu

- [ ] Projdi si následující soubory a pochop stávající chování:
  - [ ] `apps/web/components/dashboard/DashboardContent.tsx` – karta „Shipment History“
  - [ ] `apps/api/src/articles/articles.service.ts` – logika pro práci s články a plány
  - [ ] `apps/api/src/webs/webs.service.ts` – příklady, jak API vrací data pro dashboard
  - [ ] `apps/worker/src/main.ts` – jak vznikají `Article`, `ArticlePlan` a jejich stavy
- [ ] Přečti si sekci „ArticlePlan lifecycle & publikace“ v `README.md`, ať chápeš, co znamenají stavy `PLANNED`, `QUEUED`, `GENERATED`, `PUBLISHED`.

---

## Fáze 1 – Backend API pro „article history“

**Cíl:** Přidat jednoduchý read‑only endpoint, který pro aktuálně přihlášeného uživatele vrátí historii posledních článků (napříč všemi weby) v normalizovaném tvaru.

### 1.1 Návrh datového modelu pro response

- [ ] Vymysli finální tvar položky, např.:
  - [ ] `articleId: string`
  - [ ] `webId: string`
  - [ ] `webUrl: string`
  - [ ] `title: string` (celý titulek)
  - [ ] `titlePreview: string` (první slova titulku, max. ~50 znaků)
  - [ ] `currentStatus: 'PLANNED' | 'GENERATED' | 'PUBLISHED'`
  - [ ] `currentStatusAt: string` (ISO datum času posledního stavu)
  - [ ] `history: { status: 'PLANNED' | 'GENERATED' | 'PUBLISHED'; at: string }[]`
- [ ] Rozhodni, jak bude vypadat query:
  - [ ] `status` – volitelný query param (`all | published | generated`), výchozí `all`
  - [ ] `limit` – volitelný query param (výchozí 4, max např. 10)

### 1.2 DTO a typy v API

- [ ] Vytvoř nový DTO soubor, např. `apps/api/src/articles/dto/article-activity-query.dto.ts`:
  - [ ] Definuj `status?: 'all' | 'published' | 'generated'`
  - [ ] Definuj `limit?: number`
  - [ ] Přidej validaci (`@IsOptional`, `@IsIn`, `@IsInt`, `@Min`, `@Max`)
- [ ] Volitelně: vytvoř typ pro položku v response (např. `ArticleActivityItem`) – může být jen TypeScript typ, ne nutně DTO.

### 1.3 Nový service method v `ArticlesService`

- [ ] Otevři `apps/api/src/articles/articles.service.ts`
- [ ] Přidej novou metodu, např. `listArticleActivity(userId: string, query: ArticleActivityQueryDto)`
- [ ] V metodě:
  - [ ] Připrav `where` podmínku tak, aby `ArticlePlan` patřily webům daného uživatele:
    - [ ] `where: { web: { userId }, status: { in: [PLANNED, QUEUED, GENERATED, PUBLISHED] } }`
  - [ ] Přidej include:
    - [ ] `web` (aspoň `id`, `url`, `nickname`)
    - [ ] `article` (aspoň `id`, `title`, `status`, `createdAt`, `publishedAt`)
  - [ ] Seřaď plány od nejnovějších podle `plannedPublishAt` nebo podle „aktuálního stavu“ (viz další krok).
- [ ] Pro každý záznam sestav historii stavů:
  - [ ] Vždy přidej `PLANNED` s časem `plannedPublishAt`
  - [ ] Pokud existuje `article`:
    - [ ] Přidej `GENERATED` s časem `article.createdAt`
    - [ ] Pokud má `article.publishedAt`, přidej `PUBLISHED` s tímto časem
  - [ ] Seřaď interně historii podle času (od nejstaršího po nejnovější)
  - [ ] Urči `currentStatus` = poslední status v historii
  - [ ] Urči `currentStatusAt` = čas posledního statusu
- [ ] Aplikuj filtr podle `query.status`:
  - [ ] `status = 'all'` → nefiltruj
  - [ ] `status = 'published'` → nech jen položky s `currentStatus = 'PUBLISHED'`
  - [ ] `status = 'generated'` → nech jen položky s `currentStatus = 'GENERATED'`
- [ ] Seřaď výsledky podle `currentStatusAt` sestupně
- [ ] Omez počet položek na `query.limit` (výchozí 4)
- [ ] Namapuj výsledky do finálního response tvaru (včetně `titlePreview`, např. prvních ~8–10 slov)

### 1.4 Controller endpoint

- [ ] Otevři `apps/api/src/articles/all-articles.controller.ts` nebo vytvoř nový controller, pokud se hodí lépe.
- [ ] Přidej route, např.:
  - [ ] `GET /articles/activity`
  - [ ] Ochrana pomocí JWT (stejná jako ostatní článkové endpointy)
  - [ ] Přečti query parametry do `ArticleActivityQueryDto`
  - [ ] Volej `this.articlesService.listArticleActivity(user.userId, query)`
- [ ] Otestuj endpoint přes Postman/Thunder Client:
  - [ ] Bez parametrů (výchozí `status=all`, `limit=4`)
  - [ ] S `status=published`
  - [ ] S `status=generated`

---

## Fáze 2 – Frontend: datové typy a fetch helper

**Cíl:** Přidat na frontend jednoduchou funkci, která zavolá nový endpoint a vrátí data v očekávaném tvaru.

### 2.1 Typy pro Article Activity

- [ ] V `apps/web` vytvoř (nebo doplň) soubor pro sdílené typy článků, např. `apps/web/lib/article-activity.ts`:
  - [ ] Definuj typ `ArticleActivityItem` kompatibilní s response z API:
    - [ ] `articleId`, `webId`, `webUrl`, `title`, `titlePreview`
    - [ ] `currentStatus`, `currentStatusAt`
    - [ ] `history: { status; at }[]`

### 2.2 Fetch helper

- [ ] V tom samém souboru vytvoř funkci:
  - [ ] `export async function fetchArticleActivity(filter: 'all' | 'published' | 'generated' = 'all'): Promise<ArticleActivityItem[]>`
- [ ] Použij existující `apiFetch` utilitu:
  - [ ] URL např. `GET /articles/activity?status=${filter}&limit=4`
  - [ ] Dekóduj JSON a vrať pole `ArticleActivityItem[]`
- [ ] Ošetři chyby:
  - [ ] V případě chyby vyhoď Error (frontend komponenta pak může zobrazit fallback zprávu)

---

## Fáze 3 – Frontend: úprava karty „Shipment History“

**Cíl:** Nahradit statický obsah karty dynamickými daty o článcích, beze změny celkového designu a layoutu.

### 3.1 Renaming záložek / filtrů

- [ ] Otevři `apps/web/components/dashboard/DashboardContent.tsx` a najdi kartu „Shipment History“.
- [ ] V nav‑pills přejmenuj texty:
  - [ ] `Notable` → `ALL`
  - [ ] `Delivered` → `PUBLISHED`
  - [ ] `Shipping` → `GENERATED`
- [ ] Zkontroluj, že HTML struktura, třídy (`nav-link`, `bullet-custom`, atd.) a markup zůstaly stejné.

### 3.2 Stav komponenty a napojení na API

- [ ] V komponentě přidej React state:
  - [ ] `const [activeFilter, setActiveFilter] = useState<'all' | 'published' | 'generated'>('all');`
  - [ ] `const [items, setItems] = useState<ArticleActivityItem[]>([]);`
  - [ ] `const [loading, setLoading] = useState(false);`
  - [ ] `const [error, setError] = useState<string | null>(null);`
- [ ] Přidej `useEffect`, který se spustí při mountu a při změně `activeFilter`:
  - [ ] Nastav `loading=true`, `error=null`
  - [ ] Zavolej `fetchArticleActivity(activeFilter)`
  - [ ] Výsledek ulož do `items`
  - [ ] V `finally` nastav `loading=false`
- [ ] V nav‑pills klik handler:
  - [ ] Při kliknutí na „ALL“ nastav `activeFilter('all')`
  - [ ] „PUBLISHED“ → `activeFilter('published')`
  - [ ] „GENERATED“ → `activeFilter('generated')`
  - [ ] Zajisti, že aktivní tab má class `active` (můžeš to řídit přes React, ne spoléhat na Bootstrap JS).

### 3.3 Zobrazení stavu „loading“ / „empty“

- [ ] Pokud `loading === true`, zobraz v těle karty jednoduchý loader (např. text „Načítám poslední články…“ nebo skeleton).
- [ ] Pokud `!loading && items.length === 0`, zobraz neutrální zprávu (např. „Zatím nemáte žádnou aktivitu článků.“).
- [ ] Jen pokud `items.length > 0`, renderuj seznam článků.

### 3.4 Mapování dat na existující design

- [ ] Připrav pomocnou funkci pro formátování času na timeline:
  - [ ] Např. `formatTime(at: string)` → `Intl.DateTimeFormat` (lokální čas, např. `HH:mm` nebo `d.M. HH:mm`).
- [ ] Pro každý `ArticleActivityItem`:
  - [ ] Využij stávající markup jednoho položkového bloku (symbol + text + badge + timeline).
  - [ ] **Nech CSS třídy a strukturu beze změny**, pouze vyměň texty a obsah.
- [ ] Horní část položky:
  - [ ] Zachovej text `Ship Freight` / `Truck Freight` / apod. jako vizuální label (můžeš ho nechat statický).
  - [ ] Badge vpravo:
    - [ ] Text badge = `currentStatus` (`PUBLISHED` nebo `GENERATED` nebo `PLANNED`)
    - [ ] Barvu badge mapuj podle statusu, ale použij existující třídy:
      - [ ] `PUBLISHED` → `badge-light-success`
      - [ ] `GENERATED` → `badge-light-primary`
      - [ ] `PLANNED` → může zůstat některá neutrální barva (např. `badge-light`)
  - [ ] Druhý řádek (místo `#5635-342808`):
    - [ ] Zobraz `titlePreview` (např. `# První slova článku…`)
    - [ ] Odkaz `href="#"` zatím nech jako placeholder (budoucí proklik na detail článku).
- [ ] Timeline pod položkou:
  - [ ] Místo geografických názvů zobraz stavy článku:
    - [ ] Pro každý záznam v `history` (vynecháš případně ten úplně poslední, pokud je shodný s `currentStatus` a už je zobrazen nahoře – záleží na preferenci):
      - [ ] Horní řádek = `formatTime(at)`
      - [ ] Spodní řádek = text statusu (`PLANNED` / `GENERATED` / `PUBLISHED`)
  - [ ] Ponech timeline ikonky (`ki-cd`, `ki-geolocation`), jen je znovu použij, nemusíš je měnit podle statusu.
- [ ] Omez počet položek v UI na max. 4:
  - [ ] Pokud backend teoreticky vrátí více položek, na frontendu použij `items.slice(0, 4)` pro jistotu.

### 3.5 Přemapování tabů na filtry

- [ ] Ujisti se, že:
  - [ ] Tab „ALL“ zobrazuje výsledek `status=all` (všechny stavy).
  - [ ] Tab „PUBLISHED“ používá `status=published` (jen položky s `currentStatus='PUBLISHED'`).
  - [ ] Tab „GENERATED“ používá `status=generated` (jen položky s `currentStatus='GENERATED'`).
- [ ] Stavy `PLANNED` (ještě negenerované články) se objevují pouze pod „ALL“ (logicky dává smysl).

---

## Fáze 4 – Testování a ladění

**Cíl:** Ověřit, že karta funguje správně pro různé stavy pipeline a filtry.

### 4.1 Lokální data a scénáře

- [ ] Na lokálním prostředí si vytvoř testovacího uživatele a alespoň 1–2 weby.
- [ ] Spusť pipeline tak, aby vzniklo několik článků:
  - [ ] Některé v `GENERATED` stavu (draft v DB, nepublikované na WP).
  - [ ] Některé v `PUBLISHED` stavu (publikované na WP).
  - [ ] Některé pouze `PLANNED` (bez vygenerovaného článku).

### 4.2 Testování backend endpointu

- [ ] Přes Postman/Thunder Client ověř:
  - [ ] `GET /articles/activity` vrací max. 4 položky, setříděné od nejnovějších.
  - [ ] `GET /articles/activity?status=published` vrací jen `currentStatus='PUBLISHED'`.
  - [ ] `GET /articles/activity?status=generated` vrací jen `currentStatus='GENERATED'`.
  - [ ] Každá položka má správně sestavenou historii (`PLANNED`, případně `GENERATED`, případně `PUBLISHED`).

### 4.3 Testování frontend UI

- [ ] Otevři `/dashboard` jako přihlášený uživatel.
- [ ] Zkontroluj kartu „Shipment History“:
  - [ ] Nápisy na tabech jsou `ALL`, `PUBLISHED`, `GENERATED`.
  - [ ] V záložce „ALL“ vidíš až 4 položky s reálnými články (pokud existují).
  - [ ] U první položky je badge a `titlePreview` pro nejnovější stav článku.
  - [ ] Timeline pod položkou ukazuje stavy s časy (bez geografických názvů).
- [ ] Přepínej záložky:
  - [ ] „PUBLISHED“ ukazuje jen publikované články.
  - [ ] „GENERATED“ ukazuje jen generované (ale ještě nepublikované).
- [ ] Ověř chování, když žádná data nejsou:
  - [ ] Zobrazuje se definovaná „empty state“ zpráva místo rozbitého layoutu.

---

## Fáze 5 – Budoucí rozšíření (volitelné)

- [ ] Přidat proklik na detail článku:
  - [ ] Uvnitř `titlePreview` nahradit `href="#"` za reálnou URL (např. `/dashboard/articles/:articleId`).
- [ ] Vylepšit timeline:
  - [ ] Přidat tooltips s přesným datem a časem.
  - [ ] Využít různé ikonky pro různé stavy (bez zásahu do existujících CSS tříd).
- [ ] Přidat jednoduché e2e nebo integrační testy pro nový endpoint a UI (pokud budou v projektu standardizované testy pro API / frontend).

