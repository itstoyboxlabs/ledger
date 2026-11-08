import { test, expect, openApp, goTo, ls, money, flushSaves } from './fixtures'

// Sample budget (public/sample-data.json): Rent 1850, Crunch Fitness 39, Electricity 95,
// Phone 65, Groceries 450, Restaurants 260, Transit 120, Unexpected 150, plus the
// subscriptions Netflix, Spotify and iCloud ($30). Income is $5,821 a month.

const main = (page) => page.getByRole('main')
const rowOf = (page, name) => page.locator('tr').filter({ has: page.locator(`input[value="${name}"]`) })
const amountIn = (page, name) => rowOf(page, name).locator('input').nth(1)
const totalRow = (page) => page.locator('tr', { hasText: /^Total/ })
const subRow = (page, name) => main(page).locator('tr', { has: page.getByRole('button', { name: 'Remove until it charges again' }) }).filter({ hasText: name })
const kpi = (page, label) => main(page).locator('[data-slot=card]', { hasText: label }).first()
const saved = (page) => flushSaves(page)

async function setAmount(page, name, value) {
  const input = amountIn(page, name)
  await input.fill(String(value))
  await input.blur()
  await saved(page)
}

test.beforeEach(async ({ page }) => {
  await openApp(page)
  await goTo(page, 'Budget')
})

test.describe('summary cards', () => {
  test('income, expenses and what is left', async ({ page }) => {
    await expect(kpi(page, 'Monthly income')).toContainText('$5,821')
    await expect(kpi(page, 'Budgeted expenses')).toContainText('$3,059')
    await expect(kpi(page, 'Budgeted expenses')).toContainText('8 line items')
    await expect(kpi(page, 'Left over / month')).toContainText('$2,762')
    await expect(kpi(page, 'Left over / year')).toContainText('$33,142')
  })

  test('each card compares to the last complete month', async ({ page }) => {
    await expect(kpi(page, 'Budgeted expenses')).toContainText('Actual spending, Oct 2026')
    await expect(kpi(page, 'Budgeted expenses')).toContainText('$3,415')
    await expect(kpi(page, 'Budgeted expenses')).toContainText('$356 over budget')
    await expect(kpi(page, 'Left over / month')).toContainText('$356 short')
  })
})

test.describe('editing amounts', () => {
  test('changing an amount moves the total, the KPIs and the leftover', async ({ page }) => {
    await setAmount(page, 'Rent', 1900)
    await expect(totalRow(page).last()).toContainText('$3,109')
    await expect(kpi(page, 'Budgeted expenses')).toContainText('$3,109')
    await expect(kpi(page, 'Left over / month')).toContainText('$2,712')
  })

  test('amounts are whole dollars, rounded up', async ({ page }) => {
    await setAmount(page, 'Rent', 1850.4)
    await expect(amountIn(page, 'Rent')).toHaveValue('1851')
    await expect(totalRow(page).last()).toContainText('$3,060')
  })

  test('clearing a field lets you type a fresh number', async ({ page }) => {
    const input = amountIn(page, 'Electricity')
    await input.fill('')
    await expect(input).toHaveValue('')
    await input.fill('120')
    await input.blur()
    await saved(page)
    await expect(totalRow(page).last()).toContainText('$3,084')
  })

  test('edits are saved and survive a reload', async ({ page }) => {
    await setAmount(page, 'Phone', 80)
    await page.reload()
    await expect(amountIn(page, 'Phone')).toHaveValue(/80/)
    await expect(totalRow(page).last()).toContainText('$3,074')
  })

  test('renaming a row keeps it', async ({ page }) => {
    await rowOf(page, 'Electricity').locator('input').first().fill('Power')
    await page.keyboard.press('Tab')
    await saved(page)
    await page.reload()
    await expect(rowOf(page, 'Power')).toHaveCount(1)
  })
})

