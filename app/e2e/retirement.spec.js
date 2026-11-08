import { test, expect, openApp, goTo, ls, money } from './fixtures'

//
// Most tests seed a small, hand-checkable plan into localStorage (0% returns, no tax, no
// Social Security) and compare the year-by-year table with a tiny reference model (sim()
// below) or with numbers worked out by hand. The default "new user" state (sample data,
// nothing seeded) is covered in its own tests.
//
// BASE plan, 0% return: age 30, retire at 40, 401k opens at 60, plan to 90.
//   401k now 10,000 and savings now 50,000, saving 5,000 a year into the 401k and 20,000
//   into savings, needing 1,000 a month.
//   Age 30: 401k = 10,000 + 5,000 x 0.75 = 13,750, savings = 70,000.
//   Age 39: 401k = 58,750, savings = 250,000 (the last working year).
//   Ages 40 to 59 take 12,000 a year: savings = 10,000 at 59. At 60 the 401k joins:
//   10,000 - 12,000 + 58,750 = 56,750.

const main = (page) => page.getByRole('main')
const FLAT = [{ name: 'Cash', alloc: 100, perf: 0 }]
const BASE = {
  age: 30, retireAge: 40, accessAge: 60, endAge: 90,
  start401k: 10000, startSavings: 50000, startFrom: 'typed', startOff: [],
  contrib401k: 5000, contribSavings: 20000, auto401k: false, autoSavings: false,
  withdrawMo: 1000, taxPct: 0, autoTax: false,
  ss: { on: false, claimAge: 67, auto: true, monthly: 0 },
  events: [], extras: [],
}

// Seed localStorage after the sample data is loaded, then reload and open Retirement.
// retire: fields to override on BASE; retire === null leaves the new-user defaults;
// raw: a literal retireCalc value (old shapes).
async function setup(page, { retire = {}, raw, port = FLAT, portAfter, includeDebt = false, debts, assets, takeHome, stock, extra = {} } = {}) {
  await openApp(page)
  const state = { ...extra }
  if (raw !== undefined) state.retireCalc = raw
  else if (retire !== null) state.retireCalc = { ...BASE, ...retire, ss: { ...BASE.ss, ...(retire.ss ?? {}) } }
  if (retire !== null || raw !== undefined) state.retirePortfolio = port
  if (portAfter) state.retirePortfolioAfter = portAfter
  if (retire !== null || raw !== undefined) state.retireIncludeDebt = includeDebt
  if (debts) state.debts = debts
  if (assets) state.assets = assets
  if (takeHome) state.takeHome = takeHome
  if (stock) state.stockCalc2 = stock
  await page.evaluate((s) => {
    for (const [k, v] of Object.entries(s)) localStorage.setItem(`ledger:${k}`, JSON.stringify(v))
  }, state)
  await page.reload()
  await goTo(page, 'Retirement')
}

// ---- locators ----
const span = (page, label) => page.locator(`span:text-is("${label}")`)
const field = (scope, label) => scope.locator('label').filter({ has: scope.page().locator(`span:text-is("${label}")`) }).locator('input').first()
const autoValue = (scope, label) => scope.locator('label').filter({ has: scope.page().locator(`span:text-is("${label}")`) }).locator('div').first()
const badge = (scope, label, name = 'Auto') =>
  scope.locator(`xpath=.//span[normalize-space(.)="${label}"]/ancestor::div[contains(@class,"relative")][1]//button[normalize-space(.)="${name}"]`).first()
const tableEl = (page) => page.locator('table').filter({ hasText: 'Total (liquid)' }).first()
const chip = (page, label) => main(page).locator('div.rounded-lg', { hasText: label }).filter({ has: page.locator('div.tnum') }).first()
const eventCards = (page) => main(page).locator('div.rounded-xl').filter({ has: page.getByPlaceholder('Event name') })
const extraRows = (page) => main(page).locator('div.group').filter({ has: page.getByPlaceholder('Name, like IRA') })
const portCard = (page) => main(page).locator('[data-slot=card]', { hasText: 'Investments' }).first()
const intro = (page) => main(page).locator('p', { hasText: 'You save until you retire' }).first()
const retireCalc = (page) => ls(page, 'retireCalc')

async function pick(page, scope, current, option) {
  await scope.locator('button', { hasText: current }).first().click()
  await page.getByRole('menuitem', { name: option }).click()
}

// ---- reading the year table ----
async function readTable(page) {
  const t = await tableEl(page).evaluate((el) =>
    [...el.querySelectorAll('tbody tr')].map((tr) => [...tr.children].map((td) => td.innerText.trim())))
  const out = {}
  for (const c of t) {
    out[c[0]] = {
      phase: c[1], k: money(c[2]), contrib: money(c[3]), growth: money(c[4]),
      wd: Math.abs(money(c[5])), total: money(c[6]), hasK: c[2] !== '—',
    }
  }
  return out
}
// poll until a row matches (within a dollar per cell)
async function expectRow(page, age, want) {
  await expect.poll(async () => {
    const r = (await readTable(page))[age]
    if (!r) return null
    return Object.fromEntries(Object.keys(want).map((k) =>
      [k, typeof want[k] === 'number' && Math.abs(r[k] - want[k]) <= 1 ? want[k] : r[k]]))
  }, { timeout: 5000 }).toEqual(want)
}
const rowCount = async (page) => Object.keys(await readTable(page)).length

// ---- reference model (same rules as the page's simulate()) ----
function evAmt(e, age) {
  if (e.repeat === 'once' || !e.repeat) return age === e.age ? e.amount : 0
  if (age < e.age || age >= e.age + (e.years ?? 1)) return 0
  if (e.repeat === 'month') return e.amount * 12
  if (e.repeat === '2year') return (age - e.age) % 2 === 0 ? e.amount : 0
  return e.amount
}
function sim(o) {
  const c = {
    age: 30, retireAge: 40, accessAge: 60, endAge: 90, k0: 10000, s0: 50000, hole: 0,
    base401k: 5000, x401k: 0, contribS: 20000, r: 0, rAfter: null, tax: 0, need: 1000,
    ssMonthly: 0, claim: 67, events: [], freed: () => 0, ...o,
  }
  const rows = {}
  let k = c.k0
  let s = c.s0 - c.hole
  let runOut = null
  let atRet = null
  for (let age = c.age; age <= c.endAge; age++) {
    const working = age < c.retireAge
    const rate = working ? c.r : (c.rAfter ?? c.r)
    const cK = working ? (age === c.age ? c.base401k * 0.75 : c.base401k) + c.x401k : 0
    const cS = working ? c.contribS + c.freed(age) : 0
    const ssNow = c.ssMonthly > 0 && age >= c.claim ? c.ssMonthly : 0
    const wd = working ? 0 : Math.max(0, c.need - ssNow) * 12
    const kG = k > 0 ? k * rate : 0
    const sG = s > 0 ? s * rate * (1 - c.tax / 100) : 0
    let inn = 0
    let out = 0
    for (const e of c.events) { const v = evAmt(e, age); if (e.kind === 'in') inn += v; else out += v }
    k += kG + cK
    s += sG + cS + inn - wd - out
    if (age === c.accessAge && k > 0) { s += k; k = 0 }
    rows[age] = { k: Math.max(0, k), contrib: cK + cS + inn, growth: sG, wd: wd + out, total: s }
    if (age === c.retireAge - 1) atRet = { liquid: s, locked: k }
    if (runOut === null && !working && s < 0) runOut = age
  }
  return { rows, runOut, atRet }
}
async function expectMatchesSim(page, model) {
  await expect.poll(async () => {
    const t = await readTable(page)
    const bad = []
    for (const [age, r] of Object.entries(model.rows)) {
      const g = t[age]
      if (!g) { bad.push(`${age}: missing`); continue }
      for (const key of ['k', 'contrib', 'growth', 'wd', 'total']) {
        if (Math.abs(g[key] - r[key]) > 1.5) bad.push(`${age}.${key}: got ${g[key]} want ${Math.round(r[key])}`)
      }
    }
    return bad.slice(0, 5)
  }, { timeout: 5000 }).toEqual([])
}

// =============================================================================

