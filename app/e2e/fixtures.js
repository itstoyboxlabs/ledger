import fs from 'node:fs'
import { test as base, expect } from '@playwright/test'

// Every test gets a fresh browser context (empty IndexedDB and localStorage) on a dev server
// in browser mode, so nothing here can reach the real data folder. The clock is pinned so
// "this month" is always November 2026 and the sample data's last month is October 2026.
export const NOW = '2026-11-08T12:00:00'

// The hosted site loads a shared merchant logo catalog from the Supabase storage bucket. Tests never reach it: by default the
// request fails, so merchants show letter avatars as before. icons.spec.js mocks it instead.
export const ICON_ROUTE = 'https://newimvknbatgjauygmwu.supabase.co/storage/v1/object/public/ledger-public/icons/**'

// The first-run "watch the tutorials" nudge would sit over the sidebar in every spec, so by default each test
// starts with `ledger:tutorialAck` already set. Set `test.use({ tutorialAck: false })` to start like a new user.
export const test = base.extend({
  tutorialAck: [true, { option: true }],
  page: async ({ page, tutorialAck }, provide) => {
    await page.route(ICON_ROUTE, (route) => route.abort())
    await page.clock.install({ time: new Date(NOW) })
    if (tutorialAck) {
      // once per tab (sessionStorage marks it) so a later clear or upload is not undone by a reload
      await page.addInitScript(() => {
        try {
          if (sessionStorage.getItem('e2e:seeded')) return
          sessionStorage.setItem('e2e:seeded', '1')
          localStorage.setItem('ledger:tutorialAck', 'true')
        } catch { /* storage unavailable */ }
      })
    }
    await provide(page)
  },
})
export { expect }

// Refuse to run against a local-mode server (one that serves /api/budget from real files).
async function assertBrowserMode(page) {
  const r = await page.request.get('/api/budget', { headers: { accept: 'application/json' } })
  const type = r.headers()['content-type'] ?? ''
  if (type.includes('json')) throw new Error('Test server is in local mode. Refusing to touch real data.')
}

// open the app on the empty state, with nothing loaded
export async function openEmpty(page) {
  await page.goto('/app')
  await assertBrowserMode(page)
  await expect(page.getByRole('button', { name: 'Try it with sample data' })).toBeVisible()
}

// open the app with the fake sample data loaded, on the Spending page.
// Most specs were written against a bare start (no balances, no presets, the first eight budget rows), so by
// default the sample's settings are swapped for e2e/lean-settings.json, the sample as it was before it got
// balances and presets. Pass { rich: true } to load public/sample-data.json exactly as shipped.
export async function openApp(page, { rich = false } = {}) {
  await openEmpty(page)
  if (!rich) {
    const lean = JSON.parse(fs.readFileSync('e2e/lean-settings.json', 'utf8'))
    await page.route('**/sample-data.json', async (route) => {
      const res = await route.fetch()
      const body = await res.json()
      await route.fulfill({ response: res, json: { ...body, settings: lean } })
    })
  }
  await page.getByRole('button', { name: 'Try it with sample data' }).click()
  await expect(page.getByRole('heading', { name: 'Spending', level: 1 }).or(page.locator('h1', { hasText: 'Spending' }))).toBeVisible()
}

// go to a page by its sidebar name
export async function goTo(page, name) {
  await page.getByRole('complementary').getByRole('button', { name, exact: true }).click()
  await expect(page.locator('h1', { hasText: name })).toBeVisible()
}

// read a localStorage value the app saved (keys are "ledger:<name>")
export const ls = (page, key) =>
  page.evaluate((k) => {
    const raw = localStorage.getItem(`ledger:${k}`)
    try { return JSON.parse(raw) } catch { return raw }
  }, key)

export const money = (s) => Number(String(s).replace(/[−-]/, '-').replace(/[^0-9.-]/g, ''))

// Saves are debounced (about 400 ms) and the page has no "saved" label, so jump the pinned
// clock past the debounce and give IndexedDB a moment to commit before reloading or leaving.
export async function flushSaves(page) {
  await page.clock.fastForward(600)
  await page.waitForTimeout(200)
}
