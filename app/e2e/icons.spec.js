import { test, expect, openApp, ICON_ROUTE } from './fixtures'

// The hosted site's merchant logos come from a shared catalog. Here its index and images are mocked, and the
// sample's `merchants` map loses Uber, so Uber can only match by name.
const INDEX = { domains: ['netflix.com', 'uber.com'], names: { netflix: 'netflix.com', uber: 'uber.com' } }
// a 1x1 transparent PNG
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64')

const txnRows = (page) => page.locator('table', { has: page.getByRole('columnheader', { name: /^Merchant/ }) }).first().locator('tbody tr')
const rowFor = (page, merchant) => txnRows(page).filter({ has: page.locator('div.font-medium', { hasText: new RegExp(`^${merchant}$`) }) }).first()

test('browser mode shows catalog logos for known merchants and letters for the rest', async ({ page }) => {
  const asked = []
  await page.route(ICON_ROUTE, async (route) => {
    const url = route.request().url()
    asked.push(url)
    if (url.endsWith('/icons/index.json')) return route.fulfill({ json: INDEX })
    return route.fulfill({ body: PNG, contentType: 'image/png' })
  })
  await page.route('**/sample-data.json', async (route) => {
    const res = await route.fetch()
    const body = await res.json()
    const { Uber: _uber, ...merchants } = body.merchants
    await route.fulfill({ response: res, json: { ...body, merchants } })
  })
  await openApp(page, { rich: true })

  // Netflix matches by the domain in the merchants map, Uber by its name alone
  await expect(rowFor(page, 'Netflix').locator('img[src$="/icons/netflix.com.png"]')).toBeVisible()
  await expect(rowFor(page, 'Uber').locator('img[src$="/icons/uber.com.png"]')).toBeVisible()
  // Spotify has a domain the catalog lacks, Lucali is unknown: both keep their letter
  await expect(rowFor(page, 'Spotify').locator('[data-slot=avatar-fallback]')).toHaveText('S')
  await expect(rowFor(page, 'Lucali').locator('[data-slot=avatar-fallback]')).toHaveText('L')
  await expect(rowFor(page, 'Lucali').locator('img')).toHaveCount(0)

  // one index request, and only catalog files: nothing names a merchant the catalog does not have
  expect(asked.filter((u) => u.endsWith('/index.json'))).toHaveLength(1)
  expect(asked.some((u) => /spotify|lucali/i.test(u))).toBe(false)
})
