# Plán: favicon a screenshot homepage (vlastní služba + workery)

Tento dokument popisuje, jak v rámci MVP přidáme k webu favicon a screenshot homepage s využitím vlastní rendering služby a workerů. Ukládání probíhá do lokálního adresáře, ale architektura je připravená na pozdější přesun do bucketu (S3/GCS apod.).

---

## 1) Architektura – high‑level

- Hlavní aplikace (API + web scanning + business logika).
- Rendering služba:
  - stará se o headless prohlížeč (Playwright/Puppeteer),
  - umí vytvořit screenshot a případně i fallback favicon, pokud žádná není.
- Job/queue vrstva:
  - fronty `favicon_fetch` a `screenshot_generate`,
  - workery pro každou frontu (může běžet v rámci hlavní app nebo samostatně).
- Storage abstrakce:
  - jednotné rozhraní `AssetStorage` (lokální FS vs. bucket),
  - MVP: lokální adresář `./storage/website-assets/...`,
  - později: S3 / GCS / jiný bucket za stejné rozhraní.

---

## 2) Storage vrstva – příprava na bucket

### 2.1 Rozhraní

Abstrakce `AssetStorage`:

- `saveFile(path, binary, contentType) -> publicUrl`
- `getFile(path) -> binary/stream`
- `deleteFile(path)`
- `getPublicUrl(path) -> url`

Implementace:

- `LocalAssetStorage`:
  - root: `./storage/website-assets`,
  - `path` relativní, např. `projects/{projectId}/favicon-64.png`,
  - `getPublicUrl` vrací např. `https://app.local.test/assets/...` (v dev).
- `S3AssetStorage` (později):
  - stejné metody, jen ukládání do bucketu,
  - `getPublicUrl` používá doménu bucketu / CDN.

### 2.2 Struktura souborů

Navržené cesty:

- `storage/website-assets/projects/{projectId}/favicon-16.png`
- `storage/website-assets/projects/{projectId}/favicon-32.png`
- `storage/website-assets/projects/{projectId}/favicon-64.png`
- `storage/website-assets/projects/{projectId}/screenshot-home-1024x768.jpg`

Při přechodu na bucket zůstane struktura cest stejná, mění se jen implementace storage.

---

## 3) Rendering služba (headless browser worker)

### 3.1 Role

Rendering služba:

- Dostane URL + typ výstupu:
  - `type = "screenshot"` → vykreslení stránky a screenshot.
  - `type = "favicon-fallback"` → generovaná ikonka, pokud favicon chybí.
- Běží odděleně od hlavního web API (jiný proces / služba), aby se minimalizoval dopad headless prohlížeče na API.

### 3.2 API rendering služby

Interní API (dle zvoleného stacku):

- buď přímé volání funkcí z workeru (monolit),
- nebo interní HTTP API, např. `POST /internal/render/screenshot` s payloadem:
  - `url`
  - `type` (`screenshot` / `favicon-fallback`)
  - parametry viewportu / rozlišení.

### 3.3 Chování – screenshot homepage

- Otevřít URL v headless prohlížeči.
- Nastavit viewport (např. 1280×720).
- Počkat krátký čas (2–5 s) na načtení stránky.
- Volitelně:
  - „above the fold“ screenshot (jen první obrazovka),
  - nebo full‑page screenshot (konfigurovatelné).
- Uložit do dočasného souboru, komprimovat do JPEG/PNG.
- Vrátit binární obsah workeru, který ho uloží přes `AssetStorage`.

### 3.4 Chování – favicon fallback

- Vzít doménu nebo název projektu.
- Vytvořit canvas 64×64 px s pozadím (barva může být deterministicky odvozená z domény).
- Doprostřed velké písmeno (brand / doména).
- Výsledek uložit jako PNG a vrátit binární data workeru.

---

## 4) Favicon pipeline (worker + service)

### 4.1 Rozšíření datového modelu

Do entity „Project“ / „Website“ přidat:

- `faviconUrl` (string),
- `faviconStatus` (`pending | success | failed`),
- `faviconSourceUrl` (origin URL favicony, pokud existuje),
- `faviconLastFetchedAt` (datetime).

### 4.2 Flow

1. Onboarding / založení projektu:
   - vytvoření záznamu projektu,
   - nastavení `faviconStatus = "pending"`,
   - enqueue job `FetchFaviconJob(projectId)`.
2. Worker `FetchFaviconJob`:
   - načte HTML homepage (přes sdílený `PageFetcher` nebo z cached snapshotu),
   - najde `<link rel="icon">`, `apple-touch-icon`, apod.,
   - z kandidátů vybere nejvhodnější (typ, velikost),
   - stáhne favicon (HTTP GET),
   - z favicony vytvoří několik velikostí (16/32/64 px),
   - uloží je přes `AssetStorage` do `projects/{projectId}/favicon-XX.png`,
   - aktualizuje DB:
     - `faviconUrl` (např. URL 64px varianty),
     - `faviconStatus = "success"`,
     - `faviconSourceUrl`, `faviconLastFetchedAt`.
3. Fallback:
   - pokud favicon nenalezena nebo stažení selže:
     - optional: zavolat rendering službu s `type="favicon-fallback"`,
     - generovaný fallback uložit přes `AssetStorage`,
     - `faviconUrl` ukazovat na fallback,
     - `faviconStatus = "success"` (ale s informací, že je to fallback).
