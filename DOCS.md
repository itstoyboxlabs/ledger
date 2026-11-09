# Ledger documentation

Ledger is a financial planning app that runs on your own statements. This file documents every page, every
tool, the shared systems and the product decisions behind them. Read it before changing the app.

For how the code is organized, see [CODING_PATTERNS.md](CODING_PATTERNS.md). For how to send a change,
see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Architecture

- **Stack**: Vite, React, TypeScript-ready (`allowJs`, so files move over one at a time), Tailwind v4,
  shadcn/ui, Recharts and Zustand. All of it lives in `app/`.
- **One project, three routes**: the landing page (`/`) and the tutorial (`/tutorial`) are part of the same React
  project as the app. They live in `app/src/screens/marketing` and are prerendered to HTML at build time
  (`npm run build` runs `scripts/prerender.mjs` after Vite). The app itself is a single-page app at `/app`.
- **Code layout**: one thing per file. Each page lives in `app/src/screens/<page>` (spending, about-you, budget, log,
  tools, retirement, balances). Anything several pages use lives in `app/src/shared` (components, hooks, state,
  utils, constants). A feature never imports from another feature. `App.jsx` is only the shell: the sidebar, the
  page header and which page shows. Pages load lazily.
- **Storage adapter**: pages never call `fetch('/api/...')` directly. They call the storage functions in
  `app/src/shared/utils` (`getBudget`, `saveBudget`, `getLog`, `saveLog`, `getNotes`, `saveNotes`, `getPresets`,
  `savePresets`, `getData`, `setData`). The current mode lives in `shared/state/storageModeStore.js`.
- **Two run modes**:
  - **Local mode** reads and writes plain files. The dev server (`npm run dev`) has small middleware endpoints in
    `app/vite.config.js`: `/api/budget`, `/api/notes`, `/api/presets` and `/api/log` (read and write) and
    `/api/transactions` (read only).
  - **Browser mode** keeps everything in IndexedDB with no server. It is what the hosted site uses. Test it
    locally with `npm run dev -- --mode browser`, which skips the file endpoints.
  - On startup `main.jsx` asks `detectMode()`. If `/api/budget` answers with JSON the app is in local mode,
    otherwise browser mode. There is no setting for it.
  - On the dev server in local mode, `/` opens the app directly. Everywhere else `/` is the landing page.
- **Data folder**: local mode reads from the `data/` folder next to `app/`. Set `LEDGER_DATA_DIR` in the
  environment or in `app/.env.local` to keep the files somewhere else. A leading `~` means your home folder. The
  folder is created on the first save. `data/` and `statements/` are ignored by git on purpose.
- **Changing `vite.config.js`** needs a dev server restart.
- **Statements data** (accounts, merchants, periods, subscriptions, transactions) lives in the Zustand
  `dataStore` (`shared/state/dataStore.js`). `applyData()` fills it before the first render. Code reads it with
  functions such as `getAllTxns()`, `getAccounts()`, `getMonths()`, `getPeriods()`, `getSubscriptions()`,
  `getMerchants()` and `getLastCompleteMonth()`. There are no live bindings. The app is keyed on a version counter
  that goes up after an import, so everything redraws.
- **Persisted UI state** lives in Zustand stores (`shared/state/persistedStore.js`) behind `usePersistedState`. Saved
  data (budget, log, notes, presets) is loaded and saved through the storage adapter.
