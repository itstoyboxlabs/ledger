import fs from 'node:fs'
import { test, expect, openApp, goTo, ls } from './fixtures'

// The About you page: birth date, filing status and tax state, which the planning pages read.
// openApp loads the lean e2e settings (no About you keys and no Balances date), so each test
// seeds a birth date that makes you 35 today and Single. The clock is pinned to November 8, 2026.
// The rich sample itself is checked in sample.spec.js.

const main = (page) => page.getByRole('main')
const card = (page, title) => main(page).locator('[data-slot=card]').filter({ has: page.locator('h2', { hasText: title }) }).first()
const birthBox = (page) => main(page).getByLabel('Birth date')
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
    localStorage.setItem('ledger:birthDate', JSON.stringify('1991-03-15'))
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
    for (const t of ['Your birth date', 'Filing status', 'Tax state and city']) {
      await expect(main(page).getByRole('heading', { level: 2, name: new RegExp(t) })).toBeVisible()
    }
  })

  test('starts from the seeded birth date (35 today), Single, Texas', async ({ page }) => {
    await expect(birthBox(page)).toHaveValue('03-15-1991')
    await expect(card(page, 'Your birth date')).toContainText('You are 35 today.')
    await expect(filingSelect(page)).toHaveText('Single')
    await expect(main(page).getByRole('button', { name: /State\s*Texas/ })).toBeVisible()
  })

  test('has no partner fields', async ({ page }) => {
    await expect(main(page).getByLabel(/partner|spouse/i)).toHaveCount(0)
  })
})