4. Retry logika:
   - max. počet pokusů (např. 3),
   - interval mezi pokusy (např. 1 h, 24 h),
   - možnost ručního „retry“ z admin UI.

---

## 5) Screenshot pipeline (worker + rendering služba)

### 5.1 Rozšíření datového modelu

Do entity projektu přidat:

- `screenshotUrl` (string),
- `screenshotStatus` (`pending | success | failed`),
- `screenshotLastGeneratedAt` (datetime),
- volitelně meta: `screenshotWidth`, `screenshotHeight`.

### 5.2 Flow

1. Onboarding / založení projektu:
   - nastavit `screenshotStatus = "pending"`,
   - enqueue job `GenerateHomepageScreenshotJob(projectId)`.
2. Worker `GenerateHomepageScreenshotJob`:
   - načte URL projektu z DB,
   - pošle požadavek do rendering služby:
     - `type = "screenshot"`,
     - `url`,
     - viewport, typ screenshotu (fold/full page),
   - rendering služba vrátí binární obrázek,
   - worker uloží obrázek přes `AssetStorage` do:
     - `projects/{projectId}/screenshot-home-1280x720.jpg`,
   - aktualizuje DB:
     - `screenshotUrl`,
     - `screenshotStatus = "success"`,
     - `screenshotLastGeneratedAt`.
3. Error handling:
   - timeout, 4xx/5xx, DNS chyby:
     - `screenshotStatus = "failed"`,
     - zaznamenat důvod do logů,
   - worker může dle konfigurace naplánovat další pokus (retry).
4. Refresh screenshotu:
   - periodický job (cron), který pro projekty se starým screenshotem (např. > 7–30 dní):
     - enqueuje nový `GenerateHomepageScreenshotJob`,
   - manuální tlačítko „Refresh screenshot“ v UI (enqueue job na vyžádání).

---

## 6) Job/queue vrstva

### 6.1 Abstrakce

Nezávisle na konkrétní technologii:

- `JobQueue`:
  - `enqueue(queueName, payload)`,
  - consumer/worker naslouchá na frontách `favicon_fetch`, `screenshot_generate`.

Payload:

- příklad: `{"projectId": "...", "trigger": "onboarding"}`,
- rozšířitelné o prioritu, max attempts, atd.

### 6.2 MVP implementace

- Jednoduchý in‑process job runner:
  - fronta může být v DB (tabulka jobs),
  - worker proces periodicky tahá joby z DB a zpracovává je.
- Dlouhodobě:
  - náhrada za message broker (Redis, RabbitMQ, SQS…),
  - stejné rozhraní `JobQueue`, jiná implementace.

---

## 7) Integrace s hlavním flow

### 7.1 Onboarding

- Při vytvoření projektu:
  - uložit základní data (URL, název),
  - nastavit `faviconStatus` a `screenshotStatus` na `pending`,
  - enqueue `FetchFaviconJob` a `GenerateHomepageScreenshotJob`.

### 7.2 Web scanning modul

- Při prvním crawlu homepage:
  - modul může parsovat `<link rel="icon"...>` a uložit kandidátní URL do `faviconSourceUrl`,
  - `FetchFaviconJob` potom může využít tyto data a vynechat vlastní parsování HTML (re‑use).

### 7.3 UI chování

- `faviconStatus = "pending"`:
  - zobrazit placeholder (generický avatar).
- `faviconStatus = "failed"`:
  - zobrazit fallback (např. generovanou ikonku nebo písmeno).
- `screenshotStatus = "pending"`:
  - zobrazit skeleton / šedý blok místo náhledu.
- `screenshotStatus = "failed"`:
  - zobrazit fallback (např. jen favicon + text).

---

## 8) MVP vs. budoucí bucket – konkrétní kroky

### 8.1 MVP

- Vytvořit modul `AssetStorage` + implementaci `LocalAssetStorage`.
- Přidat konfiguraci:
  - `ASSET_STORAGE_DRIVER=local`,
  - `ASSET_STORAGE_LOCAL_PATH=./storage/website-assets`,
  - `ASSET_PUBLIC_BASE_URL=http://localhost:3000/assets` (dle stacku).
- V API vracet jen `faviconUrl` / `screenshotUrl`:
  - už jako public URL, ne interní cestu.
- Rendering službu spouštět jako samostatný proces/worker vedle hlavní aplikace.

### 8.2 Přechod na bucket

- Přidat implementaci `S3AssetStorage` (nebo jiné cloud storage). V repu už je připravená kostra (`libs/storage/src/index.ts`) – metody zatím hází `Not implemented`, ale DI/konfigurace už driver umí zaregistrovat.
- Konfigurace:
  - `ASSET_STORAGE_DRIVER=s3`,
  - `ASSET_S3_BUCKET=...`,
  - `ASSET_S3_REGION=...`,
  - `ASSET_PUBLIC_BASE_URL=https://cdn.myproduct.com`.
- Neměnit API ani DB:
  - pouze se přepne `ASSET_STORAGE_DRIVER` na `s3`.
- Migrace existujících lokálních souborů (pokud bude potřeba):
  - jednorázový script, který projde `storage/website-assets`,
  - uploadne vše do bucketu se stejným `path` layoutem.
