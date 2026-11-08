import { test, expect, openApp, goTo, ls, flushSaves } from './fixtures'

// The sample data starts with no debts and no assets, so every test builds what it needs.

const main = (page) => page.getByRole('main')
const owe = (page) => main(page).locator('[data-slot=card]', { hasText: 'Add a debt' }).last()
const have = (page) => main(page).locator('[data-slot=card]', { hasText: 'Add something you have' }).last()
const kpi = (page, label) => main(page).locator('[data-slot=card]', { hasText: label }).first()
const nums = (card) => card.locator('input[type=number]')
const texts = (card) => card.locator('input:not([type=number]):not([type=date])')

async function addDebt(page, { name, balance, apr = 0, payment = 0 }) {
  await main(page).getByRole('button', { name: 'Add a debt' }).click()
  const i = (await texts(owe(page)).count()) - 1
  await texts(owe(page)).nth(i).fill(name)
  await nums(owe(page)).nth(i * 3).fill(String(balance))
  await nums(owe(page)).nth(i * 3 + 1).fill(String(apr))
  await nums(owe(page)).nth(i * 3 + 2).fill(String(payment))
}
async function addAsset(page, { name, balance }) {
  await main(page).getByRole('button', { name: 'Add something you have' }).click()
  const i = (await texts(have(page)).count()) - 1
  await texts(have(page)).nth(i).fill(name)
  await nums(have(page)).nth(i).fill(String(balance))
}

test.beforeEach(async ({ page }) => {
  await openApp(page)
  await goTo(page, 'Balances')
})

test.describe('empty page', () => {
  test('starts with nothing owed or owned', async ({ page }) => {
    await expect(kpi(page, 'Total owed')).toContainText('$0.00')
    await expect(kpi(page, 'Total owned')).toContainText('$0.00')
    await expect(main(page).getByText('No debts yet.')).toBeVisible()
    await expect(main(page).getByText('Nothing added yet.')).toBeVisible()
  })
})

test.describe('what you owe', () => {
  test('adding a debt gives a blank row with defaults', async ({ page }) => {
    await main(page).getByRole('button', { name: 'Add a debt' }).click()
    await expect(main(page).getByText('No debts yet.')).toHaveCount(0)
    await expect(texts(owe(page)).first()).toHaveAttribute('placeholder', 'Student loans')
    await expect(texts(owe(page)).first()).toHaveValue('')
    await expect(owe(page).locator('[data-slot=dropdown-menu-trigger]')).toContainText('Type it in')
  })

  test('total owed adds up every debt balance', async ({ page }) => {
    await addDebt(page, { name: 'Loans', balance: 20000, apr: 5, payment: 400 })
    await addDebt(page, { name: 'Card', balance: 3500.5, apr: 24, payment: 150 })
    await expect(kpi(page, 'Total owed')).toContainText('$23,500.50')
  })

  test('a debt can be renamed', async ({ page }) => {
    await addDebt(page, { name: 'Car loan', balance: 9000 })
    await page.reload()
    await expect(texts(owe(page)).first()).toHaveValue('Car loan')
  })

  test('debts survive a reload with every field', async ({ page }) => {
    await addDebt(page, { name: 'Loans', balance: 12345, apr: 6.5, payment: 300 })
    await page.reload()
    await expect(nums(owe(page)).nth(0)).toHaveValue('12345')
    await expect(nums(owe(page)).nth(1)).toHaveValue('6.5')
    await expect(nums(owe(page)).nth(2)).toHaveValue('300')
    expect((await ls(page, 'debts')).length).toBe(1)
  })

  test('a debt can be removed', async ({ page }) => {
    await addDebt(page, { name: 'Loans', balance: 1000 })
    await owe(page).getByRole('button', { name: /remove|delete/i }).first().click()
    await expect(main(page).getByText('No debts yet.')).toBeVisible()
    await expect(kpi(page, 'Total owed')).toContainText('$0.00')
  })

  test('clearing the balance lets you type a new number', async ({ page }) => {
    await addDebt(page, { name: 'Loans', balance: 5000 })
    await nums(owe(page)).nth(0).fill('')
    await expect(nums(owe(page)).nth(0)).toHaveValue('')
    await nums(owe(page)).nth(0).fill('750')
    await expect(kpi(page, 'Total owed')).toContainText('$750.00')
  })

  test('the payment can be linked to a Budget row and follows its amount', async ({ page }) => {
    await addDebt(page, { name: 'Loans', balance: 5000, payment: 10 })
    await owe(page).locator('[data-slot=dropdown-menu-trigger]').click()
    await page.getByRole('menuitem', { name: 'Transit' }).click()
    // Transit is budgeted at $120, so that is now the payment
    await expect(owe(page)).toContainText('Transit')
    await expect(nums(owe(page))).toHaveCount(2)
    expect((await ls(page, 'debts'))[0].budgetRow).toBeTruthy()
    // change the Budget row and the payment follows
    await goTo(page, 'Budget')
    const row = page.locator('tr').filter({ has: page.locator('input[value="Electricity"]') })
    await expect(row).toHaveCount(1)
  })
})