- **Fake data**: `app/public/sample-data.json` is the demo and test data. Real data is never imported by the code
  and never used in tests.
  The sample carries a full `settings` block, so loading it fills every page: Budget rows (including a Car loan and
  a Student loan row) with a leftover plan, three Budget presets (`Today`, `Leaner (easier job)`, `Retirement`),
  Log entries, kept notes, and `local` keys for Balances (`ledger:debts` linked to the loan rows, `ledger:assets` in the
  savings and 401k pools, planning-variables presets), the Retirement plan, portfolio, presets and the Budget preset
  it follows (`ledger:retireNeedPreset`), plus Rent scenarios, Vacation, Debt payoff and two lists.
  Uploading a real file after trying the sample replaces all of it, settings included (see Import and export).
  - **The story it tells**: a 25 year old (About you birth date 05-14-2001, which is 25 on the Balances date of 2026-10-31, Single, Texas) with a corporate job until 40, then an
    easier, lower paying job until retiring at 62. It shows the pay plan end to end: one Budget preset and one
    Take-home preset per phase of life, picked by age on Retirement.
  - **Take-home pay**: three presets (key `takeHome`, ids `th-corporate`, `th-easier`, `th-parttime`): `Corporate
    job` ($105,000, 6% 401k with a 50% match, $150 a month health insurance), `Easier job` ($62,000, 0% 401k, no
    match) and `Part-time` ($30,000, 0% 401k). The tool itself (`ledger:takeHome`) matches Corporate job, so that
    preset shows as active. The Budget takes its income from the tool (`ledger:budgetIncomeOverride` is
    `{ active: true }`): $6,376 a month, so each period's Take-home preset also sets the income its Budget preset
    saves from.
  - **Budget presets** have ids (`bp-today`, `bp-leaner`, `bp-retirement`). With the live subscriptions, Today is
    $3,654 a month, Leaner (easier job) $2,949 and Retirement $4,174. Leaner is affordable on the Easier job's
    $4,213 a month, so its Auto savings stay positive.
  - **Retirement plan** (`retireCalc.pay`): `Corporate job` from 25 until 40 (Take-home preset Corporate job, Budget
    preset Today, growing 3% a year: $9,450 into the 401k and $19,602 into savings a year to start) and
    `Easier job` from 40 until you retire (Easier job and Leaner (easier job), 0% growth: nothing into the 401k and
    $9,098 into savings). Retire at 62, Need per month follows the Retirement preset, Current age is on Auto. Events
    are a $300 a month Roth IRA from 25 for 15 years, replacing the car at 40 and a family gift at 50. The
    Retirement presets (retire at 62, 58 and 67) carry the same plan.
  - **Returns are conservative** on purpose, since the model has no inflation input: an index fund at 4.6% and
    bonds at 2.5%, 70/30 while working (3.97% a year) and 30/70 after retiring (3.13%). The headline reads about
    $2.57M at 62 and money lasts to the plan-to age of 95 with plenty left over.
  - **Balances** fit a 25 year old: $25,200 owed (car loan, student loan, credit card) and $48,700 owned, of which
    $28,200 is savings, so the starting savings stay positive after debts ($3,000).
  - Statements, Budget rows and the leftover split are unchanged.
  Browser tests use `app/e2e/lean-settings.json` (the sample's settings before this was added)
  unless a test passes `openApp(page, { rich: true })`, so most specs still start from a bare plan.
- **Tests**: Vitest unit tests sit beside each source file (`npm run test:unit`). Playwright browser tests live in
  `app/e2e` and click through every page with fake data in a throwaway browser (`npm run test:e2e`). See
  `app/e2e/README.md`. `npm test` runs both.

### Data files

All files are plain JSON except where noted.

- `transactions.json`: `{ version, updated, accounts, merchants, periods, subscriptions, transactions }`.
  - `accounts` is `{ <id>: { name, bank, type, last4 } }` where type is `checking`, `savings` or `card`. Older files
    stored a plain label per id. `normalizeAccounts` upgrades that on load.
  - Account labels and coverage checks use `ACCOUNTS[id].type` and `.name`, never the ids.
  - A card payment is a `kind: 'transfer'` row.
  - `periods` holds the opening and closing dates of each statement. It drives the coverage system.
  - `subscriptions` is the list of recurring charges, each with `lastSeen` and a billing day.
  - `merchants` maps a merchant name to a website domain, used for icons. It is optional: on the hosted site a
    merchant without a domain can still match the logo catalog by name.
- `budget.json`: the Budget plan (rows, `dismissedSubs`, `leftover`).
- `log.json`: Log entries.
- `notes.json`: notes (not shown in the app, kept so they survive an export).
- `presets.json`: named presets, keyed by page or tool.

### Import and export

- **One file.** `ledger-data.json` holds everything, in the shape of `app/public/sample-data.json`:
  `{ version, exportedAt, updated, notes, accounts, merchants, periods, subscriptions, transactions, settings }`.
  An AI assistant makes the statements part from the user's statements using `IMPORT_PROMPT.md`. A first file has
  no `exportedAt` or `settings`, and the app starts the settings from defaults. "Export data" (`buildExport`,
  `downloadExport`) writes the whole file: the statements as stored (`statementsPart` keeps `updated` and the
  top-level `notes`) plus `settings: { budget, notes, presets, log, local }`, where `local` is every `ledger:`
  localStorage key. In local mode it reads `data/transactions.json`, `budget.json`, `notes.json`, `presets.json` and
  `log.json` through the dev server API and writes the same one file. Uploading an export replaces everything with
  exactly what was exported, so an export, clear and upload gives back the same data.
- **Monthly update.** The user exports, gives that `ledger-data.json` and the new statements to their assistant,
  and uploads what it gives back. The prompt tells the assistant to keep every id, account, period and subscription
  and to copy `settings`, `version` and `exportedAt` back byte for byte.
- **Upload replaces.** The upload result replaces what the browser stores (`importDataFile`); nothing merges into
  what was stored before. A file replaces the parts it contains:
  - A full file (statements and `settings`) wipes everything first (`clearStoredData('all')`: statements, budget,
    log, notes, presets and every `ledger:` localStorage key), then writes the file.
  - A statements-only file (a first file, or one from before settings moved into it) replaces the statements and
    keeps the settings (`clearStoredData('statements')`).
  - A settings-only file (an old version 1 `ledger-settings.json` backup) replaces the settings and keeps the
    statements (`clearStoredData('settings')`).
  - Over the sample, any file wipes everything first, so nothing from the sample survives. Loading the sample sets
    an IndexedDB `sample` mark that `clearStoredData('all')` removes.
  Picking several files at once still works for old two-file backups: `combineDataFiles` joins them first
  (transactions by id with the later file winning and a repeated `statement` replacing its old rows whole,
  accounts, merchants and periods by key, subscriptions by name, settings sections from a settings-only file over
  those in a data file). Import runs in browser mode only. Local mode never imports through the app: an assistant
  writes `data/` directly and keeps every existing id (see CLAUDE.md). If you change the data format, change
  `IMPORT_PROMPT.md` too and run `python3 scripts/build-import-prompt.py`.
- **What survives.** Anything that must outlive the browser, or be visible to an assistant during a refresh, goes
  through these files and not through localStorage.
- **Merchant icons.** `MerchantIcon` asks `faviconUrl(name)` for a logo and shows the first letter when there is
  none or the image fails to load.
  - **Local mode**: icons are served from `app/public/icons/<domain>.png`, using the domain in the `merchants` map.
    `scripts/fetch-icons.sh` downloads them, follows redirects and checks that each file is a real image. The
    folder is gitignored because it reflects one person's merchants.
  - **Browser mode (the hosted site)**: icons come from a shared catalog of common merchants in a public
    Supabase Storage bucket (`ledger-public`), at `ICON_BASE_URL` (`.../icons/<domain>.png` plus `.../icons/index.json`). `useIconCatalog`
    asks for the index once, when the browser is idle after the first paint (`requestIconCatalog`,
    `loadIconCatalog`), caches it in sessionStorage and keeps it in `iconCatalogStore`. Failures are silent and
    leave the letters. The index is `{ domains, names }`. `catalogDomainFor` matches a merchant first by its
    `merchants` domain, then by its name normalized with `normalizeMerchantName` (lowercase, no punctuation,
    digits, card processor prefixes like `SQ *` or filler like "inc" and "com"), trying the full name and then
    shorter leading word groups: "Uber Eats Delivery" tries "uber eats delivery", "uber eats", "uber". The index
    request is identical for every visitor, so it reveals nothing about anyone's merchants. The logo requests go
    only to the project's own storage bucket. No other third-party service is ever contacted. CSP: `img-src` and `connect-src` allow
    the Supabase storage host.
  - **The catalog** is built from `app/scripts/icon-domains.txt`, one merchant per line as
    `Brand name | domain | alias, alias`. It is public and hand-written, never derived from anyone's data. The
    import prompt links to it so an assistant can use the exact brand names. To change it, from `app/`:
    1. edit `scripts/icon-domains.txt`;
    2. `node scripts/build-icon-catalog.mjs` downloads a 64px favicon per domain (the same Google favicon service
       as `fetch-icons.sh`, 8 at a time), skips failures, the service's default globe and icons under 16px, converts
       other formats to PNG with macOS `sips`, keeps each file under 6 KB, and writes `app/.icon-catalog/`
       (gitignored) with `<domain>.png` files and `index.json`. It skips logos it already has. Name keys that are
       everyday words ("rent", "budget", "acme") are left out of `names` so they never pick up a brand's logo;
    3. `npm run icons` uploads every logo to `icons/<domain>.png` and `icons/index.json` in the bucket (30 day
       cache). It needs `SUPABASE_SERVICE_ROLE_KEY` in the environment (kept outside the repo, never printed).
       `npm run videos` does the same for the tutorial videos in `videos/`.

---

## Design system

The whole app follows one look: deep navy page, left sidebar, glass cards.

- **Tokens** live in `app/src/styles/tokens.css` (`--page`, `--sidebar`, `--surface-1/2/3`, `--accent`,
  `--accent-soft`, `--good`, `--bad`, category colors). `theme.css` maps them to Tailwind, `base.css` has resets
  and scrollbars, and `index.css` imports the three. Never hard-code a hex in JSX. Popovers, menus and modals
  use `--surface-3`.
- **Theme**: dark only. Category colors are fixed per category (`CATEGORY_HEX`) and never reshuffled by value.
- **Cards**: `Card` is the shadcn Card plus the `.card` surface class (a top-lit gradient and a hairline). Active
  pills and tabs use `--accent-soft`. Primary buttons use solid `--accent`.
- **Labels** are sentence case, never uppercase (table heads, field labels, KPI labels).
- **Icons**: `Icon` draws lucide-style paths from `ICON_PATHS`. No emoji. Remove and delete glyphs are the
  lucide `X`, never a typed character.
- **Money**: shown with `fmt` or `fmt0`. Negative and over-budget amounts are red, good ones green. Prefer words
  ("$300 over budget") to signs.
- **Controls share one radius**, `rounded-lg`. Cards and menus are rounder on purpose.

### shadcn/ui rule

Every control comes from the library. No hand-rolled button, input, textarea, menu, tab or modal. Components
live in `app/src/shared/ui/primitives/`: avatar, badge, breadcrumb, button, button-group, card, checkbox, command,
dialog, dropdown-menu, input, label, popover, progress, select, separator, sheet, table, tabs, textarea, toggle
and tooltip. `cn()` is in `src/shared/utils/cn.js` and `@/` points at `src/`. Their color names are mapped onto the
app tokens in the `@theme inline` block. Because the app already uses `--accent` (brand) and `--ring`
(hairline), shadcn's hover fill and field border use `--ui-hover` and `--ui-input`. `<html class="dark">` is set
so `dark:` variants apply.

- `Button` uses stock variants and sizes plus one app variant, `soft` (the "on" state of a nav item or the
  selected preset). Toolbar actions are `variant="outline" size="sm"`. Do not invent pill or chip variants. A
  custom chip variant made the toolbar look hand-made.
- On and off controls are `Toggle variant="outline" size="sm"`.
- `Input` is boxed by default. `variant="inline"` is the table cell editor: no box until hover or focus.
  `DraftNumberInput` is inline unless `boxed`. Boxed number fields hide the native spinner (`no-native-spin`) and
  show `Stepper` chevrons on hover and focus.
- `Modal` wraps Dialog and renders a real `DialogHeader` (title, description, optional action).
- `Dropdown` and the presets menu are DropdownMenus. Table columns sort from their headers (`SortHead`).
  Spending tabs and the add-row switch are `Tabs`. Merchant icons are `Avatar`. Info hovers are `InfoTip` on
  `Tooltip`. Log meters are `Progress` (with an `indicatorColor` prop). The drill path is `Breadcrumb`.
- Hand-made on purpose: the sidebar layout, `Kpi`, `Sparkline`, the Recharts charts and their tooltips, and
  `Stepper`.
- Adding a component: run `pnpm dlx shadcn@latest add <name>` from `app/`. The CLI misreads the `@/` alias, so
  after each add change `from "cn"` to `from "@/shared/utils/cn"` in the new files and run `npm uninstall cn`.

### Shell and layout

- **Sidebar**: wordmark, the pages from `NAV`, accounts, then one row of icon buttons named by tooltip
  (Export data, Upload file when available, Tutorial, GitHub) at the very bottom. `PageHeader` has the big title, a
  one-line subtitle from `NAV` and the right-side controls.
- **Tutorial nudge** (`TutorialNudge`, wraps the Tutorial icon): in browser mode, until `ledger:tutorialAck` is `true`,
  a bouncing arrow points at the Tutorial icon and a callout ("Watch the tutorials first") asks the person to watch the
  tutorial videos. "Okay" sets the flag for good; so does clicking the Tutorial icon or "Open the tutorials" (both
  still open the tutorial). Escape hides it until the next page load without saving the flag, so only a deliberate
  Okay (or opening the tutorial) retires it. It is not a modal: no overlay, nothing else is blocked, and it never
  shows in local mode. On wide screens the callout opens to the right of the sidebar; below `lg` it opens above the
  icon inside the menu drawer, so phones see it when they open the menu. The arrow's `nudge-bounce` keyframe
  (`styles/base.css`) is off under `prefers-reduced-motion`. `ledger:tutorialAck` is a normal `ledger:` key
  (`useTutorialAck`): it is in the export's `settings.local`, and a file that has its own `ledger:tutorialAck` replaces it; a file or the sample without one keeps the person's acknowledgement (`importDataFile`), so loading data never brings the nudge back.
- **Nav names and view ids**: About you (`about`), Spending (`actuals`), Budget (`budget`), Log (`log`), Tools
  (`tools`), Retirement (`retirement`), Balances (`balances`). The ids never change, so saved values keep working.
- **Accounts in the sidebar**: each row toggles the `accounts` filter. Rows are grouped under a muted bank
  header (none when `bank` is empty) and show name, last four digits and a dot on the right (filled is on, hollow
  is off, colored by type). The list scrolls when long. Toggling one jumps to Spending, the only page the filter
  affects. Accounts that arrive by import are switched on.
- **Phones** (below `lg`): the sidebar becomes a top bar with the wordmark and a hamburger that opens a
  full-screen drawer (`ui/sheet.jsx`) with the same nav, accounts and icon row. Picking a page closes it.
  No page scrolls sideways at 375px. Below `sm` the `.card` bubbles turn into flat sections divided by
  hairlines, `body` gets `overflow-x: hidden`, and wide tables drop columns. The Retirement year table scrolls
  inside its card on purpose.
- **Small decisions**:
  - Recharts tooltips use `isAnimationActive={false}`. By default they slide in from the chart corner on every
    hover.
  - Sticky table headers are frosted (translucent surface, blur and a hairline), not a solid band.
  - Every table row highlights on hover. Inner scroll containers use `overscroll-contain` so scrolling does not
    chain to the page. Scrollbars are thin and dark.
  - Number inputs step by whole dollars (`step="1"`).
  - The mockup's Settings item and Accounts "+" were left out because nothing exists behind them.
  - There is no "saved" label anywhere. Only a failed save shows a message.

---

## Shared systems

### usePersistedState

`usePersistedState(key, fallback, validate)` keeps UI state in a Zustand store backed by localStorage under
`ledger:<key>`. Everything the user selects persists: active tab, month and account filters, drill path, sort
orders, toggles, every tool's inputs, tax state.

- Every component using the same key shares one value. A change in one place shows up everywhere at once. Tools
  need this because they read values another tool edits (Take-home pay feeds Rent scenarios).
- localStorage is per browser. Anything that must be shared or survive a cleared browser goes in the data files.
- Keep existing `ledger:` keys. If the shape of saved data changes, migrate it in place so nobody's numbers
  reset.

### useToolState

`useToolState(key, defaults)` is persisted object state with merge semantics. Stored keys win, but keys added in
later versions fall back to defaults instead of invalidating the saved object. Use it for all tool inputs.
Gotcha: it drops any stored key whose `typeof` differs from its default. A default of `null` has type `object`,
so a saved string would be discarded. Defaults must have the same type as the values they will hold.

### useBudgetIncome

The one place tools get monthly income: actual payroll, or the Take-home pay figure when the Budget income
source is set to the tool. Rent scenarios, Vacation and Debt payoff use it, so they cannot disagree with Budget.

### Presets

`usePresets(key, { ids })` and `PresetBar` store named presets through the storage adapter (`presets.json`
locally). Used by Budget (`expenses`), the Take-home pay tool (`takeHome`), Rent scenarios (`rentScenario`),
Balances (`planningVariables`) and Retirement (`retirement`).

- **Ids**: with `ids: true` (Budget and Take-home) every preset is `{ id, name, data }` so the Retirement pay plan
  can point at one by id. Presets saved before that get an id made from their name on first load
  (`withPresetIds`, `presetIdFor`), and the list is saved back. Names and data never change, so anything that
  still looks a preset up by name keeps working. New presets get a random id. Overwriting keeps the id.
- **Rename**: when `onRename` is given (Budget and Take-home), hovering a row also shows a pencil that opens a
  rename dialog. The id and data stay, a name already in use is refused, and the active preset follows the
  new name.
- **Hint**: `hint` puts a short muted line at the top of the menu. Budget and Take-home use it to say that a
  preset can stand for a phase of your life and that Retirement picks one for each period by age
  (`BUDGET_PRESET_HINT`, `TAKE_HOME_PRESET_HINT`).

- `PresetBar` is one `DropdownMenu`. The trigger shows the active preset name, or "Presets" when none, with a
  small amber dot when the current values differ from it.
- A preset is active when its data equals the current data, or when it was the last one applied or saved
  (`ledger:presetActive:<scope>`).
- The menu lists one item per preset with a check on the active one. Hovering a row reveals a save icon
  (overwrite that preset, one click, only while it has drifted) and an X (opens the delete confirm).
- "Save as new preset" is always shown. When `canSave` is false it is disabled with the tooltip "Change something
  first". Saving under an existing name replaces it in place so the order holds.
- Old presets are normalized when applied. Stored presets are never rewritten, apart from the one-time id
  migration above.

### Other shared pieces

- **Dropdown**: single-select (`value`, `onChange`, closes on pick) or multi-select (`values`, `onToggle`, stays
  open). Options take an optional `badge` node, used for month coverage dots.
- **SortHead and nextSort**: click a column header to sort, click again to flip. An arrow marks the active column.
- **HeaderTip**: info tooltips on column headers. They open downward because headers sit at the top of scroll
  containers, where upward tooltips get clipped. Right-hand columns anchor to the right edge.
- **Modals** share one pattern: backdrop click closes, Escape closes, the first input is focused, Enter submits.
- **ToolField and DraftNumberInput**: number inputs keep a local draft string while focused. They commit the parsed
  number on every valid keystroke but display exactly what is typed (empty, "-", "0.") until blur. The naive
  `value={n}` with `parseFloat(x) || 0` traps you at "0" when you clear a field. `DraftNumberInput` is a plain
  component, not a hook, so it is safe inside `.map()` and conditional JSX.
- **Kpi** takes `icon`, `iconColor`, `spark` (a number series) and `sparkColor`. `Sparkline` draws the line and a
  fade. `KpiActual` shows the actual under a plan figure, with words instead of signs.
- **parseSumExpr** parses free text like `3200 checking + 400 sale - 50 fee` into signed terms, each a number plus an
  optional label.

---

## The coverage system

`periods` records each statement's opening and closing dates. `coverage(ym, account)` says whether a calendar
month is fully, partly or not covered per account. Consumers:

- **Month dropdown** (Spending): one dot per month. Green when every account has a statement covering the whole
  month, yellow when any is missing, with a tooltip "Missing: <account names>" (`missingAccounts`). Months are
  listed newest first.
- **`isMonthComplete` and `monthCompareLabel`**: a month is complete only if every day is inside a loaded
  statement for every account. Otherwise "· partial" is added to the label. This catches holes in the middle of
  the timeline, not only the end.
- **`isActiveSubscription(sub)`**: a subscription is active if its `lastSeen` is within about 35 days of its own
  account's coverage end. The window is per account because one account's data often lags another's. Annual
  subscriptions are always active. `cancelled: true` forces inactive.
- **`isBudgetRowHidden(row)`**: a budget subscription row auto-hides when its statement subscription (matched by
  exact name) stopped charging. Rows with no statement match are never auto-hidden.
- **Next statement**: `NextStatementBadge` and `NextStatementLine` show when the next statement is due, from
  `nextStatementDay`.

---

## Page: Spending (view id `actuals`)

Statement reality. Everything derives from the statements data.

- **Filters**: a single month with coverage dots, newest first. Accounts are filtered from the sidebar toggles.
  Filters only render on this page.
- **KPIs**: Spending, Income and Net, with sparklines. Sparks are running totals through the selected month, or
  month by month when All months is selected.
  - Transfers between your own accounts (a card payment from checking) are `kind: "transfer"` and excluded from
    both spending and income. There is no "excluded transfers" KPI.
  - Refunds are `kind: "refund"` and net against their category.
- **Layout**: KPI row, then a tabbed card beside a month overview, then the transaction tables.
  - Tabs: Spending by category (drill-down donut and group table), Trends (stacked monthly spending by category)
    and Cash flow (income against spending bars with a net line). Clicking a bar selects that month.
  - The month overview shows income, spending, net, net against the previous month and against the budget total.
- **Drill-down**: category, then subcategory, then merchant. Click slices or rows. A breadcrumb goes back and the
  path persists. Sub-levels use lightness shades of the parent color. Level tables show count, total and percent.
- **Transactions table**: every row in the current drill scope, sortable by date and amount, with merchant icons
  and the statement description under the merchant name. The income table sits below.
- **Subscriptions table**: only active subscriptions. A short footer sentence and an "N not seen recently" toggle
  list the hidden ones so nothing vanishes silently. Every column header sorts (`ledger:subsSort2`).
  - "Bills on" is the billing day of the month, taken from observed charge dates. A `~` marks a single-observation
    estimate.
  - Annual subscriptions show their amount divided by 12.
  - No horizontal scroll. Columns collapse responsively.
- **Income model**: a paycheck flagged `partial: true` (a short first period) is excluded from income averaging.
  Monthly income is the average full paycheck times the pay frequency over 12. The frequency is read from the
  median gap between paydays (weekly 52, biweekly 26, semi-monthly 24 or monthly 12 a year). With fewer than two
  paydays it assumes semi-monthly.

---

## Page: About you (view id `about`)

A sidebar page (`about`, user icon) at the very top of the sidebar, above Spending. It is the starting point of planning: the few facts
about you that several pages share, set once. A short intro says what the page is for and that the other pages
read from it. Every field has a sentence or two saying what it is for and which pages use it.

- **Your birth date**: typed as plain text in MM-DD-YYYY (placeholder `MM-DD-YYYY`, no calendar or date picker).
  `MM/DD/YYYY` and one-digit months and days work too. It is checked as you type (once a four-digit year is in)
  and when you leave the box, by `parseBirthDate`: a short plain error shows for text that is not a date, a day
  that does not exist, a future date or an age over 120 (`MAX_AGE`), and the saved date stays as it was. A good
  date is saved as `ledger:birthDate` = `YYYY-MM-DD` and shown back as MM-DD-YYYY (`formatBirthDate`). Under the
  box it says "You are 38 today" (`ageOn`). Leaving the box empty or "Clear my birth date" sets it to `null`.
  The card says why it asks (age drives Retirement and the payoff ages), that the date is stored only on this
  device and in the exported file, and that Retirement uses your age on the day Balances was last updated.
- **Old typed ages**: saves from before the birth date have `ledger:age` = `{ age, asOf }`. With no birth date it
  is read as a fixed age (it no longer goes up each January) and the card says so. Saving a birth date sets
  `ledger:age` to `null`, so the birth date wins.
- **Age for planning**: `planningAge()` (hook `usePlanningAge`) is the one place every page gets the About you
  age. With a birth date it is your age on the Balances "as of" date (`ledger:assetsAsOf`), or today when that is
  empty. Balances are only as fresh as their date, so the plan's starting age moves forward only when Balances is
  updated and the plan does not drift. An old typed age is used as it is. Retirement reads it (see Retirement),
  and the debt payoff ages there (and on Balances, through `usePlanStartAge`) follow Retirement's current age. The Debt payoff tool shows a date, not an age.
- **Filing status**: `ledger:filingStatus`, `single` or `mfj` (the `FilingStatus` enum, labels in
  `FILING_LABELS`). Only these two on purpose. Nothing saved, or anything else, reads as `single`, which is how the
  app always worked. It changes federal brackets, the standard deduction, the long-term gains bands, the
  investment income tax and Additional Medicare thresholds, so it moves Take-home pay, Budget income from the
  tool, Rent scenarios, Hourly, Equity payout and the whole Retirement projection.
- **Tax state and city**: the only place the tax state is set. It is the same `taxState` key that Balances used to
  hold, so saved choices load unchanged. Other pages read it through `useTaxState`. Its info tip says that state tax for married filers is an estimate (see Tax engine).
- **No partner fields.** The app plans around your own income.
- These are plain `ledger:` keys, so they travel in the exported `ledger-data.json` (`settings.local`) and come back on
  import like every other key. The sample data sets `ledger:birthDate` to `2001-05-14` (25 on its Balances date
  of 2026-10-31) and Single, with `retireAgeAuto: true` so its Retirement plan runs from 25. The lean e2e settings
  have neither key.
- Hooks: `useBirthDate()` (`{ birthDate, savedAge, setBirthDate, clear }`), `usePlanningAge()` and
  `useFilingStatus()`, all in `shared/hooks`.

---

## Page: Budget

The forward-looking plan, backed by `budget.json`. In-app edits and any outside edit write the same file. The
app refetches on window focus unless a save is pending, so an outside edit is not overwritten by a stale save.
`load()` also ignores its response when a save is pending.

### Rows

`{ id, name, type, amount, source, day?, prorate?, hidden?, match?, trackInLog?, items? }`

- **`type`**: `simple` (a name and a monthly amount) or `breakdown` (a name plus `items`, with `amount` kept as
  their sum so every page reading `row.amount` keeps working). A sub item is
  `{ id, name, mode: 'month'|'week', amount, perWeek }`. Month mode is a flat monthly amount. Week mode is
  `amount` times `perWeek` times 4. No row is special-cased by name. `normalizeBudgetRow` upgrades old shapes on
  load and is also applied to presets before they are compared or applied.
- **`source`**:
  - `manual`: the user's own rows. Can be deleted. Never touched by a refresh.
  - `tracked`: derived from statements. A refresh updates the amounts.
  - `subscription`: mirrors the statement subscriptions. No hard delete. The stored `amount` and `hidden` are
    ignored at render.
- **`match`** says what counts toward the row's Actual. **`trackInLog`** says whether the row gets a Log meter.

### Subscriptions are derived

Each subscription row's amount is recomputed on every render as its latest observed charge (`liveSubAmount`,
then `monthlyCost`). Any subscription with no budget row is appended. Name and amount are read-only.