- Postup pro přepnutí bez výpadku:
  1. nasadit reálnou implementaci `S3AssetStorage` (použít AWS SDK nebo generický S3 client),
  2. nahrát historické soubory (`storage/website-assets/**`) do bucketu – zachovat strukturu `projects/{webId}/...`,
  3. nastavit `ASSET_STORAGE_DRIVER=s3`, `ASSET_S3_BUCKET`, `ASSET_S3_REGION`, `ASSET_PUBLIC_BASE_URL=https://cdn.example.com`,
  4. v API/worker instancích nasadit nový build a zkontrolovat, že `GET /assets` route už není potřeba (při S3 driveru lze route vypnout),
  5. vyčistit lokální `storage/website-assets` až po potvrzení, že CDN vrací nové URL.

---

## 9) Shrnutí

- Favicon i screenshot jsou řešeny přes background joby a vlastní rendering službu.
- Storage je abstrahovaná přes `AssetStorage`, takže přechod z lokálního FS na bucket je bez změny API/DB.
- MVP ukládá soubory do `./storage/website-assets`, UI pracuje s public URL.
- Dlouhodobě je možné:
  - vyměnit storage za S3/GCS,
  - nahradit jednoduchý job runner plnohodnotnou message queue,
  - optimalizovat rendering službu (cache, pooling headless prohlížečů).

---

# Implementační plán pro favicony a screenshoty (pro vývojáře)

Tato sekce rozpracovává výše uvedený konceptuální plán do konkrétních milníků a úkolů, které může postupně realizovat juniorní vývojář. U každého celku jsou:

- **Cíl:** co má být výsledkem.
- **Proč:** jaký má úsek smysl v celém systému.
- **Jak:** konkrétní kroky, které je potřeba provést (bez psaní detailního kódu).

Na závěr je uveden postup, jak ověřit a předat hotový úsek.

---

## Milník 1: Storage vrstva (`AssetStorage`) s lokálním uložištěm

### 1.1 Definice rozhraní `AssetStorage`

**Cíl:**  
Mít jedno společné rozhraní pro práci s assety (favicony a screenshoty), které bude použitelné jak pro lokální disk (MVP), tak později pro cloudový bucket (S3/GCS).

**Proč:**  
Díky abstrakci `AssetStorage` nebudeme muset měnit zbytek aplikace, až se rozhodneme přejít z lokálního adresáře na cloudový bucket. Všechny části systému budou používat jen toto rozhraní a nebude je zajímat, kde soubory fyzicky leží.

**Jak:**
- V backendu vytvoř složku/modul pro storage (např. `src/storage` nebo ekvivalent v NestJS).
- Vytvoř interface `AssetStorage` s metodami:
  - `saveFile(path, binary, contentType): Promise<string>` – uloží soubor na danou cestu a vrátí public URL.
  - `getFile(path): Promise<Binary>` nebo stream – zatím stačí signatura; implementace se může řešit později.
  - `deleteFile(path): Promise<void>`.
  - `getPublicUrl(path): string` – v případě potřeby vrací URL bez fyzického ukládání.
- Do dokumentace (`screenshots.md` a případně technická dokumentace backendu) doplň krátký popis interface, aby bylo jasné, že ostatní části systému mají mluvit jen s `AssetStorage`, ne s konkrétním filesystem API.

### 1.2 Implementace `LocalAssetStorage`

**Cíl:**  
Mít plně funkční lokální implementaci storage, která ukládá soubory do `./storage/website-assets/...` a vrací public URL, které může UI nebo API použít.

**Proč:**  
Potřebujeme MVP, které bude fungovat bez externích služeb (S3/GCS). Lokální storage nám umožní rychlý start a jednodušší vývoj, zatímco rozhraní `AssetStorage` nás připravuje na budoucí přechod na cloud.

**Jak:**
- Vytvoř třídu `LocalAssetStorage`, která implementuje `AssetStorage`.
- Konfiguruj root adresář pro ukládání, např.:
  - `ASSET_STORAGE_LOCAL_PATH=./storage/website-assets`
- Implementuj:
  - `saveFile(path, binary, contentType)`:
    - slož `fullPath = ROOT_PATH + "/" + path`,
    - zajisti vytvoření adresářů (`projects/{projectId}/...`),
    - zapiš binární data na disk,
    - slož public URL pomocí `ASSET_PUBLIC_BASE_URL` (např. `http://localhost:3000/assets/...`),
    - vrať public URL.
  - `getPublicUrl(path)`:
    - vrátí `ASSET_PUBLIC_BASE_URL + "/" + path`.
  - `deleteFile(path)`:
    - smaže soubor z disku, pokud existuje.
- Ujisti se, že cesty odpovídají návrhu:
  - `projects/{projectId}/favicon-16.png`,
  - `projects/{projectId}/screenshot-home-1280x720.jpg`, atd.

### 1.3 Registrace storage přes konfiguraci

**Cíl:**  
Mít možnost přepínat storage driver (lokální vs. budoucí S3) pomocí konfigurace, bez zásahu do kódu jednotlivých modulů.

**Proč:**  
Usnadní to budoucí změnu infrastruktury (přechod na bucket) – stačí změnit konfiguraci a případně přidat S3 implementaci, ostatní kód zůstane beze změny.

**Jak:**
- Přidej konfigurační proměnné:
  - `ASSET_STORAGE_DRIVER=local`
  - `ASSET_STORAGE_LOCAL_PATH=./storage/website-assets`
  - `ASSET_PUBLIC_BASE_URL=http://localhost:3000/assets`
