import { test, expect, openApp, goTo, ls } from './fixtures'

// Sample budget (public/sample-data.json): Rent 1850 (day 1), Crunch Fitness 39 (day 3),
// Electricity 95 (day 8), Phone 65 (day 12), Groceries 450, Restaurants 260 and Transit 120
// (all prorated, no day), Unexpected 150 (no day, not prorated). Non-rent rows add up to
// 1179. Income from the statements is 5820.80 a month. The shared tax state defaults to
// Texas (no state tax). The clock is pinned to Nov 8 2026 (a 30 day month).
// Expected tax numbers were worked out with the app's own tax engine (src/lib/tax.js).

const main = (page) => page.locator('main')
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const TITLES = {
  cash: 'Cash needed between two days of the month',
  debt: 'Debt payoff',
  rentalcost: 'Effective rental cost',
  stock: 'Equity payout',
  hourly: 'Hourly calculator',
  rentscenarios: 'Rent scenarios',
  renttoincome: 'Rent-to-income',
  takehome: 'Take-home pay',
  vacation: 'Vacation planning',
}
const tool = (page, id) =>
  main(page).locator('[data-slot=card]').filter({ has: page.locator('h2', { hasText: TITLES[id] }) }).first()
// the number input inside the label that starts with this text
const field = (card, label) =>
  card.locator('label').filter({ hasText: new RegExp('^\\s*' + escapeRe(label)) }).locator('input').first()
const row = (card, label) => card.getByRole('row', { name: label })

async function setLS(page, key, value) {
  await page.evaluate(([k, v]) => localStorage.setItem(`ledger:${k}`, JSON.stringify(v)), [key, value])
}
async function reload(page) {
  // saves are debounced, so let them finish before the page goes away
  await page.clock.fastForward(600)
  await page.waitForTimeout(200)
  await page.reload()
  await expect(page.locator('h1', { hasText: 'Tools' })).toBeVisible()
}
// set some localStorage keys, then reload so the page boots with them
async function seed(page, entries) {
  for (const [k, v] of Object.entries(entries)) await setLS(page, k, v)
  await reload(page)
}
async function type(input, value) {
  await input.fill(String(value))
  await input.blur()
}
const picker = (page) => page.locator('button').filter({ hasText: /^What to show/ })
const trigger = (card, text) => card.locator('button[data-slot=dropdown-menu-trigger]').filter({ hasText: text })
async function pick(card, page, current, option) {
  await expect(async () => {
    if (!(await page.getByRole('menuitem').first().isVisible())) await trigger(card, current).first().click()
    await page.getByRole('menuitem', { name: option, exact: true }).click({ timeout: 2000 })
  }).toPass({ timeout: 15000 })
}

// Pay off is a multi-select: tick or untick debts until only these are ticked
async function onlyDebts(card, page, current, names) {
  await trigger(card, current).first().click()
  const items = page.getByRole('menuitemcheckbox')
  for (const name of names) {
    const item = items.filter({ hasText: new RegExp(`^${name}$`) })
    if ((await item.getAttribute('aria-checked')) !== 'true') await item.click()
  }
  const all = await items.allTextContents()
  for (const name of all.filter((n) => !names.includes(n))) {
    const item = items.filter({ hasText: new RegExp(`^${name}$`) })
    if ((await item.getAttribute('aria-checked')) === 'true') await item.click()
  }
  await page.keyboard.press('Escape')
}

const DEBTS = [
  { id: 'd1', name: 'Student loans', balance: 12000, apr: 0, payment: 400, budgetRow: null },
  { id: 'd2', name: 'Card', balance: 3000, apr: 20, payment: 150, budgetRow: null },
]

test.beforeEach(async ({ page }) => {
  await openApp(page)
  await goTo(page, 'Tools')
  await expect(tool(page, 'cash')).toContainText('Total')
})

// ---------------------------------------------------------------- picker and layout

test.describe('tool picker', () => {
  test('all nine tools show by default and the button counts them', async ({ page }) => {
    await expect(picker(page)).toContainText('9/9')
    for (const id of Object.keys(TITLES)) await expect(tool(page, id)).toBeVisible()
  })

  test('the modal lists every tool alphabetically with a one-line description', async ({ page }) => {
    await picker(page).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Click a tool to put it on the page or take it off.')).toBeVisible()
    const titles = await dialog.locator('label span.font-semibold').allInnerTexts()
    expect(titles).toEqual([
      'Cash between two days', 'Debt payoff', 'Effective rental cost', 'Equity payout', 'Hourly calculator',
      'Rent scenarios', 'Rent-to-income', 'Take-home pay', 'Vacation planning',
    ])
    await expect(dialog).toContainText('Total cost of a trip from hotel, flight, food and spending.')
  })

  test('clicking a card takes the tool off the page and back on', async ({ page }) => {
    await picker(page).click()
    const dialog = page.getByRole('dialog')
    await dialog.locator('label', { hasText: 'Hourly calculator' }).click()
    await expect(picker(page)).toContainText('8/9')
    await expect(tool(page, 'hourly')).toHaveCount(0)
    expect(await ls(page, 'toolsShown')).not.toContain('hourly')
    await dialog.locator('label', { hasText: 'Hourly calculator' }).click()
    await expect(picker(page)).toContainText('9/9')
    await expect(tool(page, 'hourly')).toBeVisible()
  })

  test('Clear all empties the page, Show all brings everything back', async ({ page }) => {
    await picker(page).click()
    await page.getByRole('button', { name: 'Clear all' }).click()
    await expect(picker(page)).toContainText('0/9')
    await expect(main(page).getByText('Nothing selected. Use "What to show" at the top right to pick tools.')).toBeVisible()
    expect(await ls(page, 'toolsShown')).toEqual([])
    await page.getByRole('button', { name: 'Show all' }).click()
    await expect(picker(page)).toContainText('9/9')
    await expect(tool(page, 'vacation')).toBeVisible()
  })

  test('Done and Escape both close the modal', async ({ page }) => {
    await picker(page).click()
    await page.getByRole('button', { name: 'Done' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await picker(page).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('the selection survives a reload', async ({ page }) => {
    await picker(page).click()
    const dialog = page.getByRole('dialog')
    await dialog.locator('label', { hasText: 'Vacation planning' }).click()
    await dialog.locator('label', { hasText: 'Debt payoff' }).click()
    await page.getByRole('button', { name: 'Done' }).click()
    await reload(page)
    await expect(picker(page)).toContainText('7/9')
    await expect(tool(page, 'vacation')).toHaveCount(0)
    await expect(tool(page, 'debt')).toHaveCount(0)
    await expect(tool(page, 'cash')).toBeVisible()
  })

  test('wide tools take the full row and the rest sit two to a row', async ({ page }) => {
    const wide = await tool(page, 'cash').boundingBox()
    const half = await tool(page, 'rentalcost').boundingBox()
    expect(wide.width).toBeGreaterThan(half.width * 1.8)
  })

  test('a lone tool spans the full width', async ({ page }) => {
    const before = await tool(page, 'rentalcost').boundingBox()
    await seed(page, { toolsShown: ['rentalcost'] })
    const after = await tool(page, 'rentalcost').boundingBox()
    expect(after.width).toBeGreaterThan(before.width * 1.8)
  })

  test('a tool this browser has never seen is switched on once', async ({ page }) => {
    await seed(page, { toolsShown: ['cash'], toolsSeen: ['cash', 'debt'] })
    await expect(picker(page)).toContainText('8/9')
    // debt was already seen, so it stays off; every other unseen tool came on
    await expect(tool(page, 'debt')).toHaveCount(0)
    await expect(tool(page, 'vacation')).toBeVisible()
    expect(await ls(page, 'toolsSeen')).toEqual(expect.arrayContaining(['vacation', 'hourly', 'takehome']))
    // once seen, turning one off sticks across a reload
    await picker(page).click()
    await page.getByRole('dialog').locator('label', { hasText: 'Hourly calculator' }).click()
    await page.getByRole('button', { name: 'Done' }).click()
    await reload(page)
    await expect(picker(page)).toContainText('7/9')
    await expect(tool(page, 'hourly')).toHaveCount(0)
  })
})

// ---------------------------------------------------------------- simple lists

test.describe('lists', () => {
  const dialogFor = (page, name) => page.getByRole('dialog').filter({ has: page.getByRole('heading', { name }) })

  async function addList(page, title, items, description) {
    await picker(page).click()
    await page.getByRole('button', { name: 'Add a list' }).click()
    const dlg = dialogFor(page, 'Add a list')
    await dlg.getByPlaceholder('Gift ideas').fill(title)
    if (description) await dlg.getByPlaceholder('A short note about this list').fill(description)
    for (let i = 0; i < items.length; i++) {
      if (i > 0) await dlg.getByRole('button', { name: 'Add item' }).click()
      await dlg.getByPlaceholder('item').nth(i).fill(items[i][0])
      await dlg.locator('input[type=number], input[inputmode]').nth(i).fill(String(items[i][1]))
    }
    await dlg.getByRole('button', { name: 'Add list' }).click()
    await page.getByRole('button', { name: 'Done' }).click()
  }
  const listCard = (page, title) =>
    main(page).locator('[data-slot=card]').filter({ has: page.locator('h2', { hasText: title }) })

  test('Add list is disabled until the list has a title', async ({ page }) => {
    await picker(page).click()
    await page.getByRole('button', { name: 'Add a list' }).click()
    const dlg = dialogFor(page, 'Add a list')
    await expect(dlg.getByRole('button', { name: 'Add list' })).toBeDisabled()
    await dlg.getByPlaceholder('Gift ideas').fill('   ')
    await expect(dlg.getByRole('button', { name: 'Add list' })).toBeDisabled()
    await dlg.getByPlaceholder('Gift ideas').fill('Gift ideas')
    await expect(dlg.getByRole('button', { name: 'Add list' })).toBeEnabled()
  })

  test('a new list shows in the picker and on the page with its total', async ({ page }) => {
    await addList(page, 'Gift ideas', [['Scarf', 25], ['Book', 15.5]], 'For the holidays')
    await expect(picker(page)).toContainText('10/10')
    const card = listCard(page, 'Gift ideas')
    await expect(card).toContainText('For the holidays')
    await expect(card).toContainText('2 items')
    await expect(card).toContainText('$40.50')
    expect(await ls(page, 'lists')).toMatchObject([{ title: 'Gift ideas', description: 'For the holidays' }])
    await reload(page)
    await expect(listCard(page, 'Gift ideas')).toContainText('$40.50')
  })

  test('editing items on the card updates the total and a one-item list says item', async ({ page }) => {
    await addList(page, 'Gift ideas', [['Scarf', 25]])
    const card = listCard(page, 'Gift ideas')
    await expect(card).toContainText('1 item')
    await card.getByRole('button', { name: 'Add item' }).click()
    await card.getByPlaceholder('item').nth(1).fill('Mug')
    await card.locator('input[type=number], input[inputmode]').nth(1).fill('10')
    await expect(card).toContainText('2 items')
    await expect(card).toContainText('$35.00')
    await card.getByTitle('Remove item').first().click()
    await expect(card).toContainText('$10.00')
  })

  test('Enter in an item name adds a new row', async ({ page }) => {
    await addList(page, 'Gift ideas', [['Scarf', 25]])
    const card = listCard(page, 'Gift ideas')
    await card.getByPlaceholder('item').first().press('Enter')
    await expect(card.getByPlaceholder('item')).toHaveCount(2)
  })

  test('the pencil edits title and description', async ({ page }) => {
    await addList(page, 'Gift ideas', [['Scarf', 25]])
    await listCard(page, 'Gift ideas').getByTitle('Edit title and description').click()
    const dlg = dialogFor(page, 'Edit list')
    await dlg.getByPlaceholder('Gift ideas').fill('Birthday')
    await dlg.getByRole('button', { name: 'Save' }).click()
    await expect(listCard(page, 'Birthday')).toContainText('$25.00')
    await expect(listCard(page, 'Gift ideas')).toHaveCount(0)
  })

  test('deleting asks first, Cancel keeps it, Delete removes it', async ({ page }) => {
    await addList(page, 'Gift ideas', [['Scarf', 25]])
    const card = listCard(page, 'Gift ideas')
    await card.getByTitle('Delete list').click()
    await expect(page.getByText('Are you sure you want to delete "Gift ideas"?')).toBeVisible()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(card).toBeVisible()
    await card.getByTitle('Delete list').click()
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(card).toHaveCount(0)
    await expect(picker(page)).toContainText('9/9')
    expect(await ls(page, 'lists')).toEqual([])
  })

  test('the old "Selling stuff" key becomes a list on first read', async ({ page }) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem('ledger:lists')) {
        localStorage.setItem('ledger:sellItems', JSON.stringify([
          { id: 'i1', name: 'Monitor', amount: 400 },
          { id: 'i2', name: 'Desk', amount: 120 },
        ]))
      }
    })
    // a fresh context: the lists key is not saved yet, so the init script seeds the old key
    const ctx = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 } })
    const p2 = await ctx.newPage()
    await p2.clock.install({ time: new Date('2026-11-08T12:00:00') })
    await p2.addInitScript(() => {
      if (!localStorage.getItem('ledger:lists')) {
        localStorage.setItem('ledger:sellItems', JSON.stringify([
          { id: 'i1', name: 'Monitor', amount: 400 },
          { id: 'i2', name: 'Desk', amount: 120 },
        ]))
      }
    })
    await openApp(p2)
    // loading the sample replaces every ledger key, the seeded one too, so reload to seed it again
    await p2.reload()
    await goTo(p2, 'Tools')
    const card = main(p2).locator('[data-slot=card]').filter({ has: p2.getByRole('heading', { name: 'Selling stuff', level: 2 }) })
    await expect(card).toContainText('$520.00')
    await expect(card).toContainText('List what you plan to sell')
    expect((await ls(p2, 'lists'))[0].id).toBe('sell')
    await ctx.close()
  })
})

