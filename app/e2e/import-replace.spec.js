import fs from 'node:fs'
import { test, expect, openApp, goTo, ls } from './fixtures'

// Uploading a file replaces what the browser stores. Nothing from the sample (or an earlier file) survives.
const main = (page) => page.getByRole('main')
const aside = (page) => page.getByRole('complementary')

const tx = (id, date, amount, desc) => ({ id, date, account: 'mine', amount, kind: 'expense', desc, merchant: desc, cat: 'Food & Dining', sub: 'Groceries' })
const realFile = {
  version: 1,
  accounts: { mine: { name: 'Everyday', bank: 'Cedar Credit Union', type: 'checking', last4: '7788' } },
  transactions: [tx('m-1', '2026-10-03', 42.5, 'Corner Market'), tx('m-2', '2026-10-12', 18.25, 'Bakery Row')],
}
const asUpload = (name, json) => ({ name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(json)) })

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

const upload = (page, ...files) => page.locator('input[type=file]').setInputFiles(files)

test.describe('upload replaces stored data', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page, { rich: true })
    await expect(aside(page).getByText('Harbor Bank').first()).toBeVisible()
  })

  test('a real file after the sample removes the fake accounts and every sample setting', async ({ page }) => {
    await upload(page, asUpload('ledger-data.json', realFile))
    await expect(page.getByRole('status')).toContainText('Loaded 2 transactions.')
    await expect(aside(page).getByText('Cedar Credit Union').first()).toBeVisible()
    await expect(aside(page).getByText('Harbor Bank')).toHaveCount(0)
    await expect(aside(page).getByText('Maple Card')).toHaveCount(0)

    // the sample budget, presets, log and notes are gone from storage
    expect((await idb(page, 'data')).transactions.map((t) => t.id)).toEqual(['m-1', 'm-2'])
    expect(await idb(page, 'presets')).toBeNull()
    expect(await idb(page, 'log')).toBeNull()
    expect(await idb(page, 'notes')).toBeNull()
    const budget = await idb(page, 'budget')
    expect(JSON.stringify(budget ?? {})).not.toContain('Car loan')
    // and so are the sample's localStorage settings
    expect(await ls(page, 'retireNeedPreset')).toBeNull()
    expect(JSON.stringify(await ls(page, 'debts'))).not.toContain('Car loan')
    expect(await ls(page, 'birthDate')).toBeNull()

    await goTo(page, 'Log')
    await expect(main(page).getByText('Farmers market')).toHaveCount(0)
    await goTo(page, 'About you')
    await expect(main(page).getByLabel('Birth date')).toHaveValue('')
  })

  test('a data file and a settings backup picked together both load', async ({ page }) => {
    const backup = { version: 1, settings: { budget: { rows: [] }, local: { 'ledger:birthDate': '1995-02-03' } } }
    await upload(page, asUpload('ledger-settings.json', backup), asUpload('ledger-data.json', realFile))
    await expect(page.getByRole('status')).toContainText('Loaded your statements and settings.')
    await expect(aside(page).getByText('Cedar Credit Union').first()).toBeVisible()
    await expect(aside(page).getByText('Harbor Bank')).toHaveCount(0)
    expect(await idb(page, 'presets')).toBeNull()
    await goTo(page, 'About you')
    await expect(main(page).getByLabel('Birth date')).toHaveValue('02-03-1995')
  })

  test('an old settings backup on its own keeps your statements and replaces the settings', async ({ page }) => {
    await upload(page, asUpload('ledger-data.json', { ...realFile, settings: { presets: { budget: [{ name: 'Mine', data: {} }] } } }))
    await expect(aside(page).getByText('Cedar Credit Union').first()).toBeVisible()
    await upload(page, asUpload('ledger-settings.json', { version: 1, settings: { local: { 'ledger:birthDate': '1982-07-04' } } }))
    await expect(page.getByRole('status')).toContainText('Settings loaded.')
    await expect(aside(page).getByText('Cedar Credit Union').first()).toBeVisible()
    expect((await idb(page, 'data')).transactions.map((t) => t.id)).toEqual(['m-1', 'm-2'])
    expect(await idb(page, 'presets')).toBeNull()
    await goTo(page, 'About you')
    await expect(main(page).getByLabel('Birth date')).toHaveValue('07-04-1982')
  })

  test('an old settings backup over the sample clears the sample and waits for your statements', async ({ page }) => {
    await upload(page, asUpload('ledger-settings.json', { version: 1, settings: { local: { 'ledger:birthDate': '1982-07-04' } } }))
    await expect(page.getByRole('status')).toContainText('Now upload your ledger-data.json')
    await expect(page.getByRole('button', { name: 'Upload ledger-data.json' })).toBeVisible()
    expect(await ls(page, 'retireNeedPreset')).toBeNull()
    await upload(page, asUpload('ledger-data.json', realFile))
    await expect(aside(page).getByText('Cedar Credit Union').first()).toBeVisible()
    await goTo(page, 'About you')
    await expect(main(page).getByLabel('Birth date')).toHaveValue('07-04-1982')
  })

  test('a statements-only file over your own data keeps your settings', async ({ page }) => {
    await upload(page, asUpload('ledger-data.json', { ...realFile, settings: { local: { 'ledger:birthDate': '1995-02-03' } } }))
    await expect(aside(page).getByText('Cedar Credit Union').first()).toBeVisible()
    const next = { ...realFile, transactions: [...realFile.transactions, tx('m-3', '2026-10-20', 9.75, 'Bakery Row')] }
    await upload(page, asUpload('ledger-data.json', next))
    await expect(page.getByRole('status')).toContainText('Loaded 3 transactions.')
    await goTo(page, 'About you')
    await expect(main(page).getByLabel('Birth date')).toHaveValue('02-03-1995')
  })

  test('the upload button says it loads your data or gives the prompt again', async ({ page }) => {
    await aside(page).getByRole('button', { name: 'Upload file' }).hover()
    await expect(page.getByRole('tooltip')).toContainText('Upload file: load your data, or get the import prompt again.')
  })
})