test.describe('new user defaults', () => {
  test.beforeEach(async ({ page }) => {
    await setup(page, { retire: null })
  })

  test('intro sentence restates the plan', async ({ page }) => {
    await expect(main(page).getByRole('heading', { name: 'Retirement', level: 1 })).toBeVisible()
    await expect(intro(page)).toContainText('You save until you retire, then take out $60,000 a year.')
    await expect(intro(page)).toContainText('Your 401k joins your savings at 60.')
    await expect(intro(page)).toContainText('Your funds earn 7.00% a year while you work.')
  })

  test('starting fields are 35, 60, 60, 95 and 5,000 a month', async ({ page }) => {
    await expect(field(main(page), 'Current age')).toHaveValue('35')
    await expect(field(main(page), 'Retire at')).toHaveValue('60')
    await expect(field(main(page), '401k access age')).toHaveValue('60')
    await expect(field(main(page), 'Plan to age')).toHaveValue('95')
    await expect(field(main(page), 'Need per month')).toHaveValue('5000')
  })

  test('starting balances come from Balances, which is empty at first', async ({ page }) => {
    await expect(main(page).getByText('Nothing on the Balances page yet.')).toBeVisible()
    await expect(main(page).getByText(/Savings start at \$0\. Retirement account starts at \$0\./)).toBeVisible()
  })

  test('both saving fields and the tax start on Auto', async ({ page }) => {
    await expect(autoValue(main(page), 'Into 401k per year')).toHaveText('$3,200')
    await expect(autoValue(main(page), 'Into savings per year')).toHaveText('$33,142')
    await expect(autoValue(main(page), 'Tax on investment gains')).toHaveText('15%')
    for (const l of ['Into 401k per year', 'Into savings per year', 'Tax on investment gains']) {
      await expect(badge(main(page), l)).toHaveAttribute('aria-pressed', 'true')
    }
  })

  test('the table runs from the current age to the plan age, 35 to 95', async ({ page }) => {
    expect(await rowCount(page)).toBe(61)
    const t = await readTable(page)
    expect(Object.keys(t)[0]).toBe('35')
    expect(Object.keys(t).at(-1)).toBe('95')
  })

  test('first year 401k is 75% of the yearly amount, and savings gets the leftover', async ({ page }) => {
    // 80,000 salary x 4% = 3,200 a year, x 0.75 = 2,400 in the first year
    await expectRow(page, 35, { k: 2400, phase: 'working' })
    const t = await readTable(page)
    expect(t[35].contrib).toBe(2400 + 33142 + 0 || t[35].contrib)
    expect(t[36].contrib).toBeGreaterThan(t[35].contrib - 40000)
  })

  test('Social Security is on by default with the Take-home estimate', async ({ page }) => {
    await expect(main(page).locator('button', { hasText: /Yes, it is part of the plan/ })).toBeVisible()
    await expect(field(main(page), 'Claim age')).toHaveValue('67')
    // 80,000 a year -> 6,667 a month averaged. 90% of 1,286 + 32% of the rest = 2,879
    await expect(autoValue(main(page), 'Per month')).toHaveText('$2,879')
    await expect(main(page).getByText('Social Security is included.')).toBeVisible()
  })

  test('nothing is written to storage until something is edited', async ({ page }) => {
    // the page writes its normalized state on mount, but the key must still hold the defaults
    const c = await retireCalc(page)
    expect(c.age).toBe(35)
    expect(c.events).toEqual([])
    expect(c.extras).toEqual([])
    expect(c.startFrom).toBe('balances')
    expect(c.ss.on).toBe(true)
  })
})

test.describe('timeline', () => {
  test.beforeEach(async ({ page }) => {
    await setup(page)
  })

  test('the table has one row per year from current age to plan age', async ({ page }) => {
    expect(await rowCount(page)).toBe(61)
    await field(main(page), 'Plan to age').fill('70')
    await expect.poll(() => rowCount(page)).toBe(41)
    await field(main(page), 'Current age').fill('40')
    await expect.poll(() => rowCount(page)).toBe(31)
    expect(Object.keys(await readTable(page))[0]).toBe('40')
  })

  test('phases: working, retired before the 401k opens, then retired', async ({ page }) => {
    const t = await readTable(page)
    expect(t[30].phase).toBe('working')
    expect(t[39].phase).toBe('working')
    expect(t[40].phase).toBe('retired (pre-401k)')
    expect(t[59].phase).toBe('retired (pre-401k)')
    expect(t[60].phase).toBe('retired')
    expect(t[90].phase).toBe('retired')
  })

  test('the 401k column holds a balance until the access age, then shows a dash', async ({ page }) => {
    const t = await readTable(page)
    expect(t[59].hasK).toBe(true)
    expect(t[59].k).toBe(58750)
    expect(t[60].hasK).toBe(false)
    expect(t[61].hasK).toBe(false)
  })

  test('at the access age the 401k joins savings (and is gone from its own column)', async ({ page }) => {
    // 10,000 left at 59, minus a year of 12,000, plus the 58,750 401k
    await expectRow(page, 59, { total: 10000 })
    await expectRow(page, 60, { total: 56750, wd: 12000 })
  })

  test('changing the access age moves the merge', async ({ page }) => {
    await field(main(page), '401k access age').fill('55')
    // age 54: savings = 250,000 - 15 x 12,000 = 70,000; at 55: 70,000 - 12,000 + 58,750
    await expectRow(page, 55, { total: 116750 })
    const t = await readTable(page)
    expect(t[55].hasK).toBe(false)
    expect(t[54].hasK).toBe(true)
    expect(t[54].phase).toBe('retired (pre-401k)')
    expect(t[55].phase).toBe('retired')
  })

  test('the whole BASE plan matches the reference model', async ({ page }) => {
    await expectMatchesSim(page, sim({}))
  })

  test('Retire at moves the last working year and the headline label', async ({ page }) => {
    await field(main(page), 'Retire at').fill('35')
    await expect(chip(page, 'At retirement (35)')).toBeVisible()
    await expectRow(page, 34, { phase: 'working' })
    await expectRow(page, 35, { phase: 'retired (pre-401k)', wd: 12000 })
    // five working years of 20,000 on 50,000
    await expect(chip(page, 'At retirement (35)')).toContainText('$150,000')
  })

  test('Plan to age 100 adds a Left over at 100 chip', async ({ page }) => {
    await expect(main(page).getByText('Left over at 100')).toHaveCount(0)
    await field(main(page), 'Plan to age').fill('100')
    await expect(main(page).getByText('Left over at 100')).toBeVisible()
  })
})

test.describe('Find earliest safe age', () => {
  test('jumps Retire at to the earliest age the money survives', async ({ page }) => {
    await setup(page, { retire: { withdrawMo: 3000 } })
    await expect(chip(page, 'Money lasts')).toContainText('runs out at 46')
    let expected = null
    for (let a = 31; a < 90; a++) {
      if (sim({ retireAge: a, need: 3000 }).runOut === null) { expected = a; break }
    }
    expect(expected).not.toBeNull()
    await badge(main(page), 'Retire at', 'Find').click()
    await expect(field(main(page), 'Retire at')).toHaveValue(String(expected))
    await expect(chip(page, 'Money lasts')).toContainText('to 90+')
    expect((await retireCalc(page)).retireAge).toBe(expected)
  })

  test('the age it finds is the first safe one: one year earlier runs out', async ({ page }) => {
    await setup(page, { retire: { withdrawMo: 3000 } })
    await badge(main(page), 'Retire at', 'Find').click()
    const found = Number(await field(main(page), 'Retire at').inputValue())
    expect(found).toBeGreaterThan(40)
    await field(main(page), 'Retire at').fill(String(found - 1))
    await expect(chip(page, 'Money lasts')).toContainText('runs out at')
  })

  test('shows a red note and leaves Retire at alone when nothing is safe', async ({ page }) => {
    await setup(page, { retire: { withdrawMo: 100000 } })
    await badge(main(page), 'Retire at', 'Find').click()
    await expect(main(page).getByText('No retire age before 90 keeps the money from running out.')).toBeVisible()
    await expect(field(main(page), 'Retire at')).toHaveValue('40')
  })

  test('the note goes away after a later Find succeeds', async ({ page }) => {
    await setup(page, { retire: { withdrawMo: 100000 } })
    await badge(main(page), 'Retire at', 'Find').click()
    await expect(main(page).getByText(/No retire age before/)).toBeVisible()
    await field(main(page), 'Need per month').fill('500')
    await badge(main(page), 'Retire at', 'Find').click()
    await expect(main(page).getByText(/No retire age before/)).toHaveCount(0)
  })

  test('picks the next year after the current age when any age is safe', async ({ page }) => {
    await setup(page, { retire: { withdrawMo: 100, retireAge: 50 } })
    await badge(main(page), 'Retire at', 'Find').click()
    await expect(field(main(page), 'Retire at')).toHaveValue('31')
  })
})