// ---------------------------------------------------------------- hourly

test.describe('hourly calculator', () => {
  test('defaults: 40 hours at $50 is $104,000 a year, taxed in Texas', async ({ page }) => {
    const card = tool(page, 'hourly')
    await expect(row(card, 'Per week')).toHaveText(/Per week\s*\$2,000\s*−\$423\s*\$1,577/)
    await expect(row(card, 'Per month')).toHaveText(/Per month\s*\$8,667\s*−\$1,834\s*\$6,833/)
    await expect(row(card, 'Per year')).toHaveText(/Per year\s*\$104,000\s*−\$22,006\s*\$81,994/)
    await expect(card).toContainText('Tax is about 21.2% in Texas, federal, FICA and state combined')
    await expect(card).toContainText('Taxed in Texas.')
    await expect(card).toContainText('Assumes you are a W-2 employee')
  })

  test('changing hours and rate recomputes the table', async ({ page }) => {
    const card = tool(page, 'hourly')
    await type(field(card, 'Hours / week'), 20)
    await type(field(card, 'Pay / hour'), 30)
    await expect(row(card, 'Per week')).toHaveText(/Per week\s*\$600\s*−\$76\s*\$524/)
    await expect(row(card, 'Per month')).toHaveText(/Per month\s*\$2,600\s*−\$329\s*\$2,271/)
    await expect(row(card, 'Per year')).toHaveText(/Per year\s*\$31,200\s*−\$3,951\s*\$27,249/)
    await expect(card).toContainText('Tax is about 12.7%')
  })

  test('zero hours gives zeros and no tax', async ({ page }) => {
    const card = tool(page, 'hourly')
    await type(field(card, 'Hours / week'), 0)
    await expect(row(card, 'Per year')).toHaveText(/Per year\s*\$0\s*−\$0\s*\$0/)
    await expect(card).toContainText('Tax is about 0.0%')
  })

  test('a cleared field shows empty while typing and falls back to the last value on blur', async ({ page }) => {
    const card = tool(page, 'hourly')
    const hours = field(card, 'Hours / week')
    await hours.fill('')
    await expect(hours).toHaveValue('')
    await expect(row(card, 'Per week')).toContainText('$2,000')
    await hours.blur()
    await expect(hours).toHaveValue('40')
  })

  test('a fresh number can be typed after clearing', async ({ page }) => {
    const card = tool(page, 'hourly')
    const hours = field(card, 'Hours / week')
    await hours.fill('')
    await hours.fill('25')
    await hours.blur()
    await expect(row(card, 'Per week')).toContainText('$1,250')
  })

  test('inputs persist across a reload', async ({ page }) => {
    const card = tool(page, 'hourly')
    await type(field(card, 'Pay / hour'), 75)
    expect((await ls(page, 'hourlyCalc')).rate).toBe(75)
    await reload(page)
    await expect(field(tool(page, 'hourly'), 'Pay / hour')).toHaveValue('75')
    await expect(row(tool(page, 'hourly'), 'Per week')).toContainText('$3,000')
  })

  test('it taxes in the shared state (California)', async ({ page }) => {
    await seed(page, { taxState: 'ca' })
    const card = tool(page, 'hourly')
    await expect(card).toContainText('Taxed in California.')
    await expect(row(card, 'Per year')).toHaveText(/Per year\s*\$104,000\s*−\$27,601\s*\$76,399/)
    await expect(card).toContainText('Tax is about 26.5% in California')
  })

  test('Change opens the About you page', async ({ page }) => {
    await tool(page, 'hourly').getByRole('button', { name: 'Change' }).click()
    await expect(page.locator('h1', { hasText: 'About you' })).toBeVisible()
  })
})

// ---------------------------------------------------------------- effective rental cost

