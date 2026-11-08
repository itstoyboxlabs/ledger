import { defineConfig } from '@playwright/test'

// Tests run against a throwaway dev server in browser mode (port 5159). That mode skips
// the /api plugins in vite.config.js, so nothing here can read or write ../data, and every
// test gets a fresh browser context (empty IndexedDB and localStorage) seeded from the
// fake public/sample-data.json. See e2e/README.md.
// LEDGER_TEST_PORT lets two runs go at once (default 5159)
const PORT = Number(process.env.LEDGER_TEST_PORT) || 5159

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.js',
  globalSetup: './e2e/global-setup.js',
  fullyParallel: true,
  // 10 browsers at once on a laptop; CI is already split into shards, so each shard stays small
  workers: Number(process.env.PW_WORKERS) || (process.env.CI ? 2 : 10),
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
    // set PW_CHROMIUM to reuse a browser you already have instead of `npx playwright install`
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  webServer: {
    command: `npx vite --mode browser --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI, // safe: every test refuses to run against a local-mode server
    timeout: 60_000,
  },
})