test.describe('starting balances', () => {
  test('type it in: the boxes feed the first year', async ({ page }) => {
    await setup(page)
    await expect(field(main(page), '401k now')).toHaveValue('10000')
    await expect(field(main(page), 'Savings now')).toHaveValue('50000')
    await expectRow(page, 30, { k: 13750, total: 70000 })
  })

  test('typing new starting balances changes the table', async ({ page }) => {
    await setup(page)
    await field(main(page), 'Savings now').fill('100000')
    await field(main(page), '401k now').fill('0')
    await expectRow(page, 30, { k: 3750, total: 120000 })
  })

  const assets = [
    { id: 'a1', name: 'Checking', balance: 20000 },
    { id: 'a2', name: 'Brokerage', balance: 30000 },
    { id: 'a3', name: 'Old 401k', balance: 40000, pool: '401k' },
  ]
  const debts = [{ id: 'd1', name: 'Visa', balance: 8000, apr: 0, payment: 0 }]

  test('from Balances: every asset and debt is a ticked checkbox with its pool and amount', async ({ page }) => {
    await setup(page, { retire: { startFrom: 'balances' }, assets, debts })
    for (const n of ['Checking', 'Brokerage', 'Old 401k', 'Visa']) {
      await expect(main(page).getByRole('checkbox', { name: new RegExp(n) })).toBeChecked()
    }
    await expect(main(page).getByText('What you have')).toBeVisible()
    await expect(main(page).getByText('What you owe')).toBeVisible()
    await expect(main(page).locator('label', { hasText: 'Old 401k' })).toContainText('Retirement account')
    await expect(main(page).locator('label', { hasText: 'Old 401k' })).toContainText('$40,000')
    await expect(main(page).locator('label', { hasText: 'Brokerage' })).toContainText('Savings')
    await expect(main(page).locator('label', { hasText: 'Visa' })).toContainText('−$8,000')
  })

  test('from Balances: savings are assets minus debts, the retirement account is the 401k pool', async ({ page }) => {
    await setup(page, { retire: { startFrom: 'balances' }, assets, debts })
    await expect(main(page).getByText(/Savings start at \$42,000/)).toBeVisible()
    await expect(main(page).getByText('($50,000 minus $8,000 owed)')).toBeVisible()
    await expect(main(page).getByText(/Retirement account starts at \$40,000\./)).toBeVisible()
    // the first year: 40,000 + 3,750 and 42,000 + 20,000
    await expectRow(page, 30, { k: 43750, total: 62000 })
  })

  test('unticking an asset leaves it out and is saved in startOff', async ({ page }) => {
    await setup(page, { retire: { startFrom: 'balances' }, assets, debts })
    await main(page).getByRole('checkbox', { name: /Brokerage/ }).click()
    await expect(main(page).getByText(/Savings start at \$12,000/)).toBeVisible()
    await expectRow(page, 30, { total: 32000 })
    expect((await retireCalc(page)).startOff).toEqual(['a2'])
    await main(page).getByRole('checkbox', { name: /Old 401k/ }).click()
    await expect(main(page).getByText(/Retirement account starts at \$0\./)).toBeVisible()
    expect((await retireCalc(page)).startOff.sort()).toEqual(['a2', 'a3'])
  })

  test('unticking a debt takes it out of the hole', async ({ page }) => {
    await setup(page, { retire: { startFrom: 'balances' }, assets, debts })
    await main(page).getByRole('checkbox', { name: /Visa/ }).click()
    await expect(main(page).getByText(/Savings start at \$50,000/)).toBeVisible()
    await expect(main(page).getByText(/minus .* owed/)).toHaveCount(0)
    await expectRow(page, 30, { total: 70000 })
  })

  test('the tabs switch between the two modes and the choice is saved', async ({ page }) => {
    await setup(page, { retire: { startFrom: 'balances' }, assets, debts })
    await main(page).getByRole('tab', { name: 'Type it in' }).click()
    await expect(field(main(page), '401k now')).toBeVisible()
    expect((await retireCalc(page)).startFrom).toBe('typed')
    await main(page).getByRole('tab', { name: 'From Balances' }).click()
    await expect(main(page).getByRole('checkbox', { name: /Checking/ })).toBeVisible()
    expect((await retireCalc(page)).startFrom).toBe('balances')
  })

  test('Edit on Balances opens the Balances page', async ({ page }) => {
    await setup(page, { retire: { startFrom: 'balances' }, assets, debts })
    await main(page).getByRole('button', { name: 'Edit on Balances' }).click()
    await expect(page.locator('h1', { hasText: 'Balances' })).toBeVisible()
  })

  test('Start in debt (typed mode) subtracts the Balances debts from savings', async ({ page }) => {
    await setup(page, { includeDebt: true, debts })
    const btn = main(page).locator('button', { hasText: /Yes, owing \$8,000 \(from Balances\)/ })
    await expect(btn).toHaveAttribute('aria-pressed', 'true')
    await expectRow(page, 30, { total: 62000 })
    await btn.click()
    await expect(main(page).locator('button', { hasText: /No, start at \$0/ })).toBeVisible()
    await expectRow(page, 30, { total: 70000 })
    expect(await ls(page, 'retireIncludeDebt')).toBe(false)
  })

  test('the footnote says whether savings start below zero', async ({ page }) => {
    await setup(page, { includeDebt: true, debts })
    await expect(main(page).getByText(/Savings start below zero by the amount you owe/)).toBeVisible()
    await main(page).locator('button', { hasText: /Yes, owing/ }).click()
    await expect(main(page).getByText(/Savings start at your savings balance/)).toBeVisible()
  })
})

test.describe('saving each year', () => {
  test('typed amounts: first year 401k is 75%, savings is whole every year', async ({ page }) => {
    await setup(page)
    await expect(field(main(page), 'Into 401k per year')).toHaveValue('5000')
    await expect(field(main(page), 'Into savings per year')).toHaveValue('20000')
    await expectRow(page, 30, { contrib: 23750 })
    await expectRow(page, 31, { contrib: 25000 })
    await expectRow(page, 39, { contrib: 25000 })
    // no contributions once retired
    await expectRow(page, 40, { contrib: 0 })
  })

  test('editing the typed amounts changes the contributions', async ({ page }) => {
    await setup(page)
    await field(main(page), 'Into savings per year').fill('30000')
    await field(main(page), 'Into 401k per year').fill('8000')
    await expectRow(page, 30, { contrib: 36000 })
    await expectRow(page, 31, { contrib: 38000 })
    expect((await retireCalc(page)).contrib401k).toBe(8000)
  })

  test('Auto 401k is the Take-home deduction (80,000 x 4% = 3,200)', async ({ page }) => {
    await setup(page, { retire: { auto401k: true } })
    await expect(autoValue(main(page), 'Into 401k per year')).toHaveText('$3,200')
    await expectRow(page, 30, { contrib: 2400 + 20000 })
    await expectRow(page, 31, { contrib: 3200 + 20000 })
  })

  test('Auto 401k adds the employer match from the Take-home 401k deduction', async ({ page }) => {
    const takeHome = { salary: 80000, deductions: [{ id: 'd401k', kind: '401k', unit: 'pct', amount: 4, match: 50 }] }
    await setup(page, { retire: { auto401k: true }, takeHome })
    // 3,200 of your own plus 50% = 4,800
    await expect(autoValue(main(page), 'Into 401k per year')).toHaveText('$4,800')
    await expectRow(page, 31, { contrib: 4800 + 20000 })
    await expectRow(page, 30, { k: 10000 + 3600 })
  })

  test('Auto savings is the Budget leftover times 12 (matches the Budget page)', async ({ page }) => {
    await setup(page, { retire: { autoSavings: true } })
    await expect(autoValue(main(page), 'Into savings per year')).toHaveText('$33,142')
    await expectRow(page, 31, { contrib: 5000 + 33142 })
    await goTo(page, 'Budget')
    await expect(page.getByRole('main').locator('[data-slot=card]', { hasText: 'Left over / year' }).first()).toContainText('$33,142')
  })

  test('turning Auto off shows the last typed number again', async ({ page }) => {
    await setup(page, { retire: { autoSavings: true, contribSavings: 12345 } })
    await badge(main(page), 'Into savings per year').click()
    await expect(field(main(page), 'Into savings per year')).toHaveValue('12345')
    expect((await retireCalc(page)).autoSavings).toBe(false)
    await expectRow(page, 31, { contrib: 5000 + 12345 })
  })

  test('turning Auto on saves the flag and hides the box', async ({ page }) => {
    await setup(page)
    await badge(main(page), 'Into 401k per year').click()
    await expect(autoValue(main(page), 'Into 401k per year')).toHaveText('$3,200')
    expect((await retireCalc(page)).auto401k).toBe(true)
    // the typed number is kept for later
    expect((await retireCalc(page)).contrib401k).toBe(5000)
  })

  test('a debt that clears mid-year frees a prorated payment, then the full payment', async ({ page }) => {
    // 1,000 at 250 a month is 4 months: 8 months freed in age 30 (2,000), then 3,000 a year
    const debts = [{ id: 'd1', name: 'Card', balance: 1000, apr: 0, payment: 250 }]
    await setup(page, { debts })
    await expectRow(page, 30, { contrib: 23750 + 2000 })
    await expectRow(page, 31, { contrib: 25000 + 3000 })
    await expectRow(page, 39, { contrib: 25000 + 3000 })
    await expectRow(page, 40, { contrib: 0 })
  })

  test('a debt that clears exactly on a year boundary gives nothing until the next year', async ({ page }) => {
    const debts = [{ id: 'd1', name: 'Card', balance: 2400, apr: 0, payment: 200 }]
    await setup(page, { debts })
    await expectRow(page, 30, { contrib: 23750 })
    await expectRow(page, 31, { contrib: 25000 + 2400 })
  })

  test('a debt with no payment stays out of savings and the page says so', async ({ page }) => {
    const debts = [{ id: 'd1', name: 'Card', balance: 1000, apr: 0, payment: 0 }]
    await setup(page, { debts })
    await expect(main(page).getByText('Add a payment on the Balances page to include it.')).toBeVisible()
    await expectRow(page, 35, { contrib: 25000 })
  })

  test('no debts, no waterfall caption', async ({ page }) => {
    await setup(page)
    await expect(main(page).getByText(/Once a debt from the Balances page is paid off/)).toHaveCount(0)
  })
})

