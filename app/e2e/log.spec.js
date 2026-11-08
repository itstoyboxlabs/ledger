import { test, expect, openApp, goTo, ls, flushSaves } from './fixtures'


const amount = (page) => page.getByPlaceholder('14.50')
const noteBox = (page) => page.getByPlaceholder('burrito')
const addBtn = (page) => page.getByRole('main').getByRole('button', { name: 'Add', exact: true }).first()
const rowPicker = (page) => page.locator('label', { hasText: 'Counts against' }).getByRole('button')
const meter = (page, name) => page.locator('div.group', { hasText: name }).filter({ hasText: / of \$/ }).first()
const tableRows = (page) => page.locator('main tbody tr')

async function pickRow(page, name) {
  await rowPicker(page).click()
  await page.getByRole('menuitem', { name }).click()
}
async function log(page, amt, note, row) {
  if (row) await pickRow(page, row)
  await amount(page).fill(String(amt))
  if (note) await noteBox(page).fill(note)
  await addBtn(page).click()
  // saves are debounced about 400ms and there is no "saved" label, so flush them
  await flushSaves(page)
}

test.beforeEach(async ({ page }) => {
  await openApp(page)
  await goTo(page, 'Log')
})

test.describe('quick add', () => {
  test('starts empty with a meter for each untimed budget row', async ({ page }) => {
    await expect(page.getByText('Nothing logged this month.')).toBeVisible()
    await expect(page.getByText('Logged $0.00 across 0 entries')).toBeVisible()
    for (const [name, budget] of [['Groceries', 450], ['Restaurants', 260], ['Transit', 120], ['Unexpected', 150]]) {
      await expect(meter(page, name)).toContainText(`$0 of $${budget}`)
    }
  })

  test('date defaults to today and cannot be in the future', async ({ page }) => {
    const date = page.locator('input[type=date]')
    await expect(date).toHaveValue('2026-11-08')
    await expect(date).toHaveAttribute('max', '2026-11-08')
  })

  test('Add is disabled until there is an amount', async ({ page }) => {
    await expect(addBtn(page)).toBeDisabled()
    await amount(page).fill('0')
    await expect(addBtn(page)).toBeDisabled()
    await amount(page).fill('5')
    await expect(addBtn(page)).toBeEnabled()
  })

  test('adding an entry shows it in the table, the total and the meter', async ({ page }) => {
    await log(page, 14, 'burrito', 'Restaurants')
    const row = tableRows(page).first()
    await expect(row).toContainText('burrito')
    await expect(row).toContainText('Restaurants')
    await expect(row).toContainText('$14.00')
    await expect(page.getByText('Logged $14.00 across 1 entry')).toBeVisible()
    await expect(meter(page, 'Restaurants')).toContainText('$14 of $260')
    await expect(meter(page, 'Restaurants')).toContainText('$246 left')
  })

  test('cents are kept', async ({ page }) => {
    await log(page, 12.35, 'with cents', 'Groceries')
    await expect(tableRows(page).first()).toContainText('$12.35')
    await expect(page.getByText('Logged $12.35 across 1 entry')).toBeVisible()
  })

  test('Enter in a field adds, clears the fields and returns focus to Amount', async ({ page }) => {
    await amount(page).fill('9')
    await noteBox(page).fill('coffee')
    await noteBox(page).press('Enter')
    await expect(tableRows(page).first()).toContainText('coffee')
    await expect(amount(page)).toHaveValue('')
    await expect(noteBox(page)).toHaveValue('')
    await expect(amount(page)).toBeFocused()
  })

  test('an entry without a note shows a dash', async ({ page }) => {
    await log(page, 3, '', 'Transit')
    await expect(tableRows(page).first()).toContainText('—')
  })

  test('the last row you picked is remembered', async ({ page }) => {
    await pickRow(page, 'Transit')
    expect(await ls(page, 'logRow')).toBeTruthy()
    await page.reload()
    await expect(rowPicker(page)).toContainText('Transit')
  })

  test('subscriptions cannot be picked', async ({ page }) => {
    await rowPicker(page).click()
    await expect(page.getByRole('menuitem', { name: 'Netflix' })).toHaveCount(0)
    await expect(page.getByRole('menuitem', { name: 'Groceries' })).toBeVisible()
  })
})