test.describe('add and remove rows', () => {
  test('adds a simple expense', async ({ page }) => {
    await main(page).getByRole('button', { name: '+ Add row' }).click()
    const d = page.getByRole('dialog')
    await d.getByPlaceholder('e.g. Gym membership').fill('Pet food')
    await d.getByPlaceholder('0.00').fill('40')
    await d.getByRole('button', { name: 'Add', exact: true }).click()
    await expect(rowOf(page, 'Pet food')).toHaveCount(1)
    await expect(totalRow(page).last()).toContainText('$3,099')
    await expect(kpi(page, 'Budgeted expenses')).toContainText('9 line items')
  })

  test('cannot add a row without a name', async ({ page }) => {
    await main(page).getByRole('button', { name: '+ Add row' }).click()
    await page.getByRole('dialog').getByPlaceholder('0.00').fill('40')
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Add', exact: true })).toBeDisabled()
  })

  test('Cancel leaves the budget alone', async ({ page }) => {
    await main(page).getByRole('button', { name: '+ Add row' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click()
    await expect(totalRow(page).last()).toContainText('$3,059')
  })

  test('a subscription you add by hand keeps the amount you typed', async ({ page }) => {
    await main(page).getByRole('button', { name: '+ Add row' }).click()
    const d = page.getByRole('dialog')
    await d.getByRole('tab', { name: 'Subscriptions' }).click()
    await d.getByPlaceholder('e.g. Gym membership').fill('Hinge')
    await d.getByPlaceholder('0.00').fill('25')
    await d.getByRole('button', { name: 'Add', exact: true }).click()
    const row = subRow(page, 'Hinge')
    await expect(row).toContainText('$25')
    await expect(main(page).locator('tr', { hasText: 'Subscriptions total' })).toContainText('$55')
    await saved(page)
    await page.reload()
    await expect(subRow(page, 'Hinge')).toContainText('$25')
  })

  test('adding a stack builds the row from its sub items', async ({ page }) => {
    await main(page).getByRole('button', { name: '+ Add row' }).click()
    const d = page.getByRole('dialog')
    await d.getByRole('tab', { name: 'Stack with sub items' }).click()
    await expect(d).toContainText('1 sub item')
    await d.getByPlaceholder('Sub item name').fill('Vet')
    await d.locator('input:not([placeholder])').last().fill('30')
    await d.getByPlaceholder('e.g. Gym membership').fill('Pets')
    await expect(d).toContainText('$30a month')
    await d.getByRole('button', { name: 'Add', exact: true }).click()
    await expect(rowOf(page, 'Pets')).toContainText('30')
    await expect(totalRow(page).last()).toContainText('$3,089')
  })

  test('removing a manual row drops it from the total', async ({ page }) => {
    await rowOf(page, 'Electricity').getByRole('button', { name: 'Remove row' }).click()
    await expect(rowOf(page, 'Electricity')).toHaveCount(0)
    await expect(totalRow(page).last()).toContainText('$2,964')
  })

  test('removing a subscription hides it until it charges again, and the chip restores it', async ({ page }) => {
    await subRow(page, 'Netflix').getByRole('button', { name: 'Remove until it charges again' }).click()
    await expect(subRow(page, 'Netflix')).toHaveCount(0)
    await expect(main(page).getByText('Removed until they charge again:')).toBeVisible()
    await expect(totalRow(page).last()).toContainText('$3,044')
    await main(page).getByRole('button', { name: /^Netflix/ }).click()
    await expect(subRow(page, 'Netflix')).toHaveCount(1)
    await expect(totalRow(page).last()).toContainText('$3,059')
  })

  test('subscription names and amounts are read only', async ({ page }) => {
    const sub = subRow(page, 'Spotify')
    await expect(sub.locator('input')).toHaveCount(0)
    await expect(sub).toContainText('$12')
  })
})

test.describe('sub items (stacks)', () => {
  test('a stack shows the sum of its items and opens its editor', async ({ page }) => {
    await expect(rowOf(page, 'Groceries')).toContainText('450')
    await rowOf(page, 'Groceries').getByRole('button', { name: 'Edit sub items' }).click()
    const d = page.getByRole('dialog')
    await expect(d).toContainText('4 sub items')
    await expect(d).toContainText('$450')
  })

  test('per week items multiply out (average cost x times a week x 4)', async ({ page }) => {
    await rowOf(page, 'Restaurants').getByRole('button', { name: 'Edit sub items' }).click()
    // 35 x 1 x 4 + 15 x 2 x 4
    await expect(page.getByRole('dialog')).toContainText('$260')
  })

  test('adding a sub item and pressing Done changes the row total', async ({ page }) => {
    await rowOf(page, 'Transit').getByRole('button', { name: 'Edit sub items' }).click()
    const d = page.getByRole('dialog')
    await d.getByRole('button', { name: 'Add sub item' }).click()
    await d.getByPlaceholder('Sub item name').last().fill('Ferry')
    await d.locator('input:not([placeholder])').last().fill('20')
    await expect(d).toContainText('$140')
    await d.getByRole('button', { name: 'Done' }).click()
    await expect(totalRow(page).last()).toContainText('$3,079')
  })

  test('Cancel restores the row as it was', async ({ page }) => {
    await rowOf(page, 'Transit').getByRole('button', { name: 'Edit sub items' }).click()
    const d = page.getByRole('dialog')
    await d.getByRole('button', { name: 'Remove sub item' }).first().click()
    await d.getByRole('button', { name: 'Cancel' }).click()
    await expect(totalRow(page).last()).toContainText('$3,059')
  })

  test('a stack can be turned into a simple row and keeps its total', async ({ page }) => {
    await rowOf(page, 'Groceries').getByRole('button', { name: 'Edit sub items' }).click()
    const d = page.getByRole('dialog')
    await d.getByRole('tab', { name: 'Simple' }).click()
    await d.getByRole('button', { name: 'Done' }).click()
    await expect(totalRow(page).last()).toContainText('$3,059')
    await expect(rowOf(page, 'Groceries').locator('input').nth(1)).toBeVisible()
  })
})

test.describe('sorting', () => {
  const names = (page) => page.locator('tbody tr').evaluateAll((trs) => trs.map((r) => r.querySelector('input')?.value).filter(Boolean))

  test('Name sorts A to Z then Z to A', async ({ page }) => {
    const head = page.getByRole('columnheader', { name: /^Name/ })
    await head.click()
    const asc = (await names(page)).slice(0, 8)
    expect(asc).toEqual([...asc].sort((a, b) => a.localeCompare(b)))
    await head.click()
    const desc = (await names(page)).slice(0, 8)
    expect(desc).toEqual([...desc].sort((a, b) => b.localeCompare(a)))
  })

  test('Amount sorts and the choice is remembered', async ({ page }) => {
    await page.getByRole('columnheader', { name: /^Amount/ }).click()
    expect(await ls(page, 'budgetSort')).toBeTruthy()
    await page.reload()
    await expect(rowOf(page, 'Rent')).toHaveCount(1)
    const first = (await names(page))[0]
    expect(['Rent', 'Groceries']).toContain(first)
  })
})

test.describe('remaining this month', () => {
  test('shows only what is still to pay and changes nothing in the data', async ({ page }) => {
    await main(page).getByRole('button', { name: 'Remaining this month' }).click()
    await expect(main(page).getByText('Remaining until end of month')).toBeVisible()
    // Rent (the 1st), Crunch Fitness (3rd) and Electricity (8th) are already paid on Nov 8
    for (const paid of ['Rent', 'Crunch Fitness', 'Electricity']) await expect(rowOf(page, paid)).toHaveCount(0)
    await expect(rowOf(page, 'Phone')).toContainText('on the 12th')
    await main(page).getByRole('button', { name: 'Remaining this month' }).click()
    await expect(rowOf(page, 'Rent')).toHaveCount(1)
    await expect(totalRow(page).last()).toContainText('$3,059')
  })

  test('prorated rows scale by the days left', async ({ page }) => {
    await main(page).getByRole('button', { name: 'Remaining this month' }).click()
    // 22 of 30 days are left: 450 x 22/30 = 330
    await expect(rowOf(page, 'Groceries')).toContainText('$450 × 22/30')
    await expect(rowOf(page, 'Groceries')).toContainText('$330')
    await expect(main(page)).toContainText('$854')
  })

  test('the presets menu is hidden while it is on', async ({ page }) => {
    await main(page).getByRole('button', { name: 'Remaining this month' }).click()
    await expect(main(page).getByRole('button', { name: 'Presets' })).toHaveCount(0)
  })
})

test.describe('compare to actual', () => {
  test('adds Actual and Diff columns for the last complete month', async ({ page }) => {
    await main(page).getByRole('button', { name: 'Compare to actual' }).click()
    await expect(page.getByRole('columnheader', { name: /^Actual/ })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /^Diff/ })).toBeVisible()
    await expect(main(page)).toContainText('Oct 2026')
    // every dollar spent shows up, so the actual total matches the card above
    await expect(totalRow(page).last()).toContainText('$3,415')
  })

  test('spending nobody budgeted for shows as Not budgeted rows', async ({ page }) => {
    await main(page).getByRole('button', { name: 'Compare to actual' }).click()
    await expect(main(page).getByText('Not budgeted total')).toBeVisible()
  })

  test('is mutually exclusive with Remaining this month', async ({ page }) => {
    await main(page).getByRole('button', { name: 'Compare to actual' }).click()
    await main(page).getByRole('button', { name: 'Remaining this month' }).click()
    await expect(page.getByRole('columnheader', { name: /^Diff/ })).toHaveCount(0)
  })

  test('the choice is remembered', async ({ page }) => {
    await main(page).getByRole('button', { name: 'Compare to actual' }).click()
    await page.reload()
    await expect(page.getByRole('columnheader', { name: /^Diff/ })).toBeVisible()
  })
})