- V konfiguraci/DI kontejneru backendu:
  - vytvoř factory, která podle `ASSET_STORAGE_DRIVER` vrací konkrétní implementaci (`LocalAssetStorage`),
  - exportuj `AssetStorage` jako injektovatelnou službu.
- Ověř, že moduly budou brát závislost pouze na rozhraní/storage službě, ne na konkrétní implementaci.

---

## Milník 2: Rozšíření datového modelu pro favicony a screenshoty

### 2.1 Rozšíření entity `web` (projekt/website)

**Cíl:**  
Doplnit do databáze informace o faviconě a screenshotu, aby se daly snadno načítat v API a UI.

**Proč:**  
UI potřebuje vědět, kde faviconu a screenshot najde (URL), a také v jakém jsou stavu (pending/success/failed). Databáze musí tyto informace držet konzistentně pro každou stránku (web/projekt).

**Jak:**
- V Prisma/ORM schématu doplň do tabulky `webs` (nebo ekvivalentu):
  - `faviconUrl` (string, nullable),
  - `faviconStatus` (enum `pending | success | failed`, default `pending`),
  - `faviconSourceUrl` (string, nullable),
  - `faviconLastFetchedAt` (datetime, nullable),
  - `screenshotUrl` (string, nullable),
  - `screenshotStatus` (enum `pending | success | failed`, default `pending`),
  - `screenshotLastGeneratedAt` (datetime, nullable),
  - volitelně `screenshotWidth`, `screenshotHeight` (integer, nullable).
- Vytvoř a spusť migraci databáze.
- Aktualizuj entity/modely v kódu, aby reflektovaly nová pole.

### 2.2 Úprava API modelů (DTOs) pro web

**Cíl:**  
Zajistit, aby API vrátilo favicon a screenshot informace klientovi (frontend, admin nástroje).

**Proč:**  
Frontend na dashboardu a detailu webu musí vědět, jaké jsou stavy favicony a screenshotu a jak je zobrazit. Bez toho by uživatel neviděl náhledy ani ikonu.

**Jak:**
- V DTOs / response modelech pro web (např. `WebDto`):
  - přidej pole `faviconUrl`, `faviconStatus`, `screenshotUrl`, `screenshotStatus` atd.
- V kontrolerech/servisech, které vracejí data o webu:
  - zajisti, že se nová pole správně načítají z DB a plní do odpovědi.
- Pokud existuje seznam webů (např. `GET /webs`):
  - ujisti se, že v seznamu jsou k dispozici i favicon a screenshot (alespoň URL a status).

---

## Milník 3: Favicon pipeline – job a worker

### 3.1 Job `FetchFaviconJob`

**Cíl:**  
Implementovat background job, který pro daný projekt:
- najde vhodnou faviconu,
- stáhne ji,
- uloží do storage,
- aktualizuje záznam v DB.

**Proč:**  
Nechceme blokovat onboarding nebo UI – získání favicony může chvíli trvat nebo selhat. Proto vše běží na pozadí, přes queue/worker.

**Jak:**
- V job/queue vrstvě definuj nový job typ, např. `FetchFaviconJob`.
- Payload jobu: `{ webId: string }` nebo `{ projectId: string }`.
- V onboading flow:
  - po vytvoření webu:
    - nastav `faviconStatus = "pending"`,
    - enqueue `FetchFaviconJob`.

### 3.2 Implementace workeru pro `FetchFaviconJob`

**Cíl:**  
Zpracovávat frontu `favicon_fetch` – pro každý job udělat všechny kroky nutné k získání favicony.

**Proč:**  
Worker odděluje dlouhotrvající/nespolehlivé operace (HTTP requesty na cizí weby) od hlavního API a umožňuje retry logiku.

**Jak:**
- V worker aplikaci:
  - přidej procesor pro frontu `favicon_fetch`.
- Implementuj kroky z pohledu workeru:
  1. Načti z DB web podle `webId`.
  2. Získej HTML homepage:
     - buď přímo (HTTP GET),
     - nebo použitím existujícího `PageFetcher`/web scanning modulu (pokud už existuje).
  3. Z HTML vyparsuj `<link rel="icon">`, `apple-touch-icon`, atd.
  4. Vyber nejlepší kandidátní faviconu:
     - preferuj PNG/SVG před ICO,
     - preferuj větší velikost (např. 64×64).
  5. Stáhni faviconu.
  6. Vytvoř potřebné velikosti (16/32/64 px) – pro MVP stačí 1–2 velikosti, ale plánuj strukturu na více.
  7. Ulož faviconu(y) přes `AssetStorage`:
     - cesty typu `projects/{projectId}/favicon-64.png`.
  8. Aktualizuj DB:
     - `faviconUrl` (např. na 64px variantu),
     - `faviconStatus = "success"`,
     - `faviconSourceUrl`, `faviconLastFetchedAt`.

### 3.3 Fallback favicon (volitelné pro první iteraci)

**Cíl:**  
Mít možnost vygenerovat jednoduchou ikonu, pokud web žádnou faviconu neposkytuje nebo stahování opakovaně selže.

**Proč:**  
Chceme, aby UI mělo vždy aspoň nějakou vizuální reprezentaci webu, což zlepšuje UX (seznam webů, e‑maily).

