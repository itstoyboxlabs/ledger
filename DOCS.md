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
- **Code layout**: one thing per file. Each page lives in `app/src/screens/<page>` (spending, budget, log, tools,
  retirement, balances, notes). Anything several pages use lives in `app/src/shared` (components, hooks, state,
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
  Log entries, Notes, and `local` keys for Balances (`ledger:debts` linked to the loan rows, `ledger:assets` in the
  savings and 401k pools, planning-variables presets), the Retirement plan, portfolio, presets and the Budget preset
  it follows (`ledger:retireNeedPreset`), plus Rent scenarios, Vacation, Debt payoff and two lists. Take-home pay is
  left at its defaults. Browser tests use `app/e2e/lean-settings.json` (the sample's settings before this was added)
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
  - `merchants` maps a merchant name to a website domain, used for icons.
- `budget.json`: the Budget plan (rows, `dismissedSubs`, `leftover`).
- `log.json`: Log entries.
- `notes.json`: notes.
- `presets.json`: named presets, keyed by page or tool.

### Import and export

- **Two files.** `ledger-data.json` holds statements data. It is made by an AI assistant from your statements
  using `IMPORT_PROMPT.md`, and the app only imports it. `ledger-settings.json` is what "Export data" writes:
  `{ version, exportedAt, settings: { budget, notes, presets, log, local } }`, with no transactions.
- **Upload** takes either file or both. A file with `transactions` merges by id (the file wins), accounts,
  merchants and periods by key, and subscriptions by name. A file with `settings` replaces only the keys it
  contains. Import runs in browser mode. If you change the data format, change `IMPORT_PROMPT.md` too.
- **What survives.** Anything that must outlive the browser, or be visible to an assistant during a refresh, goes
  through these files and not through localStorage.
- **Merchant icons** are served from `app/public/icons/<domain>.png`. `scripts/fetch-icons.sh` downloads them from
  the `merchants` map, follows redirects and checks that each file is a real image. Unknown merchants get a
  letter avatar. The app itself never looks icons up on the network.

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

- **Sidebar**: wordmark, the pages from `NAV`, accounts, Notes, then one row of icon buttons named by tooltip
  (Export data, Download, Upload file when available, Tutorial, GitHub). `PageHeader` has the big title, a
  one-line subtitle from `NAV` and the right-side controls.
- **Nav names and view ids**: Spending (`actuals`), Budget (`budget`), Log (`log`), Tools (`tools`), Retirement
  (`retirement`), Balances (`balances`). The ids never change, so saved values keep working.
- **Accounts in the sidebar**: each row toggles the `accounts` filter. Rows are grouped under a muted bank
  header (none when `bank` is empty) and show name, last four digits and a dot on the right (filled is on, hollow
  is off, colored by type). The list scrolls when long. Toggling one jumps to Spending, the only page the filter
  affects. Accounts that arrive by import are switched on.
- **Phones** (below `lg`): the sidebar becomes a top bar with the wordmark and a hamburger that opens a
  full-screen drawer (`ui/sheet.jsx`) with the same nav, accounts, Notes and icon row. Picking a page closes it.
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

`usePresets(key)` and `PresetBar` store named presets through the storage adapter (`presets.json` locally).
Used by Budget (`expenses`), Rent scenarios (`rentScenario`), Balances (`planningVariables`) and Retirement
(`retirement`).

- `PresetBar` is one `DropdownMenu`. The trigger shows the active preset name, or "Presets" when none, with a
  small amber dot when the current values differ from it.
- A preset is active when its data equals the current data, or when it was the last one applied or saved
  (`ledger:presetActive:<scope>`).
- The menu lists one item per preset with a check on the active one. Hovering a row reveals a save icon
  (overwrite that preset, one click, only while it has drifted) and an X (opens the delete confirm).
- "Save as new preset" is always shown. When `canSave` is false it is disabled with the tooltip "Change something
  first". Saving under an existing name replaces it in place so the order holds.
- Old presets are normalized when applied. Stored presets are never rewritten.

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
  and the statement description under the merchant name. The income table sits below. The sidebar Download
  saves a CSV of every transaction in the month scope on the switched-on accounts, transfers included at their
  real amount.
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

`shared/utils/taxOn.js` and its helpers implement real progressive brackets: federal, FICA (Social Security cap
and Medicare surtax) and state brackets for several states and New York City. Single filer, standard deductions,
labeled estimates.

- `taxOn(gross, state)` is the tax on a salary. `taxOnExtra(base, extra, state)` is the marginal tax on a windfall
  stacked on a salary.
- `ltcgOnExtra` handles long-term gains: federal 0, 15 and 20 percent plus 3.8 percent investment income tax,
  state and local as income, no FICA.
- The state is the shared `taxState`, set on the Balances page. Tools show "Taxed in <state>. Change" and the
  button opens Balances.

### The calculators

- **Take-home pay**: gross salary to net per year, month and paycheck. Pre-tax mechanics are correct: a 401k
  deferral reduces income tax but not FICA, and medical premiums reduce both. Paychecks are 24 a year. The
  employer match lives on the 401k deduction (`match`, percent of your contribution) and is not deducted from
  pay. Calibration tip, also in its tooltip: tune the medical input until the paycheck matches a real pay stub,
  and other salaries inherit the accuracy.
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
  year and "Debt paid off in" (shared debts over that leftover, ignoring interest).
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

A sidebar page (`balances`, landmark icon). Cards: totals owed and owned, "Taxed in" (the shared `taxState`, with
a PresetBar), "What you owe" and "What you have".

- **Debts** live in the `debts` key as `[{ id, name, balance, apr, payment, budgetRow }]`. `payment` is typed
  unless `budgetRow` links a Budget row by id, whose amount is then the payment ("Payment comes from" dropdown,
  "Type it in" means no link). Linking by id means renaming a row keeps the link.
- Older saves were `{ loans, card, taxes }`. `useDebts` rewrites them as three entries on first read, and
  `useDebtLinkMigration` turns an old name-based hint into a row id only when a row with that exact name exists.
  Otherwise the debt migrates unlinked with payment 0, so no number changes.
- **Assets** live in `assets` (`[{ id, name, balance, pool?, kind? }]`) with an "as of" date in `assetsAsOf`.
  `kind` is the account type, picked in an "Account type" select: `regular` (Savings, use anytime), `pretax`
  (a traditional 401k or IRA, taxed as income on the way out) or `roth` (taxed going in, tax free out). Pre-tax
  and Roth are locked until the 401k access age, so picking a type also writes the matching `pool` (`savings` or
  `401k`). Saves without `kind` read through `assetKind`: a `401k` pool asset is pre-tax, anything else regular,
  so old data loads unchanged.
- **Presets** use the key `planningVariables` and save `{ taxState, debts }`. Old presets with debts as an object
  are converted on apply.
- Debt payoff, Rent scenarios and Retirement's debt logic all read this list.

---

## Page: Retirement

The most model-heavy page: a year-by-year projection from current age to the end age.

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
    `incomeTaxOnExtra(0, G, taxState)`: federal brackets after the 16,100 standard deduction plus the state and
    city brackets from the Balances `taxState`, no FICA. It is progressive, so a bigger year reaches higher
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
- **Live by name.** Presets have no id and names are unique, so the pick is the preset name, stored in
  `ledger:retireNeedPreset` (`string` or `null`). Overwriting the preset on Budget moves the need the next time
  Retirement opens. A deleted or renamed preset falls back to the typed number with the note "The <name>
  preset is gone, so this uses your typed number." Typing a new number clears the pick.
- **Old saves.** No key, or a bad value, reads as `null`: the typed number, exactly as before. Results only
  change once a preset is picked.
- **Sanity line**: "Your Budget today: $Y a month" sits under the field whenever Budget has rows of its own.
- The pick is not part of Retirement presets.

### Saving each year

- **Auto contribution sources**: a small Auto toggle on each contribution field swaps the manual number for a
  live value. Toggling off keeps the last typed number.
  - 401k per year: the Take-home tool's 401k deduction (salary times its percent, or a flat amount) plus the
    employer match.
  - Savings per year: the Budget `savings` leftover share, times 12. The leftover never goes below zero. With
    no allocation at all the whole leftover counts. Once there is one, only its savings share does.
  - These live in `retireCalc` (`auto401k`, `autoSavings`) and are captured by presets.
- **Your own savings lines**: the plus button adds `retireCalc.extras: [{ id, name, amount, unit: 'yr'|'mo',
  to: 'savings'|'401k' }]`. They add to the amounts above for every working year. Savings lines go into the
  liquid pool. Retirement account lines go into the locked pool (the first-year 75% rule applies only to the
  payroll 401k).
- **Debt payoff to savings**: each debt has its own monthly payment and is paid off independently, ignoring
  interest and with no snowballing.
  - Months to payoff are `ceil(balance / payment)`. That decides which simulated year it lands in and how many
    months of that year are freed.
  - The payoff year gets a prorated credit for the freed months only. Later years get all 12. Landing exactly on
    a 12-month boundary frees 0 months that year, which is correct.
  - The freed payment follows the Budget allocation: its `savings` share goes into savings and the rest is
    spent. With no allocation at all, all of it goes to savings. This holds for self-cleared debts and for "Pay
    off a debt" events. A debt unticked on the starting balances frees nothing.
  - It applies only while working. A caption under the fields shows each debt's payoff age, with "no payment
    set on Budget" or "already clear" when relevant.

### Events

`retireCalc.events: [{ id, name, amount, kind: 'in'|'out'|'debt', age, repeat: 'once'|'month'|'year'|'2year',
years, auto?: 'equity', debtId?, custom? }]`. The plus button in the section header adds one.

- Repeating events cover `years` years from `age`. Monthly ones add amount times 12 per year. Every-two-years
  pays at the start age and every second year after, inside the window.
- Money-out events show in the Withdrawals column for their year, money-in events in Contributions.
- **Equity link**: an event's Auto badge pulls its amount and years from the Equity payout tool ("Net per
  year"), forces money in, repeating yearly. Like RSUs it pays only while you are still working.
- **Pay off a debt** (`kind: 'debt'`): pick a debt and an age. The amount is the debt's balance (Auto badge,
  click to type your own, `custom: true`). Only an age from today to the end age counts. The debt is then left out of the starting hole, its amount leaves the
  liquid pool at that age, and its payment flows into savings from then on.
- **Old shape**: saves without `events` are converted by `normalizeRetire` into the equivalent events. The
  stored value is only rewritten when something is edited. Stored presets are never rewritten.

### Social Security

`retireCalc.ss: { on, claimAge, auto, monthly }`: a toggle, a claim age (default 67) and a monthly amount with an
Auto badge. Auto is `ssMonthlyBenefit()`: the Take-home salary for 35 years, capped at the wage base, with
90, 32 and 15 percent bend points, scaled by claim age: 62 is 70%, 67 is 100% and 70 is 124%. Claiming early
loses 5/9 of 1% a month for the first 36 months before 67 and 5/12 of 1% a month beyond that (64 is 80%), and
each year after 67 adds 8%.
Figures are for 2026 and sourced in the code. From the claim age on, the benefit reduces the monthly withdrawal,
never below zero. Saves without `ss` read as off so numbers do not move. New users start with it on.

### Known simplifications

Flat return every year, today's dollars, no inflation. Stated in the page footer.

---

## Notes

A pencil icon in the sidebar, visible on every page. It opens a modal backed by `notes.json` through the storage
adapter. Notes are structured, not one blob: `{ id, text, createdAt (epoch ms), pinned }`.

- **Add**: a textarea and an Add button (Cmd or Ctrl plus Enter) at the top.
- **Edit**: each note's text is a live textarea that autosaves about 400ms after typing stops.
- **Delete**: an X, revealed on hover, with no confirm (the same convention as manual budget rows).
- **Pin**: a pin toggle revealed on hover. Pinned notes show a static pin next to their date.
- **Sort**: pinned first, then newest to oldest within each group.
- Notes are included in the settings export.

---

## Product decisions in short

- Real data stays on the user's machine or in their browser. The code never imports it and tests never use it.
- Statements are the source of truth for actuals. The Log is a diary and never feeds them.
- Plans are static and actuals are derived. Subscriptions maintain themselves from statements.
- Liquid money and locked money are shown apart so "money lasts" means spendable money.
- Rounding and wording favor clarity: whole dollars, words over signs, no false precision.
- Every control comes from one library so the app looks consistent.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODING_PATTERNS.md](CODING_PATTERNS.md) for how to contribute and how the code is organized.
