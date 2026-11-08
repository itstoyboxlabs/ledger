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

  test('icon row has export, download, upload, tutorial and github', async ({ page }) => {
    await openApp(page)
    const aside = page.getByRole('complementary')
    for (const n of ['Export data', 'Download', 'Upload file']) await expect(aside.getByRole('button', { name: n })).toBeVisible()
    await expect(aside.getByRole('link', { name: 'Tutorial' })).toHaveAttribute('href', /tutorial/)
    await expect(aside.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', /.+/)
  })

  test('Export data downloads a settings file with no transactions', async ({ page }) => {
    await openApp(page)
    await page.getByRole('complementary').getByRole('button', { name: 'Export data' }).click()
    const [dl] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('dialog').getByRole('button', { name: 'Download' }).click(),
    ])
    expect(dl.suggestedFilename()).toBe('ledger-settings.json')
    const file = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'))
    expect(file.version).toBe(1)
    expect(file.transactions).toBeUndefined()
    expect(Array.isArray(file.settings.budget.rows)).toBe(true)
  })
})

test.describe('csv download', () => {
  test('Download saves the scoped transactions as a CSV', async ({ page }) => {
    await openApp(page)
    const [dl] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('complementary').getByRole('button', { name: 'Download' }).click(),
    ])
    expect(dl.suggestedFilename()).toMatch(/\.csv$/)
    const lines = fs.readFileSync(await dl.path(), 'utf8').split('\n')
    expect(lines[0]).toBe('date,merchant,description,category,subcategory,account,kind,amount')
    expect(lines.length).toBeGreaterThan(100)
  })
})

test.describe('notes', () => {
  const open = async (page) => {
    await page.getByRole('button', { name: 'Notes' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  }
  const add = async (page, text) => {
    await page.getByPlaceholder(/New note/).fill(text)
    await page.getByRole('dialog').getByRole('button', { name: 'Add', exact: true }).click()
  }

  test('starts empty, adds notes, newest first', async ({ page }) => {
    await openApp(page)
    await open(page)
    await expect(page.getByText('No notes yet.')).toBeVisible()
    await add(page, 'first note')
    await page.clock.fastForward(2000)
    await add(page, 'second note')
    const boxes = page.getByRole('dialog').locator('textarea:not([placeholder])')
    await expect(boxes).toHaveCount(2)
    await expect(boxes.nth(0)).toHaveValue('second note')
    await expect(boxes.nth(1)).toHaveValue('first note')
  })

  test('Cmd/Ctrl+Enter adds a note', async ({ page }) => {
    await openApp(page)
    await open(page)
    await page.getByPlaceholder(/New note/).fill('quick one')
    await page.getByPlaceholder(/New note/).press('ControlOrMeta+Enter')
    await expect(page.getByRole('dialog').locator('textarea:not([placeholder])')).toHaveValue('quick one')
  })

  test('a blank note is not added', async ({ page }) => {
    await openApp(page)
    await open(page)
    await page.getByPlaceholder(/New note/).fill('   ')
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Add', exact: true })).toBeDisabled()
  })

  test('editing autosaves and survives a reload', async ({ page }) => {
    await openApp(page)
    await open(page)
    await add(page, 'draft')
    const box = page.getByRole('dialog').locator('textarea:not([placeholder])')
    await box.fill('edited text')
    await page.waitForTimeout(900)
    await page.reload()
    await open(page)
    await expect(page.getByRole('dialog').locator('textarea:not([placeholder])')).toHaveValue('edited text')
  })

  test('pinned notes sort first, delete removes a note', async ({ page }) => {
    await openApp(page)
    await open(page)
    await add(page, 'older')
    await page.clock.fastForward(2000)
    await add(page, 'newer')
    const rows = page.getByRole('dialog').locator('textarea:not([placeholder])')
    // pin the older note (second row)
    await rows.nth(1).locator('xpath=ancestor::*[.//button][1]').hover()
    await page.getByRole('dialog').getByRole('button', { name: /pin/i }).nth(1).click()
    await expect(rows.nth(0)).toHaveValue('older')
    await rows.nth(0).locator('xpath=ancestor::*[.//button][1]').hover()
    await page.getByRole('dialog').getByRole('button', { name: /delete|remove/i }).first().click()
    await expect(rows).toHaveCount(1)
    await expect(rows.first()).toHaveValue('newer')
  })

  test('Close and Escape dismiss the modal', async ({ page }) => {
    await openApp(page)
    await open(page)
    await page.getByRole('dialog').getByRole('button', { name: 'Close' }).first().click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await open(page)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })
})
