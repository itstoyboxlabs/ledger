import fs from 'node:fs'
import { test, expect, openApp, goTo, ls } from './fixtures'

// The About you page: age, filing status and tax state, which the planning pages read.
// openApp loads the lean e2e settings (no About you keys), so each test starts from what the
// shipped sample saves: age 35 as of 2026 and Single. The clock is pinned to November 2026.
// The rich sample itself is checked in sample.spec.js.

const main = (page) => page.getByRole('main')
const card = (page, title) => main(page).locator('[data-slot=card]').filter({ has: page.locator('h2', { hasText: title }) }).first()
const ageBox = (page) => main(page).getByLabel('Your age')
const filingSelect = (page) => main(page).getByRole('combobox', { name: 'Filing status' })

async function pickFiling(page, name) {
  await filingSelect(page).click()
  await page.getByRole('option', { name }).click()
  await expect(filingSelect(page)).toHaveText(name)
}

// open Tools and return the Take-home pay card
async function takeHome(page) {
  await goTo(page, 'Tools')
  return main(page).locator('[data-slot=card]').filter({ has: page.locator('h2', { hasText: 'Take-home pay' }) }).first()
}

test.beforeEach(async ({ page }) => {
  await openApp(page)
  await page.evaluate(() => {
    localStorage.setItem('ledger:age', JSON.stringify({ age: 35, asOf: 2026 }))
    localStorage.setItem('ledger:filingStatus', JSON.stringify('single'))
  })
  await page.reload()
  await goTo(page, 'About you')
})

test.describe('page', () => {
  test('sits at the top of the sidebar and explains itself', async ({ page }) => {
    const names = await page.getByRole('complementary').getByRole('navigation', { name: 'Pages' }).getByRole('button').allInnerTexts()
    expect(names.map((n) => n.trim()).slice(0, 3)).toEqual(['About you', 'Spending', 'Budget'])
    await expect(main(page)).toContainText('This is the starting point for planning')
    for (const t of ['Your age', 'Filing status', 'Tax state and city']) {
      await expect(main(page).getByRole('heading', { level: 2, name: new RegExp(t) })).toBeVisible()
    }
  })

  test('starts from the sample data: 35, Single, Texas', async ({ page }) => {
    await expect(ageBox(page)).toHaveValue('35')
    await expect(filingSelect(page)).toHaveText('Single')
    await expect(main(page).getByRole('button', { name: /State\s*Texas/ })).toBeVisible()
  })

  test('has no partner fields', async ({ page }) => {
    await expect(main(page).getByLabel(/partner|spouse/i)).toHaveCount(0)
  })
})

test.describe('age', () => {
  test('a typed age is saved with this year and survives a reload', async ({ page }) => {
    await ageBox(page).fill('41')
    await expect(card(page, 'Your age')).toContainText('You are 41. Next January this becomes 42 by itself.')
    expect(await ls(page, 'age')).toEqual({ age: 41, asOf: 2026 })
    await page.reload()
    await expect(ageBox(page)).toHaveValue('41')
  })

  test('an age typed in an earlier year has gone up since', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('ledger:age', JSON.stringify({ age: 30, asOf: 2024 })))
    await page.reload()
    await expect(ageBox(page)).toHaveValue('32')
    await expect(card(page, 'Your age')).toContainText('You are 32 now. You typed 30 in 2024')
  })

  test('Retirement reads it behind an Auto badge, and a typed age still works', async ({ page }) => {
    await ageBox(page).fill('40')
    await goTo(page, 'Retirement')
    const ageField = main(page).locator('div.relative').filter({ has: page.locator('span:text-is("Current age")') }).first()
    await expect(ageField.getByRole('button', { name: 'Auto' })).toHaveAttribute('aria-pressed', 'true')
    await expect(ageField).toContainText('40')
    const table = main(page).locator('table').filter({ hasText: 'Total (liquid)' }).first()
    await expect(table.locator('tbody tr').first().locator('td').first()).toHaveText('40')
    // turn Auto off: the typed age (35 for a new plan) comes back and can be edited
    await ageField.getByRole('button', { name: 'Auto' }).click()
    await expect(ageField.locator('input')).toHaveValue('35')
    await ageField.locator('input').fill('38')
    await expect(table.locator('tbody tr').first().locator('td').first()).toHaveText('38')
    expect(await ls(page, 'retireAgeAuto')).toBe(false)
  })

  test('clearing the age leaves Retirement on its typed age', async ({ page }) => {
    await main(page).getByRole('button', { name: 'Clear my age' }).click()
    expect(await ls(page, 'age')).toBeNull()
    await goTo(page, 'Retirement')
    const ageField = main(page).locator('label').filter({ has: page.locator('span:text-is("Current age")') }).first()
    await expect(ageField.locator('input')).toHaveValue('35')
    await expect(main(page).locator('div.relative').filter({ has: page.locator('span:text-is("Current age")') }).getByRole('button', { name: 'Auto' })).toHaveCount(0)
  })
})