It is the latest single charge and not a month's sum on purpose. Billing dates drift, so a calendar month can
catch a subscription twice or not at all, and neither is its monthly cost. The Actual column still shows the
real month sum, because that comparison is the point.

- There is no reset button and no eye toggle. A subscription you cancel stops charging and ages off the list. One
  you forgot about appears the moment it bills.
- **Annual plans are left out of Budget** (`cadence: "annual"`). A once-a-year charge is a one-time payment you
  save for, not a monthly line item. Spreading it over twelve months makes the budget look like money leaves
  every month when it does not. They stay in the subscriptions data and Spending shows them.
- **`cancelled: true`** on a subscription forces it inactive regardless of `lastSeen`. Statements lag reality, so a
  cancelled service can still show a charge, or a charge that is refunded days later.
- Auto-hiding still applies, so long-dead subscriptions drop off.
- There are no "still charging" labels. Statement data lags real-world cancellations, so such labels would
  mislead.

### Removing a subscription

The row X is a removal until the next charge, not a delete. It exists for a charge you recognize as a one-off.
If it shows up again on a later statement it must come back so you notice.

- `budget.json` has `dismissedSubs: { name: lastSeen-at-removal }`.
- `isDismissedSub(name)` is true while the subscription's `lastSeen` is on or before that date. A newer `lastSeen`
  un-dismisses it: the stale entry is dropped, the row's `hidden` is cleared and the file is saved.