**Jak:**
- V workeru po neúspěšném získání favicony:
  - volitelně zavolej rendering službu s `type="favicon-fallback"`,
  - nebo implementuj jednoduchý generátor (canvas, písmeno).
- Ulož fallback ikonu přes `AssetStorage` na podobnou cestu jako favicony.
- V DB:
  - můžeš `faviconStatus` ponechat jako `success` (ale uvnitř systému označit, že jde o fallback – např. zvláštním polem nebo logem).

### 3.4 Retry a error handling

**Cíl:**  
Zajistit, že jednorázový výpadek webu nebo dočasná chyba neznamená trvale neplatnou faviconu.

**Proč:**  
Web může být dočasně nedostupný, ale později začne faviconu vracet. Potřebujeme robustní systém, který to zvládne.

**Jak:**
- V queue systému nastav:
  - maximální počet pokusů (např. 3),
  - prodlevu mezi pokusy (exponenciální backoff).
- V DB:
  - při definitivním selhání (vyčerpání pokusů) nastav `faviconStatus = "failed"`.
- Připrav endpoint nebo admin nástroj pro manuální „retry“ (enqueue další job).

---

## Milník 4: Screenshot pipeline – job, worker a rendering služba

### 4.1 Job `GenerateHomepageScreenshotJob`

**Cíl:**  
Mít background job, který pro daný web vytvoří screenshot homepage a uloží ho do storage.

**Proč:**  
Screenshot bývá náročnější operace (rendering prohlížeče), která může trvat déle a nechceme ji provádět synchronně při requestu z UI.

**Jak:**
- Definuj job typ `GenerateHomepageScreenshotJob` s payloadem `{ webId: string }`.
- Při vytvoření webu:
  - nastav `screenshotStatus = "pending"`,
  - enqueue `GenerateHomepageScreenshotJob`.
- V budoucnu:
  - přidej periodic job (cron), který re‑enqueue joby pro weby se starým screenshotem.

### 4.2 Implementace rendering služby (MVP)

**Cíl:**  
Mít samostatnou komponentu, která umí vzít URL a vrátit binární screenshot homepage.

**Proč:**  
Odděluje náročný rendering (headless browser) od zbytku backendu a usnadňuje škálování a ladění.

**Jak:**
- Vytvoř modul/službu `RenderingService` (samostatná app nebo modul workeru).
- Zvol nástroj (Playwright / Puppeteer).
- Implementuj metodu:
  - `renderScreenshot(url, options) -> binary`:
    - otevře URL v headless prohlížeči,
    - nastaví viewport (např. 1280×720),
    - počká na načtení stránky (timeout),
    - udělá screenshot (fold nebo full page),
    - vrátí binární data (PNG/JPEG).
- Pro MVP může být rendering služba volaná přímo z workeru (stejný proces). Později lze extrahovat do samostatné mikro‑služby.

### 4.3 Implementace workeru pro screenshoty

**Cíl:**  
Zpracovávat frontu screenshotů a ukládat výsledné obrázky do storage.

**Proč:**  
Stejně jako u favicon, nechceme screenshoty generovat přímo v API requestu.

**Jak:**
- V workeru přidej procesor pro frontu `screenshot_generate`.
- Pro každý job:
  1. Načti `web` z DB podle `webId`.
  2. Získej URL webu.
  3. Zavolej `RenderingService.renderScreenshot(url, options)`.
  4. Výsledek ulož přes `AssetStorage` na cestu typu:
     - `projects/{projectId}/screenshot-home-1280x720.jpg`.
  5. Aktualizuj DB:
     - `screenshotUrl`,
     - `screenshotStatus = "success"`,
     - `screenshotLastGeneratedAt`.
- Implementuj error handling a retry podobně jako u favicon:
  - při trvalém selhání nastav `screenshotStatus = "failed"`.

### 4.4 Refresh screenshotu

**Cíl:**  
Udržovat screenshot relativně aktuální (např. 1× za 7–30 dní).

**Proč:**  
Weby se mění a starý screenshot může být matoucí nebo nevypadat dobře.

**Jak:**
- Vytvoř jednoduchý scheduler (cron nebo v rámci NestJS Scheduler), který:
  - jednou za den najde weby se `screenshotLastGeneratedAt` starším než X dní,
  - pro každý takový web enqueue `GenerateHomepageScreenshotJob`.
- Připrav endpoint/UI akci „Refresh screenshot“:
  - po kliknutí enqueue job ručně pro daný web.

---

## Milník 5: Integrace s onboardingem a UI

### 5.1 Napojení na onboarding flow

**Cíl:**  
Zajistit, že těsně po založení webu se automaticky spustí tvorba favicony a screenshotu.

**Proč:**  
Chceme, aby uživatel viděl náhledy co nejdříve, aniž by musel něco ručně spouštět.

**Jak:**
- V místě, kde se vytváří nový web (např. `POST /webs` nebo po zaplacení přes Stripe):
  - po uložení webu:
    - nastav `faviconStatus = "pending"`, `screenshotStatus = "pending"`,
    - enqueue `FetchFaviconJob`,
    - enqueue `GenerateHomepageScreenshotJob`.
- Přesvědč se, že případný rollback (např. neúspěch platby) zohledňuje i tyto joby, pokud je to potřeba.

### 5.2 Úprava UI (dashboard, detail webu)