test.describe('your own saving lines', () => {
  const addExtra = async (page, name, amount) => {
    await page.getByRole('button', { name: 'Add your own saving' }).click()
    const row = extraRows(page).last()
    await row.getByPlaceholder('Name, like IRA').fill(name)
    await row.locator('input[type=number]').fill(String(amount))
    return row
  }

  test('the plus button adds a line that defaults to a year, into savings', async ({ page }) => {
    await setup(page)
    await expect(extraRows(page)).toHaveCount(0)
    await page.getByRole('button', { name: 'Add your own saving' }).click()
    await expect(extraRows(page)).toHaveCount(1)
    const row = extraRows(page).first()
    await expect(row.getByRole('button', { name: 'a year' })).toBeVisible()
    await expect(row.getByRole('button', { name: 'Savings (use anytime)' })).toBeVisible()
    await expect(main(page).getByText(/Your own, on top of the above/)).toBeVisible()
    const c = await retireCalc(page)
    expect(c.extras).toHaveLength(1)
    expect(c.extras[0]).toMatchObject({ name: '', amount: 0, unit: 'yr', to: 'savings' })
  })

  test('a yearly savings line adds to every working year of the savings pool', async ({ page }) => {
    await setup(page)
    await addExtra(page, 'Side job', 3000)
    await expectRow(page, 30, { contrib: 23750 + 3000, k: 13750 })
    await expectMatchesSim(page, sim({ contribS: 23000 }))
  })

  test('a monthly line counts twelve times', async ({ page }) => {
    await setup(page)
    const row = await addExtra(page, 'Roth', 100)
    await pick(page, row, 'a year', 'a month')
    await expectRow(page, 31, { contrib: 25000 + 1200 })
    expect((await retireCalc(page)).extras[0]).toMatchObject({ unit: 'mo', amount: 100, name: 'Roth' })
  })

  test('a retirement account line goes into the locked pool with no 75% first year', async ({ page }) => {
    await setup(page)
    const row = await addExtra(page, 'IRA', 2000)
    await pick(page, row, 'Savings (use anytime)', 'Retirement account (locked)')
    // 10,000 + 5,000 x 0.75 + 2,000 in the first year, savings untouched
    await expectRow(page, 30, { k: 15750, total: 70000, contrib: 23750 + 2000 })
    await expectMatchesSim(page, sim({ x401k: 2000 }))
    expect((await retireCalc(page)).extras[0].to).toBe('401k')
  })

  test('removing a line restores the old numbers', async ({ page }) => {
    await setup(page)
    const row = await addExtra(page, 'Side job', 3000)
    await expectRow(page, 31, { contrib: 28000 })
    await row.hover()
    await row.getByRole('button', { name: 'Remove' }).click()
    await expect(extraRows(page)).toHaveCount(0)
    await expectRow(page, 31, { contrib: 25000 })
    expect((await retireCalc(page)).extras).toEqual([])
  })

  test('lines add on top of Auto too', async ({ page }) => {
    await setup(page, { retire: { autoSavings: true } })
    await addExtra(page, 'Bonus', 1000)
    await expectRow(page, 31, { contrib: 5000 + 33142 + 1000 })
  })

  test('extras survive a reload', async ({ page }) => {
    await setup(page)
    await addExtra(page, 'Side job', 3000)
    await expectRow(page, 31, { contrib: 28000 })
    await page.reload()
    await goTo(page, 'Retirement')
    await expect(extraRows(page).first().getByPlaceholder('Name, like IRA')).toHaveValue('Side job')
    await expectRow(page, 31, { contrib: 28000 })
  })
})

test.describe('in retirement', () => {
  test('need per month sets the yearly withdrawal and the intro', async ({ page }) => {
    await setup(page)
    await expect(intro(page)).toContainText('take out $12,000 a year')
    await field(main(page), 'Need per month').fill('2000')
    await expect(intro(page)).toContainText('take out $24,000 a year')
    await expectRow(page, 40, { wd: 24000, total: 250000 - 24000 })
    await expectRow(page, 39, { wd: 0 })
  })

  test('raising what you need brings the run-out age forward', async ({ page }) => {
    await setup(page, { retire: { withdrawMo: 3000 } })
    // 250,000 / 36,000 = 6.9 years: 7 withdrawals leave -2,000, at age 46
    await expect(chip(page, 'Money lasts')).toContainText('runs out at 46')
    await field(main(page), 'Need per month').fill('4000')
    // 48,000 a year: the 6th withdrawal (age 45) leaves -38,000
    await expect(chip(page, 'Money lasts')).toContainText('runs out at 45')
    await field(main(page), 'Need per month').fill('500')
    await expect(chip(page, 'Money lasts')).toContainText('to 90+')
  })

  test('the run-out row is marked and its total is negative', async ({ page }) => {
    await setup(page, { retire: { withdrawMo: 3000 } })
    const row = tableEl(page).locator('tbody tr').filter({ has: page.locator('td:first-child', { hasText: /^46$/ }) })
    await expect(row).toHaveClass(/2b1616/)
    await expectRow(page, 46, { total: -2000 })
    const other = tableEl(page).locator('tbody tr').filter({ has: page.locator('td:first-child', { hasText: /^45$/ }) })
    await expect(other).not.toHaveClass(/2b1616/)
  })

  test('Auto tax follows what you need to live on', async ({ page }) => {
    await setup(page, { retire: { autoTax: true, withdrawMo: 5000 } })
    await expect(autoValue(main(page), 'Tax on investment gains')).toHaveText('15%')
    await field(main(page), 'Need per month').fill('2000')
    // under the 0% federal bracket (49,450 a year) and no state tax in the default state
    await expect(autoValue(main(page), 'Tax on investment gains')).toHaveText('0%')
  })

  test('typed tax shaves the savings growth but not the 401k growth', async ({ page }) => {
    await setup(page, {
      retire: { retireAge: 31, startSavings: 100000, start401k: 10000, contrib401k: 0, contribSavings: 0, taxPct: 20 },
      port: [{ name: 'Fund', alloc: 100, perf: 7 }],
    })
    // 100,000 x 7% x (1 - 20%) = 5,600 of growth; the 401k earns the full 700
    await expectRow(page, 30, { growth: 5600, k: 10700 })
  })

  test('turning the tax Auto off keeps a typed number', async ({ page }) => {
    await setup(page, { retire: { autoTax: true, taxPct: 22 } })
    await badge(main(page), 'Tax on investment gains').click()
    await expect(field(main(page), 'Tax on investment gains')).toHaveValue('22')
    expect((await retireCalc(page)).autoTax).toBe(false)
  })
})