- Removing also sets `hidden: true` on the row so Tools calculators that read the file stop counting it.
- A row with no statement match is simply deleted.
- "Removed until they charge again" chips under the list restore one by hand.
- Imports must keep updating `lastSeen` and never edit `dismissedSubs`. A reappeared row stays.
- The info icon on the header and the tooltip on the X ("Remove until it charges again") explain this.

### Compare to actual

A toggle adds two columns: Actual for one calendar month and Diff (budget minus actual, green under, red over).
It is mutually exclusive with Remaining this month. Persisted as `budgetCompareMode` and `budgetCompareMonth2`.

- **Calendar months, not statement cycles.** Cycles catch each recurring bill once but span uneven windows that
  are confusing to read. Plain months accept one known artifact: a bill that lands on the 1st and again on the
  31st reads double in one month and zero in the next. That is intended.
- **Partial months are labeled** through the coverage system (see above). The selector defaults to the last
  complete month, not the newest, which is normally still mid-statement and would read as cheap.
- **Row to transaction matching** (`rowMatch`, `txnMatches`, `actualForBudgetRow`). A row's `match` is one of:
  `{ merchant }`, `{ merchants: [...] }`, `{ cat, sub? }`, a mix `{ merchants?, cats: [{ cat, sub? }] }`, or `null`.
  - `null` counts nothing and Actual shows a dash, not $0, because $0 would wrongly read as "spent nothing".
  - With no `match` key the default applies: a subscription row matches its own merchant, otherwise a row named
    like a merchant matches it, otherwise like a category, then a subcategory, otherwise nothing.
  - The pencil on every row opens a "Counts toward" picker (Popover plus Command with substring search) over the
    merchants and categories in the data. Picks show as removable chips. "Use the default" clears the key.
  - Merchant names must stay spelled the same across imports or matches drift.
- **Not budgeted rows**: every dollar spent that no row claims, grouped by category and subcategory, shown
  read-only and italic below the last expense row with a "Not budgeted total". Without them, "how much did I
  spend" would omit whatever was never budgeted. The grand total Actual is all spend in the month
  (`totalSpendForMonth`), so budget against actual reconciles to the dollar.
- Diffs round both sides before subtracting. Every figure here is whole dollars, and an unrounded diff would
  render as "-$0".

### Layout, totals and toolbar