**Cíl:**  
Zobrazit faviconu a screenshot na dashboardu a detailu webu, včetně rozumných fallbacků.

**Proč:**  
Zlepší to UX a pomůže uživateli rychle identifikovat jednotlivé weby.

**Jak:**
- V dashboardu se seznamem webů:
  - pro každý web zobraz:
    - faviconu z `faviconUrl` (pokud `faviconStatus = "success"`),
    - fallback (placeholder) pokud `pending` nebo `failed`.
- V detailu webu:
  - zobraz větší screenshot z `screenshotUrl`,
  - pokud `pending` → skeleton/placeholder,
  - pokud `failed` → fallback (např. jen barevný blok + favicon).
- Volitelně zobraz i statusy (pro debug/administraci), ale v produkčním UI je můžeš skrýt nebo zjednodušit.

---

## Milník 6: Příprava na budoucí přechod na bucket

### 6.1 Návrh `S3AssetStorage` (bez nutné implementace v MVP)

**Cíl:**  
Mít jasný návrh, jak bude vypadat S3 (nebo jiná cloud) implementace, aby při pozdějším přechodu nevznikaly nejasnosti.

**Proč:**  
Už při návrhu struktury cest a konfigurace chceme zohlednit, že jednou budeme ukládat do S3/GCS a distribuovat přes CDN.

**Jak:**
- Navrhni třídu `S3AssetStorage`, která také implementuje `AssetStorage`:
  - `saveFile(path, binary, contentType)`:
    - uloží do S3 bucketu s klíčem `path`,
    - vrátí `ASSET_PUBLIC_BASE_URL + "/" + path`.
- Konfigurační proměnné pro budoucnost:
  - `ASSET_S3_BUCKET`,
  - `ASSET_S3_REGION`,
  - `ASSET_PUBLIC_BASE_URL=https://cdn.myproduct.com`.
- Zdokumentuj v `screenshots.md`, že přechod na S3 znamená:
  - změnit `ASSET_STORAGE_DRIVER` z `local` na `s3`,
  - (případně) jednorázově zmigrovat existující soubory z lokálního disku do bucketu.

---

## Podmínky dokončení a předání jednotlivých úseků

Pro každý výše uvedený milník (nebo logicky uzavřený celek úkolů) platí následující pravidla pro dokončení a předání:

1. **Build a testy:**
   - Po dokončení práce vždy spusť relevantní build/test příkazy (např. `npm run build`, `npm test`, `make test` – podle toho, co projekt používá).
   - Pokračuj dál až ve chvíli, kdy build a testy proběhnou bez chyb.
2. **Ověření funkčnosti:**
   - Ověř prakticky, že úsek funguje:
     - pro storage: soubor se uloží na správnou cestu a URL je použitelná,
     - pro joby: job se vytvoří a worker ho zpracuje,
     - pro UI: favicony a screenshoty se zobrazují podle statusů.
3. **Commit:**
   - Teprve po úspěšném buildu a základním ověření funkčnosti proveď commit,
   - commit zprávu piš ve formátu Conventional Commits (např. `feat: add local asset storage`).
4. **Označení úseku za splněný:**
   - V související dokumentaci / task managementu označ milník jako „done“ až po:
     - úspěšném buildu,
     - základním ověření bezchybnosti,
     - a provedení commitu.

Tím je zajištěno, že každý předaný úsek je stabilní, otestovaný a připravený pro navazující práci dalších vývojářů.

---

## Seznam issues / tasks pro task manager

Tento seznam je připravený pro přepis do nástroje jako Linear, Jira nebo GitHub Issues. Každý task má název, stručný popis a základní kritéria „hotovo“.

- [x] **Issue 1: Definice rozhraní `AssetStorage`**
  - **Typ:** `feat`
  - **Cíl:** Přidat do backendu interface `AssetStorage` pro práci s assety (favicony, screenshoty).
  - **Popis:**
    - Vytvořit modul/složku pro storage.
    - Definovat interface `AssetStorage` s metodami `saveFile`, `getFile`, `deleteFile`, `getPublicUrl`.
    - Zdokumentovat účel interface ve `screenshots.md` (krátká zmínka už existuje, jen ji sladit s implementací).
  - **Hotovo když:**
    - Backend se zbuildí bez chyb.
    - Lze `AssetStorage` importovat z jednoho centrálního místa.
    - Neexistují žádné přímé závislosti na konkrétním filesystem API v novém kódu (mimo implementace storage).

- [x] **Issue 2: Implementace `LocalAssetStorage` (MVP)**
  - **Typ:** `feat`
  - **Cíl:** Implementovat lokální storage pro favicony a screenshoty, ukládající do `./storage/website-assets`.
  - **Popis:**
    - Implementovat třídu `LocalAssetStorage` podle interface `AssetStorage`.
    - Využít konfigurační proměnné `ASSET_STORAGE_LOCAL_PATH` a `ASSET_PUBLIC_BASE_URL`.
    - Zajistit vytváření podadresářů `projects/{projectId}/...`.
    - Otestovat zápis a čtení souboru na disk (manuálně nebo jednoduchým testem).
  - **Hotovo když:**
    - `saveFile` uloží testovací soubor a vrátí použitelnou public URL.
    - `getPublicUrl` vrací správně složenou URL.
    - Build i testy projdou bez chyb.

