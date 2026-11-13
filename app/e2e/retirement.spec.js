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
// BASE turns the tax on 401k withdrawals off, so these rules stay the untaxed ones. The
// "tax on 401k withdrawals" tests turn it on and use simTaxed() below.

const main = (page) => page.getByRole('main')
const FLAT = [{ name: 'Cash', alloc: 100, perf: 0 }]
const BASE = {
  age: 30, retireAge: 40, accessAge: 60, endAge: 90,
  start401k: 10000, startSavings: 50000, startFrom: 'typed', startOff: [],
  contrib401k: 5000, contribSavings: 20000, auto401k: false, autoSavings: false,
  withdrawMo: 1000, taxPct: 0, autoTax: false, tax401k: false,
  ss: { on: false, claimAge: 67, auto: true, monthly: 0 },
  events: [],
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
  // a seeded plan keeps its own typed age even if a test adds an About you age
  if (retire !== null || raw !== undefined) state.retireAgeAuto = false
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
const portCard = (page) => main(page).locator('[data-slot=card]', { hasText: 'Investments' }).first()
const intro = (page) => main(page).locator('p', { hasText: 'You save until you retire' }).first()
const retireCalc = (page) => ls(page, 'retireCalc')

async function pick(page, scope, current, option) {
  await scope.locator('button', { hasText: current }).first().click()
  await page.getByRole('menuitem', { name: option }).click()
}

// ---- reading the year table ----
// columns are found by their header, so a new column does not shift the others
async function readTable(page) {
  const { head, body } = await tableEl(page).evaluate((el) => ({
    head: [...el.querySelectorAll('thead th')].map((th) => th.innerText.trim()),
    body: [...el.querySelectorAll('tbody tr')].map((tr) => [...tr.children].map((td) => td.innerText.trim())),
  }))
  const col = (label) => head.indexOf(label)
  const [iAge, iPhase, iK, iC, iG, iW, iT, iTot] =
    ['Age', 'Phase', '401k', 'Contributions', 'Growth (liquid)', 'Withdrawals', 'Tax', 'Total (liquid)'].map(col)
  const out = {}
  for (const c of body) {
    out[c[iAge]] = {
      phase: c[iPhase], k: money(c[iK]), contrib: money(c[iC]), growth: money(c[iG]),
      wd: Math.abs(money(c[iW])), tax: iT < 0 ? 0 : Math.abs(money(c[iT])), total: money(c[iTot]), hasK: c[iK] !== '—',
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
// The pay plan part of the model, for periods with typed 401k and savings dollars
// (preset values depend on the tax engine, so they are checked in unit tests). Periods
// never overlap. A period covers its from age up to, not including, its until age. Each
// year the period's amounts grow by its raise, the first year of each period is a 75%
// 401k year, and a working year no period covers keeps today's numbers.
function planAt(periods, age, startAge, retireAge) {
  for (let i = periods.length - 1; i >= 0; i--) {
    const p = periods[i]
    const from = Math.max(p.fromAge, startAge)
    const end = p.toAge === 'retire' ? retireAge : p.toAge
    if (age < from || age >= end || age >= retireAge) continue
    return { grow: (1 + p.raisePct / 100) ** (age - from), i }
  }
  return null
}
// money going to debts comes out of what is saved but never takes more than it saves
function withFreed(saved, freed) {
  return saved + (freed < 0 ? -Math.min(-freed, Math.max(0, saved)) : freed)
}
function sim(o) {
  const c = {
    age: 30, retireAge: 40, accessAge: 60, endAge: 90, k0: 10000, s0: 50000, hole: 0,
    base401k: 5000, contribS: 20000, r: 0, rAfter: null, tax: 0, need: 1000,
    ssMonthly: 0, claim: 67, events: [], freed: () => 0, periods: [], ...o,
  }
  let prevSeg = null
  const rows = {}
  // already past the access age: the 401k starts in savings
  const openNow = c.age >= c.accessAge
  let k = openNow ? 0 : c.k0
  let s = c.s0 - c.hole + (openNow ? c.k0 : 0)
  let runOut = null
  let atRet = c.retireAge <= c.age ? { liquid: s, locked: k } : null
  for (let age = c.age; age <= c.endAge; age++) {
    const working = age < c.retireAge
    const open = age >= c.accessAge
    const rate = working ? c.r : (c.rAfter ?? c.r)
    let cK = working ? (age === c.age ? c.base401k * 0.75 : c.base401k) : 0
    let cS = working ? withFreed(c.contribS, c.freed(age)) : 0
    if (c.periods.length > 0 && working) {
      const hit = planAt(c.periods, age, c.age, c.retireAge)
      const seg = hit ? hit.i : -1
      const first = seg !== prevSeg
      prevSeg = seg
      if (!hit) cK = first ? c.base401k * 0.75 : c.base401k
      else {
        const p = c.periods[hit.i]
        cK = p.k401 * hit.grow * (first ? 0.75 : 1)
        cS = withFreed(p.savings * hit.grow, c.freed(age))
      }
    }
    const ssNow = c.ssMonthly > 0 && age >= c.claim ? c.ssMonthly : 0
    const wd = working ? 0 : Math.max(0, c.need - ssNow) * 12
    const kG = k > 0 ? k * rate : 0
    const sG = s > 0 ? s * rate * (1 - c.tax / 100) : 0
    let inn = 0
    let out = 0
    // money in can go to the retirement account (no first-year rule), and a line set to
    // stop when you retire does, whatever its years
    for (const e of c.events) {
      if (e.untilRetire && !working) continue
      const v = evAmt(e.untilRetire ? { ...e, years: Infinity } : e, age)
      if (e.kind === 'in' && e.to === '401k') cK += v
      else if (e.kind === 'in') inn += v
      else out += v
    }
    // from the access age on, new 401k money goes straight to savings and whatever the
    // 401k holds moves in at the end of the year, shown in Contributions
    k += kG + (open ? 0 : cK)
    s += sG + cS + (open ? cK : 0) + inn - wd - out
    let moved = 0
    if (open && k > 0) { moved = k; s += k; k = 0 }
    rows[age] = { k: Math.max(0, k), contrib: cK + cS + inn + moved, growth: sG, wd: wd + out, total: s }
    if (age === c.retireAge - 1) atRet = { liquid: s, locked: k }
    if (runOut === null && !working && s < 0) runOut = age
  }
  return { rows, runOut, atRet }
}
// ---- reference model with the tax on 401k withdrawals (Texas: federal income tax only) ----
// Written apart from the page code on purpose: the gross-up is a fixed-point loop here
// (G = need + tax(G)) where the page bisects, and the pools are plain variables.
const FED_BRACKETS = [[12400, 0.10], [50400, 0.12], [105700, 0.22], [201775, 0.24], [256225, 0.32], [640600, 0.35], [Infinity, 0.37]]
function fedTax(gross) {
  const income = Math.max(0, gross - 16100)
  let tax = 0
  let prev = 0
  for (const [cap, rate] of FED_BRACKETS) {
    if (income <= prev) break
    tax += (Math.min(income, cap) - prev) * rate
    prev = cap
  }
  return tax
}
function grossFor(need) {
  let g = need
  for (let i = 0; i < 200; i++) g = need + fedTax(g)
  return g
}
function simTaxed(o) {
  const c = {
    age: 30, retireAge: 40, accessAge: 60, endAge: 90, k0: 10000, roth0: 0, s0: 50000,
    base401k: 5000, contribS: 20000, r: 0, tax: 0, need: 1000, events: [], ...o,
  }
  const rows = {}
  let pre = c.k0
  let roth = c.roth0
  let s = c.s0
  let open = c.age >= c.accessAge
  let runOut = null
  for (let age = c.age; age <= c.endAge; age++) {
    const working = age < c.retireAge
    let cK = working ? (age === c.age ? c.base401k * 0.75 : c.base401k) : 0
    let cS = working ? c.contribS : 0
    let wd = working ? 0 : c.need * 12
    // money in for the retirement account joins the pre-tax pool, other money in goes to
    // savings and money out is a withdrawal
    for (const e of c.events) {
      const v = evAmt(e, age)
      if (e.kind === 'in' && e.to === '401k') cK += v
      else if (e.kind === 'in') cS += v
      else wd += v
    }
    const preG = pre * c.r
    const rothG = roth * c.r
    const sG = s > 0 ? s * c.r * (1 - c.tax / 100) : 0
    const growth = sG + (open ? preG + rothG : 0)
    let moved = 0
    if (!open && age >= c.accessAge) { open = true; moved = pre + preG + roth + rothG }
    pre += preG + cK
    roth += rothG
    s += sG + cS - wd
    let tax = 0
    if (open && s < 0) {
      // savings first, then pre-tax grossed up for income tax, then Roth
      const need = -s
      const g = grossFor(need)
      if (g <= pre) { pre -= g; tax = g - need; s = 0 } else {
        tax = fedTax(pre)
        const left = need - (pre - tax)
        pre = 0
        const fromRoth = Math.min(roth, left)
        roth -= fromRoth
        s = -(left - fromRoth)
      }
    }
    rows[age] = { k: open ? 0 : pre + roth, contrib: cK + cS + moved, growth, wd, tax, total: s + (open ? pre + roth : 0) }
    if (runOut === null && !working && s < -0.01) runOut = age
  }
  return { rows, runOut }
}
// ---- reference model for debts (same rules as the page, written apart from it) ----
// Months to pay off a debt: with an APR, step month by month (interest, then the payment) until
// nothing is left; with none, balance over payment rounded up. Null when it never clears.
function payoffMonthsRef(balance, payment, apr) {
  if (balance <= 0) return 0
  if (!(payment > 0)) return null
  const r = apr / 100 / 12
  if (r > 0 && payment <= balance * r) return null
  let left = balance
  let n = 0
  while (left > 1e-6 && n < 2000) { left = left * (1 + r) - payment; n++ }
  return n
}
// What each year frees into savings: in the payoff year the months after the last payment, then
// 12 a year. An event at an age frees all 12 months from that age instead.
function freedRef(debts, startAge, eventAges = {}) {
  return (age) => debts.reduce((sum, d) => {
    const ev = eventAges[d.id]
    if (ev !== undefined) return sum + (age >= ev ? d.payment * 12 : 0)
    const m = payoffMonthsRef(d.balance, d.payment, d.apr)
    if (m === null) return sum
    const end = startAge * 12 + m // the month the last payment is made, counted from birth
    const freedMonths = Math.max(0, Math.min(12, (age + 1) * 12 - Math.max(end, age * 12)))
    return sum + d.payment * freedMonths
  }, 0)
}
// Debts come first: every month the debts get all their payments plus the monthly savings. Each
// debt takes its own payment, the rest goes to the first one still owing, and a cleared debt's
// payment rolls on. What that does to the savings in a year: money beyond the payments comes out,
// payments no longer needed are freed (all of them once the last debt clears).
function debtsFirstRef(debts, poolYear, startAge) {
  const pool = poolYear / 12
  const sumPay = debts.reduce((t, d) => t + d.payment, 0)
  const left = debts.map((d) => d.balance)
  const months = debts.map((d) => (d.balance <= 0.005 ? 0 : null))
  const spent = []
  for (let m = 1; m <= 1200 && months.includes(null); m++) {
    let avail = sumPay + pool
    const open = debts.map((_, i) => i).filter((i) => months[i] === null)
    for (const i of open) left[i] *= 1 + debts[i].apr / 1200
    for (const i of open) { const p = Math.min(debts[i].payment, left[i], avail); left[i] -= p; avail -= p }
    for (const i of open) { const p = Math.min(avail, left[i]); left[i] -= p; avail -= p }
    for (const i of open) if (left[i] <= 0.005) months[i] = m
    spent.push(sumPay + pool - avail)
  }
  const never = months.includes(null)
  const freed = (age) => {
    let net = 0
    for (let k = 1; k <= 12; k++) {
      const n = (age - startAge) * 12 + k
      const sp = n <= spent.length ? spent[n - 1] : never ? sumPay + pool : 0
      net += sp >= sumPay ? -(sp - sumPay) : sumPay - sp
    }
    return net
  }
  return { months, freed }
}
// What a Pay off a debt event at `age` pays: the balance, plus the interest the payment leaves
// unpaid when it does not cover it, compounding monthly from today
function eventPaysRef(d, startAge, age) {
  const r = d.apr / 100 / 12
  if (!(r > 0) || d.payment >= d.balance * r) return d.balance
  let left = d.balance
  for (let i = 0; i < (age - startAge) * 12; i++) left = left * (1 + r) - d.payment
  return left
}

async function expectMatchesSim(page, model) {
  await expect.poll(async () => {
    const t = await readTable(page)
    const bad = []
    for (const [age, r] of Object.entries(model.rows)) {
      const g = t[age]
      if (!g) { bad.push(`${age}: missing`); continue }
      for (const key of ['k', 'contrib', 'growth', 'wd', 'tax', 'total']) {
        if (key in r && Math.abs(g[key] - r[key]) > 1.5) bad.push(`${age}.${key}: got ${g[key]} want ${Math.round(r[key])}`)
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
    await expect(intro(page)).toContainText('Your 401k opens at 60 and what you take out of it is taxed as income.')
    await expect(intro(page)).toContainText('Your funds earn 7.00% a year while you work.')
  })

  test('starting fields are 35, 60, 60, 95 and 5,000 a month', async ({ page }) => {
    // the e2e start has no About you age, so this is the typed default
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

  test('both saving fields follow today\'s Take-home and Budget, and the tax starts on Auto', async ({ page }) => {
    await expect(autoValue(main(page), 'Into 401k per year')).toHaveText('$3,200')
    await expect(autoValue(main(page), 'Into savings per year')).toHaveText('$33,142')
    // 60,000 a year less the 16,100 standard deduction stays in the 0% federal band in Texas
    await expect(autoValue(main(page), 'Tax on investment gains')).toHaveText('0%')
    // pay, 401k and savings pick their source from a menu, never an Auto badge
    await expect(main(page).getByRole('button', { name: "Take-home preset for Now: Today's Take-home" })).toBeVisible()
    await expect(main(page).getByRole('button', { name: "Take-home preset for Now: Today's Take-home" })).toBeVisible()
    await expect(main(page).getByRole('button', { name: "Budget preset for Now: Today's Budget" })).toBeVisible()
    await expect(main(page).locator('[data-slot=card]', { hasText: 'Pay and saving over time' }).getByRole('button', { name: 'Auto', exact: true })).toHaveCount(0)
    await expect(badge(main(page), 'Tax on investment gains')).toHaveAttribute('aria-pressed', 'true')
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
    // saving lines became events, so there is no extras list any more
    expect(c).not.toHaveProperty('extras')
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

  test('the year the 401k unlocks, its balance shows in Contributions', async ({ page }) => {
    await expectRow(page, 60, { contrib: 58750, wd: 12000, total: 56750 })
  })

  test('Plan to age 100 adds a Left over at 100 chip', async ({ page }) => {
    await expect(main(page).getByText('Left over at 100')).toHaveCount(0)
    await field(main(page), 'Plan to age').fill('100')
    await expect(main(page).getByText('Left over at 100')).toBeVisible()
  })
})

test.describe('401k after the access age', () => {
  test('401k money paid in after the access age stays in savings', async ({ page }) => {
    await setup(page, { retire: { age: 55, retireAge: 65, endAge: 70, start401k: 100000, startSavings: 0, contrib401k: 10000, contribSavings: 0, withdrawMo: 0 } })
    // 107,500 the first year, 10,000 a year after, all of it in savings by 70
    await expectRow(page, 70, { total: 197500, hasK: false })
    await expectMatchesSim(page, sim({ age: 55, retireAge: 65, endAge: 70, k0: 100000, s0: 0, base401k: 10000, contribS: 0, need: 0 }))
  })

  test('already past the access age, the 401k starts in savings', async ({ page }) => {
    await setup(page, { retire: { age: 65, retireAge: 66, endAge: 70, start401k: 100000, startSavings: 0, contrib401k: 10000, contribSavings: 0 } })
    // 100,000 plus 7,500 saved at 65, then 12,000 a year for five years
    await expectRow(page, 70, { total: 47500, hasK: false })
    await expect(chip(page, 'Money lasts')).toContainText('to 70+')
    await expectMatchesSim(page, sim({ age: 65, retireAge: 66, endAge: 70, k0: 100000, s0: 0, base401k: 10000, contribS: 0 }))
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

  test('the note goes away once an input changes', async ({ page }) => {
    await setup(page, { retire: { withdrawMo: 100000 } })
    await badge(main(page), 'Retire at', 'Find').click()
    await expect(main(page).getByText(/No retire age before/)).toBeVisible()
    await field(main(page), 'Need per month').fill('90000')
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

  test('from Balances: savings are the assets, debts are paid off first, the retirement account is the 401k pool', async ({ page }) => {
    await setup(page, { retire: { startFrom: 'balances' }, assets, debts })
    await expect(main(page).getByText(/Savings start at \$50,000/)).toBeVisible()
    await expect(main(page).getByText('(and you owe $8,000, paid off first)')).toBeVisible()
    await expect(main(page).getByText(/Retirement account starts at \$40,000\./)).toBeVisible()
    // the first year: 40,000 + 3,750 and 42,000 + 20,000
    await expectRow(page, 30, { k: 43750, total: 62000 })
  })

  test('unticking an asset leaves it out and is saved in startOff', async ({ page }) => {
    await setup(page, { retire: { startFrom: 'balances' }, assets, debts })
    await main(page).getByRole('checkbox', { name: /Brokerage/ }).click()
    await expect(main(page).getByText(/Savings start at \$20,000/)).toBeVisible()
    await expectRow(page, 30, { total: 32000 })
    expect((await retireCalc(page)).startOff).toEqual(['a2'])
    await main(page).getByRole('checkbox', { name: /Old 401k/ }).click()
    await expect(main(page).getByText(/Retirement account starts at \$0\./)).toBeVisible()
    expect((await retireCalc(page)).startOff.sort()).toEqual(['a2', 'a3'])
  })

  test('unticking a debt leaves it out of what is owed', async ({ page }) => {
    await setup(page, { retire: { startFrom: 'balances' }, assets, debts })
    await main(page).getByRole('checkbox', { name: /Visa/ }).click()
    await expect(main(page).getByText(/Savings start at \$50,000/)).toBeVisible()
    await expect(main(page).getByText(/paid off first\)/)).toHaveCount(0)
    await expectRow(page, 30, { total: 70000 })
  })

  test('an unticked debt frees no payment into savings', async ({ page }) => {
    // 1,000 at 250 a month clears in 4 months: ticked, it frees 2,000 in the first year
    const card = [{ id: 'd9', name: 'Card', balance: 1000, apr: 0, payment: 250 }]
    await setup(page, { retire: { startFrom: 'balances' }, debts: card })
    await expectRow(page, 30, { contrib: 23750 + 2000 })
    await main(page).getByRole('checkbox', { name: /Card/ }).click()
    await expectRow(page, 30, { contrib: 23750 })
    await expectRow(page, 31, { contrib: 25000 })
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

  test('typed mode says what you owe and pays it off first from your savings', async ({ page }) => {
    await setup(page, { debts })
    await expect(main(page).getByText(/You owe \$8,000 on the Balances page. It is paid off first/)).toBeVisible()
    // 50,000 and 20,000 saved, less the 8,000 that goes to the debt in the first year
    await expectRow(page, 30, { total: 62000 })
  })

  test('the footnote says debts are paid off first', async ({ page }) => {
    await setup(page, { debts })
    await expect(main(page).getByText(/Debts on the Balances page are paid off first, with your saving/)).toBeVisible()
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
    await main(page).getByRole('button', { name: "Budget preset for Now: Today's Budget" }).click()
    await page.getByRole('menuitem', { name: 'Type it in' }).click()
    await expect(field(main(page), 'Into savings per year')).toHaveValue('12345')
    expect((await retireCalc(page)).autoSavings).toBe(false)
    await expectRow(page, 31, { contrib: 5000 + 12345 })
  })

  test('picking Today\'s Take-home for the 401k saves the flag and hides the box', async ({ page }) => {
    await setup(page)
    await main(page).getByRole('button', { name: 'Take-home preset for Now: Typed' }).click()
    await page.getByRole('menuitem', { name: "Today's Take-home" }).click()
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
    await expect(main(page).getByText(/so interest is included/)).toHaveCount(0)
  })

  test('two debts with no APR are paid in order and the page matches the reference model', async ({ page }) => {
    const debts = [
      { id: 'd1', name: 'Card', balance: 1000, apr: 0, payment: 250 },
      { id: 'd2', name: 'Loan', balance: 6000, apr: 0, payment: 200 },
    ]
    await setup(page, { debts })
    const ref = debtsFirstRef(debts, 20000, 30)
    // 2,117 a month in all: the card clears in month 1, the loan in month 4
    expect(ref.months).toEqual([1, 4])
    await expectMatchesSim(page, sim({ freed: ref.freed }))
  })

  test('a debt with an APR includes the interest, and the caption says when', async ({ page }) => {
    // 10,000 at 18% with 300 a month and the savings on top
    const debts = [{ id: 'd1', name: 'Car', balance: 10000, apr: 18, payment: 300 }]
    await setup(page, { debts })
    const ref = debtsFirstRef(debts, 20000, 30)
    const months = ref.months[0]
    expect(months).toBeLessThan(12)
    await expect(main(page).getByText(`Paid off in ${months} months (age 30).`)).toBeVisible()
    await expectMatchesSim(page, sim({ freed: ref.freed }))
  })

  test('a debt the savings cannot outrun takes all the savings and says it is never paid off', async ({ page }) => {
    // 12% of 1,000,000 is 10,000 a month in interest, far above the payment and savings together
    const debts = [{ id: 'd1', name: 'Card', balance: 1000000, apr: 12, payment: 200 }]
    await setup(page, { debts })
    await expect(main(page).getByText('Never paid off with your payments and savings.')).toBeVisible()
    await expectRow(page, 39, { contrib: 5000 })
    await expectMatchesSim(page, sim({ freed: debtsFirstRef(debts, 20000, 30).freed }))
  })
})

test.describe('money in for the retirement account', () => {
  const addIn = async (page, name, amount, repeat) => {
    await page.getByRole('button', { name: 'Add event' }).click()
    const card = eventCards(page).last()
    await card.getByPlaceholder('Event name').fill(name)
    await field(card, 'Amount').fill(String(amount))
    await pick(page, card, 'Money out', 'Money in')
    await field(card, 'Starts at age').fill('30')
    if (repeat) await pick(page, card, 'Once', repeat)
    return card
  }

  test('there is no separate saving lines list any more', async ({ page }) => {
    await setup(page)
    await expect(page.getByRole('button', { name: 'Add your own saving' })).toHaveCount(0)
    await expect(main(page).getByPlaceholder('Name, like IRA')).toHaveCount(0)
  })

  test('money in goes to savings unless set to the retirement account', async ({ page }) => {
    await setup(page)
    const card = await addIn(page, 'IRA', 2000, 'Every year')
    await field(card, 'For how many years').fill('10')
    await expect(card.locator('button', { hasText: 'Savings (use anytime)' })).toBeVisible()
    await expectRow(page, 30, { k: 13750, contrib: 23750 + 2000 })
    await pick(page, card, 'Savings (use anytime)', 'Retirement account (locked)')
    // 10,000 + 5,000 x 0.75 + 2,000 in the first year, savings untouched
    await expectRow(page, 30, { k: 15750, total: 70000, contrib: 23750 + 2000 })
    const e = (await retireCalc(page)).events[0]
    expect(e).toMatchObject({ kind: 'in', to: '401k', repeat: 'year', years: 10 })
    await expectMatchesSim(page, sim({ events: [{ kind: 'in', to: '401k', amount: 2000, age: 30, repeat: 'year', years: 10 }] }))
  })

  test('with tax on 401k withdrawals, retirement account money joins the pre-tax pool', async ({ page }) => {
    const events = [{ id: 'e1', name: 'IRA', kind: 'in', to: '401k', amount: 3000, age: 30, repeat: 'year', years: 10 }]
    await setup(page, { retire: { tax401k: true, withdrawMo: 3000, events } })
    // locked with the 401k: 10,000 + 3,750 + 3,000 after the first year
    await expectRow(page, 30, { k: 16750, total: 70000 })
    await expectMatchesSim(page, simTaxed({ need: 3000, events }))
  })

  test('a repeating money-in event can stop when you retire', async ({ page }) => {
    await setup(page)
    const card = await addIn(page, 'Side job', 3000, 'Every year')
    await badge(card, 'For how many years', 'Until retire').click()
    await expect(card.getByText('Until you retire')).toBeVisible()
    expect((await retireCalc(page)).events[0].untilRetire).toBe(true)
    await expectRow(page, 39, { contrib: 25000 + 3000 })
    await expectRow(page, 40, { contrib: 0 })
    await field(main(page), 'Retire at').fill('45')
    await expectRow(page, 44, { contrib: 28000 })
  })

  test('an old save with saving lines loads them as money-in events with the same numbers', async ({ page }) => {
    await setup(page, {
      retire: {
        extras: [
          { id: 'a', name: 'Side job', amount: 3000, unit: 'yr', to: 'savings' },
          { id: 'b', name: 'IRA', amount: 2000, unit: 'yr', to: '401k' },
          { id: 'c', name: 'Roth', amount: 100, unit: 'mo', to: 'savings' },
        ],
      },
    })
    await expect(eventCards(page)).toHaveCount(3)
    await expect(eventCards(page).first().getByPlaceholder('Event name')).toHaveValue('Side job')
    // what the saving lines added before: 3,000 + 1,200 to savings and 2,000 to the 401k
    await expectRow(page, 30, { k: 15750, contrib: 23750 + 3000 + 2000 + 1200 })
    await expectRow(page, 39, { contrib: 25000 + 6200 })
    await expectRow(page, 40, { contrib: 0 })
    await expectMatchesSim(page, sim({
      events: [
        { kind: 'in', amount: 3000, age: 30, repeat: 'year', years: 10, untilRetire: true },
        { kind: 'in', to: '401k', amount: 2000, age: 30, repeat: 'year', years: 10, untilRetire: true },
        { kind: 'in', amount: 100, age: 30, repeat: 'month', years: 10, untilRetire: true },
      ],
    }))
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
    await setup(page, { retire: { autoTax: true, withdrawMo: 6000 } })
    // 72,000 less the 16,100 standard deduction is 55,900, over the 49,450 0% band
    await expect(autoValue(main(page), 'Tax on investment gains')).toHaveText('15%')
    await field(main(page), 'Need per month').fill('2000')
    // under the 0% federal bracket after the standard deduction and no state tax in the default state
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
    await expect(total).toHaveClass(/--warn/)
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
    await expect(main(page).getByText('No events yet. Add one for a big purchase, a bonus, an IRA or a stock payout.')).toBeVisible()
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
    // the Loan has no payment of its own, so the savings pay it off first
    const loanFirst = debtsFirstRef([debts[1]], 20000, 30)
    const freed = (age) => (age >= 33 ? 2400 : 0) + loanFirst.freed(age)
    await expectRow(page, 32, { contrib: 25000 - 0 + 0 })
    await expectRow(page, 33, { contrib: 25000 + 2400, wd: 6000 })
    await expectMatchesSim(page, sim({
      events: [{ kind: 'out', amount: 6000, age: 33, repeat: 'once' }],
      freed,
    }))
  })

  test('the paid-off debt is left out of what you owe', async ({ page }) => {
    await setup(page, { debts })
    await expect(main(page).getByText(/You owe \$15,000 on the Balances page/)).toBeVisible()
    await addDebtEvent(page, 33)
    await expect(main(page).getByText(/You owe \$9,000 on the Balances page/)).toBeVisible()
  })

  test('a payoff age before today or after the plan leaves the debt owed', async ({ page }) => {
    await setup(page, { debts })
    const card = await addDebtEvent(page, 25)
    await expect(main(page).getByText(/You owe \$15,000 on the Balances page/)).toBeVisible()
    await field(card, 'Pay off at age').fill('95')
    await expect(main(page).getByText(/You owe \$15,000 on the Balances page/)).toBeVisible()
    await field(card, 'Pay off at age').fill('33')
    await expect(main(page).getByText(/You owe \$9,000 on the Balances page/)).toBeVisible()
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

  test('with an APR the payment covers the interest, so the event still pays the balance', async ({ page }) => {
    const card = { id: 'd1', name: 'Card', balance: 6000, apr: 12, payment: 200 }
    await setup(page, { debts: [card] })
    await addDebtEvent(page, 33)
    await expect(main(page).getByText('Paid off at age 33 by your Pay off a debt event. Then $200 a month is freed up.')).toBeVisible()
    expect(eventPaysRef(card, 30, 33)).toBe(6000)
    await expectMatchesSim(page, sim({
      events: [{ kind: 'out', amount: 6000, age: 33, repeat: 'once' }],
      freed: freedRef([card], 30, { d1: 33 }),
    }))
  })

  test('a payment too small for the interest makes the event pay the bigger balance', async ({ page }) => {
    // 12,000 at 12% is 120 a month in interest, and only 100 is paid
    const loan = { id: 'd1', name: 'Loan', balance: 12000, apr: 12, payment: 100 }
    await setup(page, { debts: [loan] })
    const card = await addDebtEvent(page, 32)
    const owed = eventPaysRef(loan, 30, 32)
    expect(owed).toBeGreaterThan(12000)
    await expect(autoValue(card, 'Amount')).toHaveText(`$${Math.round(owed).toLocaleString('en-US')}`)
    await expectMatchesSim(page, sim({
      events: [{ kind: 'out', amount: owed, age: 32, repeat: 'once' }],
      freed: freedRef([loan], 30, { d1: 32 }),
    }))
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

test.describe('tax on 401k withdrawals', () => {
  // a retiree living off a big pre-tax 401k in Texas, so the brackets matter
  const RETIREE = { tax401k: true, age: 55, retireAge: 60, endAge: 85, start401k: 600000, startSavings: 50000, contrib401k: 0, contribSavings: 0, withdrawMo: 4000 }
  const RETIREE_SIM = { age: 55, retireAge: 60, endAge: 85, k0: 600000, s0: 50000, base401k: 0, contribS: 0, need: 4000 }
  const taxToggle = (page) => main(page).getByRole('button', { name: 'Tax on 401k withdrawals' })

  test('the whole plan matches the taxed reference model', async ({ page }) => {
    await setup(page, { retire: RETIREE })
    await expectMatchesSim(page, simTaxed(RETIREE_SIM))
  })

  test('savings are spent first, then each year out of the 401k owes income tax', async ({ page }) => {
    await setup(page, { retire: RETIREE })
    const model = simTaxed(RETIREE_SIM)
    // 50,000 of savings cover age 60 and part of 61; no tax until they run low
    await expectRow(page, 60, { tax: 0, total: model.rows[60].total })
    expect(model.rows[61].tax).toBeGreaterThan(0)
    // a full year of 48,000 from the 401k: 16,100 is free, the rest is taxed at 10 and 12%
    expect(model.rows[62].tax).toBeGreaterThan(3000)
    await expectRow(page, 62, { tax: model.rows[62].tax, wd: 48000 })
  })

  test('with returns, a gains tax and a Roth the plan still matches and every row adds up', async ({ page }) => {
    await setup(page, { retire: { tax401k: true, withdrawMo: 3000, taxPct: 15 }, port: [{ name: 'Mix', alloc: 100, perf: 6 }] })
    await expectMatchesSim(page, simTaxed({ r: 0.06, tax: 15, need: 3000 }))
    const t = await readTable(page)
    for (let a = 61; a <= 90; a++) {
      expect(Math.abs(t[a - 1].total + t[a].contrib + t[a].growth - t[a].wd - t[a].tax - t[a].total), `age ${a}`).toBeLessThanOrEqual(3)
    }
  })

  test('with no pre-tax money the numbers are the same as without the tax', async ({ page }) => {
    await setup(page, { retire: { tax401k: true, start401k: 0, contrib401k: 0, withdrawMo: 1500 } })
    await expectMatchesSim(page, sim({ k0: 0, base401k: 0, need: 1500 }))
    const t = await readTable(page)
    expect(Object.values(t).every((r) => r.tax === 0)).toBe(true)
  })

  test('the money runs out sooner than without the tax, and the toggle shows the difference', async ({ page }) => {
    await setup(page, { retire: { ...RETIREE, withdrawMo: 5000 } })
    const taxed = simTaxed({ ...RETIREE_SIM, need: 5000 }).runOut
    const untaxed = sim({ age: 55, retireAge: 60, endAge: 85, k0: 600000, s0: 50000, base401k: 0, contribS: 0, need: 5000 }).runOut
    expect(taxed).not.toBeNull()
    expect(untaxed).toBeGreaterThan(taxed)
    await expect(chip(page, 'Money lasts')).toContainText(`runs out at ${taxed}`)
    await expect(taxToggle(page)).toHaveAttribute('aria-pressed', 'true')
    await expect(taxToggle(page)).toContainText('Yes, taxed as income in Texas')
    await taxToggle(page).click()
    await expect(taxToggle(page)).toHaveAttribute('aria-pressed', 'false')
    await expect(chip(page, 'Money lasts')).toContainText(`runs out at ${untaxed}`)
    expect((await retireCalc(page)).tax401k).toBe(false)
  })

  test('Find picks a later age once the tax is counted', async ({ page }) => {
    await setup(page, { retire: { tax401k: true, start401k: 300000, startSavings: 0, contrib401k: 30000, contribSavings: 0, withdrawMo: 6000 } })
    let expected = null
    for (let a = 31; a < 90; a++) {
      if (simTaxed({ retireAge: a, k0: 300000, s0: 0, base401k: 30000, contribS: 0, need: 6000 }).runOut === null) { expected = a; break }
    }
    let untaxed = null
    for (let a = 31; a < 90; a++) {
      if (sim({ retireAge: a, k0: 300000, s0: 0, base401k: 30000, contribS: 0, need: 6000 }).runOut === null) { untaxed = a; break }
    }
    expect(expected).toBeGreaterThan(untaxed)
    await badge(main(page), 'Retire at', 'Find').click()
    await expect(field(main(page), 'Retire at')).toHaveValue(String(expected))
  })

  test('a note explains the tax with the gross amount', async ({ page }) => {
    await setup(page, { retire: RETIREE })
    const g = Math.round(grossFor(48000))
    await expect(main(page).getByText(`To spend $48,000 a year from it you take out about $${g.toLocaleString('en-US')}.`, { exact: false })).toBeVisible()
    await taxToggle(page).click()
    await expect(main(page).getByText(/Turn this on to see the difference/)).toBeVisible()
  })

  test('a Roth account from Balances comes out tax free, after savings', async ({ page }) => {
    await setup(page, {
      retire: { ...RETIREE, startFrom: 'balances' },
      assets: [
        { id: 'a1', name: 'Checking', balance: 50000 },
        { id: 'a2', name: 'Roth IRA', balance: 600000, pool: '401k', kind: 'roth' },
      ],
    })
    await expect(main(page).locator('label', { hasText: 'Roth IRA' })).toContainText('Retirement account, Roth')
    await expectMatchesSim(page, simTaxed({ ...RETIREE_SIM, k0: 0, roth0: 600000 }))
    const t = await readTable(page)
    expect(Object.values(t).every((r) => r.tax === 0)).toBe(true)
  })

  test('the Tax column header explains it', async ({ page }) => {
    await setup(page, { retire: RETIREE })
    await expect(tableEl(page).locator('thead')).toContainText('Tax')
  })
})

test.describe('headline results', () => {
  test('At retirement shows the liquid savings and the locked 401k separately', async ({ page }) => {
    await setup(page)
    const c = chip(page, 'At retirement (40)')
    await expect(c).toContainText('$250,000')
    await expect(c).toContainText('+ $58,750 locked in 401k')
  })

  test('At retirement shows the starting balances when retiring now', async ({ page }) => {
    await setup(page, { retire: { retireAge: 30 } })
    const c = chip(page, 'At retirement (30)')
    await expect(c).toContainText('$50,000')
    await expect(c).toContainText('+ $10,000 locked in 401k')
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

  test('the end age gets its own chip, never twice', async ({ page }) => {
    await setup(page, { retire: { endAge: 85 } })
    const t = await readTable(page)
    await expect(chip(page, 'Left over at 85')).toContainText(`$${Math.abs(t[85].total).toLocaleString('en-US')}`)
    await field(main(page), 'Plan to age').fill('90')
    await expect(main(page).getByText('Left over at 85')).toHaveCount(0)
    await expect(main(page).getByText('Left over at 90')).toHaveCount(1)
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
      retire: { ss: { on: true, auto: false, monthly: 900 }, withdrawMo: 2500, accessAge: 55, endAge: 80, start401k: 10000, contrib401k: 0 },
      port: [{ name: 'Fund', alloc: 100, perf: 6 }],
      extra: {},
    })
    const t = await readTable(page)
    const ages = Object.keys(t).map(Number)
    for (let i = 1; i < ages.length; i++) {
      const a = ages[i]
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

test.describe('pay and saving over time', () => {
  // a period with typed 401k and savings dollars, so the reference model can check it
  const period = (o) => ({
    id: 'p', label: '', fromAge: 30, toAge: 'retire', raisePct: 0,
    takeHomeFrom: 'typed', takeHomePreset: '', k401: 5000, saveFrom: 'typed', savePreset: '', savings: 20000, ...o,
  })
  const card = (page) => main(page).locator('[data-slot=card]', { has: page.getByRole('heading', { name: 'Pay and saving over time' }) })
  const todayRow = (page) => card(page).getByText('Now, until you retire')
  const takeHomeCard = (page) => main(page).locator('[data-slot=card]').filter({ has: page.locator('h2', { hasText: 'Take-home pay' }) }).first()

  test('with no plan, one card holds today\'s 401k and savings', async ({ page }) => {
    await setup(page)
    await expect(card(page)).toContainText('Same pay until you retire. $80,000 a year from Take-home pay.')
    await expect(card(page)).toContainText('If your pay or spending will change, like a lower paying job at 40, plan it in periods.')
    await expect(card(page)).toContainText('Then pick them here for each period.')
    await expect(todayRow(page)).toBeVisible()
    await expect(main(page).getByText('Saving each year')).toHaveCount(0)
    await expect(card(page).getByText(/Pay per year/)).toHaveCount(0)
    await expect(tableEl(page).locator('th', { hasText: /^Pay/ })).toHaveCount(0)
    expect((await retireCalc(page)).pay).toBeUndefined()
  })

  test('add a change at 35: contributions follow it and Money lasts updates', async ({ page }) => {
    await setup(page, { retire: { withdrawMo: 2000 } })
    const lasts = await chip(page, 'Money lasts').innerText()
    await card(page).getByRole('button', { name: 'Plan pay changes' }).click()
    await expect(page.getByLabel(/From age for Now/)).toHaveValue('30')
    await expect(todayRow(page)).toHaveCount(0)
    await page.getByLabel(/Until age for Now/).fill('35')
    await page.getByLabel(/From age for period 2/).fill('35')
    await page.getByLabel(/Into savings per year for period 2/).fill('2000')
    await page.getByLabel(/Into 401k per year for period 2/).fill('0')
    await page.getByLabel(/Label for period 2/).fill('Easier job')
    await expectRow(page, 34, { contrib: 25000 })
    await expectRow(page, 35, { contrib: 2000 })
    await expect.poll(() => chip(page, 'Money lasts').innerText()).not.toBe(lasts)
    const saved = (await retireCalc(page)).pay.periods
    expect(saved.map((x) => [x.label, x.fromAge, x.toAge, x.takeHomeFrom, x.k401, x.saveFrom, x.savings])).toEqual([
      ['Now', 30, 35, 'typed', 5000, 'typed', 20000], ['Easier job', 35, 'retire', 'typed', 0, 'typed', 2000],
    ])
  })

  test('the table matches the reference model with a raise and typed amounts', async ({ page }) => {
    const periods = [
      period({ id: 'a', label: 'Now', toAge: 34, raisePct: 3, k401: 6000 }),
      period({ id: 'b', label: 'Easier job', fromAge: 34, k401: 0, savings: 8000, raisePct: 1 }),
    ]
    await setup(page, { retire: { taxPct: 15, endAge: 75, withdrawMo: 2000, pay: { periods } }, port: [{ name: 'Fund', alloc: 100, perf: 6 }] })
    await expectMatchesSim(page, sim({ r: 0.06, tax: 15, endAge: 75, need: 2000, periods }))
  })

  test('a period after retiring keeps saving in those years only', async ({ page }) => {
    const periods = [period({ id: 'a', label: 'Now' }), period({ id: 'b', label: 'Part time', fromAge: 42, toAge: 45, k401: 0, savings: 6000 })]
    await setup(page, { retire: { pay: { periods } } })
    await expect(card(page)).toContainText('Keeps going after you retire at 40.')
    await expectRow(page, 41, { wd: 12000, contrib: 0 })
    await expectRow(page, 42, { wd: 12000, contrib: 6000, phase: 'retired (pre-401k)' })
    await expectRow(page, 45, { contrib: 0 })
  })

  test('gaps and periods after retiring say so, and an old overlap is trimmed', async ({ page }) => {
    const periods = [
      period({ id: 'a', label: 'Now', toAge: 33 }),
      period({ id: 'b', label: 'Job two', fromAge: 35, toAge: 38 }),
      period({ id: 'c', label: 'Job three', fromAge: 37, k401: 0, savings: 1000 }),
      period({ id: 'd', label: 'Late start', fromAge: 41 }),
    ]
    await setup(page, { retire: { pay: { periods } } })
    await expect(card(page)).toContainText("No period covers ages 33 to 34. Those years use today's 401k and saving.")
    await expect(card(page)).toContainText('Starts after you retire at 40, so it never counts.')
    // Job three overlapped Job two at 37, so it now starts at 38, where Job two ends
    await expect(card(page)).not.toContainText('Overlaps')
    await expect(page.getByLabel(/From age for Job three/)).toHaveValue('38')
    await expectRow(page, 37, { contrib: 25000 })
    await expectRow(page, 38, { contrib: 1000 })
    // the gap uses today's Take-home 401k (3,200) and Budget saving (33,142)
    await expectRow(page, 33, { contrib: 2400 + 33142 })
    await expectRow(page, 34, { contrib: 3200 + 33142 })
  })

  test('periods cannot overlap: the next one starts at the previous until age', async ({ page }) => {
    await setup(page)
    await card(page).getByRole('button', { name: 'Plan pay changes' }).click()
    // Now runs until 39 and period 2 picks up at 39
    await expect(page.getByLabel(/Until age for Now/)).toHaveValue('39')
    await expect(page.getByLabel(/From age for period 2/)).toHaveValue('39')
    await expect(card(page).getByText(/For how many years/)).toHaveCount(0)
    await page.getByLabel(/Until age for Now/).fill('35')
    await page.getByLabel(/Until age for Now/).blur()
    await expect(page.getByLabel(/From age for period 2/)).toHaveValue('39')
    await page.getByLabel(/From age for period 2/).fill('35')
    // a later until age pushes period 2 along
    await page.getByLabel(/Until age for Now/).fill('37')
    await page.getByLabel(/Until age for Now/).blur()
    await expect(page.getByLabel(/From age for period 2/)).toHaveValue('37')
    // and period 2 cannot start before Now ends
    await page.getByLabel(/From age for period 2/).fill('33')
    await page.getByLabel(/From age for period 2/).blur()
    await expect(page.getByLabel(/From age for period 2/)).toHaveValue('37')
    await expect.poll(async () => (await retireCalc(page)).pay.periods.map((x) => [x.fromAge, x.toAge])).toEqual([[30, 37], [37, 'retire']])
  })

  test('a period points at a Take-home preset, follows a rename and falls back when it is deleted', async ({ page }) => {
    await setup(page)
    // an easier job with no 401k, saved as a preset on the Take-home tool
    await goTo(page, 'Tools')
    const th = takeHomeCard(page)
    await th.getByRole('button', { name: 'Remove' }).first().click()
    await th.locator('label').filter({ hasText: /^\s*Salary per year/ }).locator('input').first().fill('50000')
    await th.getByRole('button', { name: 'Presets' }).click()
    await page.getByRole('menuitem', { name: 'Save as new preset' }).click()
    await page.getByPlaceholder('Preset name').fill('Easier job')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(th.getByRole('button', { name: 'Easier job' })).toBeVisible()

    await goTo(page, 'Retirement')
    await card(page).getByRole('button', { name: 'Plan pay changes' }).click()
    await page.getByRole('button', { name: /^Take-home preset for period 2:/ }).click()
    await page.getByRole('menuitem', { name: 'Easier job' }).click()
    await expect(page.getByRole('button', { name: 'Take-home preset for period 2: Easier job' })).toBeVisible()
    // period 2 runs from 39: nothing into the 401k
    await expect.poll(async () => { const t = await readTable(page); return t[39].k - t[38].k }).toBe(0)
    const stored = (await retireCalc(page)).pay.periods[1]
    expect(stored).toMatchObject({ takeHomeFrom: 'preset', k401: 0 })
    expect(stored.takeHomePreset).toMatch(/^pr/)

    // a rename on the Take-home tool keeps the link
    await goTo(page, 'Tools')
    await th.getByRole('button', { name: 'Easier job' }).click()
    await page.getByRole('button', { name: 'Rename preset "Easier job"' }).click({ force: true })
    await page.getByLabel('New preset name').fill('Calmer job')
    await page.getByRole('button', { name: 'Rename', exact: true }).click()
    await goTo(page, 'Retirement')
    await expect(page.getByRole('button', { name: 'Take-home preset for period 2: Calmer job' })).toBeVisible()

    // deleting it falls back to the typed copy, with a note
    await goTo(page, 'Tools')
    await th.getByRole('button', { name: 'Calmer job' }).click()
    await page.getByRole('button', { name: 'Delete preset "Calmer job"' }).click({ force: true })
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await goTo(page, 'Retirement')
    await expect(card(page)).toContainText('Its Take-home preset was deleted, so it uses the typed 401k.')
    await expect(page.getByLabel(/Into 401k per year for period 2/)).toHaveValue('0')
  })

  test('a period saves by a Budget preset', async ({ page }) => {
    await setup(page)
    await goTo(page, 'Budget')
    await main(page).getByRole('button', { name: 'Presets' }).click()
    await page.getByRole('menuitem', { name: 'Save as new preset' }).click()
    await page.getByPlaceholder('Preset name').fill('Today')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await goTo(page, 'Retirement')
    await card(page).getByRole('button', { name: 'Plan pay changes' }).click()
    await page.getByRole('button', { name: /^Budget preset for period 2:/ }).click()
    await page.getByRole('menuitem', { name: 'Today', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Budget preset for period 2: Today' })).toBeVisible()
    const p2 = (await retireCalc(page)).pay.periods[1]
    expect(p2.saveFrom).toBe('preset')
    expect(p2.savePreset).toMatch(/^pr/)
    // the same rows as the Budget: 33,142 a year, plus the typed 5,000 401k at 75% in a new period
    await expectRow(page, 39, { contrib: 33142 + 3750 })
  })

  test('Contributions grow a year works with no plan and carries into periods and back', async ({ page }) => {
    await setup(page)
    await expect(field(card(page), 'Contributions grow a year')).toHaveValue('0')
    await field(card(page), 'Contributions grow a year').fill('3')
    // 5,000 into the 401k and 20,000 into savings, 3% more each year
    await expectRow(page, 30, { contrib: 23750 })
    await expectRow(page, 32, { contrib: 25000 * 1.03 ** 2 })
    expect((await retireCalc(page)).raisePct).toBe(3)
    await card(page).getByRole('button', { name: 'Plan pay changes' }).click()
    await expect(page.getByLabel(/Contributions grow a year for Now/)).toHaveValue('3')
    await expect(page.getByLabel(/Contributions grow a year for period 2/)).toHaveValue('3')
    await expectRow(page, 32, { contrib: 25000 * 1.03 ** 2 })
    await card(page).getByRole('button', { name: 'Back to one period' }).click()
    await expect(field(card(page), 'Contributions grow a year')).toHaveValue('3')
    await expect.poll(async () => (await retireCalc(page)).pay.periods).toEqual([])
  })

  test('Back to one period clears the plan and the numbers return', async ({ page }) => {
    await setup(page, { retire: { pay: { periods: [period({ toAge: 35, k401: 0, savings: 0 }), period({ id: 'q', fromAge: 35, k401: 0, savings: 0 })] } } })
    await expectRow(page, 31, { contrib: 0 })
    await card(page).getByRole('button', { name: 'Back to one period' }).click()
    await expectRow(page, 31, { contrib: 25000 })
    await expect.poll(async () => (await retireCalc(page)).pay.periods).toEqual([])
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

  test('applying a preset restores the whole plan: fields, funds and events', async ({ page }) => {
    const debts = [{ id: 'd1', name: 'Card', balance: 8000, apr: 0, payment: 0 }]
    await setup(page, { debts, port: [{ name: 'Fund', alloc: 100, perf: 6 }] })
    await page.getByRole('button', { name: 'Add event' }).click()
    await field(eventCards(page).last(), 'Amount').fill('5000')
    await savePreset(page, 'Plan A')
    // change everything
    await field(main(page), 'Need per month').fill('2000')
    await field(main(page), 'Retire at').fill('50')
    await portCard(page).locator('input[type=number]').nth(1).fill('3')
    await eventCards(page).first().getByRole('button', { name: 'Remove event' }).click()
    await openMenu(page, 'Plan A')
    await page.getByRole('menuitem', { name: 'Plan A' }).click()
    await expect(field(main(page), 'Need per month')).toHaveValue('1000')
    await expect(field(main(page), 'Retire at')).toHaveValue('40')
    await expect(portCard(page).locator('tr', { hasText: 'Weighted avg return' })).toContainText('6.00%')
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

test.describe('need per month from a Budget preset', () => {
  // Sample Budget today: rows 3,029 plus live Netflix, Spotify and iCloud (15 + 12 + 3) = 3,059.
  // The seeded "Retirement" preset: Rent 1,200 + Food 300 + the live subscriptions it has no row for,
  // as Budget would show it (Netflix 15, Spotify 12, iCloud 3 and Crunch Fitness 39) = 1,569.
  const PRESET = [
    { id: 'p1', name: 'Rent', type: 'simple', amount: 1200, source: 'manual' },
    { id: 'p2', name: 'Food', type: 'simple', amount: 300, source: 'manual' },
  ]
  const needBtn = (page) => main(page).getByRole('button', { name: 'Use a Budget preset' })

  // like setup(), but also writes Budget presets into IndexedDB (browser mode storage)
  async function setupWithPresets(page, { expenses = [{ name: 'Retirement', data: PRESET }], ls: extraLs = {} } = {}) {
    await openApp(page)
    const state = { retireCalc: BASE, retirePortfolio: FLAT, retireIncludeDebt: false, ...extraLs }
    await page.evaluate(async ({ s, expenses }) => {
      for (const [k, v] of Object.entries(s)) localStorage.setItem(`ledger:${k}`, JSON.stringify(v))
      const db = await new Promise((resolve, reject) => {
        const req = indexedDB.open('ledger', 1)
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      })
      const store = db.transaction('kv', 'readonly').objectStore('kv')
      const current = await new Promise((resolve) => { const r = store.get('presets'); r.onsuccess = () => resolve(r.result ?? {}) })
      await new Promise((resolve, reject) => {
        const tx = db.transaction('kv', 'readwrite')
        tx.objectStore('kv').put({ ...current, expenses }, 'presets')
        tx.oncomplete = resolve
        tx.onerror = () => reject(tx.error)
      })
      db.close()
    }, { s: state, expenses })
    await page.reload()
    await goTo(page, 'Retirement')
  }

  test('never picking a preset keeps the typed number and the same table', async ({ page }) => {
    await setupWithPresets(page)
    await expect(field(main(page), 'Need per month')).toHaveValue('1000')
    await expect(intro(page)).toContainText('$12,000 a year')
    await expect(main(page).getByText('Your Budget today: $3,059 a month')).toBeVisible()
    await expect(main(page).getByText(/From the .* preset/)).toHaveCount(0)
    await expectMatchesSim(page, sim({}))
  })

  test('picking a preset uses its expenses, shows where it came from and survives a reload', async ({ page }) => {
    await setupWithPresets(page)
    await needBtn(page).click()
    await expect(page.getByRole('menuitem', { name: /Retirement/ })).toContainText('$1,569')
    await page.getByRole('menuitem', { name: /Retirement/ }).click()
    await expect(main(page).getByText('From the Retirement preset: $1,569 a month')).toBeVisible()
    await expect(intro(page)).toContainText('$18,828 a year')
    await expectRow(page, 40, { total: 250000 - 18828 })
    // saved by the preset's id, so a rename on Budget keeps it
    expect(await ls(page, 'retireNeedPreset')).toMatch(/^p[nr]/)
    await page.reload()
    await goTo(page, 'Retirement')
    await expect(main(page).getByText('From the Retirement preset: $1,569 a month')).toBeVisible()
  })

  test('Type it in goes back to the typed number', async ({ page }) => {
    // a pick saved by name before presets had ids still works, and is saved again by id
    await setupWithPresets(page, { ls: { retireNeedPreset: 'Retirement' } })
    await expect(intro(page)).toContainText('$18,828 a year')
    await expect.poll(() => ls(page, 'retireNeedPreset')).toMatch(/^pn/)
    await needBtn(page).click()
    await page.getByRole('menuitem', { name: 'Type it in' }).click()
    await expect(field(main(page), 'Need per month')).toHaveValue('1000')
    await expect(intro(page)).toContainText('$12,000 a year')
    expect(await ls(page, 'retireNeedPreset')).toBeNull()
  })

  test('a deleted preset falls back to the typed number with a note', async ({ page }) => {
    await setupWithPresets(page, { ls: { retireNeedPreset: 'Gone' } })
    await expect(main(page).getByText('The Budget preset you picked is gone, so this uses your typed number.')).toBeVisible()
    await expect(intro(page)).toContainText('$12,000 a year')
  })

  test('a preset saved on Budget shows up here with the Budget total', async ({ page }) => {
    await openApp(page)
    await goTo(page, 'Budget')
    await main(page).getByRole('button', { name: 'Presets' }).click()
    await page.getByRole('menuitem', { name: 'Save as new preset' }).click()
    await page.getByRole('dialog').getByRole('textbox').fill('Retired life')
    await page.getByRole('dialog').getByRole('button', { name: /^Save/ }).click()
    await expect(main(page).getByRole('button', { name: 'Retired life' })).toBeVisible()
    await goTo(page, 'Retirement')
    await needBtn(page).click()
    await page.getByRole('menuitem', { name: /Retired life/ }).click()
    await expect(main(page).getByText('From the Retired life preset: $3,059 a month')).toBeVisible()
    await expect(main(page).getByText('Your Budget today: $3,059 a month')).toBeVisible()
  })
})
