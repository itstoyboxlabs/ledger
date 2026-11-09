import { test, expect, openApp, goTo } from './fixtures'

// The sample data as shipped (public/sample-data.json) fills every page. Other specs use the lean settings.
const main = (page) => page.getByRole('main')

test.describe('rich sample data', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page, { rich: true })
  })

  test('Balances shows debts and assets', async ({ page }) => {
    await goTo(page, 'Balances')
    await expect(main(page).getByText('$25,200').first()).toBeVisible()
    await expect(main(page).getByText('$48,700').first()).toBeVisible()
    await expect(main(page).locator('input[value="Car loan"]')).toBeVisible()
    await expect(main(page).locator('input[value="Roth IRA"]')).toBeVisible()
  })

  test('Budget has three presets and a leftover plan', async ({ page }) => {
    await goTo(page, 'Budget')
    // the trigger shows "Today" because the rows match that preset
    await main(page).locator('[data-slot=dropdown-menu-trigger]:visible').nth(1).click()
    for (const name of ['Today', 'Leaner (easier job)', 'Retirement']) {
      await expect(page.getByRole('menuitem', { name })).toBeVisible()
    }
    await expect(page.getByText(/On Retirement you pick one for each period by age\./)).toBeVisible()
  })

  test('Retirement follows the Retirement budget preset', async ({ page }) => {
    await goTo(page, 'Retirement')
    await expect(main(page).getByText('Retirement', { exact: true }).first()).toBeVisible()
    await expect(main(page).getByText('Replace the car').or(main(page).locator('input[value="Replace the car"]')).first()).toBeVisible()
  })

  test('Log has entries', async ({ page }) => {
    await goTo(page, 'Log')
    await expect(main(page).getByText('Farmers market')).toBeVisible()
  })

  test('About you has a birth date that makes you 25 on the Balances date and Single, and Retirement follows that age', async ({ page }) => {
    await goTo(page, 'About you')
    await expect(main(page).getByLabel('Birth date')).toHaveValue('05-14-2001')
    await expect(main(page)).toContainText('You are 25 today.')
    await expect(main(page).getByRole('combobox', { name: 'Filing status' })).toHaveText('Single')
    await goTo(page, 'Retirement')
    const ageField = main(page).locator('div.relative').filter({ has: page.locator('span:text-is("Current age")') }).first()
    await expect(ageField.getByRole('button', { name: 'Auto' })).toHaveAttribute('aria-pressed', 'true')
    await expect(ageField).toContainText('25')
  })

  test('Retirement plans a corporate job until 40, then an easier job, each with its own presets', async ({ page }) => {
    await goTo(page, 'Retirement')
    const card = main(page).locator('[data-slot=card]', { has: page.getByRole('heading', { name: 'Pay and saving over time' }) })
    await expect(card.getByLabel('Label for period 1')).toHaveValue('Corporate job')
    await expect(card.getByLabel('Label for period 2')).toHaveValue('Easier job')
    await expect(card.getByLabel(/From age for Corporate job/)).toHaveValue('25')
    await expect(card.getByLabel(/Until age for Corporate job/)).toHaveValue('40')
    await expect(card.getByLabel(/Contributions grow a year for Corporate job/)).toHaveValue('3')
    await expect(card.getByLabel(/From age for Easier job/)).toHaveValue('40')
    await expect(card.getByLabel(/Until age for Easier job/)).toHaveCount(0)
    await expect(card.getByRole('button', { name: 'Take-home preset for Corporate job: Corporate job' })).toBeVisible()
    await expect(card.getByRole('button', { name: 'Budget preset for Corporate job: Today' })).toBeVisible()
    await expect(card.getByRole('button', { name: 'Take-home preset for Easier job: Easier job' })).toBeVisible()
    await expect(card.getByRole('button', { name: 'Budget preset for Easier job: Leaner (easier job)' })).toBeVisible()
    // the corporate job puts 6% plus a 50% match into the 401k; the easier job puts in nothing and saves less
    await expect(card).toContainText('$9,450')
    await expect(card).toContainText('$19,602')
    await expect(card).toContainText('$9,098')
    // conservative returns: a realistic headline at 62 that lasts to 95 (the debts pay off with interest)
    await expect(main(page).getByText('At retirement (62)')).toBeVisible()
    await expect(main(page).getByText('$2,566,643').first()).toBeVisible()
    await expect(main(page).getByText('to 95+')).toBeVisible()
    // the How this works section starts closed and explains the presets
    const how = card.getByRole('button', { name: 'How this works' })
    await expect(how).toHaveAttribute('aria-expanded', 'false')
    await how.click()
    await expect(card).toContainText('Presets are saved versions of your Budget and your Take-home pay')
  })

  test('Take-home pay has a preset for each job, today is the corporate job and Budget income follows it', async ({ page }) => {
    await goTo(page, 'Tools')
    const th = main(page).locator('[data-slot=card]').filter({ has: page.locator('h2', { hasText: 'Take-home pay' }) }).first()
    await th.getByRole('button', { name: 'Corporate job' }).click()
    for (const name of ['Corporate job', 'Easier job', 'Part-time']) {
      await expect(page.getByRole('menuitem', { name })).toBeVisible()
    }
    await expect(page.getByText(/Save your pay for each part of your life/)).toBeVisible()
    await page.keyboard.press('Escape')
    await goTo(page, 'Budget')
    await expect(main(page).getByText('$6,376').first()).toBeVisible()
  })
})