test.describe('the Upload your data modal', () => {
  const dialog = (page) => page.getByRole('dialog', { name: 'Upload your data' })
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await aside(page).getByRole('button', { name: 'Upload file' }).click()
    await expect(dialog(page)).toBeVisible()
  })

  test('says what a file replaces and closes with Escape', async ({ page }) => {
    await expect(dialog(page)).toContainText('a statements-only file replaces just your statements')
    await expect(dialog(page).getByRole('heading', { name: 'Need to redo your statements?' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog(page)).toBeHidden()
  })

  test('Choose a file opens the file picker and closes the modal', async ({ page }) => {
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      dialog(page).getByRole('button', { name: 'Choose a file' }).click(),
    ])
    await expect(dialog(page)).toBeHidden()
    const realFile = JSON.parse(fs.readFileSync('public/sample-data.json', 'utf8'))
    delete realFile.settings
    await chooser.setFiles({ name: 'ledger-data.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(realFile)) })
    await expect(page.getByRole('status')).toContainText('Loaded')
  })

  test('copies and downloads the import prompt', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await dialog(page).getByRole('button', { name: 'Copy the prompt' }).click()
    await expect(dialog(page).getByRole('button', { name: 'Copied' })).toBeVisible()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('You are helping me import')
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      dialog(page).getByRole('button', { name: 'Download the prompt' }).click(),
    ])
    expect(download.suggestedFilename()).toBe('IMPORT_PROMPT.md')
  })

  test('Read more opens Getting started', async ({ page }) => {
    await dialog(page).getByRole('button', { name: 'Read more on the Getting started page' }).click()
    await expect(dialog(page)).toBeHidden()
    await expect(page.locator('h1')).toHaveText('Getting started')
  })
})
