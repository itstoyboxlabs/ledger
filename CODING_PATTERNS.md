# Coding patterns

How the code in `app/` is organized. New code follows this. Old code moves over one feature at a time.
Migration status is at the bottom.

## Stack

- React and TypeScript, built with Vite. The landing page and tutorial (`screens/marketing`) and the app are one React
  project: `/` and `/tutorial` are prerendered to HTML at build time (`app/scripts/prerender.mjs`) for speed and search,
  and `/app` is a single-page app. No Next.js: nothing needs a server.
- Tailwind v4 and shadcn/ui for the UI. Recharts for charts.
- Unit tests: Vitest and Testing Library (`npm run test:unit`). Browser tests: Playwright (`npm run test:e2e`,
  see `app/e2e/README.md`). `npm test` runs both. `npm run typecheck` runs `tsc`.

## One thing per file

Every file exports one thing, named after the file.

| Kind | Folder | Example | Test beside it |
| --- | --- | --- | --- |
| Constant | `constants/` | `constants/budgetRowDefaults.ts` | none needed |
| Enum | `enums/` | `enums/AccountType.ts` | none needed |
| Type or interface | `types/` | `types/BudgetRow.ts` | none needed |
| Utility (pure function) | `utils/` | `utils/monthlyCost.ts` | `utils/monthlyCost.test.ts` |
| Hook | `hooks/` | `hooks/useSortedEntries.ts` | `hooks/useSortedEntries.test.ts` |
| Store (Zustand) | `state/` | `state/useBudgetStore.ts` | `state/useBudgetStore.test.ts` |
| Component | `ui/` | `ui/LogMeter.tsx` | `ui/LogMeter.test.tsx` |

Rules:

- Constants, enums, types and utilities each get their own file. Every utility, hook, store and component has a test file,
  and every test file sits next to the file it tests.
- The exception: the props type of a component stays in the component file (`type LogMeterProps = ...`).
  Anything used by more than one file moves to `types/`.
- No barrel files (`index.ts` that re-export). Import from the file you need.
- A component file holds one component. Small private helpers it alone uses can sit above it in the same file.
- Test what a person can see or what a function returns, not how it is built inside.

## Folders

The app is a set of screens (pages). Every screen, every feature inside a screen, and `shared` have the same
folders, and components always live in `ui/`.

```
app/src/
  screens/
    guide/  spending/  about-you/  budget/  log/  balances/  retirement/  marketing/
    tools/
      constants/  enums/  hooks/  state/  types/  utils/  ui/    what the Tools screen itself uses
      features/                                                  one folder per calculator
        take-home/  hourly/  rent-scenario/  debt-payoff/  ...
          constants/  enums/  hooks/  state/  types/  utils/  ui/    the same folders again
  shared/                                                        used by more than one screen
    constants/  enums/  hooks/  state/  types/  utils/  ui/
    ui/primitives/                                               the shadcn buttons, inputs and so on
  App.tsx  main.tsx
```

- Create a folder only when there is something to put in it. `features/` appears only where a screen has parts big
  enough to be their own folder (today, the Tools calculators).
- **A module can use its own files and anything above it.** A feature can use its screen's files and `shared`. A
  screen can use its own features and `shared`.
- **Never sideways.** A screen never imports another screen, and a feature never imports a sibling feature. When
  two of them need something, it moves up one level: to the screen, or to `shared` if two screens need it. Take-home
  pay is built in Tools, but Budget, Rent scenarios and Retirement all read it, so its store lives in `shared/state/`.
- `shared` never imports from a screen.
- Start a thing where it is first used. When a second place needs it, move it up in that same change.
- `src/architecture.test.ts` checks all of this.

## State

Zustand is the only state library. Ledger makes no network calls for data (everything is IndexedDB, localStorage or the
local file server; the one exception is the shared merchant logo catalog, a single public file loaded once into
`iconCatalogStore`), so there is no use for React Query, and Redux is more than this needs.

- **Saved data** (budget, log, notes, presets): one store each. A store has `load`, a debounced `save` that also
  flushes when the page closes, and a reload when the window regains focus (skipped while a save is pending).
  Components read the store through a hook such as `useBudget()` and never call the storage adapter directly.
- **Persisted UI and tool state** (selected month, sort order, tool inputs): a Zustand store with the persist
  middleware, keeping the existing `ledger:` keys so saved numbers never reset. This replaces `usePersistedState`
  and its `ledger-state` event, so parents stop passing props around.
- **State used by one component** stays in `useState` in that component.
- **Where stores live**: a store only one screen reads sits in that screen's `state/` folder. A store several screens
  read (budget, balances, take-home, tax state) sits in `shared/state/`, along with the helper that builds persisted
  stores (`shared/state/createPersistedStore.ts`).

## Code splitting

Vite splits any dynamic `import()` into its own file that loads when needed.

- Split at the page: `App` loads each feature's main view with `React.lazy` and a `Suspense` fallback, so opening
  Spending does not download Retirement.
- Split what is heavy or optional: the Recharts charts, the tax engine, and each calculator on the Tools page
  (it loads when the tool is switched on).
- Do not lazy-load small components. Splitting everything makes a chain of tiny requests that is slower than one file.
- The sidebar, header and first paint stay in the main bundle.
- Check with `npm run build`: the output lists every chunk and its size. Keep the main chunk small.

## Styling

- Tailwind classes in the JSX. Components do not get their own CSS files.
- All global CSS lives in `app/src/styles/`: `tokens.css` (the `:root` colors, radii and fonts), `theme.css` (the
  Tailwind `@theme` mapping), `base.css` (resets, scrollbars) and `index.css`, which imports the other three.
- Colors always come from a token (`var(--accent)`), never a hard-coded hex in a component.
- If a component truly needs custom CSS that utilities cannot express, put it in `styles/` under the component's name
  and keep it short.

## Data and privacy

- Real data lives in `data/` and the user's browser. It is never imported by the code and never used in tests.
- Tests and demos use `app/public/sample-data.json`, which is fake.

## Migration status

- [x] Playwright tests for every page (`app/e2e/`)
- [x] TypeScript and Vitest set up (`allowJs` is on, so files move over one at a time)
- [x] Everything in `App.jsx`, the old `lib/` folder split into one file each, with a unit test beside it
- [x] `App.jsx` split into feature folders, one component per file
- [ ] Zustand stores for saved data and persisted UI state
- [x] Pages and charts lazy-loaded; CSS split into `styles/`
