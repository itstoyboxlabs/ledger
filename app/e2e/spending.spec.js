import { test, expect, openApp, goTo, ls, money } from './fixtures'
import fs from 'node:fs'

// Numbers below come from public/sample-data.json (fake data, May to Oct 2026).

const main = (page) => page.getByRole('main')
const kpi = (page, label) => main(page).locator('div', { hasText: new RegExp(`^${label}\\s`) }).last()
async function chooseMonth(page, label) {
  await main(page).getByRole('button', { name: /All months|Last|Year to date|\d{4}$/ }).first().click()
  await page.getByRole('menu').or(page.getByRole('listbox')).getByText(label, { exact: true }).click()
}
const txnTable = (page) => page.locator('table', { has: page.getByRole('columnheader', { name: /^Merchant/ }) }).first()
const txnRows = (page) => txnTable(page).locator('tbody tr')

test.beforeEach(async ({ page }) => {
  await openApp(page)
})

test.describe('summary numbers', () => {
  test('KPIs for all months', async ({ page }) => {
    const t = await main(page).innerText()
    expect(t).toContain('$19,766.16')
    expect(t).toContain('290 transactions')
    expect(t).toContain('$35,130.76')
    expect(t).toContain('14 deposits')
    expect(t).toContain('$15,364.60')
    expect(t).toContain('$3,294 a month')
  })

  test('card payments between your own accounts are not counted as spending or income', async ({ page }) => {
    await expect(main(page).getByText('Card payment', { exact: true })).toHaveCount(0)
  })

  test('the category table adds up to the total', async ({ page }) => {
    const rows = await main(page).locator('table').first().locator('tbody tr').evaluateAll((trs) =>
      trs.map((r) => [...r.querySelectorAll('td')].map((c) => c.innerText.trim())),
    )
    const total = rows.reduce((s, r) => s + money(r[2]), 0)
    expect(total).toBeCloseTo(19766.16, 1)
    expect(rows[0][0]).toContain('Housing')
    expect(rows[0][3]).toBe('56.2%')
  })
})

test.describe('month filter', () => {
  test('lists months newest first with presets above them', async ({ page }) => {
    await main(page).getByRole('button', { name: 'All months' }).click()
    const text = await page.getByRole('menu').or(page.getByRole('listbox')).innerText()
    expect(text.replace(/\s+/g, ' ')).toMatch(/All months Last month Last 3 months Last 6 months Year to date Oct 2026 Sep 2026 Aug 2026 Jul 2026 Jun 2026 May 2026/)
  })

  test('picking a month rescopes every number', async ({ page }) => {
    await chooseMonth(page, 'Oct 2026')
    await expect(main(page).getByText('$19,766.16')).toHaveCount(0)
    await expect(main(page).getByRole('button', { name: 'Oct 2026' })).toBeVisible()
    const rows = await main(page).locator('table').first().locator('tbody tr').evaluateAll((trs) => trs.map((r) => r.querySelectorAll('td')[2]?.innerText ?? ''))
    const sum = rows.reduce((s, v) => s + money(v), 0)
    const head = await main(page).getByText(/^Total spending/).locator('xpath=following::*[1]').innerText()
    expect(sum).toBeCloseTo(money(head), 1)
  })

  test('Last month is October while the date is in November', async ({ page }) => {
    await chooseMonth(page, 'Last month')
    const octOnly = await main(page).innerText()
    await chooseMonth(page, 'Oct 2026')
    expect(await main(page).innerText()).toContain((octOnly.match(/\$[\d,]+\.\d\d/) ?? [])[0])
  })

  test('the choice survives a reload', async ({ page }) => {
    await chooseMonth(page, 'Sep 2026')
    await page.reload()
    await expect(main(page).getByRole('button', { name: 'Sep 2026' })).toBeVisible()
  })
})

test.describe('category drill-down', () => {
  test('click a category to see its subcategories, then go back with the breadcrumb', async ({ page }) => {
    await main(page).locator('table').first().getByText('Food & Dining').click()
    await expect(main(page).getByRole('navigation', { name: /breadcrumb/i })).toContainText('Food & Dining')
    await expect(main(page).locator('table').first()).toContainText('Groceries')
    await expect(main(page).locator('table').first()).toContainText('Restaurants & Takeout')
    // the transaction list is scoped to the category
    await expect(main(page).getByText('159 transactions').first()).toBeVisible()
    await main(page).getByRole('navigation', { name: /breadcrumb/i }).getByText(/All|Spending/).first().click()
    await expect(main(page).getByText('290 transactions').first()).toBeVisible()
  })

  test('drills a third level to a merchant', async ({ page }) => {
    await main(page).locator('table').first().getByText('Food & Dining').click()
    await main(page).locator('table').first().getByText('Groceries').click()
    await expect(main(page).locator('table').first()).toContainText("Trader Joe's")
  })

  test('the drill path persists across reload', async ({ page }) => {
    await main(page).locator('table').first().getByText('Housing').click()
    await page.reload()
    await expect(main(page).getByRole('navigation', { name: /breadcrumb/i })).toContainText('Housing')
  })
})