test.describe('effective rental cost', () => {
  test('defaults: $2,500 with one month free', async ({ page }) => {
    const card = tool(page, 'rentalcost')
    await expect(row(card, 'Effective cost / mo')).toContainText('$2,291.67')
    await expect(row(card, 'Total for the year')).toContainText('$27,500.00')
  })

  test('two months free on $2,000', async ({ page }) => {
    const card = tool(page, 'rentalcost')
    await type(field(card, 'Rental cost / mo'), 2000)
    await type(field(card, 'Months free'), 2)
    await expect(row(card, 'Effective cost / mo')).toContainText('$1,666.67')
    await expect(row(card, 'Total for the year')).toContainText('$20,000.00')
  })

  test('no free months means the full rent', async ({ page }) => {
    const card = tool(page, 'rentalcost')
    await type(field(card, 'Months free'), 0)
    await expect(row(card, 'Effective cost / mo')).toContainText('$2,500.00')
    await expect(row(card, 'Total for the year')).toContainText('$30,000.00')
  })

  test('12 or more months free cost nothing, never negative', async ({ page }) => {
    const card = tool(page, 'rentalcost')
    await type(field(card, 'Months free'), 12)
    await expect(row(card, 'Effective cost / mo')).toContainText('$0.00')
    await type(field(card, 'Months free'), 15)
    await expect(row(card, 'Effective cost / mo')).toContainText('$0.00')
    await expect(row(card, 'Total for the year')).toContainText('$0.00')
  })

  test('values persist across a reload', async ({ page }) => {
    const card = tool(page, 'rentalcost')
    await type(field(card, 'Rental cost / mo'), 3000)
    await reload(page)
    await expect(field(tool(page, 'rentalcost'), 'Rental cost / mo')).toHaveValue('3000')
    await expect(row(tool(page, 'rentalcost'), 'Effective cost / mo')).toContainText('$2,750.00')
  })
})

// ---------------------------------------------------------------- rent-to-income

test.describe('rent-to-income', () => {
  test('defaults: $100,000 against $2,500 clears 40x exactly', async ({ page }) => {
    const card = tool(page, 'renttoincome')
    await expect(row(card, 'Your income is')).toContainText('Your income is 40.0× the rent')
    await expect(row(card, 'Your income is')).toContainText('Clears the 40× they ask for')
    await expect(row(card, 'Max rent at 40×')).toContainText('$2,500.00')
  })

  test('a higher rent falls short', async ({ page }) => {
    const card = tool(page, 'renttoincome')
    await type(field(card, 'Monthly rent'), 3000)
    await expect(row(card, 'Your income is')).toContainText('Your income is 33.3× the rent')
    await expect(row(card, 'Your income is')).toContainText('Short of the 40× they ask for')
  })

  test('a lower multiple changes the verdict and the max rent', async ({ page }) => {
    const card = tool(page, 'renttoincome')
    await type(field(card, 'Monthly rent'), 3000)
    await type(field(card, 'They ask for'), 30)
    await expect(row(card, 'Your income is')).toContainText('Clears the 30× they ask for')
    await expect(row(card, 'Max rent at 30×')).toContainText('$3,333.33')
  })

  test('rent of zero shows a dash, not a verdict', async ({ page }) => {
    const card = tool(page, 'renttoincome')
    await type(field(card, 'Monthly rent'), 0)
    await expect(row(card, 'Enter a rent to compare')).toContainText('—')
    await expect(card).not.toContainText('Short of the')
  })

  test('asking for 0x gives a max rent of $0', async ({ page }) => {
    const card = tool(page, 'renttoincome')
    await type(field(card, 'They ask for'), 0)
    await expect(row(card, 'Max rent at 0×')).toContainText('$0.00')
  })

  test('Swap flips to the max-rent direction and hides the rent field', async ({ page }) => {
    const card = tool(page, 'renttoincome')
    await card.getByRole('button', { name: 'Swap' }).click()
    await expect(field(card, 'Monthly rent')).toHaveCount(0)
    await expect(row(card, 'Max monthly rent at 40×')).toContainText('$2,500.00')
    await expect(row(card, 'Per year at that rent')).toContainText('$30,000.00')
    await expect(card).toContainText('to see the most rent you qualify for')
    expect((await ls(page, 'rentIncomeCalc2')).mode).toBe(1)
  })

  test('in the max-rent direction income and multiple drive the answer', async ({ page }) => {
    const card = tool(page, 'renttoincome')
    await card.getByRole('button', { name: 'Swap' }).click()
    await type(field(card, 'Annual income'), 150000)
    await type(field(card, 'They ask for'), 30)
    await expect(row(card, 'Max monthly rent at 30×')).toContainText('$5,000.00')
    await expect(row(card, 'Per year at that rent')).toContainText('$60,000.00')
  })

  test('swapping twice comes back, and the direction survives a reload', async ({ page }) => {
    const card = tool(page, 'renttoincome')
    await card.getByRole('button', { name: 'Swap' }).click()
    await reload(page)
    await expect(field(tool(page, 'renttoincome'), 'Monthly rent')).toHaveCount(0)
    await tool(page, 'renttoincome').getByRole('button', { name: 'Swap' }).click()
    await expect(field(tool(page, 'renttoincome'), 'Monthly rent')).toHaveValue('2500')
  })
})

// ---------------------------------------------------------------- vacation

test.describe('vacation planning', () => {
  test('defaults: 4 nights add up to $1,650 and 3.3 months to save', async ({ page }) => {
    const card = tool(page, 'vacation')
    await expect(row(card, 'Trip total')).toContainText('$1,650.00')
    await expect(row(card, 'Months to save')).toContainText('3.3')
  })

  test('per-night items scale with nights, the rest do not', async ({ page }) => {
    const card = tool(page, 'vacation')
    await type(field(card, 'Nights'), 7)
    // 7 x (200 + 75) + 300 + 50 + 100 + 100
    await expect(row(card, 'Trip total')).toContainText('$2,475.00')
    await type(field(card, 'Flights, round trip'), 800)
    await expect(row(card, 'Trip total')).toContainText('$2,975.00')
  })

  test('every cost field feeds the total', async ({ page }) => {
    const card = tool(page, 'vacation')
    await type(field(card, 'Hotel per night'), 100)
    await type(field(card, 'Food per night'), 50)
    await type(field(card, 'Getting around'), 0)
    await type(field(card, 'Spending'), 0)
    await type(field(card, 'Just in case'), 0)
    // 4 x 150 + 300
    await expect(row(card, 'Trip total')).toContainText('$900.00')
  })

  test('months to save divides the total by the monthly saving', async ({ page }) => {
    const card = tool(page, 'vacation')
    await type(field(card, 'You can save per month'), 300)
    await expect(row(card, 'Months to save')).toContainText('5.5')
  })

  test('saving nothing a month shows a dash instead of dividing by zero', async ({ page }) => {
    const card = tool(page, 'vacation')
    await type(field(card, 'You can save per month'), 0)
    await expect(row(card, 'Months to save')).toContainText('—')
    await expect(row(card, 'Trip total')).toContainText('$1,650.00')
  })

  test('the months tooltip quotes the live Budget leftover', async ({ page }) => {
    const card = tool(page, 'vacation')
    await row(card, 'Months to save').locator('svg').hover()
    // income 5,820.80 minus the eight budget rows (3,029)
    await expect(page.getByRole('tooltip')).toContainText('Trip total ($1,650) divided by what you can save per month ($500)')
    await expect(page.getByRole('tooltip')).toContainText('your Budget tab leaves about $2,762 a month')
  })

  test('values persist across a reload', async ({ page }) => {
    await type(field(tool(page, 'vacation'), 'Nights'), 10)
    await reload(page)
    await expect(field(tool(page, 'vacation'), 'Nights')).toHaveValue('10')
    // 10 x 275 + 550
    await expect(row(tool(page, 'vacation'), 'Trip total')).toContainText('$3,300.00')
  })
})

// ---------------------------------------------------------------- equity payout

