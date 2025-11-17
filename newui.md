# Nové UI pro admin /dashboard

Tento dokument popisuje plán, jak z integrovaných Metronic šablon v `templates/` postavit jednotné admin UI:

- Globální dashboard pro všechny projekty: `/dashboard`
- Per‑project dashboard: `/dashboard/<slug>`
- Nastavení projektu: `/dashboard/<slug>/settings`

Vše za `/dashboard` zůstane chráněno přes existující auth.

## 0. Informační architektura a způsob práce

- Cílové URL:
  - `/dashboard` – globální přehled napříč všemi weby/projekty.
  - `/dashboard/<web-app-slug>` – prostor pro konkrétní projekt (dashboard + další stránky).
  - `/dashboard/<web-app-slug>/settings` – nastavení konkrétního projektu.
- Pracujeme inkrementálně:
  - malý krok → commit (úprava šablony / routy / assets),
  - průběžně ověřujeme, že `/dashboard` funguje vizuálně i po stránce JS (theme, sidebar, základní interakce).

## 1. Základní layout z `templates/index.html`

Použijeme `templates/index.html` jako výchozí šablonu pro `/dashboard`. **Aktuální stav:** `/dashboard` nyní renderuje Metronic demo 1:1 (včetně kompletního HTML, stylů i skriptů) bez jakýchkoli úprav obsahu; čekáme na další pokyny před začátkem customizace.

### 1.1 Identifikace společných částí

V `index.html` najdeme a oddělíme tyto bloky:

- **Header container**
  - zůstane napříč všemi admin stránkami stejný,
  - ponese odkazy na weby/projekty (dnes jsou projekty reprezentovány spíše v levém sidebaru),
  - obsahuje logo, hlavní horní navigaci, případně přepínač mezi projekty/workspaces.
- **Sidebar**
  - bude mít menu sdružené pro celý produkt (ne jen demo „Chartmix“),
  - položky: globální dashboard, projekty, případně další sekce (např. Billing, Account, …).
- **Footer**
  - společný pro všechny admin stránky,
  - obsahuje copyright, odkazy, případně verzi aplikace.
- **Content**
  - označená oblast, kde se mění obsah podle konkrétní stránky (overview, konkrétní projekt, nastavení).

### 1.2 Rozpad na layout + partialy (konceptuálně)

Bez ohledu na konkrétní templating engine budeme mířit na strukturu:

- `layout` (např. `base.html` / `layout.html`)
  - obsahuje `<html>`, `<head>` (link na CSS/JS bundly), `Header`, `Sidebar`, `Footer`,
  - uvnitř definuje „content block“ pro dynamický obsah.
- `partials/header.html` – výřez headeru z `index.html`.
- `partials/sidebar.html` – výřez sidebaru z `index.html`.
- `partials/footer.html` – výřez footeru z `index.html`.
- Konkrétní stránky (`/dashboard`, `/dashboard/<slug>`, `/dashboard/<slug>/settings`) budou vkládat obsah do content bloku.

> V této fázi ještě neřešíme napojení na data, pouze přenesení a sladění struktury HTML.

## 2. Assets a skripty (funkční Metronic chování)

Chceme, aby `/dashboard` fungovalo podobně jako původní Metronic demo – tzn. téma, sidebar, dropdowny, widgety, grafy atd.

### 2.1 Umístění assets

- Rozhodneme, kde budou žít Metronic assets v rámci projektu:
  - buď ponechat v `templates/assets`,
  - nebo je přesunout do standardního statického adresáře (např. `static/assets` podle backendu).
- Podle zvolené varianty upravíme v HTML:
  - cesty v `<link>` a `<script>`,
  - případné `<base href="...">`, aby odkazy na `assets/...` fungovaly korektně.

### 2.2 Načtení CSS/JS pro `/dashboard`

Na globálním layoutu zajistíme načtení:

- CSS:
  - `assets/plugins/global/plugins.bundle.css`
  - `assets/css/style.bundle.css`
- JS:
  - globální scripts bundle (např. `assets/js/scripts.bundle.js`),
  - layout skripty: `src/js/layout/theme-mode.js`, `layout.js`, `sidebar-panel.js`, apod. (přes již buildnuté bundly),
  - případné custom skripty z `src/js/custom/*`, které daná stránka využívá.

### 2.3 Kontrola základního chování

Na čistém `/dashboard` (zatím statický obsah) ověříme, že:

- funguje přepínání theme (light/dark),
- sidebar se otevírá/zavírá,
- dropdowny, modaly a další základní UI prvky reagují,
- grafy/komponenty použité na dashboardu se inicializují se statickými daty (tak jak v demu).

## 3. `/dashboard` jako globální overview

Vytvoříme naši vlastní šablonu globálního dashboardu.

### 3.1 Nová šablona pro globální dashboard

- Vytvořit např. `templates/dashboard/index.html`:
  - start bude copy/paste content části z `templates/index.html`,
  - texty a headingy přepíšeme na náš domain:
    - např. „SEO Overview“, „Articles in queue“, „WordPress Sites“, „Daily Generation Status“, apod.
  - metriky a hodnoty zůstanou statické (placeholdery) – data napojíme později.

### 3.2 Routing pro `/dashboard`

- Přidáme route `/dashboard`:
  - route je chráněná přes auth (stejně jako ostatní interní admin části),
  - renderuje základní layout + náš content (globální overview).

### 3.3 Header – příprava na přepínání projektů

- V headeru vytvoříme prostor pro:
  - seznam projektů (např. dropdown s výběrem webu/projektu),
  - přepínání mezi jednotlivými workspaces/projekty (zatím statické položky).

## 4. `/dashboard/<slug>` – per‑project dashboard

Per‑project dashboard reprezentuje konkrétní web/web app.

### 4.1 Návrh obsahu

- Hlavní prvky per‑project dashboardu:
  - název projektu/webu (např. `<slug>` + friendly name),
  - panely pro SEO strategii (pillars, topic clusters, keyword sets),
  - fronta článků (nově vygenerované, čekající na schválení, publikované),
  - stav WordPress připojení a poslední synchronizace,
  - poslední generované články a jejich stav (Draft/Published).

### 4.2 Šablona per‑project dashboardu

- Vytvořit např. `templates/dashboard/project.html`:
  - jako základ použijeme obsah z `templates/apps/projects/project.html` (layout, tabs, activity),
  - přepíšeme texty a bloky na náš domain (SEO, obsah, WordPress, články).

### 4.3 Routing pro `/dashboard/<slug>`

- Přidáme route `/dashboard/<slug>`:
  - přijímá `slug` (zatím klidně staticky „demo-site“),
  - renderuje stejný layout (sdílený header/sidebar/footer),
  - injectuje per‑project content.
- V sidebaru:
  - přidáme položku „Projects“ → pod ní odkaz na konkrétní projekt (v první verzi klidně jen jeden statický odkaz),
  - později nahradíme statiku dynamickým seznamem projektů.

## 5. `/dashboard/<slug>/settings` – nastavení projektu

### 5.1 Výchozí šablona

- Inspirovat se v:
  - `templates/account/settings.html`,
  - případně `billing.html`, `security.html` pro strukturu formulářů a tabs.
- Vytvořit `templates/dashboard/settings.html`:
  - sekce pro:
    - URL webu,
    - název projektu,
    - jazyk / market,
    - WordPress připojení (URL, API key – pouze UI),
    - publikační plán (frekvence, čas),
  - zatím čistě statický formulář (bez napojení na backend).

### 5.2 Routing pro `/dashboard/<slug>/settings`

- Přidat route `/dashboard/<slug>/settings`:
  - chráněná auth,
  - používá stejný layout (header, sidebar, footer),
  - v content bloku renderuje nastavení projektu.
- Sidebar / per‑project navigace:
  - přidat položku „Settings“,
  - aktivní stav menu podle aktuální URL.

## 6. Konsolidace UI a dokumentace

### 6.1 Konsolidace layoutu

- Ujistíme se, že:
  - `Header container` je definovaný jen na jednom místě (layout / partial),
  - `Sidebar` je jednotný a sdílený,
  - `Footer` je jednotný a sdílený,
  - `/dashboard`, `/dashboard/<slug>` a `/dashboard/<slug>/settings` používají stejný layout a liší se pouze „content“ částí.

### 6.2 Navigace mezi projekty

- V headeru:
  - dokončit strukturu pro přepínání mezi projekty (dropdown / přehled workspace),
  - zatím klidně statický seznam, později napojený na backend.

### 6.3 Dokumentace

- Aktualizovat:
  - `implementation_plan.md` – doplnit část o novém admin UI a routách,
  - `README.md` – stručně popsat, kde je UI pro `/dashboard`, jak se servírují assets a jaké jsou základní routy.

Tento dokument budeme průběžně upravovat podle toho, jak budeme nové UI na branchi `ui` implementovat.
