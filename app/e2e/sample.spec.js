import { test, expect, openApp, goTo } from './fixtures'

// The sample data as shipped (public/sample-data.json) fills every page. Other specs use the lean settings.
const main = (page) => page.getByRole('main')

test.describe('rich sample data', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page, { rich: true })
  })

  test('Balances shows debts and assets', async ({ page }) => {
    await goTo(page, 'Balances')
    await expect(main(page).getByText('$37,550').first()).toBeVisible()
    await expect(main(page).getByText('$97,100').first()).toBeVisible()
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
  })

  test('Retirement follows the Retirement budget preset', async ({ page }) => {
    await goTo(page, 'Retirement')
    await expect(main(page).getByText('Retirement', { exact: true }).first()).toBeVisible()
    await expect(main(page).getByText('Replace the car').or(main(page).locator('input[value="Replace the car"]')).first()).toBeVisible()
  })

  test('Log and Notes have entries', async ({ page }) => {
    await goTo(page, 'Log')
    await expect(main(page).getByText('Farmers market')).toBeVisible()
  })
})