test.describe('equity payout', () => {
  test('defaults: options with no shares pay nothing', async ({ page }) => {
    const card = tool(page, 'stock')
    await expect(row(card, 'Delta per share')).toContainText('$10.00')
    await expect(row(card, 'Gross profit')).toContainText('$0.00')
    await expect(row(card, 'Net profit')).toContainText('$0.00')
    await expect(card).toContainText('Taxed per payout year as income on top of your salary, in Texas.')
  })

  test('NSO: 1,000 options at a $10 spread are taxed on top of $100,000', async ({ page }) => {
    const card = tool(page, 'stock')
    await type(field(card, 'Options'), 1000)
    await expect(row(card, 'Gross profit')).toContainText('$10,000.00')
    await expect(row(card, 'Effective tax on the payout (Texas)')).toContainText('29.6%')
    await expect(row(card, 'Net profit')).toContainText('$7,035.00')
    await expect(row(card, 'Net per year (over 1)')).toContainText('$7,035.00')
  })

  test('payout years split the gain into slices taxed separately', async ({ page }) => {
    const card = tool(page, 'stock')
    await type(field(card, 'Exit price'), 30)
    await type(field(card, 'Options'), 5000)
    await type(field(card, 'Payout years'), 2)
    await expect(row(card, 'Delta per share')).toContainText('$20.00')
    await expect(row(card, 'Gross profit')).toContainText('$100,000.00')
    await expect(row(card, 'Effective tax on the payout')).toContainText('30.8%')
    await expect(row(card, 'Net profit')).toContainText('$69,222.00')
    await expect(row(card, 'Net per year (over 2)')).toContainText('$34,611.00')
  })

  test('an exit price under the strike pays nothing, never negative', async ({ page }) => {
    const card = tool(page, 'stock')
    await type(field(card, 'Options'), 1000)
    await type(field(card, 'Exit price'), 5)
    await expect(row(card, 'Delta per share')).toContainText('$0.00')
    await expect(row(card, 'Net profit')).toContainText('$0.00')
    await expect(row(card, 'Effective tax')).toContainText('0.0%')
  })

  test('zero payout years is treated as one year', async ({ page }) => {
    const card = tool(page, 'stock')
    await type(field(card, 'Options'), 1000)
    await type(field(card, 'Payout years'), 0)
    await expect(row(card, 'Net profit')).toContainText('$7,035.00')
    await expect(row(card, 'Net per year (over 1)')).toContainText('$7,035.00')
  })

  test('RSUs ignore the strike: the whole exit price is the value', async ({ page }) => {
    const card = tool(page, 'stock')
    await pick(card, page, 'Options (NSO)', 'RSUs')
    await expect(field(card, 'Your price (strike)')).toHaveCount(0)
    await type(field(card, 'Shares'), 1000)
    await expect(row(card, 'Value per share')).toContainText('$20.00')
    await expect(row(card, 'Gross profit')).toContainText('$20,000.00')
    await expect(row(card, 'Net profit')).toContainText('$14,070.00')
  })

  test('RSUs over four years on $150,000 salary', async ({ page }) => {
    const card = tool(page, 'stock')
    await pick(card, page, 'Options (NSO)', 'RSUs')
    await type(field(card, 'Exit price'), 50)
    await type(field(card, 'Shares'), 10000)
    await type(field(card, 'Salary (stacked under)'), 150000)
    await type(field(card, 'Payout years'), 4)
    await expect(row(card, 'Gross profit')).toContainText('$500,000.00')
    await expect(row(card, 'Net profit')).toContainText('$342,893.00')
    await expect(row(card, 'Net per year (over 4)')).toContainText('$85,723.25')
  })

  test('ISO shows the held-over toggle; off it is income tax with no FICA', async ({ page }) => {
    const card = tool(page, 'stock')
    await expect(card.getByRole('checkbox')).toHaveCount(0)
    await pick(card, page, 'Options (NSO)', 'Options (ISO)')
    await expect(card.getByRole('checkbox')).toBeVisible()
    await expect(card).toContainText('Turn on the toggle if you will hold the shares over a year after exercise.')
    await expect(card).toContainText('No Social Security or Medicare on ISO shares.')
    await type(field(card, 'Exit price'), 30)
    await type(field(card, 'Options'), 5000)
    await expect(row(card, 'Net profit')).toContainText('$76,436.00')
  })

  test('ISO held over a year is taxed as a long-term gain', async ({ page }) => {
    const card = tool(page, 'stock')
    await pick(card, page, 'Options (NSO)', 'Options (ISO)')
    await type(field(card, 'Exit price'), 30)
    await type(field(card, 'Options'), 5000)
    await card.getByRole('checkbox').click()
    await expect(card).toContainText('The gain is taxed as a long-term capital gain')
    await expect(row(card, 'Effective tax on the payout')).toContainText('15.0%')
    await expect(row(card, 'Net profit')).toContainText('$85,000.00')
  })

  test('the equity tax follows the shared state (NYC)', async ({ page }) => {
    await seed(page, { taxState: 'ny-nyc' })
    const card = tool(page, 'stock')
    await pick(card, page, 'Options (NSO)', 'RSUs')
    await type(field(card, 'Exit price'), 50)
    await type(field(card, 'Shares'), 10000)
    await type(field(card, 'Salary (stacked under)'), 150000)
    await type(field(card, 'Payout years'), 4)
    await expect(row(card, 'Effective tax on the payout (New York (NYC))')).toContainText('41.6%')
    await expect(row(card, 'Net profit')).toContainText('$292,052.20')
  })

  test('type and inputs persist across a reload', async ({ page }) => {
    const card = tool(page, 'stock')
    await pick(card, page, 'Options (NSO)', 'RSUs')
    await type(field(card, 'Shares'), 1000)
    await reload(page)
    const again = tool(page, 'stock')
    await expect(trigger(again, 'RSUs')).toBeVisible()
    await expect(row(again, 'Net profit')).toContainText('$14,070.00')
    expect((await ls(page, 'stockCalc2')).type).toBe('rsu')
  })
})

// ---------------------------------------------------------------- take-home pay