test.describe('what you have', () => {
  test('adding something gives a savings line with defaults', async ({ page }) => {
    await main(page).getByRole('button', { name: 'Add something you have' }).click()
    await expect(texts(have(page)).first()).toHaveAttribute('placeholder', 'Savings account')
    await expect(texts(have(page)).first()).toHaveValue('')
    await expect(have(page)).toContainText('Savings (use anytime)')
  })

  test('total owned adds up every balance', async ({ page }) => {
    await addAsset(page, { name: 'Checking', balance: 4200 })
    await addAsset(page, { name: 'Brokerage', balance: 15800.75 })
    await expect(kpi(page, 'Total owned')).toContainText('$20,000.75')
  })

  test('an asset can be a pre-tax retirement account instead', async ({ page }) => {
    await addAsset(page, { name: '401k', balance: 50000 })
    await have(page).getByRole('combobox', { name: 'Account type for 401k' }).click()
    await page.getByRole('option', { name: 'Pre-tax 401k or IRA (locked)' }).click()
    await expect(have(page)).toContainText('Pre-tax 401k or IRA (locked)')
    await flushSaves(page)
    await page.reload()
    await expect(have(page)).toContainText('Pre-tax 401k or IRA (locked)')
    expect((await ls(page, 'assets'))[0]).toMatchObject({ kind: 'pretax', pool: '401k' })
  })

  test('a Roth account is its own type and stays locked', async ({ page }) => {
    await addAsset(page, { name: 'Roth IRA', balance: 20000 })
    await have(page).getByRole('combobox', { name: 'Account type for Roth IRA' }).click()
    await page.getByRole('option', { name: 'Roth 401k or IRA (locked)' }).click()
    await expect(have(page).getByRole('combobox', { name: 'Account type for Roth IRA' })).toHaveText('Roth 401k or IRA (locked)')
    await flushSaves(page)
    expect((await ls(page, 'assets'))[0]).toMatchObject({ kind: 'roth', pool: '401k' })
  })

  test('an old 401k asset with no type reads as pre-tax', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('ledger:assets', JSON.stringify([{ id: 'a1', name: 'Old 401k', balance: 1000, pool: '401k' }])))
    await page.reload()
    await goTo(page, 'Balances')
    await expect(have(page).getByRole('combobox', { name: 'Account type for Old 401k' })).toHaveText('Pre-tax 401k or IRA (locked)')
  })

  test('the as-of date is kept', async ({ page }) => {
    await main(page).getByRole('button', { name: 'Add something you have' }).click()
    await have(page).locator('input[type=date]').fill('2026-10-31')
    await page.reload()
    await expect(have(page).locator('input[type=date]')).toHaveValue('2026-10-31')
  })

  test('assets survive a reload', async ({ page }) => {
    await addAsset(page, { name: 'Emergency fund', balance: 9000 })
    await page.reload()
    await expect(texts(have(page)).first()).toHaveValue('Emergency fund')
    await expect(kpi(page, 'Total owned')).toContainText('$9,000.00')
  })

  test('an asset can be removed', async ({ page }) => {
    await addAsset(page, { name: 'Cash', balance: 100 })
    await have(page).getByRole('button', { name: /remove|delete/i }).first().click()
    await expect(main(page).getByText('Nothing added yet.')).toBeVisible()
  })
})

test.describe('taxed in', () => {
  test('the state picker moved to About you, and Balances points there', async ({ page }) => {
    await expect(main(page).getByRole('heading', { level: 2, name: 'Taxed in Texas' })).toBeVisible()
    await expect(main(page).getByText('Your tax state and filing status now live on the About you tab.')).toBeVisible()
    await expect(main(page).getByRole('button', { name: /State\s*Texas/ })).toHaveCount(0)
    await main(page).getByRole('button', { name: 'Open About you' }).click()
    await expect(page.locator('h1', { hasText: 'About you' })).toBeVisible()
  })

  test('a state picked on About you shows here', async ({ page }) => {
    await goTo(page, 'About you')
    await main(page).getByRole('button', { name: /State/ }).click()
    await page.getByRole('menuitem', { name: 'New York' }).or(page.getByRole('option', { name: 'New York' })).first().click()
    await goTo(page, 'Balances')
    await expect(main(page).getByRole('heading', { level: 2, name: 'Taxed in New York' })).toBeVisible()
  })
})

test.describe('presets', () => {
  test('saving and applying a preset restores the state and the debts', async ({ page }) => {
    await addDebt(page, { name: 'Loans', balance: 8000, payment: 200 })
    await main(page).getByRole('button', { name: 'Presets' }).click()
    await page.getByRole('menuitem', { name: 'Save as new preset' }).click()
    await page.getByRole('dialog').getByRole('textbox').fill('Today')
    await page.getByRole('dialog').getByRole('button', { name: /^Save/ }).click()
    await nums(owe(page)).nth(0).fill('1')
    await expect(kpi(page, 'Total owed')).toContainText('$1.00')
    await main(page).locator('[data-slot=dropdown-menu-trigger]').first().click()
    await page.getByRole('menuitem', { name: 'Today' }).click()
    await expect(kpi(page, 'Total owed')).toContainText('$8,000.00')
  })
})

test.describe('other pages read Balances', () => {
  test('Retirement starting balances come from what you have and owe', async ({ page }) => {
    await addAsset(page, { name: 'Savings', balance: 10000 })
    await addDebt(page, { name: 'Loans', balance: 2000, payment: 100 })
    await goTo(page, 'Retirement')
    await expect(main(page)).toContainText('Savings')
    await expect(main(page)).toContainText('Loans')
  })
})