- Manual and tracked rows come first, then Subscriptions with its own subtotal, then the grand total.
- **Add row** asks the type first (Simple or "Stack with sub items"), then for a simple row which section (this
  sets `source`). A stack opens the sub item editor right after it is added.
- **Toolbar**: preset menu, "Remaining this month" and "Compare to actual" toggles, and the month picker when
  comparing. There is no sort menu. Click a column header (Name, Budget, Actual, Diff). Sort persists in
  `ledger:budgetSort`. A null key means file order for expenses and biggest first for subscriptions. On phones
  the toolbar collapses into one more-menu.
- **`RoundedAmountInput`**: simple rows show amounts without cents, rounded up to a whole dollar, while blurred.
  Focus reveals the exact stored value. It is display only and commits exactly what was typed on blur.
- **Native number spinners are hidden app-wide** because their reserved width shifts right-aligned digits away
  from read-only numbers in the same column. Retirement and Tools opt back in with a `.show-spinners` wrapper,
  because click-to-increment suits ages and dollar amounts there.
- **Presets** (key `expenses`) save the whole row set under a name. They are hidden while Remaining this month is
  active.

### Row editor

The pencil beside a name opens `RowEditModal`. Breakdown rows always show it. Simple rows show it on hover.
Subscription rows only get the Counts toward picker.

- A Simple / "Stack with sub items" switch at the top. Simple to stack turns the amount into one flat "Existing
  amount" item. Stack to simple keeps the total.
- A stack lists sub items, each with a name, a Per month / Per week switch and inputs (a flat amount, or average
  cost and times a week with the math shown), add and remove, and a live total.
- Every edit writes through to the row, so the KPIs behind the modal move as you type. Done or Escape keeps the
  change. Cancel restores the row as it was when the modal opened. A stack added and cancelled is removed.

### Remaining this month

A view, never an edit (persisted toggle `restMode`). Rows with a `day` count only if still upcoming. Rows with
`prorate: true` scale by days left over days in the month, with the math shown. Rows with neither count in
full, which is conservative. Paid and zero rows disappear and the total becomes "Remaining until end of month".
It answers "how much can I safely spend before payday".

### Income

Income is derived, not entered. The income card has a source dropdown stored in `budgetIncomeOverride`:

- `active: false`: from your statements (average full paycheck times the pay frequency).
- `active: true`: from the Take-home pay tool. An external-link icon opens that tool and switches it on in the
  Tools picker if it was hidden. The card lists salary, each deduction and the state, with a link to edit.
- `active: 'manual'`: type it in, with `amount`.

Statement income is already after payroll deductions. A budget row named like a 401k, 403b or IRA triggers a
one-line warning above the table. The salary, 401k percent and medical inputs for the hypothetical live in the
Take-home pay tool only, so there is one place to tune them. The Retirement 401k auto value reads the same
tool.

### KPIs

Income, budgeted expenses, leftover per month and leftover per year. Budgeted expenses has an accent up arrow
and a footer "Actual spending, <month>", the number, then "$X over budget" (red) or "$X under budget" (green).
The other cards use "Actual, <month>" with "$X short" or "$X ahead". Words, never signed numbers
(`negWord` and `posWord` on `KpiActual`). On phones the KPIs become a flat list with the plan on the left and
the actual on the right.

### What to do with what is left

At the bottom of the table, `budget.json` carries `leftover: [{ id, target: 'savings' | <row id>, pct }]`.

- Leftover is `max(0, income - counted rows)`, so nothing is taken when you overspend.
- A row that receives a share shows "+$X from leftover" and the extra counts toward its Log meter.
- The `savings` share feeds Retirement's "Into savings per year" auto value (times 12).
- Both leftover KPI cards have an info badge that scrolls to this section.

---

## Page: Log (view id `log`)

**Why it exists.** Statements arrive weeks late and Budget is a deliberately static plan. A purchase made
yesterday needs a third place. The Log is a hand-kept diary of purchases between statements, each tagged with
the budget row it counts against, with month-to-date meters for the soft rows.

- **Data**: `log.json` is `{ entries: [{ id, date: 'YYYY-MM-DD', amount, note, rowId, createdAt }] }`. `rowId` is
  the Budget row id. A deleted row shows as "Removed row" and the entry is kept.
- **Quick add**: amount (accepts `parseSumExpr` text, so `12 + 3.50` works), note, a "Counts against" row picker
  (remembers the last choice in `logRow`, defaults to the first row alphabetically) and a date (defaults to
  today, cannot be in the future). Enter in any field adds. Focus returns to Amount so a batch of receipts goes
  fast.
- **Meters**: a row gets a meter from `trackInLog` (explicit true or false wins). Otherwise rows with no `day`
  get one, and dated rows only when something is logged against them this month. Subscriptions never get one.
  The bar fills to the budget amount, turns red past it and reads "$X left" or "$X over". A hide X writes
  `trackInLog: false` to the budget. A "Hidden meters" chip row restores them.
- **Months**: arrows walk calendar months and the current one is labeled "so far". Nothing is archived. Once a
  month's statements are imported, Budget actuals are the truth.
- **Entries table**: click a header (Date, Note, Counts against, Amount) to sort, again to flip. The default is
  newest first, ties by newest added. The sort is not persisted.
- **Negative amounts** are credits, such as a refund or something sold, logged against any row to offset what
  was spent. They subtract from the meter and month total and show green. A meter bar never fills below zero.
- **Not an import source.** Entries never become statement transactions. Statements stay the only source of
  actuals.

---

## Page: Tools

### Picker and lists

- The page header has a "What to show" button (Tools page only, shows a count) that opens a modal of cards, one
  per tool, alphabetical, click to toggle. `TOOL_LIST` (`screens/tools/constants/TOOL_LIST.js`, entries of id,
  title and description) drives the cards and the order. Tools sit two to a row with dense packing. Ids in
  `TOOL_WIDE` span the full width, as does a lone selected tool.
- Selection persists in `toolsShown` and syncs between the picker and the page. A tool added later is switched
  on once per browser (`toolsSeen` records the ids that browser has met), so no extra step is needed.
- Budget's "Take-home pay" link switches that tool on before scrolling to it.
- **Adding a tool**: add a folder under `screens/tools/features/`, add it to `TOOL_LIST` and to the tool map. Each
  calculator loads only when switched on.
- **Simple lists**: "What to show" has an "Add a list" button for user-made lists
  `{ id, title, description, items: [{ id, name, amount }] }`, stored under `lists` and exported with the
  settings. Each shows in the picker and grid like a tool, with a pencil (edit) and an X (delete with confirm).
  A list is a scratch pad and feeds nothing else. An older `sellItems` key is migrated once into a list.

### Tax engine

`shared/utils/taxOn.ts` and its helpers implement real progressive brackets: federal, FICA (Social Security cap
and Medicare surtax) and state brackets for every state and New York City. Standard deductions, labeled
estimates, 2026 figures.

- `taxOn(gross, state, filing)` is the tax on a salary. `taxOnExtra(base, extra, state, filing)` is the marginal
  tax on a windfall stacked on a salary. `incomeTaxOnExtra` is the same without FICA.
- `ltcgOnExtra` handles long-term gains: federal 0, 15 and 20 percent plus 3.8 percent investment income tax,
  state and local as income, no FICA.
- **Filing status** is the last argument everywhere (`taxOn`, `taxOnExtra`, `incomeTaxOnExtra`, `fica`,
  `ltcgFederal`, `ltcgOnExtra`, `takeHomeBreakdown`, `takeHomeMonthly`, `budgetIncomeFor`, `equityPayout`,
  `gainsTaxPct`). It defaults to `single`, and single results are exactly what they were before (unit tests check
  this). `mfj` (married filing jointly) uses `FED_MFJ` (32,200 standard deduction, joint brackets from IRS Rev.
  Proc. 2025-32), `LTCG_MFJ` (0 percent to 98,900, 15 percent to 613,700, investment income tax over 250,000) and
  the 250,000 Additional Medicare threshold (`ADDL_MEDICARE_OVER`). Sources are in the constant files.
- **State tax for married filers is an approximation.** `STATES` holds single filer tables only. With `mfj`, a
  state whose deduction is the federal standard deduction (Arizona, Colorado, DC and others) gets the joint
  32,200 deduction (`stateDeduction`). Every other state keeps its single deduction and brackets, which usually
  overstates state tax a little. The About you page says so in an info tip.
- The app plans around your own income. Married filing jointly is modeled as if your spouse has no income, so
  it shows the most a joint return can save. There are no partner fields on purpose.
- The state is the shared `taxState` and the status is `filingStatus`, both set on the About you page. Tools show
  "Taxed in <state>. Change" and the button opens About you. Take-home pay, Hourly, Equity payout and Rent
  scenarios also show "Using Married filing jointly from About you." with a Change link when it is set.

### The calculators