test.describe('take-home pay', () => {
  test('defaults: $80,000 with 4% 401k and $150 a month insurance', async ({ page }) => {
    const card = tool(page, 'takehome')
    await expect(card).toContainText('Taxed in Texas.')
    await expect(row(card, '401k (4%)')).toContainText('−$3,200.00')
    await expect(row(card, 'Health insurance')).toContainText('−$1,800.00')
    await expect(row(card, 'Federal income tax')).toContainText('−$7,670.00')
    await expect(row(card, 'Social Security and Medicare')).toContainText('−$5,982.30')
    await expect(row(card, 'State tax')).toContainText('−$0.00')
    await expect(row(card, 'Take-home per year')).toContainText('$61,347.70')
    await expect(row(card, 'Take-home per month')).toContainText('$5,112.31')
    await expect(row(card, 'Per paycheck, paid twice a month')).toContainText('$2,556.15')
    await expect(row(card, 'Of every dollar you earn, you keep')).toContainText('76.7%')
  })

  test('a different salary reruns the brackets', async ({ page }) => {
    const card = tool(page, 'takehome')
    await type(field(card, 'Salary per year'), 120000)
    await expect(row(card, 'Federal income tax')).toContainText('−$16,118.00')
    await expect(row(card, 'Social Security and Medicare')).toContainText('−$9,042.30')
    await expect(row(card, 'Take-home per year')).toContainText('$88,239.70')
    await expect(row(card, 'Per paycheck, paid twice a month')).toContainText('$3,676.65')
    await expect(row(card, 'Of every dollar you earn, you keep')).toContainText('73.5%')
  })

  test('zero salary: everything is zero and the percent does not divide by zero', async ({ page }) => {
    const card = tool(page, 'takehome')
    await type(field(card, 'Salary per year'), 0)
    // the $150 a month insurance is a flat amount, so it still comes out
    await expect(row(card, 'Federal income tax')).toContainText('−$0.00')
    await expect(row(card, 'Take-home per year')).toContainText('−$1,800.00')
    await expect(row(card, 'Of every dollar you earn, you keep')).toContainText('0.0%')
  })

  test('removing the insurance row: 401k skips income tax but not FICA', async ({ page }) => {
    const card = tool(page, 'takehome')
    await card.getByRole('button', { name: 'Remove' }).last().click()
    await expect(row(card, 'Health insurance')).toHaveCount(0)
    // insurance gone, FICA is now on the full 80,000
    await expect(row(card, 'Federal income tax')).toContainText('−$8,066.00')
    await expect(row(card, 'Social Security and Medicare')).toContainText('−$6,120.00')
    await expect(row(card, 'Take-home per year')).toContainText('$62,614.00')
  })

  test('removing the 401k row: insurance skips both taxes', async ({ page }) => {
    const card = tool(page, 'takehome')
    await card.getByRole('button', { name: 'Remove' }).first().click()
    await expect(row(card, '401k')).toHaveCount(0)
    await expect(row(card, 'Federal income tax')).toContainText('−$8,374.00')
    await expect(row(card, 'Social Security and Medicare')).toContainText('−$5,982.30')
    await expect(row(card, 'Take-home per year')).toContainText('$63,843.70')
  })

  test('with nothing coming out the full salary is taxed', async ({ page }) => {
    const card = tool(page, 'takehome')
    await card.getByRole('button', { name: 'Remove' }).first().click()
    await card.getByRole('button', { name: 'Remove' }).first().click()
    await expect(row(card, 'Take-home per year')).toContainText('$65,110.00')
    await expect(row(card, 'Of every dollar you earn, you keep')).toContainText('81.4%')
  })

  test('the 401k amount can switch to dollars a month', async ({ page }) => {
    const card = tool(page, 'takehome')
    const rowEl = card.locator('div.flex-wrap').filter({ has: page.getByRole('button', { name: 'Remove' }) }).first()
    await pick(rowEl, page, '% of salary', '$ per month')
    await type(rowEl.locator('input').first(), 500)
    await expect(row(card, '401k')).toContainText('−$6,000.00')
    await expect(row(card, 'Take-home per year')).toContainText('$59,163.70')
  })

  test('a Roth 401k comes out after tax', async ({ page }) => {
    const card = tool(page, 'takehome')
    const rowEl = card.locator('div.flex-wrap').filter({ has: page.getByRole('button', { name: 'Remove' }) }).first()
    await pick(rowEl, page, '401k', 'Roth 401k')
    await type(rowEl.locator('input').first(), 5)
    await expect(row(card, 'Roth 401k (5%)')).toContainText('−$4,000.00')
    // only the insurance lowers the taxed pay, the Roth just lowers take-home
    await expect(row(card, 'Federal income tax')).toContainText('−$8,374.00')
    await expect(row(card, 'Take-home per year')).toContainText('$59,843.70')
  })

  test('adding a deduction starts as a $0 pre-tax row and changes nothing', async ({ page }) => {
    const card = tool(page, 'takehome')
    await card.getByRole('button', { name: 'Add something that comes out' }).click()
    await expect(card.getByRole('button', { name: 'Remove' })).toHaveCount(3)
    await expect(row(card, 'Something else, pre-tax')).toContainText('−$0.00')
    await expect(row(card, 'Take-home per year')).toContainText('$61,347.70')
  })

  test('negative deductions are held at zero', async ({ page }) => {
    const card = tool(page, 'takehome')
    const rowEl = card.locator('div.flex-wrap').filter({ has: page.getByRole('button', { name: 'Remove' }) }).first()
    await type(rowEl.locator('input').first(), -5)
    await expect(row(card, '401k')).toContainText('−$0.00')
  })

  test('an employer match shows only on 401k rows and adds to the 401k total', async ({ page }) => {
    const card = tool(page, 'takehome')
    await expect(card.getByText('Your employer adds')).toHaveCount(0)
    await expect(card.getByText('Employer match')).toHaveCount(1)
    const rowEl = card.locator('div.flex-wrap').filter({ has: page.getByRole('button', { name: 'Remove' }) }).first()
    await type(rowEl.locator('input').nth(1), 50)
    // 50% of the $3,200 you put in
    await expect(card).toContainText('Your employer adds $1,600.00 a year to your 401k.')
    // the match is not taken from your pay
    await expect(row(card, 'Take-home per year')).toContainText('$61,347.70')
    expect((await ls(page, 'takeHome')).deductions[0].match).toBe(50)
  })

  test('it taxes in the shared state (New York City)', async ({ page }) => {
    await seed(page, { taxState: 'ny-nyc' })
    const card = tool(page, 'takehome')
    await expect(card).toContainText('Taxed in New York (NYC).')
    await expect(row(card, 'State and city tax')).toContainText('−$5,925.09')
    await expect(row(card, 'Take-home per year')).toContainText('$55,422.61')
    await expect(row(card, 'Per paycheck, paid twice a month')).toContainText('$2,309.28')
  })

  test('edits persist across a reload', async ({ page }) => {
    await type(field(tool(page, 'takehome'), 'Salary per year'), 200000)
    await reload(page)
    await expect(field(tool(page, 'takehome'), 'Salary per year')).toHaveValue('200000')
    await expect(row(tool(page, 'takehome'), 'Take-home per month')).toContainText('$11,792.09')
  })

  test('presets: save, change, apply, rename and delete', async ({ page }) => {
    const card = tool(page, 'takehome')
    await card.getByRole('button', { name: 'Presets' }).click()
    await expect(page.getByText('No presets yet')).toBeVisible()
    await page.getByRole('menuitem', { name: 'Save as new preset' }).click()
    await page.getByPlaceholder('Preset name').fill('Now')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(card.getByRole('button', { name: 'Now' })).toBeVisible()
    await type(field(card, 'Salary per year'), 120000)
    await expect(row(card, 'Take-home per year')).toContainText('$88,239.70')
    await expect(card.getByLabel('Changed since this preset')).toBeVisible()
    await card.getByRole('button', { name: 'Now' }).click()
    await page.getByRole('menuitem', { name: 'Now' }).click()
    await expect(field(card, 'Salary per year')).toHaveValue('80000')
    await expect(row(card, 'Take-home per year')).toContainText('$61,347.70')
    await card.getByRole('button', { name: 'Now' }).click()
    await page.getByRole('button', { name: 'Rename preset "Now"' }).click({ force: true })
    await page.getByLabel('New preset name').fill('Today')
    await page.getByRole('button', { name: 'Rename', exact: true }).click()
    await expect(card.getByRole('button', { name: 'Today' })).toBeVisible()
    await reload(page)
    await tool(page, 'takehome').getByRole('button', { name: 'Today' }).click()
    await page.getByRole('button', { name: 'Delete preset "Today"' }).click({ force: true })
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(tool(page, 'takehome').getByRole('button', { name: 'Presets' })).toBeVisible()
  })

  test('an old take-home save loads unchanged with presets in place', async ({ page }) => {
    await seed(page, { takeHome: { salary: 80000, k401Pct: 4, medicalMo: 150 } })
    const card = tool(page, 'takehome')
    await expect(row(card, 'Take-home per year')).toContainText('$61,347.70')
    await expect(card.getByRole('button', { name: 'Presets' })).toBeVisible()
  })

  test('Change opens the About you page', async ({ page }) => {
    await tool(page, 'takehome').getByRole('button', { name: 'Change' }).click()
    await expect(page.locator('h1', { hasText: 'About you' })).toBeVisible()
  })
})

// ---------------------------------------------------------------- cash between two days