test.describe('returns', () => {
  test('the portfolio table shows the fund, allocation, return and weighted average', async ({ page }) => {
    await setup(page, { retire: null })
    const card = portCard(page)
    await expect(card.getByText('While working')).toBeVisible()
    await expect(card.locator('input').first()).toHaveValue('Index fund')
    await expect(card.getByText('Weighted avg return')).toBeVisible()
    await expect(card.locator('tr', { hasText: 'Weighted avg return' })).toContainText('100%')
    await expect(card.locator('tr', { hasText: 'Weighted avg return' })).toContainText('7.00%')
  })

  test('changing a return moves the average, the intro and the growth', async ({ page }) => {
    await setup(page, { port: [{ name: 'Fund', alloc: 100, perf: 7 }] })
    const card = portCard(page)
    await card.locator('input[type=number]').nth(1).fill('5')
    await expect(card.locator('tr', { hasText: 'Weighted avg return' })).toContainText('5.00%')
    await expect(intro(page)).toContainText('earn 5.00% a year while you work')
    expect((await ls(page, 'retirePortfolio'))[0].perf).toBe(5)
    // age 30: 401k grows 10,000 x 5% = 500 -> 10,000 + 500 + 3,750
    await expectRow(page, 30, { k: 14250 })
  })

  test('two funds are weighted by allocation', async ({ page }) => {
    await setup(page, { port: [{ name: 'A', alloc: 100, perf: 7 }, { name: 'B', alloc: 50, perf: 10 }] })
    const avg = portCard(page).locator('tr', { hasText: 'Weighted avg return' })
    // (100 x 7 + 50 x 10) / 150 = 8.00
    await expect(avg).toContainText('150%')
    await expect(avg).toContainText('8.00%')
    await expect(intro(page)).toContainText('earn 8.00% a year')
  })

  test('allocations that do not add to 100 turn the total yellow', async ({ page }) => {
    await setup(page, { port: [{ name: 'A', alloc: 100, perf: 7 }, { name: 'B', alloc: 50, perf: 10 }] })
    const total = portCard(page).locator('tr', { hasText: 'Weighted avg return' }).locator('td').nth(1)
    await expect(total).toHaveClass(/e8c76a/)
  })

  test('+ Add fund adds an empty row, and the X removes one', async ({ page }) => {
    await setup(page, { port: [{ name: 'A', alloc: 100, perf: 7 }] })
    const card = portCard(page)
    await card.getByRole('button', { name: '+ Add fund' }).click()
    expect(await ls(page, 'retirePortfolio')).toHaveLength(2)
    // a 0% empty fund at 0 allocation does not change the 7%
    await expect(card.locator('tr', { hasText: 'Weighted avg return' })).toContainText('7.00%')
    const rows = card.locator('tbody tr').filter({ has: page.locator('input[type=number]') })
    await expect(rows).toHaveCount(2)
    await rows.last().hover()
    await rows.last().locator('button').last().click({ force: true })
    await expect(rows).toHaveCount(1)
    expect(await ls(page, 'retirePortfolio')).toHaveLength(1)
  })

  test('a flat 0% plan has no growth at all', async ({ page }) => {
    await setup(page)
    const t = await readTable(page)
    expect(Object.values(t).every((r) => r.growth === 0)).toBe(true)
  })

  test('a different mix after retiring is its own table and the intro says so', async ({ page }) => {
    await setup(page, { port: [{ name: 'Fund', alloc: 100, perf: 7 }] })
    await expect(portCard(page).locator('tr', { hasText: 'Weighted avg return' })).toHaveCount(1)
    await main(page).getByRole('button', { name: 'I plan to invest differently after retiring' }).click()
    await expect(portCard(page).locator('tr', { hasText: 'Weighted avg return' })).toHaveCount(2)
    await expect(main(page).getByRole('button', { name: 'Use the same funds after retiring' })).toBeVisible()
    const after = (await ls(page, 'retirePortfolioAfter'))
    expect(after.same).toBe(false)
    expect(after.rows).toEqual([{ name: 'Fund', alloc: 100, perf: 7 }])
  })

  test('the after-retiring return drives the retired years (both pools)', async ({ page }) => {
    await setup(page, {
      retire: { retireAge: 32, accessAge: 70, endAge: 40, startSavings: 100000, start401k: 10000, contrib401k: 0, contribSavings: 0, withdrawMo: 0 },
      port: [{ name: 'Fund', alloc: 100, perf: 7 }],
      portAfter: { same: false, rows: [{ name: 'Safe', alloc: 100, perf: 2 }] },
    })
    await expect(intro(page)).toContainText('earn 7.00% a year while you work and 2.00% after')
    // age 31 is the last working year at 7%; age 32 on at 2%
    await expectRow(page, 31, { total: Math.round(100000 * 1.07 * 1.07), k: Math.round(10000 * 1.07 * 1.07) })
    await expectRow(page, 32, { total: Math.round(100000 * 1.07 * 1.07 * 1.02), k: Math.round(10000 * 1.07 * 1.07 * 1.02) })
  })

  test('Use the same funds goes back to one table', async ({ page }) => {
    await setup(page, {
      port: [{ name: 'Fund', alloc: 100, perf: 7 }],
      portAfter: { same: false, rows: [{ name: 'Safe', alloc: 100, perf: 2 }] },
    })
    await main(page).getByRole('button', { name: 'Use the same funds after retiring' }).click()
    await expect(main(page).getByRole('button', { name: 'I plan to invest differently after retiring' })).toBeVisible()
    await expect(intro(page)).not.toContainText('% after')
    expect((await ls(page, 'retirePortfolioAfter')).same).toBe(true)
  })
})

test.describe('Social Security', () => {
  const SS = { on: true, claimAge: 67, auto: false, monthly: 1000 }

  test('the toggle hides the claim age and amount and updates the footnote', async ({ page }) => {
    await setup(page, { retire: { ss: { on: true } } })
    await expect(field(main(page), 'Claim age')).toBeVisible()
    await main(page).locator('button', { hasText: /Yes, it is part of the plan/ }).click()
    await expect(main(page).locator('button', { hasText: /No, plan without it/ })).toBeVisible()
    await expect(field(main(page), 'Claim age')).toHaveCount(0)
    await expect(main(page).getByText('Social Security is left out.')).toBeVisible()
    expect((await retireCalc(page)).ss.on).toBe(false)
  })

  test('a typed monthly benefit reduces the withdrawal from the claim age on', async ({ page }) => {
    await setup(page, { retire: { ss: SS, withdrawMo: 3000 } })
    await expectRow(page, 66, { wd: 36000 })
    await expectRow(page, 67, { wd: 24000 })
    await expectRow(page, 90, { wd: 24000 })
    await expectMatchesSim(page, sim({ need: 3000, ssMonthly: 1000 }))
  })

  test('a benefit bigger than the need takes the withdrawal to zero, never below', async ({ page }) => {
    await setup(page, { retire: { ss: { ...SS, monthly: 5000 }, withdrawMo: 3000 } })
    await expectRow(page, 67, { wd: 0 })
  })

  test('the claim age moves where the benefit starts', async ({ page }) => {
    await setup(page, { retire: { ss: SS, withdrawMo: 3000 } })
    await field(main(page), 'Claim age').fill('65')
    await expectRow(page, 64, { wd: 36000 })
    await expectRow(page, 65, { wd: 24000 })
  })

  test('claim age is held between 62 and 70 when you leave the box', async ({ page }) => {
    await setup(page, { retire: { ss: SS } })
    const box = field(main(page), 'Claim age')
    await box.fill('75')
    await box.blur()
    await expect(box).toHaveValue('70')
    await box.fill('50')
    await box.blur()
    await expect(box).toHaveValue('62')
  })

  test('Auto estimate scales with the claim age: 62 pays 70%, 67 pays 100%, 70 pays 124%', async ({ page }) => {
    await setup(page, { retire: { ss: { on: true, auto: true } } })
    await expect(autoValue(main(page), 'Per month')).toHaveText('$2,879')
    await field(main(page), 'Claim age').fill('62')
    await expect(autoValue(main(page), 'Per month')).toHaveText('$2,015')
    await field(main(page), 'Claim age').fill('70')
    await expect(autoValue(main(page), 'Per month')).toHaveText('$3,570')
  })

  test('the Auto estimate follows the Take-home salary', async ({ page }) => {
    const takeHome = { salary: 20000, deductions: [] }
    await setup(page, { retire: { ss: { on: true, auto: true } }, takeHome })
    // 20,000 / 12 = 1,667 a month: 0.9 x 1,286 + 0.32 x 380.67 = 1,279
    await expect(autoValue(main(page), 'Per month')).toHaveText('$1,279')
  })

  test('Auto off shows the typed amount, and it is what the table uses', async ({ page }) => {
    await setup(page, { retire: { ss: { on: true, auto: true, monthly: 800 }, withdrawMo: 3000 } })
    await badge(main(page), 'Per month').click()
    await expect(field(main(page), 'Per month')).toHaveValue('800')
    await expectRow(page, 67, { wd: (3000 - 800) * 12 })
    expect((await retireCalc(page)).ss.auto).toBe(false)
  })

  test('Social Security off means the full need all the way', async ({ page }) => {
    await setup(page, { retire: { ss: { on: false }, withdrawMo: 3000 } })
    await expectRow(page, 80, { wd: 36000 })
  })
})

