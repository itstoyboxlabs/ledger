# Browser tests

Playwright tests that click through every page the way a person would. One spec per area:
`shell`, `spending`, `budget`, `log`, `tools`, `retirement`, `balances` and `marketing`. The unit tests live next to the code they test (see [CODING_PATTERNS.md](../../CODING_PATTERNS.md)).

## Run

```bash
cd app
npx playwright install chromium   # once
npm run test:e2e
```

`npm run test:e2e` starts its own dev server on port 5159 and stops it after. Set `LEDGER_TEST_PORT` to use another port.
To reuse a Chromium you already have, set `PW_CHROMIUM` to its executable path.

## Your real data is never touched

- The server runs with `vite --mode browser`. That mode has no `/api` file endpoints, so the app uses IndexedDB in the test browser and never reads your data folder.
- Every test gets a fresh browser context, so storage starts empty and nothing carries over.
- All numbers come from the fake `public/sample-data.json`, loaded with the "Try it with sample data" button.
- `fixtures.js` refuses to run if the server answers `/api/budget` (a local-mode server).
- `global-setup.js` hashes your data folder before the run and fails the run if anything in it changed.
- The clock is pinned to Nov 8 2026, so "this month" is always the same.

## Writing a test

```js
import { test, expect, openApp, goTo } from './fixtures'

test('example', async ({ page }) => {
  await openApp(page)        // sample data loaded, on Spending
  await goTo(page, 'Budget') // sidebar page
})
```

Saves are debounced, so call `flushSaves(page)` before reloading a page you just edited.