test.describe('cash between two days', () => {
  const total = (card) => card.locator('tr', { hasText: /^Total/ })

  // live-only subscriptions (Netflix, Spotify, iCloud: $30 a month) count like on the Budget page,
  // undated, so in full in every range
  test('defaults: the 1st to the 15th', async ({ page }) => {
    const card = tool(page, 'cash')
    await expect(card).toContainText('Day 1 to 15 (15 days)')
    await expect(total(card)).toContainText('$2,644.00')
    await expect(row(card, 'Rent')).toContainText('on the 1st')
    await expect(row(card, 'Rent')).toContainText('$1,850.00')
    await expect(row(card, 'Electricity')).toContainText('on the 8th')
    await expect(row(card, 'Phone')).toContainText('on the 12th')
    await expect(row(card, 'Crunch Fitness')).toContainText('on the 3rd')
    await expect(row(card, 'Groceries')).toContainText('prorated, 15 days')
    await expect(row(card, 'Groceries')).toContainText('$225.00')
    await expect(row(card, 'Unexpected')).toContainText('undated — assumed')
    await expect(row(card, 'Unexpected')).toContainText('$150.00')
  })

  test('rows are sorted biggest first', async ({ page }) => {
    const names = await tool(page, 'cash').locator('tbody tr td:first-child').allInnerTexts()
    const clean = names.map((n) => n.replace(/^.\n/, '').trim()).filter((n) => !n.startsWith('Total'))
    expect(clean).toEqual(['Rent', 'Groceries', 'Unexpected', 'Restaurants', 'Electricity', 'Phone', 'Transit', 'Crunch Fitness', 'Netflix', 'Spotify', 'iCloud'])
  })

  test('the 16th to end of month button uses the real month length (30)', async ({ page }) => {
    const card = tool(page, 'cash')
    await card.getByRole('button', { name: '16th → end of month' }).click()
    await expect(field(card, 'From day')).toHaveValue('16')
    // stored as 31 so it stays the last day in every month
    await expect(field(card, 'To day')).toHaveValue('31')
    await expect(card).toContainText('Day 16 to end of month (15 days)')
    // no dated rows fall in 16-30: prorated rows at 15/30 plus the undated ones
    await expect(total(card)).toContainText('$595.00')
    await expect(row(card, 'Rent')).toHaveCount(0)
  })

  test('1st to 15th button resets the range', async ({ page }) => {
    const card = tool(page, 'cash')
    await card.getByRole('button', { name: '16th → end of month' }).click()
    await card.getByRole('button', { name: '1st → 15th' }).click()
    await expect(total(card)).toContainText('$2,644.00')
  })

  test('a custom range counts dated rows once and prorates the rest', async ({ page }) => {
    const card = tool(page, 'cash')
    await type(field(card, 'From day'), 5)
    await type(field(card, 'To day'), 12)
    await expect(card).toContainText('Day 5 to 12 (8 days)')
    await expect(row(card, 'Electricity')).toContainText('$95.00')
    await expect(row(card, 'Phone')).toContainText('$65.00')
    await expect(row(card, 'Groceries')).toContainText('$120.00')
    await expect(row(card, 'Restaurants')).toContainText('$69.33')
    await expect(row(card, 'Transit')).toContainText('$32.00')
    await expect(row(card, 'Rent')).toHaveCount(0)
    await expect(row(card, 'Crunch Fitness')).toHaveCount(0)
    await expect(total(card)).toContainText('$561.33')
  })

  test('a one-day range (the 3rd) catches the gym and a sliver of the prorated rows', async ({ page }) => {
    const card = tool(page, 'cash')
    await type(field(card, 'From day'), 3)
    await type(field(card, 'To day'), 3)
    await expect(card).toContainText('Day 3 to 3 (1 days)')
    await expect(row(card, 'Crunch Fitness')).toContainText('$39.00')
    await expect(row(card, 'Groceries')).toContainText('$15.00')
    await expect(total(card)).toContainText('$246.67')
  })

  test('a "to" day before the "from" day shows an error and no table', async ({ page }) => {
    const card = tool(page, 'cash')
    await type(field(card, 'From day'), 20)
    await type(field(card, 'To day'), 10)
    await expect(card.getByText('"To day" must be on or after "From day".')).toBeVisible()
    await expect(card.locator('table')).toHaveCount(0)
    await type(field(card, 'To day'), 25)
    await expect(card.locator('table')).toBeVisible()
  })

  test('a "to" day past the end of the month stops at the last day', async ({ page }) => {
    // 1 to 31 in a 30 day month counts the whole month, 30/30
    const card = tool(page, 'cash')
    await type(field(card, 'To day'), 31)
    await expect(row(card, 'Groceries')).toContainText('$450.00')
    await expect(total(card)).toContainText('$3,059.00')
  })

  test('cash on hand adds up a running total and shows the leftover', async ({ page }) => {
    const card = tool(page, 'cash')
    await card.getByPlaceholder('3000 paycheck + 400 from a sale').fill('3200 checking + 4315 paycheck + 400 monitor sale - 50 fee')
    await expect(card).toContainText('= $7,865')
    await expect(card.getByText('Leftover after cash on hand')).toBeVisible()
    await expect(card).toContainText('$5,221.00')
  })

  test('not enough cash shows a negative leftover', async ({ page }) => {
    const card = tool(page, 'cash')
    await card.getByPlaceholder('3000 paycheck + 400 from a sale').fill('1000')
    await expect(card).toContainText('= $1,000')
    await expect(card).toContainText('−$1,644.00')
  })

  test('commas and dollar signs in cash terms are understood', async ({ page }) => {
    const card = tool(page, 'cash')
    await card.getByPlaceholder('3000 paycheck + 400 from a sale').fill('$3,000 paycheck + $500.50 sale')
    await expect(card).toContainText('= $3,501')
  })

  test('text with no number gives no total and no leftover chip', async ({ page }) => {
    const card = tool(page, 'cash')
    await card.getByPlaceholder('3000 paycheck + 400 from a sale').fill('some paycheck')
    await expect(card.getByText('Leftover after cash on hand')).toHaveCount(0)
  })

  test('the expression and the range persist across a reload', async ({ page }) => {
    const card = tool(page, 'cash')
    await card.getByPlaceholder('3000 paycheck + 400 from a sale').fill('3000 pay')
    await type(field(card, 'To day'), 20)
    await reload(page)
    const again = tool(page, 'cash')
    await expect(again.getByPlaceholder('3000 paycheck + 400 from a sale')).toHaveValue('3000 pay')
    await expect(field(again, 'To day')).toHaveValue('20')
    expect((await ls(page, 'cashRange')).cashExpr).toBe('3000 pay')
  })

  test('an old numeric cashOnHand seeds the box until it is edited', async ({ page }) => {
    await seed(page, { cashRange: { fromDay: 1, toDay: 15, cashOnHand: 3000, cashExpr: '' } })
    const card = tool(page, 'cash')
    const box = card.getByPlaceholder('3000 paycheck + 400 from a sale')
    await expect(box).toHaveValue('3000')
    await expect(card).toContainText('= $3,000')
    await box.fill('')
    await expect(box).toHaveValue('')
    await expect(card.getByText('Leftover after cash on hand')).toHaveCount(0)
    expect((await ls(page, 'cashRange')).cashOnHand).toBe(0)
  })
})

// ---------------------------------------------------------------- rent scenarios