test.describe('presets', () => {
  const save = async (page, name) => {
    await main(page).locator('[data-slot=dropdown-menu-trigger]:visible').nth(1).click()
    await page.getByRole('menuitem', { name: 'Save as new preset' }).click()
    await page.getByRole('dialog').getByRole('textbox').fill(name)
    await page.getByRole('dialog').getByRole('button', { name: /^Save/ }).click()
  }

  test('save a preset, change the budget, then switch back to it', async ({ page }) => {
    await save(page, 'Baseline')
    await expect(main(page).getByRole('button', { name: 'Baseline' })).toBeVisible()
    await setAmount(page, 'Rent', 2000)
    await main(page).locator('[data-slot=dropdown-menu-trigger]:visible').nth(1).click()
    await page.getByRole('menuitem', { name: 'Baseline' }).click()
    await expect(amountIn(page, 'Rent')).toHaveValue('1850')
    await expect(totalRow(page).last()).toContainText('$3,059')
  })

  test('a second preset can hold different numbers', async ({ page }) => {
    await save(page, 'Baseline')
    await setAmount(page, 'Rent', 2000)
    await save(page, 'Tight')
    const trigger = main(page).locator('[data-slot=dropdown-menu-trigger]:visible').nth(1)
    await trigger.click()
    await page.getByRole('menuitem', { name: 'Baseline' }).click()
    await expect(totalRow(page).last()).toContainText('$3,059')
    await trigger.click()
    await page.getByRole('menuitem', { name: 'Tight' }).click()
    await expect(totalRow(page).last()).toContainText('$3,209')
  })
})