test.describe('birth date', () => {
  const ageField = (page) => main(page).locator('div.relative').filter({ has: page.locator('span:text-is("Current age")') }).first()
  const firstRowAge = (page) => main(page).locator('table').filter({ hasText: 'Total (liquid)' }).first().locator('tbody tr').first().locator('td').first()
  const tip = async (page) => {
    await ageField(page).locator('[tabindex="0"]').first().focus()
    return page.getByRole('tooltip').first()
  }

  test('a birth date typed as MM-DD-YYYY shows the age and survives a reload', async ({ page }) => {
    await birthBox(page).fill('04-20-1988')
    await expect(card(page, 'Your birth date')).toContainText('You are 38 today.')
    expect(await ls(page, 'birthDate')).toBe('1988-04-20')
    await page.reload()
    await expect(birthBox(page)).toHaveValue('04-20-1988')
    await expect(card(page, 'Your birth date')).toContainText('You are 38 today.')
  })

  test('slashes work too and the date shows back with dashes', async ({ page }) => {
    await birthBox(page).fill('4/2/1990')
    await birthBox(page).blur()
    expect(await ls(page, 'birthDate')).toBe('1990-04-02')
    await expect(birthBox(page)).toHaveValue('04-02-1990')
  })

  test('bad input shows a plain error and keeps the saved date', async ({ page }) => {
    const alert = card(page, 'Your birth date').getByRole('alert')
    await birthBox(page).fill('02-30-1990')
    await expect(alert).toHaveText('That date does not exist. Check the month and the day.')
    await birthBox(page).fill('01-01-2030')
    await expect(alert).toHaveText('That date is in the future. Check the year.')
    await birthBox(page).fill('01-01-1890')
    await expect(alert).toContainText('older than 120')
    await birthBox(page).fill('1990')
    await expect(alert).toHaveCount(0)
    await birthBox(page).blur()
    await expect(alert).toHaveText('Type your birth date as MM-DD-YYYY, like 04-15-1990.')
    expect(await ls(page, 'birthDate')).toBe('1991-03-15')
  })

  test('Retirement Auto uses the age on the Balances date and moves when Balances does', async ({ page }) => {
    await birthBox(page).fill('11-01-1990')
    await page.evaluate(() => localStorage.setItem('ledger:assetsAsOf', JSON.stringify('2025-10-31')))
    await page.reload()
    await goTo(page, 'Retirement')
    await expect(ageField(page).getByRole('button', { name: 'Auto' })).toHaveAttribute('aria-pressed', 'true')
    await expect(ageField(page)).toContainText('34')
    await expect(firstRowAge(page)).toHaveText('34')
    await expect(await tip(page)).toContainText('Using your age on the day you last updated Balances (October 31, 2025). Update Balances to move it forward.')

    await goTo(page, 'Balances')
    await main(page).getByLabel('As of').fill('2026-11-05')
    await goTo(page, 'Retirement')
    await expect(ageField(page)).toContainText('36')
    await expect(firstRowAge(page)).toHaveText('36')
    await expect(await tip(page)).toContainText('(November 5, 2026)')
  })

  test('with no Balances date Retirement uses the age today, and a typed age still works', async ({ page }) => {
    await goTo(page, 'Retirement')
    await expect(ageField(page)).toContainText('35')
    await expect(await tip(page)).toContainText('Using your age today')
    // turn Auto off: the typed age comes back and can be edited
    await ageField(page).getByRole('button', { name: 'Auto' }).click()
    await expect(ageField(page).locator('input')).toHaveValue('35')
    await ageField(page).locator('input').fill('38')
    await expect(firstRowAge(page)).toHaveText('38')
    expect(await ls(page, 'retireAgeAuto')).toBe(false)
  })

  test('an old save with a typed age still loads as that fixed age until a birth date is added', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.removeItem('ledger:birthDate')
      localStorage.setItem('ledger:age', JSON.stringify({ age: 30, asOf: 2024 }))
    })
    await page.reload()
    await expect(birthBox(page)).toHaveValue('')
    await expect(card(page, 'Your birth date')).toContainText('You typed your age as 30 before Ledger asked for a birth date.')
    await goTo(page, 'Retirement')
    await expect(ageField(page)).toContainText('30')
    await expect(firstRowAge(page)).toHaveText('30')

    await goTo(page, 'About you')
    await birthBox(page).fill('06-01-1980')
    expect(await ls(page, 'age')).toBeNull()
    await goTo(page, 'Retirement')
    await expect(firstRowAge(page)).toHaveText('46')
  })

  test('clearing the birth date leaves Retirement on its typed age', async ({ page }) => {
    await main(page).getByRole('button', { name: 'Clear my birth date' }).click()
    expect(await ls(page, 'birthDate')).toBeNull()
    await goTo(page, 'Retirement')
    const typed = main(page).locator('label').filter({ has: page.locator('span:text-is("Current age")') }).first()
    await expect(typed.locator('input')).toHaveValue('35')
    await expect(ageField(page).getByRole('button', { name: 'Auto' })).toHaveCount(0)
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
  test('birth date and filing status travel in the exported ledger-data.json', async ({ page }) => {
    await birthBox(page).fill('07-04-1982')
    await pickFiling(page, 'Married filing jointly')
    await page.getByRole('complementary').getByRole('button', { name: 'Export data' }).click()
    const [dl] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('dialog').getByRole('button', { name: 'Download' }).click(),
    ])
    const text = fs.readFileSync(await dl.path(), 'utf8')
    const file = JSON.parse(text)
    expect(file.settings.local['ledger:birthDate']).toBe('1982-07-04')
    expect(file.settings.local['ledger:filingStatus']).toBe('mfj')
    await page.keyboard.press('Escape')

    // change both, then load the file back
    await birthBox(page).fill('01-01-2000')
    await pickFiling(page, 'Single')
    await page.locator('input[type=file]').first().setInputFiles({
      name: 'ledger-data.json',
      mimeType: 'application/json',
      buffer: Buffer.from(text),
    })
    await goTo(page, 'About you')
    await expect(birthBox(page)).toHaveValue('07-04-1982')
    await expect(card(page, 'Your birth date')).toContainText('You are 44 today.')
    await expect(filingSelect(page)).toHaveText('Married filing jointly')
  })
})

test.describe('keyboard and labels', () => {
  test('every control has a name and can be reached and used with the keyboard', async ({ page }) => {
    await expect(birthBox(page)).toBeVisible()
    await expect(filingSelect(page)).toBeVisible()
    await birthBox(page).focus()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('05-06-1974')
    await expect(birthBox(page)).toHaveValue('05-06-1974')
    expect(await ls(page, 'birthDate')).toBe('1974-05-06')
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