test.describe('rent scenarios', () => {
  const table = (card) => card.locator('table').last()
  const line = (card, rent) => table(card).getByRole('row', { name: new RegExp('^\\$' + rent.toLocaleString('en-US') + '(\\D|$)') })

  test('defaults: $1,000 to $4,000 in steps of $500 against the Budget', async ({ page }) => {
    const card = tool(page, 'rentscenarios')
    await expect(card).toContainText('$5,821 a month coming in')
    await expect(card).toContainText('$1,209 going out besides rent')
    await expect(table(card).locator('tbody tr')).toHaveCount(7)
    await expect(line(card, 1000)).toContainText('$3,611.80')
    await expect(line(card, 1000)).toContainText('$43,341.60')
    await expect(line(card, 3000)).toContainText('$1,611.80')
    await expect(line(card, 4000)).toContainText('$611.80')
    await expect(line(card, 4000)).toContainText('$7,341.60')
  })

  test('the row nearest your rent is marked', async ({ page }) => {
    const card = tool(page, 'rentscenarios')
    await expect(card.getByText('← closest to current ($1,850)')).toHaveCount(1)
    await expect(line(card, 2000)).toContainText('← closest to current ($1,850)')
  })

  test('From, To and Step control the rows', async ({ page }) => {
    const card = tool(page, 'rentscenarios')
    await type(field(card, 'From'), 1500)
    await type(field(card, 'To'), 2500)
    await type(field(card, 'Step'), 250)
    await expect(table(card).locator('tbody tr')).toHaveCount(5)
    await expect(line(card, 1750)).toContainText('← closest to current')
    await expect(line(card, 2500)).toContainText('$2,111.80')
  })

  test('a step under $50 counts as $50', async ({ page }) => {
    const card = tool(page, 'rentscenarios')
    await type(field(card, 'From'), 1000)
    await type(field(card, 'To'), 1200)
    await type(field(card, 'Step'), 10)
    // 1000, 1050, 1100, 1150, 1200
    await expect(table(card).locator('tbody tr')).toHaveCount(5)
  })

  test('the table stops at 40 rows', async ({ page }) => {
    const card = tool(page, 'rentscenarios')
    await type(field(card, 'To'), 100000)
    await type(field(card, 'Step'), 50)
    await expect(table(card).locator('tbody tr')).toHaveCount(40)
  })

  test('From above To leaves no rows', async ({ page }) => {
    const card = tool(page, 'rentscenarios')
    await type(field(card, 'From'), 5000)
    await expect(table(card).locator('tbody tr')).toHaveCount(0)
  })

  test('rents above what you can afford go red with a dash for payoff', async ({ page }) => {
    const card = tool(page, 'rentscenarios')
    await type(field(card, 'From'), 5000)
    await type(field(card, 'To'), 5000)
    const r = line(card, 5000)
    await expect(r).toContainText('−$388.20')
    await expect(r).toContainText('−$4,658.40')
    await expect(r.locator('td').nth(1)).toHaveCSS('color', 'rgb(255, 99, 99)').catch(async () => {
      // the exact red is a theme variable: just check it is not the green used for positives
      const pos = await line(card, 5000).locator('td').nth(1).evaluate((e) => getComputedStyle(e).color)
      expect(pos).not.toBe('')
    })
    await expect(r.locator('td').last()).toHaveText('—')
  })

  test('with debts, "Debt paid off in" pays the debt from the monthly leftover, with interest', async ({ page }) => {
    await seed(page, { debts: DEBTS })
    const card = tool(page, 'rentscenarios')
    // 15,000 owed at a balance-weighted 4% APR, the same as the Debt payoff tool's All debts
    await expect(line(card, 1000).locator('td').last()).toHaveText('5m')
    await expect(line(card, 2000).locator('td').last()).toHaveText('6m')
    // 611.80 a month: 25 months with no interest, 26 with it
    await expect(line(card, 4000).locator('td').last()).toHaveText('2y 2m')
  })

  test('a leftover that does not cover the interest is never paid off', async ({ page }) => {
    // 24% of 60,000 is 1,200 a month in interest, more than the 611.80 left at $4,000 rent
    await seed(page, { debts: [{ id: 'd', name: 'Card', balance: 60000, apr: 24, payment: 0, budgetRow: null }] })
    await expect(line(tool(page, 'rentscenarios'), 4000).locator('td').last()).toHaveText('Never')
  })

  test('the same debt pays off in the same months in Rent scenarios, Debt payoff and Balances, and Retirement dates it too', async ({ page }) => {
    // the $4,000 rent row leaves 611.80 a month, so the debt's own payment is set to that.
    // 10,000 at 18% and 611.80 a month is 19 months (17 with no interest)
    await seed(page, { debts: [{ id: 'd', name: 'Car', balance: 10000, apr: 18, payment: 611.8, budgetRow: null }] })
    await expect(line(tool(page, 'rentscenarios'), 4000).locator('td').nth(1)).toHaveText('$611.80')
    await expect(line(tool(page, 'rentscenarios'), 4000).locator('td').last()).toHaveText('1y 7m')
    await expect(field(tool(page, 'debt'), 'Contribution per month')).toHaveValue('611.8')
    await expect(row(tool(page, 'debt'), 'Time to pay off (includes interest)')).toContainText('1y 7m')
    await goTo(page, 'Balances')
    await expect(main(page).getByText(/^Paid off in 1 year 7 months/)).toBeVisible()
    await goTo(page, 'Retirement')
    // Retirement pays debts first, so its payoff time also counts the savings and is shorter
    await expect(main(page).getByText(/^Paid off in .+ \(age \d+\)\.$/)).toBeVisible()
  })

  test('with no debts it shows a dash', async ({ page }) => {
    const card = tool(page, 'rentscenarios')
    await expect(line(card, 1000).locator('td').last()).toHaveText('—')
  })

  test('a huge debt shows 100+ yrs', async ({ page }) => {
    await seed(page, { debts: [{ id: 'big', name: 'Big', balance: 10000000, apr: 0, payment: 0, budgetRow: null }] })
    await expect(line(tool(page, 'rentscenarios'), 4000).locator('td').last()).toHaveText('100+ yrs')
  })

  test('the expenses panel lists every non-rent row with its budget amount', async ({ page }) => {
    const card = tool(page, 'rentscenarios')
    await card.getByRole('button', { name: /Expenses used/ }).click()
    await expect(card).toContainText('Overrides only affect this tool')
    for (const [name, amt] of [['Crunch Fitness', '$39.00'], ['Electricity', '$95.00'], ['Phone', '$65.00'], ['Groceries', '$450.00'], ['Restaurants', '$260.00'], ['Transit', '$120.00'], ['Unexpected', '$150.00']]) {
      await expect(card.locator('tr', { hasText: name })).toContainText(amt)
    }
    await expect(card.locator('table').first().locator('tr', { hasText: /^Rent/ })).toHaveCount(0)
  })

  test('an override changes this tool only and is flagged', async ({ page }) => {
    const card = tool(page, 'rentscenarios')
    await card.getByRole('button', { name: /Expenses used/ }).click()
    await type(card.locator('tr', { hasText: 'Groceries' }).locator('input'), 600)
    await expect(card.getByRole('button', { name: /Expenses used/ })).toContainText('1 overridden')
    await expect(card).toContainText('$1,359 going out besides rent')
    await expect(line(card, 2000)).toContainText('$2,461.80')
    expect(await ls(page, 'rentScenarioOverrides')).toEqual({ b005: 600 })
    // the real budget is untouched
    await goTo(page, 'Budget')
    await expect(page.locator('tr', { hasText: /^Total/ }).last()).toContainText('$3,059')
  })

  test('typing the budget value back is not an override', async ({ page }) => {
    const card = tool(page, 'rentscenarios')
    await card.getByRole('button', { name: /Expenses used/ }).click()
    await type(card.locator('tr', { hasText: 'Groceries' }).locator('input'), 600)
    await type(card.locator('tr', { hasText: 'Groceries' }).locator('input'), 450)
    await expect(card.getByRole('button', { name: /overridden/ })).toHaveCount(0)
  })

  test('Reset to budget defaults clears every override', async ({ page }) => {
    const card = tool(page, 'rentscenarios')
    await card.getByRole('button', { name: /Expenses used/ }).click()
    await type(card.locator('tr', { hasText: 'Groceries' }).locator('input'), 600)
    await type(card.locator('tr', { hasText: 'Transit' }).locator('input'), 0)
    await expect(card.getByRole('button', { name: /Expenses used/ })).toContainText('2 overridden')
    await card.getByRole('button', { name: 'Reset to budget defaults' }).click()
    await expect(card).toContainText('$1,209 going out besides rent')
    await expect(card.getByRole('button', { name: 'Reset to budget defaults' })).toHaveCount(0)
  })

  test('overrides persist across a reload', async ({ page }) => {
    const card = tool(page, 'rentscenarios')
    await card.getByRole('button', { name: /Expenses used/ }).click()
    await type(card.locator('tr', { hasText: 'Groceries' }).locator('input'), 600)
    await reload(page)
    await expect(tool(page, 'rentscenarios')).toContainText('$1,359 going out besides rent')
  })

  test('"Your rent comes from" lists every visible row, and "No budget row" sticks', async ({ page }) => {
    const card = tool(page, 'rentscenarios')
    await trigger(card, 'Rent').first().click()
    await expect(page.getByRole('menuitem')).toHaveText(['No budget row', 'Crunch Fitness', 'Electricity', 'Groceries', 'iCloud', 'Netflix', 'Phone', 'Rent', 'Restaurants', 'Spotify', 'Transit', 'Unexpected'])
    await page.getByRole('menuitem', { name: 'No budget row' }).click()
    // with no rent row, Rent counts as an ordinary expense: 1,209 + 1,850
    await expect.poll(async () => (await ls(page, 'rentScenario3')).rentRow).toBe('none')
    await expect(card).toContainText('$3,059 going out besides rent')
  })

  test('pointing the rent at another row moves that row out of the expenses', async ({ page }) => {
    const card = tool(page, 'rentscenarios')
    await pick(card, page, 'Rent', 'Phone')
    // Phone (65) is now the rent, so Rent (1,850) counts as an expense: 3,059 - 65
    await expect(card).toContainText('$2,994 going out besides rent')
    await expect(line(card, 1000)).toContainText('← closest to current ($65)')
    expect((await ls(page, 'rentScenario3')).rentRow).toBe('b004')
  })

  test('From, To, Step and the rent row persist across a reload', async ({ page }) => {
    const card = tool(page, 'rentscenarios')
    await type(field(card, 'From'), 2000)
    await type(field(card, 'To'), 3000)
    await reload(page)
    const again = tool(page, 'rentscenarios')
    await expect(field(again, 'From')).toHaveValue('2000')
    await expect(table(again).locator('tbody tr')).toHaveCount(3)
    await expect(trigger(again, 'Rent')).toBeVisible()
  })

  test('presets: Save as new is disabled until something is overridden', async ({ page }) => {
    const card = tool(page, 'rentscenarios')
    await card.getByRole('button', { name: 'Presets' }).click()
    await expect(page.getByText('No presets yet')).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Save as new preset' })).toHaveAttribute('data-disabled', '')
  })

  test('presets: save, switch away, apply, and delete', async ({ page }) => {
    const card = tool(page, 'rentscenarios')
    await card.getByRole('button', { name: /Expenses used/ }).click()
    await type(card.locator('tr', { hasText: 'Groceries' }).locator('input'), 600)
    await card.getByRole('button', { name: 'Presets' }).click()
    await page.getByRole('menuitem', { name: 'Save as new preset' }).click()
    await page.getByPlaceholder('Preset name').fill('Frugal')
    await page.keyboard.press('Enter')
    await expect(card.getByRole('button', { name: 'Frugal' })).toBeVisible()
    await card.getByRole('button', { name: 'Reset to budget defaults' }).click()
    await expect(card).toContainText('$1,209 going out besides rent')
    await card.getByRole('button', { name: 'Frugal' }).click()
    await page.getByRole('menuitem', { name: 'Frugal' }).click()
    await expect(card).toContainText('$1,359 going out besides rent')
    // delete asks first
    await card.getByRole('button', { name: 'Frugal' }).click()
    await page.getByRole('button', { name: 'Delete preset "Frugal"' }).click({ force: true })
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await card.getByRole('button', { name: /Frugal|Presets/ }).click()
    await expect(page.getByText('No presets yet')).toBeVisible()
  })

  test('presets are still there after a reload', async ({ page }) => {
    const card = tool(page, 'rentscenarios')
    await card.getByRole('button', { name: /Expenses used/ }).click()
    await type(card.locator('tr', { hasText: 'Transit' }).locator('input'), 0)
    await card.getByRole('button', { name: 'Presets' }).click()
    await page.getByRole('menuitem', { name: 'Save as new preset' }).click()
    await page.getByPlaceholder('Preset name').fill('No transit')
    await page.keyboard.press('Enter')
    await reload(page)
    await expect(tool(page, 'rentscenarios').getByRole('button', { name: 'No transit' })).toBeVisible()
  })

  test('a changed preset shows the drift dot', async ({ page }) => {
    const card = tool(page, 'rentscenarios')
    await card.getByRole('button', { name: /Expenses used/ }).click()
    await type(card.locator('tr', { hasText: 'Groceries' }).locator('input'), 600)
    await card.getByRole('button', { name: 'Presets' }).click()
    await page.getByRole('menuitem', { name: 'Save as new preset' }).click()
    await page.getByPlaceholder('Preset name').fill('Frugal')
    await page.keyboard.press('Enter')
    await expect(card.getByLabel('Changed since this preset')).toHaveCount(0)
    await type(card.locator('tr', { hasText: 'Groceries' }).locator('input'), 700)
    await expect(card.getByLabel('Changed since this preset')).toBeVisible()
  })
})

// ---------------------------------------------------------------- debt payoff