test.describe('income source', () => {
  test('type in your own monthly income', async ({ page }) => {
    await main(page).getByRole('button', { name: 'From your statements' }).click()
    await page.getByRole('menuitem', { name: 'Type it in' }).click()
    const input = kpi(page, 'Monthly income').locator('input')
    await input.fill('7000')
    await input.blur()
    await expect(kpi(page, 'Monthly income')).toContainText('7,000')
    await expect(kpi(page, 'Left over / month')).toContainText('$3,941')
  })

  test('switching back uses the statements again', async ({ page }) => {
    await main(page).getByRole('button', { name: 'From your statements' }).click()
    await page.getByRole('menuitem', { name: 'Type it in' }).click()
    await main(page).getByRole('button', { name: 'Type it in' }).click()
    await page.getByRole('menuitem', { name: 'From your statements' }).click()
    await expect(kpi(page, 'Monthly income')).toContainText('$5,821')
  })
})

test.describe('what to do with what is left', () => {
  test('starts unassigned, Add sends everything to Savings', async ({ page }) => {
    await expect(main(page)).toContainText('$2,762 left this month')
    await expect(main(page)).toContainText('100% unassigned')
    await main(page).getByRole('button', { name: 'Add', exact: true }).click()
    await expect(main(page)).toContainText('Savings')
    await expect(main(page)).not.toContainText('unassigned')
  })

  test('a leftover plan survives a reload', async ({ page }) => {
    await main(page).getByRole('button', { name: 'Add', exact: true }).click()
    await saved(page)
    await page.reload()
    await expect(main(page)).toContainText('Savings')
  })

  test('nothing is taken when you overspend', async ({ page }) => {
    await setAmount(page, 'Rent', 9000)
    // the KPI goes negative, but the leftover plan never takes money you do not have
    await expect(kpi(page, 'Left over / month')).toContainText('−$4,388')
    await expect(main(page)).toContainText('$0 left this month')
  })
})
