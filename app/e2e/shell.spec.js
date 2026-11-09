import { test, expect, openEmpty, openApp, goTo, ls } from './fixtures'
import fs from 'node:fs'

test.describe('safety', () => {
  test('runs in browser mode with no data loaded', async ({ page }) => {
    await openEmpty(page)
    const r = await page.request.get('/api/budget', { headers: { accept: 'application/json' } })
    const body = await r.text()
    expect(() => JSON.parse(body)).toThrow()
    await expect(page.getByText("There's nothing here yet.")).toBeVisible()
  })

  test('every test starts clean', async ({ page }) => {
    await page.goto('/app')
    expect(await page.evaluate(() => localStorage.length)).toBe(0)
  })
})

test.describe('empty state and sample data', () => {
  test('sample data loads and lands on Spending', async ({ page }) => {
    await openApp(page)
    await expect(page.getByText('290 transactions').first()).toBeVisible()
  })

  test('import prompt button copies the prompt', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await openEmpty(page)
    await page.getByRole('button', { name: 'Copy import prompt' }).click()
    const text = await page.evaluate(() => navigator.clipboard.readText())
    expect(text.length).toBeGreaterThan(200)
  })

  test('uploading a data file loads it', async ({ page }) => {
    await openEmpty(page)
    const sample = JSON.parse(fs.readFileSync('public/sample-data.json', 'utf8'))
    const { settings, ...dataOnly } = sample
    await page.locator('input[type=file]').first().setInputFiles({
      name: 'ledger-data.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(dataOnly)),
    })
    await expect(page.locator('h1', { hasText: 'Spending' })).toBeVisible()
    await expect(page.getByText('290 transactions').first()).toBeVisible()
  })

  test('a file that is not valid JSON is rejected with a message', async ({ page }) => {
    await openEmpty(page)
    await page.locator('input[type=file]').first().setInputFiles({
      name: 'bad.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{ nope'),
    })
    await expect(page.getByText('bad.json is not valid JSON.')).toBeVisible()
    await expect(page.getByText("There's nothing here yet.")).toBeVisible()
  })
})

test.describe('sidebar', () => {
  test('nav switches pages and remembers the last one on reload', async ({ page }) => {
    await openApp(page)
    for (const name of ['About you', 'Budget', 'Log', 'Tools', 'Retirement', 'Balances', 'Spending']) {
      await goTo(page, name)
    }
    await goTo(page, 'Budget')
    await page.reload()
    await expect(page.locator('h1', { hasText: 'Budget' })).toBeVisible()
  })

  test('accounts toggle on and off and jump to Spending', async ({ page }) => {
    await openApp(page)
    await goTo(page, 'Budget')
    await page.getByRole('button', { name: /Maple Card/ }).click()
    await expect(page.locator('h1', { hasText: 'Spending' })).toBeVisible()
    // only the checking account's rows are left
    await expect(page.getByText('290 transactions')).toHaveCount(0)
    await expect(page.getByText('77 transactions').first()).toBeVisible()
    await page.getByRole('button', { name: /Maple Card/ }).click()
    await expect(page.getByText('290 transactions').first()).toBeVisible()
  })

  test('icon row has export, upload, tutorial and github', async ({ page }) => {
    await openApp(page)
    const aside = page.getByRole('complementary')
    for (const n of ['Export data', 'Upload file']) await expect(aside.getByRole('button', { name: n })).toBeVisible()
    await expect(aside.getByRole('link', { name: 'Tutorial' })).toHaveAttribute('href', /tutorial/)
    await expect(aside.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', /.+/)
  })

  test('Export data downloads one ledger-data.json with the statements and the settings', async ({ page }) => {
    await openApp(page)
    await page.getByRole('complementary').getByRole('button', { name: 'Export data' }).click()
    const [dl] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('dialog').getByRole('button', { name: 'Download' }).click(),
    ])
    expect(dl.suggestedFilename()).toBe('ledger-data.json')
    const file = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'))
    expect(file.version).toBe(1)
    expect(file.transactions.length).toBeGreaterThan(100)
    expect(Object.keys(file.accounts).length).toBeGreaterThan(0)
    expect(Array.isArray(file.settings.budget.rows)).toBe(true)
  })
})