test.describe('filing status', () => {
  test('Married filing jointly raises Take-home pay and the tools say why', async ({ page }) => {
    let th = await takeHome(page)
    await expect(th.getByRole('row', { name: 'Federal income tax' })).toContainText('−$7,670.00')
    await expect(th.getByRole('row', { name: 'Take-home per year' })).toContainText('$61,347.70')
    await expect(th).not.toContainText('Married filing jointly')

    await goTo(page, 'About you')
    await pickFiling(page, 'Married filing jointly')
    expect(await ls(page, 'filingStatus')).toBe('mfj')

    // taxable 75,000 - 32,200 = 42,800: 24,800 x 10% + 18,000 x 12% = 4,640
    th = await takeHome(page)
    await expect(th.getByRole('row', { name: 'Federal income tax' })).toContainText('−$4,640.00')
    await expect(th.getByRole('row', { name: 'Take-home per year' })).toContainText('$64,377.70')
    await expect(th).toContainText('Using Married filing jointly from About you.')
    for (const title of ['Hourly calculator', 'Equity payout', 'Rent scenarios']) {
      const c = main(page).locator('[data-slot=card]').filter({ has: page.locator('h2', { hasText: title }) }).first()
      await expect(c).toContainText('Using Married filing jointly from About you.')
    }
  })

  test('the note links back to About you', async ({ page }) => {
    await pickFiling(page, 'Married filing jointly')
    const th = await takeHome(page)
    await th.getByText('Using Married filing jointly from About you.').getByRole('button', { name: 'Change' }).click()
    await expect(page.locator('h1', { hasText: 'About you' })).toBeVisible()
  })

  test('switching back to Single restores the old numbers exactly', async ({ page }) => {
    await pickFiling(page, 'Married filing jointly')
    await pickFiling(page, 'Single')
    const th = await takeHome(page)
    await expect(th.getByRole('row', { name: 'Take-home per year' })).toContainText('$61,347.70')
  })

  test('an old save with no filing status reads as Single', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('ledger:filingStatus'))
    await page.reload()
    await expect(filingSelect(page)).toHaveText('Single')
  })
})

test.describe('tax state', () => {
  test('uses the same saved key as before, so an old Balances choice loads', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('ledger:taxState', JSON.stringify('ca')))
    await page.reload()
    await expect(main(page).getByRole('button', { name: /State\s*California/ })).toBeVisible()
  })

  test('a new state taxes the tools', async ({ page }) => {
    await main(page).getByRole('button', { name: /State/ }).click()
    await page.getByRole('menuitem', { name: 'New York' }).or(page.getByRole('option', { name: 'New York' })).first().click()
    expect(await ls(page, 'taxState')).toBe('ny')
    const th = await takeHome(page)
    await expect(th).toContainText('Taxed in New York.')
    await goTo(page, 'Balances')
    await expect(main(page).getByText(/Taxed in/)).toHaveCount(0)
  })
})

test.describe('export and import', () => {
  test('age and filing status travel in the settings file', async ({ page }) => {
    await ageBox(page).fill('44')
    await pickFiling(page, 'Married filing jointly')
    await page.getByRole('complementary').getByRole('button', { name: 'Export data' }).click()
    const [dl] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('dialog').getByRole('button', { name: 'Download' }).click(),
    ])
    const text = fs.readFileSync(await dl.path(), 'utf8')
    const file = JSON.parse(text)
    expect(file.settings.local['ledger:age']).toEqual({ age: 44, asOf: 2026 })
    expect(file.settings.local['ledger:filingStatus']).toBe('mfj')
    await page.keyboard.press('Escape')

    // change both, then load the file back
    await ageBox(page).fill('20')
    await pickFiling(page, 'Single')
    await page.locator('input[type=file]').first().setInputFiles({
      name: 'ledger-settings.json',
      mimeType: 'application/json',
      buffer: Buffer.from(text),
    })
    await goTo(page, 'About you')
    await expect(ageBox(page)).toHaveValue('44')
    await expect(filingSelect(page)).toHaveText('Married filing jointly')
  })
})

test.describe('keyboard and labels', () => {
  test('every control has a name and can be reached and used with the keyboard', async ({ page }) => {
    await expect(ageBox(page)).toBeVisible()
    await expect(filingSelect(page)).toBeVisible()
    await ageBox(page).focus()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('52')
    await expect(ageBox(page)).toHaveValue('52')
    // tab on to the filing status select and change it with the arrow keys
    await filingSelect(page).focus()
    await expect(filingSelect(page)).toBeFocused()
    await page.keyboard.press('Enter')
    await page.getByRole('option', { name: 'Married filing jointly' }).focus()
    await page.keyboard.press('Enter')
    await expect(filingSelect(page)).toHaveText('Married filing jointly')
    // the info tip on the tax state card is focusable and explains the state estimate
    const tip = card(page, 'Tax state and city').locator('h2 [tabindex="0"]')
    await tip.focus()
    await expect(page.getByRole('tooltip').first()).toContainText('estimate')
  })

  test('the page has one h1 and its cards use h2 titles', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText('About you')
    await expect(main(page).locator('[data-slot=card] h2')).toHaveCount(3)
  })
})