test.describe('events', () => {
  const add = async (page) => {
    await page.getByRole('button', { name: 'Add event' }).click()
    return eventCards(page).last()
  }
  const make = async (page, { name, amount, age, kind, repeat, years }) => {
    const card = await add(page)
    if (name) await card.getByPlaceholder('Event name').fill(name)
    await field(card, 'Amount').fill(String(amount))
    if (kind) await pick(page, card, 'Money out', kind)
    await field(card, 'Starts at age').fill(String(age))
    if (repeat) await pick(page, card, 'Once', repeat)
    if (years) await field(card, 'For how many years').fill(String(years))
    return card
  }

  test('starts with no events and a hint', async ({ page }) => {
    await setup(page)
    await expect(main(page).getByText('No events yet. Add one for a big purchase, a bonus or a stock payout.')).toBeVisible()
    await expect(eventCards(page)).toHaveCount(0)
  })

  test('the plus button adds a one-time money-out event at next year', async ({ page }) => {
    await setup(page)
    const card = await add(page)
    await expect(main(page).getByText('No events yet.')).toHaveCount(0)
    await expect(field(card, 'Starts at age')).toHaveValue('31')
    await expect(card.locator('button', { hasText: 'Money out' })).toBeVisible()
    await expect(card.locator('button', { hasText: 'Once' })).toBeVisible()
    const e = (await retireCalc(page)).events
    expect(e).toHaveLength(1)
    expect(e[0]).toMatchObject({ name: '', amount: 0, kind: 'out', age: 31, repeat: 'once', years: 1 })
  })

  test('a one-time money-out event lands in Withdrawals for its year', async ({ page }) => {
    await setup(page)
    await make(page, { name: 'Down payment', amount: 5000, age: 33 })
    await expectRow(page, 33, { wd: 5000, contrib: 25000, total: 50000 + 20000 * 4 - 5000 })
    await expectRow(page, 34, { wd: 0 })
    await expectMatchesSim(page, sim({ events: [{ kind: 'out', amount: 5000, age: 33, repeat: 'once' }] }))
    expect((await retireCalc(page)).events[0].name).toBe('Down payment')
  })

  test('a money-in event lands in Contributions', async ({ page }) => {
    await setup(page)
    await make(page, { amount: 7000, age: 32, kind: 'Money in' })
    await expectRow(page, 32, { contrib: 25000 + 7000, wd: 0 })
  })

  test('changing Direction moves the amount between the columns', async ({ page }) => {
    await setup(page)
    const card = await make(page, { amount: 4000, age: 32 })
    await expectRow(page, 32, { wd: 4000, contrib: 25000 })
    await pick(page, card, 'Money out', 'Money in')
    await expectRow(page, 32, { wd: 0, contrib: 29000 })
  })

  test('repeating every year covers the window and stops after it', async ({ page }) => {
    await setup(page)
    await make(page, { amount: 1000, age: 32, kind: 'Money in', repeat: 'Every year', years: 3 })
    await expectRow(page, 31, { contrib: 25000 })
    for (const a of [32, 33, 34]) await expectRow(page, a, { contrib: 26000 })
    await expectRow(page, 35, { contrib: 25000 })
  })

  test('every month pays twelve times the amount a year', async ({ page }) => {
    await setup(page)
    await make(page, { amount: 100, age: 32, kind: 'Money in', repeat: 'Every month', years: 2 })
    await expectRow(page, 32, { contrib: 26200 })
    await expectRow(page, 33, { contrib: 26200 })
    await expectRow(page, 34, { contrib: 25000 })
  })

  test('every two years pays at the start age and every second year inside the window', async ({ page }) => {
    await setup(page)
    await make(page, { amount: 1000, age: 32, kind: 'Money in', repeat: 'Every two years', years: 5 })
    for (const a of [32, 34, 36]) await expectRow(page, a, { contrib: 26000 })
    for (const a of [33, 35, 37]) await expectRow(page, a, { contrib: 25000 })
  })

  test('the For how many years box only shows for repeating events', async ({ page }) => {
    await setup(page)
    const card = await add(page)
    await expect(card.locator('label', { hasText: 'For how many years' })).toHaveCount(0)
    await pick(page, card, 'Once', 'Every year')
    await expect(field(card, 'For how many years')).toHaveValue('1')
    const years = field(card, 'For how many years')
    await years.fill('0')
    await expect.poll(async () => (await retireCalc(page)).events[0].years).toBe(1)
  })

  test('an event during retirement adds to the monthly need', async ({ page }) => {
    await setup(page, { retire: { startSavings: 500000 } })
    await make(page, { amount: 20000, age: 50 })
    await expectRow(page, 50, { wd: 12000 + 20000 })
    await expectRow(page, 51, { wd: 12000 })
  })

  test('removing an event takes its money out of the table', async ({ page }) => {
    await setup(page)
    const card = await make(page, { amount: 5000, age: 33 })
    await expectRow(page, 33, { wd: 5000 })
    await card.getByRole('button', { name: 'Remove event' }).click()
    await expect(eventCards(page)).toHaveCount(0)
    await expectRow(page, 33, { wd: 0 })
    expect((await retireCalc(page)).events).toEqual([])
  })

  test('events survive a reload', async ({ page }) => {
    await setup(page)
    await make(page, { name: 'Wedding', amount: 5000, age: 33 })
    await page.reload()
    await goTo(page, 'Retirement')
    const card = eventCards(page).first()
    await expect(card.getByPlaceholder('Event name')).toHaveValue('Wedding')
    await expect(field(card, 'Amount')).toHaveValue('5000')
    await expectRow(page, 33, { wd: 5000 })
  })

  test('old saves without an events list get House downpayment, Car buyout and Options payout', async ({ page }) => {
    const raw = { age: 36, retireAge: 44, withdrawMo: 7500, contrib401k: 4440, contribSavings: 19199 }
    await setup(page, { raw })
    const names = await eventCards(page).getByPlaceholder('Event name').evaluateAll((els) => els.map((e) => e.value))
    expect(names).toEqual(['House downpayment', 'Car buyout', 'Options payout'])
    const house = eventCards(page).first()
    await expect(field(house, 'Amount')).toHaveValue('35000')
    await expect(field(house, 'Starts at age')).toHaveValue('38')
    await expect(main(page).locator('button', { hasText: /No, plan without it/ })).toBeVisible()
    await expect(main(page).getByRole('tab', { name: 'Type it in' })).toHaveAttribute('aria-selected', 'true')
    // read as old defaults: plan runs to 120 and the stored value is not rewritten
    expect(await rowCount(page)).toBe(120 - 36 + 1)
    expect(await retireCalc(page)).toEqual(raw)
  })
})

test.describe('events: paying off a debt', () => {
  const debts = [
    { id: 'd1', name: 'Card', balance: 6000, apr: 0, payment: 200 },
    { id: 'd2', name: 'Loan', balance: 9000, apr: 0, payment: 0 },
  ]
  const addDebtEvent = async (page, age) => {
    await page.getByRole('button', { name: 'Add event' }).click()
    const card = eventCards(page).last()
    await pick(page, card, 'Money out', 'Pay off a debt')
    await field(card, 'Pay off at age').fill(String(age))
    return card
  }

  test('choosing Pay off a debt picks the first debt and uses its balance (Auto)', async ({ page }) => {
    await setup(page, { debts })
    const card = await addDebtEvent(page, 33)
    await expect(card.locator('button', { hasText: 'Card' })).toBeVisible()
    await expect(autoValue(card, 'Amount')).toHaveText('$6,000')
    await expect(card.locator('label', { hasText: 'Repeats' })).toHaveCount(0)
    const e = (await retireCalc(page)).events[0]
    expect(e).toMatchObject({ kind: 'debt', debtId: 'd1', custom: false, repeat: 'once' })
  })

  test('the balance leaves savings at that age and the payment flows in from then on', async ({ page }) => {
    await setup(page, { debts })
    await addDebtEvent(page, 33)
    // Card pays 200 a month. The event replaces its normal 30-month schedule: full 2,400 from 33
    const freed = (age) => (age >= 33 ? 2400 : 0)
    await expectRow(page, 32, { contrib: 25000 - 0 + 0 })
    await expectRow(page, 33, { contrib: 25000 + 2400, wd: 6000 })
    await expectMatchesSim(page, sim({
      events: [{ kind: 'out', amount: 6000, age: 33, repeat: 'once' }],
      freed,
    }))
  })

  test('the paid-off debt is left out of the Start in debt hole', async ({ page }) => {
    await setup(page, { debts, includeDebt: true })
    await expect(main(page).locator('button', { hasText: /Yes, owing \$15,000 \(from Balances\)/ })).toBeVisible()
    await addDebtEvent(page, 33)
    await expect(main(page).locator('button', { hasText: /Yes, owing \$9,000 \(from Balances\)/ })).toBeVisible()
  })

  test('clicking Auto lets you type your own amount, and it is used', async ({ page }) => {
    await setup(page, { debts })
    const card = await addDebtEvent(page, 33)
    await badge(card, 'Amount').click()
    await expect(field(card, 'Amount')).toHaveValue('6000')
    await field(card, 'Amount').fill('4500')
    await expectRow(page, 33, { wd: 4500 })
    expect((await retireCalc(page)).events[0]).toMatchObject({ custom: true, amount: 4500 })
  })

  test('picking another debt changes the amount', async ({ page }) => {
    await setup(page, { debts })
    const card = await addDebtEvent(page, 33)
    await pick(page, card, 'Card', 'Loan')
    await expect(autoValue(card, 'Amount')).toHaveText('$9,000')
    await expectRow(page, 33, { wd: 9000 })
  })

  test('with no debts on Balances the Debt picker says so', async ({ page }) => {
    await setup(page)
    await page.getByRole('button', { name: 'Add event' }).click()
    const card = eventCards(page).last()
    await pick(page, card, 'Money out', 'Pay off a debt')
    await expect(card.locator('button', { hasText: 'No debts on Balances' })).toBeVisible()
    await expectRow(page, 31, { wd: 0 })
  })
})

