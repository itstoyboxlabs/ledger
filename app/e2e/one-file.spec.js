import fs from 'node:fs'
import { test, expect, openApp, goTo, ls } from './fixtures'

// Ledger keeps everything in one ledger-data.json: Export data writes the statements and the settings
// together, and uploading that file gives back exactly what was exported.
const aside = (page) => page.getByRole('complementary')

// what the app saved in IndexedDB under a key (budget, presets, log, notes, data)
const idb = (page, key) =>
  page.evaluate(
    (k) =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open('ledger')
        req.onerror = () => reject(req.error)
        req.onsuccess = () => {
          const get = req.result.transaction('kv').objectStore('kv').get(k)
          get.onsuccess = () => resolve(get.result ?? null)
          get.onerror = () => reject(get.error)
        }
      }),
    key,
  )

async function exportFile(page) {
  await aside(page).getByRole('button', { name: 'Export data' }).click()
  const [dl] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('dialog').getByRole('button', { name: 'Download' }).click(),
  ])
  expect(dl.suggestedFilename()).toBe('ledger-data.json')
  const text = fs.readFileSync(await dl.path(), 'utf8')
  await page.keyboard.press('Escape')
  return text
}

// wipe everything this browser stores and reload onto the empty state
async function clearBrowser(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        localStorage.clear()
        const req = indexedDB.deleteDatabase('ledger')
        req.onsuccess = req.onerror = req.onblocked = () => resolve(null)
      }),
  )
  await page.reload()
  await expect(page.getByRole('button', { name: 'Upload ledger-data.json' })).toBeVisible()
}

test.describe('one data file', () => {
  test('the sample then Export data gives one file with the statements and the settings', async ({ page }) => {
    await openApp(page, { rich: true })
    const file = JSON.parse(await exportFile(page))
    const sample = JSON.parse(fs.readFileSync('public/sample-data.json', 'utf8'))
    expect(Object.keys(file)).toEqual(Object.keys(sample))
    const ids = (f) => f.transactions.map((t) => t.id).sort()
    expect(ids(file)).toEqual(ids(sample))
    expect(Object.keys(file.accounts).sort()).toEqual(Object.keys(sample.accounts).sort())
    expect(file.settings.budget.rows.map((r) => r.id)).toEqual(sample.settings.budget.rows.map((r) => r.id))
    expect(Object.keys(file.settings.presets).sort()).toEqual(Object.keys(sample.settings.presets).sort())
    expect(file.settings.local['ledger:age']).toEqual(sample.settings.local['ledger:age'])
  })

  test('export, clear and upload brings back the budget, presets and statements', async ({ page }) => {
    await openApp(page, { rich: true })
    const before = { data: await idb(page, 'data'), budget: await idb(page, 'budget'), presets: await idb(page, 'presets') }
    expect(Object.keys(before.presets ?? {}).length).toBeGreaterThan(0)
    const text = await exportFile(page)

    await clearBrowser(page)
    await page.locator('input[type=file]').setInputFiles({ name: 'ledger-data.json', mimeType: 'application/json', buffer: Buffer.from(text) })
    await expect(page.getByRole('status')).toContainText('Loaded your statements and settings.')
    await expect(aside(page).getByText('Harbor Bank').first()).toBeVisible()

    expect(await idb(page, 'data')).toEqual(before.data)
    expect(await idb(page, 'budget')).toEqual(before.budget)
    expect(await idb(page, 'presets')).toEqual(before.presets)
    expect((await ls(page, 'age'))?.age).toBe(25)

    // and a second export is the same file apart from the time it was made
    const again = JSON.parse(await exportFile(page))
    expect({ ...again, exportedAt: '' }).toEqual({ ...JSON.parse(text), exportedAt: '' })
    await goTo(page, 'Budget')
    await expect(page.getByRole('main').getByText('Car loan').first()).toBeVisible()
  })

  test('an old settings-only ledger-settings.json still loads', async ({ page }) => {
    await openApp(page, { rich: true })
    const text = await exportFile(page)
    const { version, exportedAt, settings } = JSON.parse(text)
    const statementsOnly = { ...JSON.parse(text) }
    delete statementsOnly.settings
    delete statementsOnly.exportedAt

    await clearBrowser(page)
    await page.locator('input[type=file]').setInputFiles({
      name: 'ledger-settings.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({ version, exportedAt, settings })),
    })
    await expect(page.getByRole('status')).toContainText('Now upload your ledger-data.json')
    await page.locator('input[type=file]').setInputFiles({ name: 'ledger-data.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(statementsOnly)) })
    await expect(aside(page).getByText('Harbor Bank').first()).toBeVisible()
    expect(Object.keys((await idb(page, 'presets')) ?? {}).length).toBeGreaterThan(0)
    expect((await ls(page, 'age'))?.age).toBe(25)
  })
})