- [x] **Issue 3: Registrace storage driveru (konfigurace)**
  - **Typ:** `feat`
  - **Cíl:** Přidat konfiguraci pro výběr storage driveru (`local` / budoucí `s3`) a DI registraci služby.
  - **Popis:**
    - Přidat proměnné: `ASSET_STORAGE_DRIVER`, `ASSET_STORAGE_LOCAL_PATH`, `ASSET_PUBLIC_BASE_URL`.
    - Vytvořit factory/service v NestJS, která podle `ASSET_STORAGE_DRIVER` vrátí `LocalAssetStorage`.
    - Ujistit se, že ostatní moduly budou injektovat pouze abstrakci `AssetStorage`.
  - **Hotovo když:**
    - Při nastavení `ASSET_STORAGE_DRIVER=local` se API spustí a storage lze použít.
    - Build projde bez chyb.

- [x] **Issue 4: Rozšíření DB schématu pro favicony a screenshoty**
  - **Typ:** `feat`
  - **Cíl:** Přidat do tabulky `webs` (nebo ekvivalentu) pole pro favicony a screenshoty.
  - **Popis:**
    - Upravit Prisma/ORM schéma: přidat `faviconUrl`, `faviconStatus`, `faviconSourceUrl`, `faviconLastFetchedAt`, `screenshotUrl`, `screenshotStatus`, `screenshotLastGeneratedAt` (+ případně `screenshotWidth`, `screenshotHeight`).
    - Vytvořit a spustit migraci.
  - **Hotovo když:**
    - `prisma migrate` (nebo ekvivalent) proběhne bez chyb.
    - Aplikace po migraci běží a umí vytvořit nový web s defaultními hodnotami.

- [x] **Issue 5: Úprava API modelů pro web (DTOs)**
  - **Typ:** `feat`
  - **Cíl:** Zahrnout informace o faviconě a screenshotu do API odpovědí (seznam webů, detail webu).
  - **Popis:**
    - Rozšířit `WebDto` (a podobné DTOs) o nová pole.
    - Aktualizovat mapování entity → DTO v service vrstvě.
    - Ověřit, že `GET /webs` a `GET /webs/:id` vrací nová pole.
  - **Hotovo když:**
    - API odpovědi obsahují `faviconUrl`, `faviconStatus`, `screenshotUrl`, `screenshotStatus`.
    - Build a základní API testy proběhnou bez chyb.

- [x] **Issue 6: Job `FetchFaviconJob` – definice a enqueue při onboardingu**
  - **Typ:** `feat`
  - **Cíl:** Definovat job `FetchFaviconJob` a spouštět ho při vytvoření webu.
  - **Popis:**
    - V queue vrstvě přidat nový typ jobu `FetchFaviconJob`.
    - V onboading flow (po vytvoření webu) nastavit `faviconStatus="pending"` a enqueue job s `webId`.
    - Zalogovat do konzole/monitoringu, že job byl vytvořen (pro debug).
  - **Hotovo když:**
    - Po vytvoření webu se v queue objeví job `FetchFaviconJob`.
    - Aplikace běží a build/testy projdou.

- [x] **Issue 7: Worker pro `FetchFaviconJob` – získání a uložení favicony**
  - **Typ:** `feat`
  - **Cíl:** Implementovat logiku workeru pro stažení a uložení favicony.
  - **Popis:**
    - V worker aplikaci přidat procesor fronty `favicon_fetch`.
    - Implementovat:
      - načtení webu z DB,
      - stažení HTML homepage (případně použití `PageFetcher`),
      - parsování `<link rel="icon">` a výběr nejlepší favicony,
      - stažení favicony,
      - uložení favicony (jedna nebo více velikostí) přes `AssetStorage`,
      - update DB (`faviconUrl`, `faviconStatus`, `faviconSourceUrl`, `faviconLastFetchedAt`).
  - **Hotovo když:**
    - Job proběhne úspěšně pro reálný testovací web.
    - V DB se objeví `faviconUrl` a `faviconStatus="success"`.

- [x] **Issue 8: Retry a fallback pro favicony**
  - **Typ:** `feat`
  - **Cíl:** Přidat retry logiku a fallback faviconu, pokud se faviconu nepodaří získat.
  - **Popis:**
    - Nastavit max. počet pokusů jobu (např. 3) a backoff.
    - Při definitivním selhání nastavit `faviconStatus="failed"`.
    - Volitelně: generovat fallback faviconu (písmeno + barva) a uložit ji jako `faviconUrl`.
  - **Hotovo když:**
    - Při záměrně neexistující faviconě systém nespadne a správně nastaví `failed` nebo použije fallback.

- [x] **Issue 9: Job `GenerateHomepageScreenshotJob` – definice a enqueue**
  - **Typ:** `feat`
  - **Cíl:** Definovat job `GenerateHomepageScreenshotJob` a spouštět ho při vytvoření webu.
  - **Popis:**
    - Přidat nový job typ `GenerateHomepageScreenshotJob`.
    - V onboading flow po vytvoření webu nastavit `screenshotStatus="pending"` a enqueue job s `webId`.
  - **Hotovo když:**
    - Po vytvoření webu se v queue objeví job `GenerateHomepageScreenshotJob`.