- **Take-home pay**: gross salary to net per year, month and paycheck. Pre-tax mechanics are correct: a 401k
  deferral reduces income tax but not FICA, and medical premiums reduce both. Paychecks are 24 a year. The
  employer match lives on the 401k deduction (`match`, percent of your contribution) and is not deducted from
  pay. Calibration tip, also in its tooltip: tune the medical input until the paycheck matches a real pay stub,
  and other salaries inherit the accuracy. Presets (key `takeHome`, with ids) save a salary and its deductions
  under a name, like "Now" or "Easier job". The Retirement pay plan uses them, and the preset menu says so. The tool's own saved values
  (`ledger:takeHome`) are untouched by presets, so old saves load as before.
- **Hourly calculator**: hours a week times rate gives weekly, times 52 gives annual gross. It assumes a full
  year, with no months-worked input. Taxes the annual total in the shared state as W-2 wages (employee FICA
  only), and its copy says so: it is not a 1099 or freelance calculator. Pay per hour steps by $1 and
  hours by 1.
- **Equity payout** (id `stock`): a type picker.
  - RSUs: exit price times shares, no strike.
  - Options NSO: exit minus strike, taxed as income on top of salary through `taxOnExtra`, per payout year.
  - Options ISO: with "held over a year after exercise" on, each year's spread is a long-term gain. With it
    off, the sale is a disqualifying disposition: taxed as income like NSO but with no Social Security or
    Medicare (IRC 3121(a)(22)), through `incomeTaxOnExtra`.
  - `equityPayout()` holds the math. Retirement's equity link calls it.
- **Effective rental cost**: rent times (12 minus months free) over 12. What concession deals really cost.
- **Rent-to-income**: the 40x income rule with a Swap button. Know the rent to get the multiple, or pick the
  requirement (20x, 30x, 40x) to get the maximum rent.
- **Vacation planning**: hotel and food per night, flight, rides, spending and buffer per trip. "Months to save"
  is the total over a save-per-month input. Its tooltip fetches the live budget leftover for reference.
- **Debt payoff**: a picker ("All debts" or one debt from Balances) and a "Contribution per month" input, then
  total debt, time to pay off and debt-free date.
  - The contribution defaults to the picked debt's payment, or the sum of payments. For All debts a saved
    `debtPayoff.perMonth` above 0 wins. Per-debt amounts sit in `debtPayoff.custom`.
  - APR 0 is balance over payment, rounded up. With an APR above 0 it uses the amortization formula and the row
    says "includes interest". All debts uses the balance-weighted APR. A payment that does not cover the monthly
    interest shows a dash.
- **Rent scenarios**: a table of hypothetical rents (from, to, step inputs) with leftover per month, leftover per
  year and "Debt paid off in": all shared debts paid off with that leftover, using `payoffMonths` at their
  balance-weighted APR (`weightedApr`), the same math as Debt payoff. "Never" means the leftover does not cover
  the interest.
  - Income and non-rent expenses come live from Budget. The rent row is excluded because each scenario
    substitutes its own. Hidden rows are excluded.
  - The current rent is found through a saved link (`rentScenario3.rentRow`, a Budget row id, "Your rent comes
    from" dropdown). First run links the row named Rent.
  - **Scenario-local overrides**: a collapsible copy of the expense list where any amount can be overridden for
    this tool only. The real budget is never touched. Overridden rows show the budget value struck through.
    "Reset to budget defaults" clears them. Overrides are keyed by row id, so deleted rows shed theirs.
  - Presets save override sets for flipping between cost structures. The row closest to current rent is marked
    "closest to current".
- **Cash between two days**: pick any day-of-month range and see what is expected to come out. It uses plain day
  numbers (1 to 31), not calendar dates, because every row's timing is itself a day of the month, and this
  avoids month-boundary counting.
  - Quick ranges: 1st to 15th and 16th to end of month, or type two days.
  - Same rules as Remaining this month: dated rows count once if their day falls in the range, prorated rows
    scale by days in range over the month length, undated rows count in full. Hidden rows are excluded.
  - Optional **cash on hand** is a free-text running total such as `3200 checking + 4315 paycheck - 50 fee`,
    parsed by `parseSumExpr` and shown as chips with the sum, so each part stays visible. When filled it shows a
    "Leftover after cash on hand" chip (green or red).
  - An end day before the start day shows an inline error.

---

## Page: Balances

A sidebar page (`balances`, landmark icon). Cards: totals owed and owned, "What you owe" and "What you have". The
Presets menu sits in the page header row.

- **No tax state here.** The tax state lives only on About you. Balances does not show, read or write it.

- **Debts** live in the `debts` key as `[{ id, name, balance, apr, payment, budgetRow }]`. `payment` is typed
  unless `budgetRow` links a Budget row by id, whose amount is then the payment ("Payment comes from" dropdown,
  "Type it in" means no link). Linking by id means renaming a row keeps the link.
- Older saves were `{ loans, card, taxes }`. `useDebts` rewrites them as three entries on first read, and
  `useDebtLinkMigration` turns an old name-based hint into a row id only when a row with that exact name exists.
  Otherwise the debt migrates unlinked with payment 0, so no number changes.
- **Assets** live in `assets` (`[{ id, name, balance, pool?, kind? }]`) with an "as of" date in `assetsAsOf`
  (empty shows today). Retirement's Auto current age is your age on this date (see About you), and the card says so.
  `kind` is the account type, picked in an "Account type" select: `regular` (Savings, use anytime), `pretax`
  (a traditional 401k or IRA, taxed as income on the way out) or `roth` (taxed going in, tax free out). Pre-tax
  and Roth are locked until the 401k access age, so picking a type also writes the matching `pool` (`savings` or
  `401k`). Saves without `kind` read through `assetKind`: a `401k` pool asset is pre-tax, anything else regular,
  so old data loads unchanged.
- **Presets** use the key `planningVariables` and save `{ debts }` only (`BalancesPresets`, shown in the page header), so a
  what-if move is still one click. Old presets that still carry a `taxState` keep loading: the field is ignored on
  apply and dropped the next time the preset is saved. Old presets with debts as an object are converted on
  apply (`presetDebts`). Neither the tax state nor the filing status is part of the preset.
- **How payoff flows into Retirement** is spelled out in a box right under "What you owe": Ledger uses the
  balance, interest rate and monthly payment to work out when each debt is paid off, and Retirement then treats
  that payment as freed up money after the payoff date and sends it where the Budget says, usually to savings.
- **Per-debt payoff line** under each debt (`debtPayoffLine`): "Paid off in 6 years 2 months (age 44). Then $385
  a month is freed up." Months come from `payoffMonths` (interest included), the age is `payoffAge` (age now plus
  whole years) from `usePlanStartAge` (the age Retirement plans from: About you while its Auto age is on,
  otherwise the age typed there; no age when neither is known). Other cases: "Your payment does not cover the
  interest, so this debt is never paid off at this payment.", "Add a monthly payment to see when this debt is
  paid off." and "This debt is already paid off." A linked payment waits for the Budget rows before it shows.
- Debt payoff, Rent scenarios and Retirement's debt logic all read this list, and all three use the same
  `payoffMonths` (shared), so a debt has one payoff time everywhere.

---

## Page: Retirement

The most model-heavy page: a year-by-year projection from current age to the end age.

- **Current age** has an Auto badge once About you has a birth date (or an old typed age): the field shows your
  age on the day you last updated Balances (`usePlanningAge`, today if Balances has no "as of" date) and the plan
  runs from it. Its tip says "Using your age on the day you last updated Balances (date). Update Balances to move
  it forward." It moves only when the Balances date does, so the starting age always matches the balances. Click Auto to type your own. The typed age stays saved in `retireCalc.age`
  underneath, so turning Auto off brings it back, and Retirement presets keep saving the typed age. The switch is
  `ledger:retireAgeAuto` (on by default, not part of presets). With no About you age the field is the plain typed
  number, exactly as before. The logic lives in `useRetireAge` and `CurrentAgeField`.
- **Filing status** from About you feeds the 401k withdrawal tax, the auto tax on returns (`gainsTaxPct`), the
  Equity link and the Budget income behind the Auto savings.

- **Two phases**: working (contributions in) and retired (withdrawals out). Retirement age is a knob to move.
- **Find earliest safe age**: a button under "Retire at". It scans linearly from `age + 1` to `endAge - 1`,
  rerunning the full simulation (`simulate(candidate)`) and jumping to the first age where money never runs out.
  A plain linear scan, not a binary search, because survival is not monotonic in retire age: one-time events land
  at fixed ages. It is cheap. If no age survives, an inline red note says so. The note goes away as soon as any input changes.