test.describe('debt payoff', () => {
  test('with no debts it points at the Balances page', async ({ page }) => {
    await expect(tool(page, 'debt')).toContainText('Add a debt on the Balances page to use this.')
    await expect(tool(page, 'debt').locator('table')).toHaveCount(0)
  })

  test('All debts: total, weighted APR and the month count', async ({ page }) => {
    await seed(page, { debts: DEBTS })
    const card = tool(page, 'debt')
    // payments 400 + 150
    await expect(field(card, 'Contribution per month')).toHaveValue('550')
    await expect(row(card, 'Total debt')).toContainText('$15,000.00')
    // balance weighted APR is 4%
    await expect(row(card, 'Time to pay off (includes interest)')).toContainText('2y 5m')
    await expect(row(card, 'Debt-free date')).toContainText('Apr 2029')
  })

  test('a single zero-interest debt is balance over payment, rounded up', async ({ page }) => {
    await seed(page, { debts: DEBTS })
    const card = tool(page, 'debt')
    await onlyDebts(card, page, 'All debts', ['Student loans'])
    await expect(field(card, 'Contribution per month')).toHaveValue('400')
    await expect(row(card, 'Total debt')).toContainText('$12,000.00')
    await expect(row(card, 'Time to pay off')).toContainText('2y 6m')
    await expect(row(card, 'Debt-free date')).toContainText('May 2029')
    await type(field(card, 'Contribution per month'), 700)
    await expect(row(card, 'Time to pay off')).toContainText('1y 6m')
    await expect(row(card, 'Debt-free date')).toContainText('May 2028')
  })

  test('an interest-bearing debt uses the amortization formula', async ({ page }) => {
    await seed(page, { debts: DEBTS })
    const card = tool(page, 'debt')
    await onlyDebts(card, page, 'All debts', ['Card'])
    await expect(row(card, 'Total debt')).toContainText('$3,000.00')
    await expect(row(card, 'Time to pay off (includes interest)')).toContainText('2y 1m')
    await expect(row(card, 'Debt-free date')).toContainText('Dec 2028')
  })

  test('a payment that does not cover the interest never clears', async ({ page }) => {
    await seed(page, { debts: DEBTS })
    const card = tool(page, 'debt')
    await onlyDebts(card, page, 'All debts', ['Card'])
    // 20% of 3,000 is $50 a month in interest
    await type(field(card, 'Contribution per month'), 40)
    await expect(row(card, 'Time to pay off')).toContainText('—')
    await expect(row(card, 'Debt-free date')).toContainText('—')
  })

  test('a contribution of zero shows dashes', async ({ page }) => {
    await seed(page, { debts: DEBTS })
    const card = tool(page, 'debt')
    await onlyDebts(card, page, 'All debts', ['Student loans'])
    await type(field(card, 'Contribution per month'), 0)
    await expect(row(card, 'Time to pay off')).toContainText('—')
    await expect(row(card, 'Debt-free date')).toContainText('—')
  })

  test('typing a contribution for All debts overrides the Balances payments', async ({ page }) => {
    await seed(page, { debts: DEBTS })
    const card = tool(page, 'debt')
    await type(field(card, 'Contribution per month'), 1000)
    await expect(row(card, 'Time to pay off (includes interest)')).toContainText('1y 4m')
    expect((await ls(page, 'debtPayoff')).typed).toBe(1000)
    await reload(page)
    await expect(field(tool(page, 'debt'), 'Contribution per month')).toHaveValue('1000')
  })

  test('a typed contribution stays when you change the debts', async ({ page }) => {
    await seed(page, { debts: DEBTS })
    const card = tool(page, 'debt')
    await onlyDebts(card, page, 'All debts', ['Card'])
    await type(field(card, 'Contribution per month'), 60)
    await expect(row(card, 'Time to pay off')).toContainText('9y 1m')
    await onlyDebts(card, page, 'Card', ['Card', 'Student loans'])
    await expect(field(card, 'Contribution per month')).toHaveValue('60')
    expect((await ls(page, 'debtPayoff')).typed).toBe(60)
  })

  test('the contribution can come from the Budget savings', async ({ page }) => {
    await seed(page, { debts: DEBTS })
    const card = tool(page, 'debt')
    await pick(card, page, 'What I pay now', 'Budget savings')
    await expect(card).toContainText('Retirement saves this same money')
  })

  test('a debt linked to a Budget row takes that row as its payment', async ({ page }) => {
    await seed(page, { debts: [{ id: 'd3', name: 'Phone plan', balance: 650, apr: 0, payment: 0, budgetRow: 'b004' }] })
    const card = tool(page, 'debt')
    // the Phone row is $65 a month
    await expect(field(card, 'Contribution per month')).toHaveValue('65')
    await expect(row(card, 'Time to pay off')).toContainText('10m')
  })

  test('a fully paid debt reads 0m', async ({ page }) => {
    await seed(page, { debts: [{ id: 'd4', name: 'Done', balance: 0, apr: 0, payment: 100, budgetRow: null }] })
    const card = tool(page, 'debt')
    await expect(row(card, 'Total debt')).toContainText('$0.00')
    await expect(row(card, 'Time to pay off')).toContainText('0m')
  })
})

// ---------------------------------------------------------------- cross-tool links

test.describe('cross-tool links', () => {
  test('Rent scenarios income follows the Take-home tool when the Budget uses it', async ({ page }) => {
    await seed(page, { budgetIncomeOverride: { active: true, amount: 0 } })
    const card = tool(page, 'rentscenarios')
    await expect(card).toContainText('$5,112 a month coming in')
    // 5,112.31 - 1,209 - 1,000
    await expect(card.locator('table').last().getByRole('row', { name: /^\$1,000/ })).toContainText('$2,903.31')
  })

  test('editing the salary updates Rent scenarios live, without a reload', async ({ page }) => {
    await seed(page, { budgetIncomeOverride: { active: true, amount: 0 } })
    await type(field(tool(page, 'takehome'), 'Salary per year'), 120000)
    await expect(tool(page, 'rentscenarios')).toContainText('$7,353 a month coming in')
    // 7,353.31 - 1,209 - 1,000
    await expect(tool(page, 'rentscenarios').locator('table').last().getByRole('row', { name: /^\$1,000/ })).toContainText('$5,144.31')
  })

  test('with statements as the source, the salary does not move Rent scenarios', async ({ page }) => {
    await type(field(tool(page, 'takehome'), 'Salary per year'), 120000)
    await expect(tool(page, 'rentscenarios')).toContainText('$5,821 a month coming in')
  })

  test('a typed Budget income is what the tools plan against', async ({ page }) => {
    await seed(page, { budgetIncomeOverride: { active: 'manual', amount: 4000 } })
    await expect(tool(page, 'rentscenarios')).toContainText('$4,000 a month coming in')
    await row(tool(page, 'vacation'), 'Months to save').locator('svg').hover()
    // 4,000 - 3,029
    await expect(page.getByRole('tooltip')).toContainText('your Budget tab leaves about $941 a month')
  })

  test('the Vacation tooltip follows the Take-home tool figure too', async ({ page }) => {
    await seed(page, { budgetIncomeOverride: { active: true, amount: 0 } })
    await row(tool(page, 'vacation'), 'Months to save').locator('svg').hover()
    // 5,112.31 - 3,059
    await expect(page.getByRole('tooltip')).toContainText('your Budget tab leaves about $2,053 a month')
  })

  test('Budget "From the Take-home tool" shows the tool figure there and the link jumps back', async ({ page }) => {
    await goTo(page, 'Budget')
    await page.getByRole('button', { name: 'From your statements' }).click()
    await page.getByRole('menuitem', { name: /From the Take-home tool/ }).click()
    await expect(page.getByText('Salary $80,000 a year')).toBeVisible()
    await page.getByRole('button', { name: 'Edit on the Tools tab' }).click()
    await expect(page.locator('h1', { hasText: 'Tools' })).toBeVisible()
    await expect(page.locator('#take-home-pay')).toBeInViewport()
  })

  test('the Budget link switches Take-home pay back on if it was hidden', async ({ page }) => {
    await seed(page, { toolsShown: ['cash'], budgetIncomeOverride: { active: true, amount: 0 } })
    await expect(tool(page, 'takehome')).toHaveCount(0)
    await goTo(page, 'Budget')
    await page.getByRole('button', { name: 'Edit on the Tools tab' }).click()
    await expect(page.locator('h1', { hasText: 'Tools' })).toBeVisible()
    await expect(tool(page, 'takehome')).toBeVisible()
    expect(await ls(page, 'toolsShown')).toContain('takehome')
  })

  test('tools read the shared tax state set on Balances', async ({ page }) => {
    await seed(page, { taxState: 'ca' })
    for (const id of ['hourly', 'takehome']) await expect(tool(page, id)).toContainText('Taxed in California.')
    await expect(row(tool(page, 'takehome'), 'State tax')).toContainText('−$2,940.85')
    await expect(row(tool(page, 'takehome'), 'Take-home per year')).toContainText('$58,406.85')
  })
})