- [x] **Issue 10: Rendering služba – základ pro screenshoty**
  - **Typ:** `feat`
  - **Cíl:** Vytvořit základ `RenderingService` pro generování screenshotů.
  - **Popis:**
    - Přidat modul/službu s metodou `renderScreenshot(url, options)`.
    - Použít Playwright/Puppeteer pro otevření stránky a vytvoření screenshotu.
    - Otestovat manuálně na jedné URL.
  - **Hotovo když:**
    - Lokální script/worker umí vygenerovat screenshot testovací stránky a uložit ho na disk.

- [x] **Issue 11: Worker pro screenshoty – uložení přes `AssetStorage`**
  - **Typ:** `feat`
  - **Cíl:** Implementovat worker, který zpracuje job `GenerateHomepageScreenshotJob`, volá rendering službu a ukládá screenshot.
  - **Popis:**
    - Přidat procesor pro frontu `screenshot_generate`.
    - Implementovat:
      - načtení webu z DB,
      - získání URL,
      - volání `RenderingService.renderScreenshot`,
      - uložení výsledku přes `AssetStorage` na `projects/{projectId}/screenshot-home-1280x720.jpg`,
      - update DB (`screenshotUrl`, `screenshotStatus`, `screenshotLastGeneratedAt`).
  - **Hotovo když:**
    - Pro testovací web vznikne screenshot a `screenshotUrl` je platná.

- [x] **Issue 12: Scheduler a ruční refresh screenshotu**
  - **Typ:** `feat`
  - **Cíl:** Umožnit pravidelný refresh screenshotu a ruční spuštění z UI.
  - **Popis:**
    - Vytvořit scheduler (cron/NestJS Scheduler), který jednou denně najde weby se starým screenshotem a enqueue job.
    - Přidat endpoint/akci „Refresh screenshot“, která enqueue job pro konkrétní web.
  - **Hotovo když:**
    - Scheduler se spouští bez chyb (lze ověřit v logu).
    - Ruční refresh vytvoří nový job a zaktualizuje screenshot.

- [x] **Issue 13: Integrace s onboardingem (favicony + screenshoty)**
  - **Typ:** `feat`
  - **Cíl:** Propojit vytvoření webu s automatickým startem favicon a screenshot jobů.
  - **Popis:**
    - V logice vytváření webu zajistit nastavování statusů (`pending`) a enqueue obou jobů.
    - Ošetřit případné edge cases (např. opakované vytvoření, chyby v queue).
  - **Hotovo když:**
    - Při standardním onboarding flow oba joby vzniknou a po chvíli se v UI objeví favicon a screenshot.

- [x] **Issue 14: Úprava UI (dashboard + detail webu)**
  - **Typ:** `feat`
  - **Cíl:** Zobrazit favicony a screenshoty na frontend dashboards/detailech.
  - **Popis:**
    - Na dashboardu vedle názvu webu zobrazit faviconu z `faviconUrl`, fallback pro `pending/failed`.
    - Na detailu webu zobrazit screenshot (nebo placeholder podle stavu).
    - Otestovat různé stavy (`pending`, `success`, `failed`).
  - **Hotovo když:**
    - UI správně reaguje na změny statusů a zobrazuje očekávané náhledy.

- [x] **Issue 15: Návrh `S3AssetStorage` a dokumentace přechodu**
  - **Typ:** `chore` / `docs`
  - **Cíl:** Připravit návrh S3 implementace a zdokumentovat kroky pro budoucí migraci.
  - **Popis:**
    - Vytvořit kostru třídy `S3AssetStorage` (bez plné implementace).
    - Dopsat do `screenshots.md` (část „Přechod na bucket“) konkrétní kroky pro migraci a přepnutí driveru.
  - **Hotovo když:**
    - Kód kompiluje i s kostrou `S3AssetStorage`.
    - Dokumentace jasně popisuje, co změnit při přechodu na bucket.

---

## Stav implementace k 17. listopadu 2025

- `AssetStorage` rozhraní + `LocalAssetStorage` jsou sdílené v balíčku `libs/storage`. API používá `AssetStorageModule`, který čte env proměnné (`ASSET_STORAGE_DRIVER`, `ASSET_STORAGE_LOCAL_PATH`, `ASSET_PUBLIC_BASE_URL`) a zároveň zveřejňuje lokální soubory přes Express route `/assets/*`.
- Worker (`apps/worker`) má nové služby `services/favicon.ts` (cheerio + sharp + fallback SVG) a `services/rendering-service.ts` (Playwright). Fronty `fetch-favicon` a `generate-screenshot` běží přes BullMQ + nové job typy v `libs/queue-types`.
- Databázová entita `Web` obsahuje pole `faviconUrl`, `faviconStatus`, `screenshotUrl`, `screenshotStatus`, `...Last*At`, `screenshotWidth/Height`. API rozšiřuje DTO/overview o tyto údaje a přidává endpointy `POST /webs/:id/refresh-favicon` a `POST /webs/:id/refresh-screenshot`.
- Frontend dashboard zobrazuje faviconu a screenshot (včetně stavů `pending/success/failed`), má tlačítka pro ruční refresh a placeholders při čekání nebo selhání.
- Cron `AssetRefreshService` (`@nestjs/schedule`) denně prochází weby starší než `SCREENSHOT_REFRESH_DAYS` (defaultně 14 dní) a znovu enqueuje screenshot joby.
- Kostra `S3AssetStorage` je připravená, takže stačí doplnit upload do S3 a přepnout `ASSET_STORAGE_DRIVER=s3`. Dokumentace výše popisuje migrační kroky.