- **Simulation rules**, in order, per year:
  - Working years: 401k grows and gains the contribution. The savings pool gains the contribution plus after-tax
    growth. Year one's payroll 401k contribution is multiplied by 0.75, because eligibility starts about three
    months into a job.
  - Retired years: withdrawals are monthly need times 12, from the savings pool only (with the tax on 401k
    withdrawals on, see below, the open 401k pools cover what savings cannot). The need is typed or comes from a
    Budget preset (see Need per month below).
  - **401k access age (60)**: at the end of that year the 401k balance rolls into the savings pool and its column
    shows a dash. The move shows in that year's Contributions. From then on new 401k money goes straight to
    savings, and if you are already past the access age the 401k starts in savings. Before that it compounds
    untouched. Early withdrawal is not modeled as available.
  - **Start in debt** toggle: the pool starts at savings now minus the shared debts, and contributions dig out
    of the hole first. Negative balances earn no returns.
- **Tax on 401k withdrawals** (`retireCalc.tax401k`, on by default, saves without it read as on): the toggle
  under "In retirement". When on, the simulation keeps three pools: regular savings, pre-tax (the typed "401k
  now" box, or `pretax` assets on Balances, plus all 401k contributions and retirement account lines) and Roth
  (`roth` assets). Pre-tax and Roth grow at the full rate and stay locked until the access age, as before. At
  the access age they do not merge into savings: they open as their own pools, count in Total (liquid) from
  then on (their balance shows in that year's Contributions, as the move did), and new 401k money keeps adding
  to the pre-tax pool.
  - **Withdrawal order**: regular savings first. Only when savings go below zero does `drawFromPools` cover the
    gap: the pre-tax pool, then Roth last (it grows tax free the longest). A shortfall left after both is the
    run-out, as before.
  - **Gross-up**: to spend a net amount N from the pre-tax pool you take out G with `G - tax(G) = N`. `tax` is
    `incomeTaxOnExtra(0, G, taxState, filingStatus)`: federal brackets after the standard deduction (16,100
    single, 32,200 married filing jointly) plus the state and city brackets from the About you `taxState`, no FICA. It is progressive, so a bigger year reaches higher
    brackets. `grossUp` solves it by bisection. The tax shows in the year table's Tax column, and each row adds
    up as `last Total + Contributions + Growth - Withdrawals - Tax = Total`.
  - **Simplified on purpose**: Social Security is not counted as taxable income (in reality up to 85% of it
    can be), savings gains are not stacked on top, today's brackets apply every year, early withdrawal before
    the access age is not modeled and payroll Roth 401k money (the Take-home `roth401k` kind) still goes into
    the pre-tax pool.
  - With the toggle off, or with no pre-tax or Roth money, the numbers are exactly the untaxed model (a unit
    test checks this). Off, Roth assets join the 401k as before.
- **Returns**: editable portfolio tables, each fund with an allocation percent and a lifetime performance
  percent, giving a weighted average. It weights strictly by the allocation column. The 401k grows at the full
  rate. The savings pool grows at the rate times (1 minus tax on returns).
  - **Tax on returns** (default 15%) is one knob. While saving it overtaxes, in drawdown it is about right.
    Forecasting realized against unrealized gains decades out would be false precision.
  - **Portfolio split**: `retirePortfolio` is "While working". `retirePortfolioAfter: { same, rows }` is "After
    retiring". With `same: true` (default) the working table is used. The simulation uses the working return
    before the retire age and the after return from it on, for both pools. Turning "Same as while working" off
    copies the working rows.
- **Total (liquid) is the key product decision.** The Total column is the savings pool only. The 401k is not
  counted until it unlocks at the access age. A combined total hides reality: liquid money can fall every year
  while a locked 401k grows, netting a small, soothing decline. Liquid-only makes "money lasts" mean spendable
  money.
- **The Growth column is liquid growth only**, so each row's arithmetic is self-contained:
  `last Total + Contributions + Growth - Withdrawals = this Total`. This holds from the access age on, the
  move included. Before it, Contributions also counts the 401k money that goes into the locked pool.
- **Headline chips** (all from the taxed result when the tax is on): liquid at retirement (with the locked 401k shown separately, and the starting balances when
  you retire at today's age), the money-lasts verdict (the first liquid-negative retirement year) and the total
  at 60, 70, 80, 90 and 100 plus the end age, each only once and only inside the plan.
- **Header tooltips are dynamic.** They embed the current input values, so they restate the assumptions.
- **Presets** (key `retirement`) capture the whole config: inputs, portfolio and debt toggle.

### Starting balances

`retireCalc.startFrom` is `'balances'` (pull from Balances) or `'typed'` (the "401k now" and "Savings now"
boxes). In balances mode each asset and debt is a checkbox, `startOff` holds the unchecked ids, savings start at
included savings assets minus included debts, and the retirement account starts at included `401k` assets. Saves
from before this existed read as `typed`, so numbers do not move. New users start on balances.

### Need per month

"Need per month" is typed, or it follows a saved Budget preset. A small Budget badge on the field (styled like
the Auto badges) opens "Use a Budget preset": every Budget preset (key `expenses`) with its monthly total, then
"Type it in".

- **The amount** is what Budget would show as "Budgeted expenses" with that preset applied: `budgetExpensesOf`
  on the preset's rows (`budgetPresetOptions`). Hidden rows and stopped subscriptions are skipped,
  subscription rows use their live amount, live monthly subscriptions the preset has no row for are added,
  and today's dismissed subscriptions are left out (a preset does not store them). Stacks count their stored
  total, which Budget keeps equal to the sub items (week items are cost times times a week times 4). Debt
  payment and savings rows count like any other row, because Budget counts them.
- **With a preset picked** the field is read-only and a badge under it reads "From the <name> preset: $X a
  month". The typed number is kept in `retireCalc.withdrawMo` for later.
- **Live by id.** Budget presets have ids (see Presets), so the pick is the preset id, stored in
  `ledger:retireNeedPreset` (`string` or `null`). A rename on Budget keeps the pick. Overwriting the preset on
  Budget moves the need the next time Retirement opens. A pick saved by name before presets had ids still
  matches by name, and the page saves its id in its place. A deleted preset falls back to the typed number with
  the note "The Budget preset you picked is gone, so this uses your typed number." Typing a new number clears
  the pick.
- **One source.** Retirement reads Budget presets once, through `usePresets('expenses', { ids: true })`, for both
  Need per month and the pay periods. "Your Budget today" comes from the same Budget the page already loads.
- **Old saves.** No key, or a bad value, reads as `null`: the typed number, exactly as before. Results only
  change once a preset is picked.
- **Sanity line**: "Your Budget today: $Y a month" sits under the field whenever Budget has rows of its own.
- The pick is not part of Retirement presets.

### Pay and saving over time

One card holds everything you put away each year while you work, with or without a plan. There is no separate
Saving each year card.

- **The idea it teaches**: presets are saved versions of your Budget and your Take-home pay for different parts of
  your life. You set each one up once on its own tab and pick them here by age. The info tip says this, the no-plan
  hint says to save that part of your life as a Budget preset and a Take-home preset first, and a "How this works"
  disclosure under the header (a ghost button with `aria-expanded` and `aria-controls`, closed by default, shown with
  or without a plan) explains it in four sentences plus a worked example: a corporate job from 25 until 40 on the
  Corporate job and Today presets growing 3% a year, then an easier job from 40 on the Easier job and Leaner budget
  presets. The sample data is that example. It only deals in what goes into the 401k and savings: what you earn lives in the Take-home
pay tool and its presets. Logic is in `utils/resolvePayPeriods.ts`, `utils/tidyPayPeriods.ts`, `utils/periodAt.ts`,
`utils/payPlanIssues.ts` and `simulateRetirement`.

- **No plan (`pay.periods` empty) is today's behavior, exactly.** The card shows one row, "Now, until you
  retire" (`TodayPayRow`): Into 401k per year (today's Take-home or typed dollars, `auto401k` and `contrib401k`)
  and Into savings per year (today's Budget or typed dollars, `autoSavings` and `contribSavings`). Under it:
  "Same pay until you retire. $X a year from Take-home pay.", a short hint to set up the other life on the Budget
  page and in the Take-home pay tool as presets, and the "Plan pay changes" button. A regression test in
  `simulateRetirement.test.ts` pins the old numbers.
  - Today's Take-home: the Take-home tool's 401k deduction (salary times its percent, or a flat amount) plus the
    employer match.
  - Today's Budget: the Budget `savings` leftover share, times 12. The leftover never goes below zero. With no
    allocation at all the whole leftover counts. Once there is one, only its savings share does.
  - Contributions grow a year (`retireCalc.raisePct`, default 0): the same field as on a plan period. It grows today's 401k
    and savings by that percent for each working year after the first (freed debt payments are not grown). 0
    leaves the numbers exactly as before. "Plan pay changes" copies it into the new periods, and clearing the
    plan ("Back to one period", or removing the last period) copies the first period's raise back.
  - Pickers: each field has a small source badge (never "Auto"): "Take-home preset" on the 401k and "Budget
    preset" on savings. The menu lists Today's Take-home or Today's Budget, the saved presets and Type it in.
    Choosing a preset starts a plan with one "Now" period from today.
- **Your own savings lines are events now.** The old `retireCalc.extras` list (`{ id, name, amount, unit, to }`)
  is gone from the card. `normalizeRetire` turns each line into a money-in event with the same name, amount and
  pool (`id: 'extra-<id>'`, from today's age, every year or every month for a monthly line, `untilRetire: true`),
  so saved numbers do not move. A regression test pins them.
- **Debt payoff to savings**: each debt has its own monthly payment and is paid off independently, with
  interest at its own APR and with no snowballing.
  - Months to payoff are `payoffMonths(balance, payment, apr)`, the same function the Debt payoff tool and Rent
    scenarios use (amortization with an APR, `ceil(balance / payment)` with none, so a 0% debt gives exactly the
    old numbers). That decides which simulated year it lands in and how many months of that year are freed
    (`debtPayoffSchedule`). A payment that never covers the interest (`payoffMonths` is null) never clears, so
    it frees nothing.
  - The payoff year gets a prorated credit for the freed months only. Later years get all 12. Landing exactly on
    a 12-month boundary frees 0 months that year, which is correct.
  - The freed payment follows the Budget allocation: its `savings` share goes into savings and the rest is
    spent. With no allocation at all, all of it goes to savings. This holds for self-cleared debts and for "Pay
    off a debt" events. A debt unticked on the starting balances frees nothing.
  - It applies only while working. A caption under the fields says that interest is included and how the freed
    payment is split, then gives each debt the same line as Balances (`debtPayoffLine`, from the plan's current
    age), or "Paid off at age N by your Pay off a debt event." for a debt with an event, or "Left out of this
    plan" for one unticked on the starting balances.

#### The pay plan

`retireCalc.pay: { periods: [{ id, label, fromAge, toAge: number | 'retire', raisePct, takeHomeFrom,
takeHomePreset, k401, saveFrom, savePreset, savings }] }`. `takeHomeFrom` and `saveFrom` are `'today' | 'preset' |
'typed'`, and `k401` and `savings` are typed dollars a year. Budget and Take-home are the sources of truth: each
period points at them rather than holding numbers. A period has no pay of its own.

- **Fields**: label, From age, Ends ("When I retire" or "At an age" with an Until age), Into 401k per year,
  Into savings per year and Contributions grow a year.
- **Plan pay changes** starts a "Now" period from today with today's sources (typed values carry over), plus a
  second period ten years on. Each later period starts where the last one ends and copies its sources. With more
  than one period, "Back to one period" in the card header clears the plan. Removing the last period does too.
- **Ages**: the until age is exclusive. Until 45 means the last year in the period is 44 and the next period
  starts at 45. A period saved with `years` and no until age reads as until from age plus years.
- **No overlaps** (`tidyPayPeriods`, run by `normalizeRetire` on every read and edit): periods stay in list order,
  which is age order. Each starts at the previous one's until age or later (the retire age after a "When I
  retire" period). A lower from age is moved up to it, so moving an until age later pushes the next periods along,
  and older saves that overlap are trimmed. The From age box has that age as its minimum and the Until age box
  the from age plus one. Gaps are allowed and get a note.
- **Into 401k per year** ("Take-home preset" badge): Today's Take-home, a Take-home preset, or Type it in. A
  preset gives its 401k line plus match at its own salary. A preset with no 401k line means nothing goes in and no
  match. Typed dollars include the match, as in the no-plan row.
- **Into savings per year** ("Budget preset" badge): Today's Budget, a Budget preset, or Type it in. A Budget
  source saves that Budget's leftover by the same rules as today (`budgetSavingsYearly`). The rows come from the
  preset, the split and dismissed subscriptions from today's Budget. Income follows the Budget's income rules:
  from statements or a typed amount it stays the same, and when the Budget uses the Take-home tool it is the
  take-home pay of the period's Take-home source.
- **Contributions grow a year** grows both amounts by that percent for each year into the period. Your share of the 401k stays
  under the yearly deferral limit (`K401_DEFERRAL_LIMIT`) and the match follows it; typed dollars are not capped.
  The first year of each period is a 75% 401k year (new job). A raise inside a period is not.
- **Picking a source copies its numbers into the typed fields**, so a deleted preset falls back to the last
  numbers it gave, with a red note on the period. Presets are matched by id, so a rename keeps the link.
- **Saving after retiring**: a period whose until age is past the saved retire age keeps adding its 401k and
  savings after you retire, while the withdrawals go on as usual. Type what part time work would add. Find
  earliest safe age stops periods that end by the saved retire age at each age it tries, and keeps these going.
- **Notes**: a gap between periods uses today's 401k and Budget saving; a period starting before today counts
  from today; one that starts after you retire and ends when you retire never counts.
- **Social Security** is not affected by the plan. On Auto it still assumes the Take-home salary for 35 years.

### Events

`retireCalc.events: [{ id, name, amount, kind: 'in'|'out'|'debt', age, repeat: 'once'|'month'|'year'|'2year',
years, auto?: 'equity', debtId?, custom?, to?: '401k', untilRetire? }]`. The plus button in the section header adds
one.

- **Goes into** (money in only, not Equity linked): Savings (use anytime, the default) or Retirement account
  (locked), stored as `to: '401k'`. Retirement account money joins the 401k pool that year, with no first-year
  75% rule, stays locked until the access age and lands in savings after it, the same as 401k money. With Tax on
  401k withdrawals on it is pre-tax money: it stays in the pre-tax pool after the access age and is taxed as
  income on the way out, like the 401k. Pay period 401k money goes to the same pool.
- **Until retire** (a badge on "For how many years" for repeating money in): `untilRetire: true` replaces the
  number of years with every year you work. It follows the retire age, including the ages Find tries. Turning it
  off sets the years to the retire age minus the start age.

- Repeating events cover `years` years from `age`. Monthly ones add amount times 12 per year. Every-two-years
  pays at the start age and every second year after, inside the window.
- Money-out events show in the Withdrawals column for their year, money-in events in Contributions.
- **Equity link**: an event's Auto badge pulls its amount and years from the Equity payout tool ("Net per
  year"), forces money in, repeating yearly. Like RSUs it pays only while you are still working.
- **Pay off a debt** (`kind: 'debt'`): pick a debt and an age. The amount is the debt's balance (Auto badge,
  click to type your own, `custom: true`). With an APR the Auto amount follows `debtEventAmount`: a debt's
  balance leaves savings once, at the start (the hole) or at the event, and the monthly payment until then is a
  Budget expense that covers the interest, so the event pays today's balance. Only when the payment does not
  cover the interest does the unpaid interest pile up, and the event pays that bigger balance (12 months a year
  from the current age to the event age). With no APR it is always the balance, exactly as before. Only an age from today to the end age counts. The debt is then left out of the starting hole, its amount leaves the
  liquid pool at that age, and its payment flows into savings from then on.
- **Old shape**: saves without `events` are converted by `normalizeRetire` into the equivalent events. The
  stored value is only rewritten when something is edited. Stored presets are never rewritten.

### Social Security

`retireCalc.ss: { on, claimAge, auto, monthly }`: a toggle, a claim age (default 67) and a monthly amount with an
Auto badge. Auto is `ssMonthlyBenefit()`: the Take-home salary for 35 years, capped at the wage base, with
90, 32 and 15 percent bend points, scaled by claim age: 62 is 70%, 67 is 100% and 70 is 124%. Claiming early
loses 5/9 of 1% a month for the first 36 months before 67 and 5/12 of 1% a month beyond that (64 is 80%), and
each year after 67 adds 8%.
Figures are for 2026 and sourced in the code. It ignores the pay plan, a known simplification: a career with pay changes or time off would earn a different benefit. From the claim age on, the benefit reduces the monthly withdrawal,
never below zero. Saves without `ss` read as off so numbers do not move. New users start with it on.

### Known simplifications

Flat return every year, today's dollars, no inflation. Stated in the page footer.

---

## Notes (hidden)

There is no Notes page or sidebar button for now. Notes that already sit in a data file are kept but not shown:
`validateDataFile` still accepts them, `importDataFile` stores them (`getNotes` and `saveNotes`, `notes.json` in local
mode) and `buildExport` writes them back out, so an export gives back exactly what was uploaded.

---

## Product decisions in short

- Real data stays on the user's machine or in their browser. The code never imports it and tests never use it.
- Statements are the source of truth for actuals. The Log is a diary and never feeds them.
- Plans are static and actuals are derived. Subscriptions maintain themselves from statements.
- Liquid money and locked money are shown apart so "money lasts" means spendable money.
- Rounding and wording favor clarity: whole dollars, words over signs, no false precision.
- Every control comes from one library so the app looks consistent.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODING_PATTERNS.md](CODING_PATTERNS.md) for how to contribute and how the code is organized.