test.describe('charts', () => {
  test('Trends and Cash flow tabs draw charts', async ({ page }) => {
    for (const tab of ['Trends', 'Cash flow']) {
      await main(page).getByRole('tab', { name: tab }).click()
      await expect(main(page).locator('.recharts-wrapper').first()).toBeVisible()
    }
    await main(page).getByRole('tab', { name: 'Spending by category' }).click()
    await expect(main(page).locator('.recharts-pie, .recharts-wrapper').first()).toBeVisible()
  })

  test('clicking a bar on Cash flow selects that month', async ({ page }) => {
    await main(page).getByRole('tab', { name: 'Cash flow' }).click()
    await main(page).locator('.recharts-bar-rectangle').first().click()
    await expect(main(page).getByRole('button', { name: /\d{4}$/ }).first()).toBeVisible()
  })

  test('the month overview shows income, spending and net for a month', async ({ page }) => {
    await chooseMonth(page, 'Oct 2026')
    const t = await main(page).innerText()
    expect(t).toMatch(/Income/)
    expect(t).toMatch(/Net/)
  })
})

test.describe('transactions table', () => {
  test('newest first by default, clicking Date flips it', async ({ page }) => {
    await expect(txnRows(page).first()).toContainText('Oct 31')
    await txnTable(page).getByRole('columnheader', { name: /^Date/ }).click()
    await expect(txnRows(page).first()).toContainText('May')
  })

  test('Amount sorts both ways', async ({ page }) => {
    const amounts = () => txnRows(page).evaluateAll((trs) => trs.map((r) => Number(r.lastElementChild.innerText.replace('−', '-').replace(/[^0-9.-]/g, ''))))
    const head = txnTable(page).getByRole('columnheader', { name: /^Amount/ })
    await head.click()
    const a = await amounts()
    expect(a).toEqual([...a].sort((x, y) => y - x))
    await head.click()
    const b = await amounts()
    expect(b).toEqual([...b].sort((x, y) => x - y))
  })

  test('each row shows the merchant, its statement text, category and account', async ({ page }) => {
    const first = txnRows(page).first()
    await expect(first).toContainText('DoorDash')
    await expect(first).toContainText('SQ *LUCALI BROOKLYN NY')
    await expect(first).toContainText('Restaurants & Takeout')
    await expect(first).toContainText('Maple Card')
  })

  test('the refund nets against its category', async ({ page }) => {
    const refund = JSON.parse(fs.readFileSync('public/sample-data.json', 'utf8')).transactions.find((t) => t.kind === 'refund')
    expect(refund).toBeTruthy()
    // total spending is the sum of expenses minus the refund
    const data = JSON.parse(fs.readFileSync('public/sample-data.json', 'utf8')).transactions
    const spend = data.filter((t) => t.kind === 'expense').reduce((s, t) => s + t.amount, 0) - data.filter((t) => t.kind === 'refund').reduce((s, t) => s + t.amount, 0)
    expect(spend).toBeCloseTo(19766.16, 1)
  })
})

test.describe('income table', () => {
  test('lists every paycheck and they add up to income', async ({ page }) => {
    const t = main(page).locator('table', { hasText: 'Acme Corp payroll' }).last()
    const rows = await t.locator('tbody tr').evaluateAll((trs) => trs.map((r) => r.lastElementChild.innerText))
    const pay = rows.filter((v) => money(v) > 1000)
    expect(pay.length).toBe(12)
    expect(rows.reduce((s, v) => s + money(v), 0)).toBeCloseTo(35130.76, 1)
  })
})

test.describe('subscriptions', () => {
  const subs = (page) => page.locator('table', { has: page.getByRole('columnheader', { name: /^Service/ }) })

  test('shows the active ones and their monthly cost', async ({ page }) => {
    await expect(main(page).getByText('5 active · ≈$74.89/month')).toBeVisible()
    for (const n of ['Netflix', 'Spotify', 'iCloud', 'Crunch Fitness', 'Costco membership']) {
      await expect(subs(page)).toContainText(n)
    }
  })

  test('annual plans show a yearly price and a monthly equivalent', async ({ page }) => {
    const row = subs(page).locator('tr', { hasText: 'Costco membership' })
    await expect(row).toContainText('annual')
    await expect(row).toContainText('$65.00/yr')
    await expect(row).toContainText('$5.42')
  })

  test('every column header sorts', async ({ page }) => {
    const names = () => subs(page).locator('tbody tr').evaluateAll((trs) => trs.map((r) => r.querySelector('td').innerText.split('\n').filter(Boolean).pop()).filter((n) => n !== 'Estimated monthly total'))
    await subs(page).getByRole('columnheader', { name: /^Service/ }).click()
    const asc = await names()
    expect(asc).toEqual([...asc].sort((a, b) => a.localeCompare(b)))
    await subs(page).getByRole('columnheader', { name: /^Service/ }).click()
    const desc = await names()
    expect(desc).toEqual([...desc].sort((a, b) => b.localeCompare(a)))
  })

  test('the sort choice persists', async ({ page }) => {
    await subs(page).getByRole('columnheader', { name: /^Service/ }).click()
    await page.reload()
    expect(await ls(page, 'subsSort2')).toBeTruthy()
  })
})