test.describe('negative amounts', () => {
  test('a credit offsets an overage on the same row', async ({ page }) => {
    await log(page, 425, 'too much', 'Unexpected')
    await expect(meter(page, 'Unexpected')).toContainText('$275 over')
    await log(page, -275, 'sold stuff', 'Unexpected')
    await expect(meter(page, 'Unexpected')).toContainText('$150 of $150')
    await expect(meter(page, 'Unexpected')).toContainText('$0 left')
    await expect(page.getByText('Logged $150.00 across 2 entries')).toBeVisible()
  })

  test('a credit shows as negative and green in the table', async ({ page }) => {
    await log(page, -40, 'refund', 'Groceries')
    const cell = tableRows(page).first().locator('td').nth(3)
    await expect(cell).toHaveText('−$40.00')
    await expect(cell).toHaveCSS('color', /rgb\(\d+, \d+, \d+\)/)
  })

  test('a credit bigger than what was spent leaves more than the budget', async ({ page }) => {
    await log(page, -50, 'refund', 'Transit')
    await expect(meter(page, 'Transit')).toContainText('−$50 of $120')
    await expect(meter(page, 'Transit')).toContainText('$170 left')
    // the bar never fills below empty
    await expect(meter(page, 'Transit').locator('[data-slot=progress-indicator]')).toHaveCSS('transform', /matrix\(1, 0, 0, 1, -\d+/)
  })

  test('negative amounts survive a reload', async ({ page }) => {
    await log(page, -12, 'refund', 'Groceries')
    await page.reload()
    await expect(tableRows(page).first()).toContainText('−$12.00')
  })
})

test.describe('entries', () => {
  test('entries persist across a reload', async ({ page }) => {
    await log(page, 7, 'lunch', 'Restaurants')
    await page.reload()
    await expect(tableRows(page).first()).toContainText('lunch')
    await expect(meter(page, 'Restaurants')).toContainText('$7 of $260')
  })

  test('deleting an entry removes it and puts the meter back', async ({ page }) => {
    await log(page, 20, 'oops', 'Restaurants')
    await tableRows(page).first().hover()
    await page.getByTitle('Delete entry').first().click()
    await expect(page.getByText('Nothing logged this month.')).toBeVisible()
    await expect(meter(page, 'Restaurants')).toContainText('$0 of $260')
  })

  test('going past the budget turns the meter over', async ({ page }) => {
    await log(page, 300, 'party', 'Restaurants')
    await expect(meter(page, 'Restaurants')).toContainText('$40 over')
  })

  test('sorting: newest first by default, headers sort and flip', async ({ page }) => {
    const date = page.locator('input[type=date]')
    await date.fill('2026-11-02'); await log(page, 30, 'bravo', 'Groceries')
    await date.fill('2026-11-05'); await log(page, 10, 'alpha', 'Restaurants')
    await date.fill('2026-11-03'); await log(page, 20, 'charlie', 'Transit')
    const notes = () => tableRows(page).evaluateAll((r) => r.slice(0, 3).map((x) => x.querySelectorAll('td')[1].innerText))
    expect(await notes()).toEqual(['alpha', 'charlie', 'bravo'])
    const head = (n) => page.getByRole('columnheader', { name: new RegExp(`^${n}`) })
    // Amount starts biggest first, then flips
    await head('Amount').click()
    expect(await notes()).toEqual(['bravo', 'charlie', 'alpha'])
    await head('Amount').click()
    expect(await notes()).toEqual(['alpha', 'charlie', 'bravo'])
    // Note and Counts against start A to Z
    await head('Note').click()
    expect(await notes()).toEqual(['alpha', 'bravo', 'charlie'])
    await head('Counts against').click()
    expect(await notes()).toEqual(['bravo', 'alpha', 'charlie'])
    // Date flips to oldest first, then back
    await head('Date').click()
    expect(await notes()).toEqual(['alpha', 'charlie', 'bravo'])
    await head('Date').click()
    expect(await notes()).toEqual(['bravo', 'charlie', 'alpha'])
  })
})

test.describe('months', () => {
  test('previous month shows its own entries and Next is disabled on the current month', async ({ page }) => {
    await expect(page.getByTitle('Next month')).toBeDisabled()
    await page.locator('input[type=date]').fill('2026-10-15')
    await log(page, 11, 'last month', 'Groceries')
    await expect(page.getByText('Nothing logged this month.')).toBeVisible()
    await page.getByTitle('Previous month').click()
    await expect(page.getByRole('heading', { name: /Oct 2026/ })).toBeVisible()
    await expect(page.getByText('so far')).toHaveCount(0)
    await expect(tableRows(page).first()).toContainText('last month')
    await page.getByTitle('Next month').click()
    await expect(page.getByText('so far')).toBeVisible()
  })
})

test.describe('meters', () => {
  test('hiding a meter moves it to the hidden chips and it can be restored', async ({ page }) => {
    await meter(page, 'Transit').hover()
    await page.getByRole('button', { name: 'Hide the Transit meter' }).click()
    await expect(page.getByRole('button', { name: 'Hide the Transit meter' })).toHaveCount(0)
    await expect(page.getByText('Hidden meters:')).toBeVisible()
    await page.reload()
    await expect(page.getByTitle('Show the Transit meter again')).toBeVisible()
    await page.getByTitle('Show the Transit meter again').click()
    await expect(meter(page, 'Transit')).toBeVisible()
    await expect(page.getByText('Hidden meters:')).toHaveCount(0)
  })
})