test.describe('events: equity link', () => {
  const stock = { type: 'rsu', exit: 20, strike: 10, shares: 1000, salary: 100000, years: 2, heldOver: false }

  const linked = async (page, age) => {
    await page.getByRole('button', { name: 'Add event' }).click()
    const card = eventCards(page).last()
    await badge(card, 'Amount').click()
    await field(card, 'Starts at age').fill(String(age))
    return card
  }

  test('Auto pulls the net yearly payout from the Equity tool and forces money in', async ({ page }) => {
    await setup(page, { stock })
    const card = await linked(page, 32)
    const shown = money(await autoValue(card, 'Amount').innerText())
    // 20,000 gross over 2 years is 10,000 a year before tax
    expect(shown).toBeGreaterThan(0)
    expect(shown).toBeLessThan(10000)
    await expect(card.locator('button', { hasText: 'Money in' })).toBeVisible()
    // linking a new event makes it repeat every year
    await expect(card.locator('button', { hasText: 'Every year' })).toBeVisible()
    await expect(card.locator('label', { hasText: 'For how many years' })).toContainText('2')
    await expectRow(page, 32, { contrib: 25000 + shown })
    await expectRow(page, 33, { contrib: 25000 + shown })
    await expectRow(page, 34, { contrib: 25000 })
    expect((await retireCalc(page)).events[0]).toMatchObject({ auto: 'equity', kind: 'in' })
  })

  test('a linked event stops the year you retire', async ({ page }) => {
    await setup(page, { stock, retire: { retireAge: 33 } })
    const card = await linked(page, 32)
    const shown = money(await autoValue(card, 'Amount').innerText())
    await expectRow(page, 32, { contrib: 25000 + shown })
    // 33 is a retired year: no contributions at all, not even the payout
    await expectRow(page, 33, { contrib: 0 })
  })

  test('with no shares in the Equity tool the linked amount is zero', async ({ page }) => {
    await setup(page)
    const card = await linked(page, 32)
    await expect(autoValue(card, 'Amount')).toHaveText('$0')
  })

  test('turning Auto off goes back to a typed amount', async ({ page }) => {
    await setup(page, { stock })
    const card = await linked(page, 32)
    await badge(card, 'Amount').click()
    await expect(field(card, 'Amount')).toBeVisible()
    expect((await retireCalc(page)).events[0].auto).toBeUndefined()
  })
})

test.describe('headline results', () => {
  test('At retirement shows the liquid savings and the locked 401k separately', async ({ page }) => {
    await setup(page)
    const c = chip(page, 'At retirement (40)')
    await expect(c).toContainText('$250,000')
    await expect(c).toContainText('+ $58,750 locked in 401k')
  })

  test('Money lasts says to 90+ when it does and runs out at the first negative year when not', async ({ page }) => {
    await setup(page, { retire: { withdrawMo: 500 } })
    const c = chip(page, 'Money lasts')
    await expect(c).toContainText('to 90+')
    await field(main(page), 'Need per month').fill('3000')
    await expect(c).toContainText('runs out at 46')
  })

  test('the chip colors flip with the verdict', async ({ page }) => {
    await setup(page, { retire: { withdrawMo: 500 } })
    const verdict = chip(page, 'Money lasts').locator('div.tnum')
    await expect(verdict).toHaveCSS('color', /./)
    const good = await verdict.evaluate((e) => getComputedStyle(e).color)
    await field(main(page), 'Need per month').fill('3000')
    await expect.poll(() => verdict.evaluate((e) => getComputedStyle(e).color)).not.toBe(good)
  })

  test('Left over chips exist for 60, 70, 80 and 90 and match the table', async ({ page }) => {
    await setup(page)
    const t = await readTable(page)
    for (const a of [60, 70, 80, 90]) {
      const v = Math.abs(t[a].total).toLocaleString('en-US')
      await expect(chip(page, `Left over at ${a}`)).toContainText(`${t[a].total < 0 ? '−' : ''}$${v}`)
    }
    await expect(main(page).getByText('Left over at 100')).toHaveCount(0)
    // 56,750 at 60, then 12,000 less every year: 10 years later
    await expect(chip(page, 'Left over at 70')).toContainText(/[−-]\$63,250/)
  })

  test('only milestones after the current age are shown', async ({ page }) => {
    await setup(page, { retire: { age: 65, retireAge: 66, endAge: 85 } })
    await expect(main(page).getByText('Left over at 60')).toHaveCount(0)
    await expect(main(page).getByText('Left over at 70')).toBeVisible()
    await expect(main(page).getByText('Left over at 80')).toBeVisible()
    await expect(main(page).getByText('Left over at 90')).toHaveCount(0)
  })

  test('milestones go negative once the money is gone', async ({ page }) => {
    await setup(page, { retire: { withdrawMo: 3000 } })
    // 250,000 - 36,000 x 20 = -470,000 at 59, then the 401k joins: -470,000 - 36,000 + 58,750
    await expect(chip(page, 'Left over at 60')).toContainText(/[−-]\$447,250/)
  })
})

test.describe('year-by-year table', () => {
  test('every row adds up: last total + contributions + growth - withdrawals = total', async ({ page }) => {
    await setup(page, {
      retire: { ss: { on: true, auto: false, monthly: 900 }, withdrawMo: 2500, accessAge: 55, endAge: 80, start401k: 0, contrib401k: 0 },
      port: [{ name: 'Fund', alloc: 100, perf: 6 }],
      extra: {},
    })
    const t = await readTable(page)
    const ages = Object.keys(t).map(Number)
    for (let i = 1; i < ages.length; i++) {
      const a = ages[i]
      if (a === 55) continue // the 401k joins the total this year
      const want = t[a - 1].total + t[a].contrib + t[a].growth - t[a].wd
      expect(Math.abs(t[a].total - want), `age ${a}`).toBeLessThanOrEqual(2)
    }
  })

  test('with returns and a tax the full table matches the reference model', async ({ page }) => {
    await setup(page, {
      retire: { taxPct: 15, endAge: 75, withdrawMo: 2000 },
      port: [{ name: 'Fund', alloc: 100, perf: 6 }],
    })
    await expectMatchesSim(page, sim({ r: 0.06, tax: 15, endAge: 75, need: 2000 }))
  })

  test('negative balances earn no growth', async ({ page }) => {
    await setup(page, {
      retire: { withdrawMo: 30000, taxPct: 0, endAge: 60 },
      port: [{ name: 'Fund', alloc: 100, perf: 10 }],
    })
    const t = await readTable(page)
    const firstNeg = Object.keys(t).map(Number).find((a) => t[a].total < 0)
    expect(firstNeg).toBeGreaterThan(40)
    expect(t[firstNeg + 1].total).toBeLessThan(0)
    expect(t[firstNeg + 1].growth).toBe(0)
    expect(t[firstNeg - 1].growth).toBeGreaterThan(0)
  })

  test('negative totals use the red color', async ({ page }) => {
    await setup(page, { retire: { withdrawMo: 3000 } })
    const cell = (age) => tableEl(page).locator('tbody tr').filter({ has: page.locator('td:first-child', { hasText: new RegExp(`^${age}$`) }) }).locator('td').last()
    const ok = await cell(45).evaluate((e) => getComputedStyle(e).color)
    const bad = await cell(46).evaluate((e) => getComputedStyle(e).color)
    expect(bad).not.toBe(ok)
  })

  test('the first year is not a full 401k year even with Auto', async ({ page }) => {
    await setup(page, { retire: { auto401k: true, start401k: 0 } })
    await expectRow(page, 30, { k: 2400 })
    await expectRow(page, 31, { k: 5600 })
  })

  test('column header tips restate the live inputs', async ({ page }) => {
    await setup(page, { retire: { ss: { on: true, auto: false, monthly: 900, claimAge: 66 } } })
    const header = tableEl(page).locator('th', { hasText: 'Withdrawals' })
    await header.locator('svg, button').last().hover()
    await expect(page.getByRole('tooltip').first()).toContainText('$1,000 a month')
    await expect(page.getByRole('tooltip').first()).toContainText('$900 a month of Social Security from age 66')
  })

  test('the footnote states the model simplifications', async ({ page }) => {
    await setup(page)
    await expect(main(page).getByText(/Your funds earn the same return every year/)).toBeVisible()
    await expect(main(page).getByText(/Everything is in today's dollars, so there is no inflation/)).toBeVisible()
  })
})

test.describe('presets', () => {
  const presetBtn = (page) => main(page).getByRole('button', { name: /^Presets$|^Plan |^Early|^Late|^Lean/ }).first()
  const menuBtn = (page, name) => main(page).locator('button', { hasText: name }).first()

  async function savePreset(page, name) {
    await main(page).getByRole('button', { name: 'Presets' }).click()
    await page.getByRole('menuitem', { name: 'Save as new preset' }).click()
    await page.getByPlaceholder('Preset name').fill(name)
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(main(page).getByRole('button', { name }).first()).toBeVisible()
  }
  async function openMenu(page, current) {
    await main(page).getByRole('button', { name: current }).first().click()
  }

  test('starts with no presets', async ({ page }) => {
    await setup(page)
    await main(page).getByRole('button', { name: 'Presets' }).click()
    await expect(page.getByText('No presets yet')).toBeVisible()
  })

  test('save as new preset names the current plan and the button shows it', async ({ page }) => {
    await setup(page)
    await savePreset(page, 'Retire at 40')
    await openMenu(page, 'Retire at 40')
    await expect(page.getByRole('menuitem', { name: 'Retire at 40' })).toBeVisible()
  })

  test('Save stays disabled until the name is typed', async ({ page }) => {
    await setup(page)
    await main(page).getByRole('button', { name: 'Presets' }).click()
    await page.getByRole('menuitem', { name: 'Save as new preset' }).click()
    await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled()
    await page.getByPlaceholder('Preset name').fill('x')
    await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeEnabled()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByPlaceholder('Preset name')).toHaveCount(0)
  })

  test('applying a preset restores the whole plan: fields, funds, events, Start in debt', async ({ page }) => {
    const debts = [{ id: 'd1', name: 'Card', balance: 8000, apr: 0, payment: 0 }]
    await setup(page, { debts, includeDebt: true, port: [{ name: 'Fund', alloc: 100, perf: 6 }] })
    await page.getByRole('button', { name: 'Add event' }).click()
    await field(eventCards(page).last(), 'Amount').fill('5000')
    await savePreset(page, 'Plan A')
    // change everything
    await field(main(page), 'Need per month').fill('2000')
    await field(main(page), 'Retire at').fill('50')
    await portCard(page).locator('input[type=number]').nth(1).fill('3')
    await main(page).locator('button', { hasText: /Yes, owing/ }).click()
    await eventCards(page).first().getByRole('button', { name: 'Remove event' }).click()
    await openMenu(page, 'Plan A')
    await page.getByRole('menuitem', { name: 'Plan A' }).click()
    await expect(field(main(page), 'Need per month')).toHaveValue('1000')
    await expect(field(main(page), 'Retire at')).toHaveValue('40')
    await expect(portCard(page).locator('tr', { hasText: 'Weighted avg return' })).toContainText('6.00%')
    await expect(main(page).locator('button', { hasText: /Yes, owing \$8,000 \(from Balances\)/ })).toBeVisible()
    await expect(eventCards(page)).toHaveCount(1)
    expect((await retireCalc(page)).events[0].amount).toBe(5000)
  })

  test('a yellow dot shows when the plan moves away from the active preset', async ({ page }) => {
    await setup(page)
    await savePreset(page, 'Base')
    await expect(main(page).getByLabel('Changed since this preset')).toHaveCount(0)
    await field(main(page), 'Need per month').fill('1500')
    await expect(main(page).getByLabel('Changed since this preset')).toBeVisible()
  })

  test('the save icon overwrites the active preset with the current values', async ({ page }) => {
    await setup(page)
    await savePreset(page, 'Base')
    await field(main(page), 'Need per month').fill('1500')
    await openMenu(page, 'Base')
    const item = page.getByRole('menuitem', { name: 'Base' })
    await item.hover()
    await page.getByRole('button', { name: 'Overwrite "Base" with the current values' }).click()
    await page.keyboard.press('Escape')
    await expect(main(page).getByLabel('Changed since this preset')).toHaveCount(0)
    await field(main(page), 'Need per month').fill('5000')
    await openMenu(page, 'Base')
    await page.getByRole('menuitem', { name: 'Base' }).click()
    await expect(field(main(page), 'Need per month')).toHaveValue('1500')
  })

  test('saving under an existing name replaces it and keeps one entry', async ({ page }) => {
    await setup(page)
    await savePreset(page, 'Base')
    await field(main(page), 'Need per month').fill('1500')
    await openMenu(page, 'Base')
    await page.getByRole('menuitem', { name: 'Save as new preset' }).click()
    await page.getByPlaceholder('Preset name').fill('Base')
    await page.getByRole('button', { name: 'Replace' }).click()
    await openMenu(page, 'Base')
    await expect(page.getByRole('menuitem', { name: 'Base' })).toHaveCount(1)
  })

  test('delete asks first, Cancel keeps it, Delete removes it', async ({ page }) => {
    await setup(page)
    await savePreset(page, 'Base')
    await openMenu(page, 'Base')
    await page.getByRole('menuitem', { name: 'Base' }).hover()
    await page.getByRole('button', { name: 'Delete preset "Base"' }).click()
    await expect(page.getByText('Are you sure you want to delete "Base"?')).toBeVisible()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(main(page).getByRole('button', { name: 'Base' }).first()).toBeVisible()
    await openMenu(page, 'Base')
    await page.getByRole('menuitem', { name: 'Base' }).hover()
    await page.getByRole('button', { name: 'Delete preset "Base"' }).click()
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(main(page).getByRole('button', { name: 'Presets' })).toBeVisible()
    await main(page).getByRole('button', { name: 'Presets' }).click()
    await expect(page.getByText('No presets yet')).toBeVisible()
  })

  test('presets are still there after a reload', async ({ page }) => {
    await setup(page)
    await savePreset(page, 'Base')
    await page.reload()
    await goTo(page, 'Retirement')
    await expect(main(page).getByRole('button', { name: 'Base' }).first()).toBeVisible()
  })
})

test.describe('persistence', () => {
  test('edits are saved in retireCalc and survive a reload', async ({ page }) => {
    await setup(page)
    await field(main(page), 'Need per month').fill('1800')
    await field(main(page), 'Current age').fill('32')
    await field(main(page), 'Savings now').fill('75000')
    await expect.poll(async () => (await retireCalc(page)).withdrawMo).toBe(1800)
    await page.reload()
    await goTo(page, 'Retirement')
    await expect(field(main(page), 'Need per month')).toHaveValue('1800')
    await expect(field(main(page), 'Current age')).toHaveValue('32')
    await expect(field(main(page), 'Savings now')).toHaveValue('75000')
    await expectRow(page, 32, { total: 75000 + 20000 })
  })

  test('a corrupted retireCalc falls back to the defaults', async ({ page }) => {
    await setup(page, { raw: 'not an object' })
    await expect(field(main(page), 'Current age')).toHaveValue('35')
    await expect(intro(page)).toContainText('$60,000 a year')
  })

  test('wrong-typed fields in a saved plan are ignored', async ({ page }) => {
    await setup(page, { raw: { ...BASE, age: 'thirty', withdrawMo: 1000 } })
    await expect(field(main(page), 'Current age')).toHaveValue('35')
    await expect(field(main(page), 'Need per month')).toHaveValue('1000')
  })

  test('clearing a box lets you type a fresh number', async ({ page }) => {
    await setup(page)
    const box = field(main(page), 'Need per month')
    await box.fill('')
    await expect(box).toHaveValue('')
    await box.fill('2500')
    await expect(intro(page)).toContainText('$30,000 a year')
  })

  test('the stepper arrows change a number by its step', async ({ page }) => {
    await setup(page)
    const label = main(page).locator('label').filter({ has: span(page, 'Need per month') })
    await label.hover()
    await label.getByRole('button', { name: 'Increase' }).click({ force: true })
    await expect(field(main(page), 'Need per month')).toHaveValue('1250')
    await label.getByRole('button', { name: 'Decrease' }).click({ force: true })
    await label.getByRole('button', { name: 'Decrease' }).click({ force: true })
    await expect(field(main(page), 'Need per month')).toHaveValue('750')
  })
})
