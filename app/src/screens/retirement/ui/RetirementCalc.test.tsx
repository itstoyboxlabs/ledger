import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { seedStorage } from '@/test-utils/seedStorage'
import { loadSampleData } from '@/test-utils/loadSampleData'
import { RetirementCalc } from './RetirementCalc'
import { budgetExpensesOf } from '@/shared/utils/budgetExpensesOf'
import { fmt0 } from '@/shared/utils/fmt0'
import { presetIdFor } from '@/shared/utils/presetIdFor'
import type { Debt } from '@/shared/types/Debt'
import type { BudgetRow } from '@/shared/types/BudgetRow'

const stored = (k: string) => JSON.parse(localStorage.getItem(`ledger:${k}`) as string)

// a hand-checkable plan: 0% return, no tax, no Social Security, typed balances
const BASE = {
  age: 30, retireAge: 40, accessAge: 60, endAge: 90,
  start401k: 10000, startSavings: 50000, startFrom: 'typed', startOff: [],
  contrib401k: 5000, contribSavings: 20000, auto401k: false, autoSavings: false,
  withdrawMo: 1000, taxPct: 0, autoTax: false,
  ss: { on: false, claimAge: 67, auto: true, monthly: 0 },
  events: [],
}
const seedPlan = (o: Record<string, unknown> = {}) => {
  localStorage.setItem('ledger:retireCalc', JSON.stringify({ ...BASE, ...o }))
  localStorage.setItem('ledger:retirePortfolio', JSON.stringify([{ name: 'Cash', alloc: 100, perf: 0 }]))
}
const debt = (o: Partial<Debt> = {}): Debt => ({ id: 'd1', name: 'Card', balance: 1000, apr: 0, payment: 250, budgetRow: null, ...o })
// the cells of one year in the table: age, phase, 401k, contributions, growth, withdrawals, tax, total
const yearRow = (age: number) => {
  const table = screen.getByRole('region', { name: 'Year by year projection table' })
  const row = within(table).getAllByRole('row').find((r) => r.querySelector('td')?.textContent === String(age))
  return [...(row?.querySelectorAll('td') ?? [])].map((td) => td.textContent)
}
const chipText = (label: string) => screen.getByText(label).parentElement?.textContent

describe('RetirementCalc', () => {
  beforeAll(() => {
    // radix tooltips measure with ResizeObserver, which jsdom lacks
    globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
  })
  beforeEach(async () => {
    await seedStorage()
    localStorage.clear()
    loadSampleData()
  })

  it('renders the summary sentence and headline cards from the defaults', async () => {
    renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
    expect(screen.getByText(/You save until you retire, then take out \$60,000 a year/)).toBeInTheDocument()
    expect(screen.getByText(/Your 401k opens at 60 and what you take out of it is taxed as income/)).toBeInTheDocument()
    expect(screen.getByText('At retirement (60)')).toBeInTheDocument()
    expect(screen.getByText('Money lasts')).toBeInTheDocument()
    expect(screen.getByText('Left over at 70')).toBeInTheDocument()
  })

  it('shows the timeline fields with the default ages', () => {
    renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
    expect(screen.getByLabelText(/Current age/)).toHaveValue(35)
    expect(screen.getByLabelText(/Retire at/)).toHaveValue(60)
    expect(screen.getByLabelText(/Plan to age/)).toHaveValue(95)
  })

  it('saves an edited age to localStorage and updates the projection', async () => {
    renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
    const plan = screen.getByLabelText(/Plan to age/)
    await userEvent.clear(plan)
    await userEvent.type(plan, '75')
    await waitFor(() => expect(stored('retireCalc').endAge).toBe(75))
    expect(screen.queryByText('Left over at 80')).toBeNull()
    expect(screen.getByText('Left over at 70')).toBeInTheDocument()
  })

  it('adds and removes an event', async () => {
    renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Add event' }))
    await waitFor(() => expect(stored('retireCalc').events).toHaveLength(1))
    expect(stored('retireCalc').events[0]).toMatchObject({ kind: 'out', age: 36, repeat: 'once' })
    await userEvent.click(screen.getByRole('button', { name: 'Remove event' }))
    await waitFor(() => expect(stored('retireCalc').events).toHaveLength(0))
  })

  it('Find reports when no retire age keeps the money from running out', async () => {
    localStorage.setItem('ledger:retireCalc', JSON.stringify({ events: [], withdrawMo: 1000000000 }))
    renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Find' }))
    expect(await screen.findByText(/No retire age before/, {}, { timeout: 25000 })).toBeInTheDocument()
    expect(screen.getByLabelText(/Retire at/)).toHaveValue(60)
  }, 40000)

  it('Find moves the retire age when a safe age exists', async () => {
    localStorage.setItem('ledger:retireCalc', JSON.stringify({ events: [], withdrawMo: 0, retireAge: 90 }))
    renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Find' }))
    await waitFor(() => expect(stored('retireCalc').retireAge).toBe(36))
  })

  it('adds a fund row to the portfolio and persists it', async () => {
    renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
    await userEvent.click(screen.getAllByRole('button', { name: '+ Add fund' })[0])
    await waitFor(() => expect(stored('retirePortfolio')).toHaveLength(2))
  })

  it('reads a saved plan from localStorage', () => {
    localStorage.setItem('ledger:retireCalc', JSON.stringify({ events: [], age: 50, retireAge: 65, withdrawMo: 3000 }))
    renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
    expect(screen.getByLabelText(/Current age/)).toHaveValue(50)
    expect(screen.getByText(/take out \$36,000 a year/)).toBeInTheDocument()
  })

  it('keeps 401k money paid in after the access age', () => {
    seedPlan({ age: 55, retireAge: 65, endAge: 70, start401k: 100000, startSavings: 0, contrib401k: 10000, contribSavings: 0, withdrawMo: 0 })
    renderApp(<RetirementCalc debts={[]} />)
    expect(yearRow(70)[7]).toBe('$197,500')
    expect(yearRow(61)[2]).toBe('—')
  })

  it('opens the 401k from the start when already past the access age', () => {
    seedPlan({ age: 65, retireAge: 66, endAge: 70, start401k: 100000, startSavings: 0, contrib401k: 10000, contribSavings: 0 })
    renderApp(<RetirementCalc debts={[]} />)
    expect(yearRow(70)[7]).toBe('$47,500')
    expect(chipText('Money lasts')).toContain('to 70+')
  })

  it('shows the starting balances at retirement when retiring now', () => {
    seedPlan({ retireAge: 30 })
    renderApp(<RetirementCalc debts={[]} />)
    expect(chipText('At retirement (30)')).toContain('$50,000')
    expect(chipText('At retirement (30)')).toContain('+ $10,000 locked in 401k')
  })

  it('shows the 401k moving into savings in the Contributions of the access year', () => {
    seedPlan()
    renderApp(<RetirementCalc debts={[]} />)
    // 10,000 at 59, minus 12,000, plus the 58,750 401k
    expect(yearRow(60).slice(3)).toEqual(['$58,750', '$0', '−$12,000', '—', '$56,750'])
  })

  it('taxes 401k withdrawals as income and shows it in the Tax column', () => {
    // Texas, no savings: 60,000 a year out of a 1,000,000 pre-tax 401k
    seedPlan({ age: 60, retireAge: 60, endAge: 70, start401k: 1000000, startSavings: 0, contrib401k: 0, contribSavings: 0, withdrawMo: 5000 })
    renderApp(<RetirementCalc debts={[]} />)
    const tax = Number(yearRow(61)[6]?.replace(/[^0-9]/g, ''))
    expect(tax).toBeGreaterThan(5000)
    expect(tax).toBeLessThan(15000)
    const toggle = screen.getByRole('button', { name: 'Tax on 401k withdrawals' })
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(toggle).toHaveTextContent('Yes, taxed as income in Texas')
    expect(screen.getByText(/To spend \$60,000 a year from it you take out about/)).toBeInTheDocument()
  })

  it('the tax toggle turns the tax off and saves it', async () => {
    seedPlan({ age: 60, retireAge: 60, endAge: 70, start401k: 1000000, startSavings: 0, contrib401k: 0, contribSavings: 0, withdrawMo: 5000 })
    renderApp(<RetirementCalc debts={[]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Tax on 401k withdrawals' }))
    await waitFor(() => expect(stored('retireCalc').tax401k).toBe(false))
    expect(yearRow(61)[6]).toBe('—')
    // untaxed: the 401k is plain savings, 1,000,000 minus two years of 60,000
    expect(yearRow(61)[7]).toBe('$880,000')
    expect(screen.getByText(/Your 401k joins your savings at 60/)).toBeInTheDocument()
  })

  it('reads Roth and pre-tax accounts from Balances separately', () => {
    localStorage.setItem('ledger:assets', JSON.stringify([
      { id: 'a1', name: 'Old 401k', balance: 40000, pool: '401k' },
      { id: 'a2', name: 'Roth IRA', balance: 10000, pool: '401k', kind: 'roth' },
    ]))
    seedPlan({ startFrom: 'balances' })
    renderApp(<RetirementCalc debts={[]} />)
    expect(screen.getByText('Retirement account, pre-tax')).toBeInTheDocument()
    expect(screen.getByText('Retirement account, Roth')).toBeInTheDocument()
    expect(screen.getByText(/of it Roth/)).toHaveTextContent('($10,000 of it Roth)')
  })

  it('a payoff event outside the plan does not stop the debt being owed', async () => {
    seedPlan({ events: [{ id: 'e1', name: '', amount: 0, kind: 'debt', age: 20, repeat: 'once', years: 1, debtId: 'd1' }] })
    renderApp(<RetirementCalc debts={[debt({ balance: 6000, payment: 0 })]} />)
    expect(screen.getByText(/You owe \$6,000 on the Balances page/)).toBeInTheDocument()
  })

  it('an unticked debt frees no payment into savings', () => {
    seedPlan({ startFrom: 'balances', startOff: ['d1'] })
    renderApp(<RetirementCalc debts={[debt()]} />)
    // 1,000 at 250 a month clears in 4 months, which would free 2,000 in the first year
    expect(yearRow(30)[3]).toBe('$23,750')
  })

  it('a ticked debt frees its payment into savings once cleared', () => {
    seedPlan({ startFrom: 'balances' })
    renderApp(<RetirementCalc debts={[debt()]} />)
    expect(yearRow(30)[3]).toBe('$25,750')
  })

  it('debts come first: the savings pay a debt off in the first month and its payment is freed', () => {
    seedPlan()
    renderApp(<RetirementCalc debts={[debt()]} />)
    // 1,000 owed against 250 a month plus the savings, so it clears in month 1: 750 comes out of
    // savings that month and 11 months of 250 are freed
    expect(yearRow(30)[3]).toBe('$25,750')
    expect(yearRow(31)[3]).toBe('$28,000')
    expect(screen.getByText(/Debts come first/)).toBeInTheDocument()
    expect(screen.getByText('Paid off in 1 month (age 30).')).toBeInTheDocument()
  })

  it('a debt with an APR includes the interest in what the debt takes', () => {
    seedPlan()
    // 1,000 at 12% a year is 10 of interest in month 1: 1,010 owed, 760 from savings
    renderApp(<RetirementCalc debts={[debt({ apr: 12 })]} />)
    expect(yearRow(30)[3]).toBe('$25,740')
    expect(yearRow(31)[3]).toBe('$28,000')
    expect(screen.getByText('Paid off in 1 month (age 30).')).toBeInTheDocument()
  })

  it('a debt the savings cannot outrun takes all the savings and the caption says so', () => {
    seedPlan()
    // 12% of 1,000,000 is 10,000 a month in interest, far more than the payment and savings together
    renderApp(<RetirementCalc debts={[debt({ balance: 1000000, apr: 12, payment: 100 })]} />)
    // only the 5,000 into the 401k is left, none of the 20,000 savings
    expect(yearRow(35)[3]).toBe('$5,000')
    expect(screen.getByText('Never paid off with your payments and savings.')).toBeInTheDocument()
  })

  it('a payoff event names its age in the caption and frees the payment from then on', () => {
    seedPlan({ events: [{ id: 'e1', name: '', amount: 0, kind: 'debt', age: 33, repeat: 'once', years: 1, debtId: 'd1' }] })
    renderApp(<RetirementCalc debts={[debt({ balance: 6000, apr: 12, payment: 200 })]} />)
    expect(screen.getByText('Paid off at age 33 by your Pay off a debt event. Then $200 a month is freed up.')).toBeInTheDocument()
    // the payment covers the 60 a month interest, so the event pays the 6,000 balance
    expect(yearRow(33)[5]).toBe('−$6,000')
    expect(yearRow(33)[3]).toBe('$27,400')
  })

  it('a payoff event pays the interest a too small payment leaves unpaid', () => {
    seedPlan({ events: [{ id: 'e1', name: '', amount: 0, kind: 'debt', age: 31, repeat: 'once', years: 1, debtId: 'd1' }] })
    // 12,000 at 12% with 100 a month: 20 a month unpaid, growing at 1% a month for 12 months
    renderApp(<RetirementCalc debts={[debt({ balance: 12000, apr: 12, payment: 100 })]} />)
    const grow = 1.01 ** 12
    const owed = 12000 * grow - (100 * (grow - 1)) / 0.01
    expect(yearRow(31)[5]).toBe(`−${fmt0(owed)}`)
  })

  // the debt's payment is the linked Budget row, so the caption about a missing payment
  // going away means the Budget has loaded
  const budgetLoaded = () => waitFor(() => expect(screen.queryByText(/Add a payment on the Balances page/)).toBeNull())

  it('Auto savings and freed payments are zero when the leftover goes to something other than savings', async () => {
    await seedStorage({ budget: { rows: [{ id: 'r1', name: 'Rent', amount: 1000 }], leftover: [{ id: 'a1', target: 'r1', pct: 100 }] } })
    seedPlan({ autoSavings: true })
    renderApp(<RetirementCalc debts={[debt({ balance: 0, budgetRow: 'r1' })]} />)
    await budgetLoaded()
    expect(yearRow(31)[3]).toBe('$5,000')
  })

  it('Auto savings never goes below zero when the Budget is overspent', async () => {
    await seedStorage({ budget: { rows: [{ id: 'r1', name: 'Rent', amount: 10000000 }, { id: 'r2', name: 'Card', amount: 100 }] } })
    seedPlan({ autoSavings: true })
    renderApp(<RetirementCalc debts={[debt({ balance: 0, budgetRow: 'r2' })]} />)
    await budgetLoaded()
    // 5,000 into the 401k plus the card's freed 1,200, and nothing taken for the overspend
    expect(yearRow(31)[3]).toBe('$6,200')
  })

  it('clears the no safe age note when the inputs change', async () => {
    seedPlan({ withdrawMo: 100000 })
    renderApp(<RetirementCalc debts={[]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Find' }))
    expect(await screen.findByText(/No retire age before/, {}, { timeout: 25000 })).toBeInTheDocument()
    const need = screen.getByLabelText(/Need per month/)
    await userEvent.clear(need)
    await userEvent.type(need, '99000')
    await waitFor(() => expect(screen.queryByText(/No retire age before/)).toBeNull())
  }, 40000)

  it('adds a chip for the end age, once', () => {
    seedPlan({ endAge: 85 })
    const { unmount } = renderApp(<RetirementCalc debts={[]} />)
    expect(chipText('Left over at 85')).toContain('$')
    unmount()
    seedPlan({ endAge: 90 })
    renderApp(<RetirementCalc debts={[]} />)
    expect(screen.getAllByText('Left over at 90')).toHaveLength(1)
  })

  it('with no pay plan shows today\'s row in the one pay and saving card', () => {
    seedPlan()
    renderApp(<RetirementCalc debts={[]} />)
    expect(screen.getByText('Same pay until you retire. $80,000 a year from Take-home pay.')).toBeInTheDocument()
    expect(screen.getByText('Now, until you retire')).toBeInTheDocument()
    expect(screen.queryByText('Saving each year')).toBeNull()
    expect(screen.queryByRole('columnheader', { name: /^Pay/ })).toBeNull()
  })

  it('starts a pay plan from today\'s numbers', async () => {
    seedPlan()
    renderApp(<RetirementCalc debts={[]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Plan pay changes' }))
    await waitFor(() => expect(stored('retireCalc').pay.periods).toHaveLength(2))
    // typed 401k and savings carry over as typed dollars
    expect(stored('retireCalc').pay.periods[0]).toMatchObject({
      label: 'Now', fromAge: 30, toAge: 39, takeHomeFrom: 'typed', k401: 5000, saveFrom: 'typed', savings: 20000,
    })
    expect(stored('retireCalc').pay.periods[1]).toMatchObject({ fromAge: 39, toAge: 'retire', takeHomeFrom: 'typed' })
    expect(screen.queryByText('Now, until you retire')).toBeNull()
    // the same numbers as before the plan
    expect(yearRow(30)[3]).toBe('$23,750')
    expect(yearRow(31)[3]).toBe('$25,000')
    await userEvent.click(screen.getByRole('button', { name: 'Back to one period' }))
    await waitFor(() => expect(stored('retireCalc').pay.periods).toHaveLength(0))
    expect(screen.getByText('Now, until you retire')).toBeInTheDocument()
  })

  const P = { raisePct: 0, takeHomePreset: '', savePreset: '' }

  it('uses each period\'s typed 401k and savings in the table, grown by its raise', () => {
    seedPlan({
      pay: {
        periods: [
          { ...P, id: 'a', label: 'Now', fromAge: 30, toAge: 35, takeHomeFrom: 'typed', k401: 4000, saveFrom: 'typed', savings: 20000 },
          { ...P, id: 'b', label: 'Easier job', fromAge: 35, toAge: 'retire', raisePct: 10, takeHomeFrom: 'typed', k401: 0, saveFrom: 'typed', savings: 8000 },
        ],
      },
    })
    renderApp(<RetirementCalc debts={[]} />)
    expect(yearRow(34)[3]).toBe('$24,000')
    expect(yearRow(35)[3]).toBe('$8,000')
    expect(yearRow(36)[3]).toBe('$8,800')
  })

  it('takes the 401k from a Take-home preset and saving from a Budget preset', async () => {
    await seedStorage({
      budget: { rows: [{ id: 'r1', name: 'Rent', amount: 1000 }] },
      presets: {
        takeHome: [{ id: 'th1', name: 'Easier job', data: { salary: 50000, deductions: [] } }],
        expenses: [{ id: 'b1', name: 'Frugal', data: [{ id: 'r1', name: 'Rent', amount: 500 }] }],
      },
    })
    localStorage.setItem('ledger:budgetIncomeOverride', JSON.stringify({ active: 'manual', amount: 3000 }))
    seedPlan({
      pay: { periods: [{ ...P, id: 'a', label: 'Easier job', fromAge: 30, toAge: 'retire', takeHomeFrom: 'preset', takeHomePreset: 'th1', k401: 0, saveFrom: 'preset', savePreset: 'b1', savings: 0 }] },
    })
    renderApp(<RetirementCalc debts={[]} />)
    // no 401k line in the preset: nothing into the 401k. Savings are the 3,000 income less
    // what the preset's rows cost (with live subscriptions, as on the Budget page), times 12.
    const spent = budgetExpensesOf({ rows: [{ id: 'r1', name: 'Rent', amount: 500 } as BudgetRow] })
    await waitFor(() => expect(yearRow(31).slice(2, 4)).toEqual(['$10,000', fmt0((3000 - spent) * 12)]))
    expect(screen.getByRole('button', { name: 'Take-home preset for Easier job: Easier job' })).toBeInTheDocument()
  })

  it('a deleted preset falls back to the typed values with a note', async () => {
    await seedStorage({ presets: {} })
    seedPlan({
      pay: { periods: [{ ...P, id: 'a', label: 'Now', fromAge: 30, toAge: 'retire', takeHomeFrom: 'preset', takeHomePreset: 'gone', k401: 6000, saveFrom: 'typed', savings: 9000 }] },
    })
    renderApp(<RetirementCalc debts={[]} />)
    expect(screen.getByText('Its Take-home preset was deleted, so it uses the typed 401k.')).toBeInTheDocument()
    expect(yearRow(31)[3]).toBe('$15,000')
  })

  it('warns about a gap in the pay plan', () => {
    seedPlan({
      pay: {
        periods: [
          { ...P, id: 'a', label: 'Now', fromAge: 30, toAge: 33, takeHomeFrom: 'today', k401: 0, saveFrom: 'today', savings: 0 },
          { ...P, id: 'b', label: '', fromAge: 35, toAge: 'retire', takeHomeFrom: 'today', k401: 0, saveFrom: 'today', savings: 0 },
        ],
      },
    })
    renderApp(<RetirementCalc debts={[]} />)
    expect(screen.getByText("No period covers ages 33 to 34. Those years use today's 401k and saving.")).toBeInTheDocument()
  })

  it('a Budget preset picked on today\'s row starts a plan', async () => {
    globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
    await seedStorage({ presets: { expenses: [{ id: 'b1', name: 'Frugal', data: [] }] } })
    seedPlan()
    renderApp(<RetirementCalc debts={[]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Budget preset for Now: Typed' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Frugal' }))
    await waitFor(() => expect(stored('retireCalc').pay.periods).toHaveLength(1))
    expect(stored('retireCalc').pay.periods[0]).toMatchObject({ label: 'Now', fromAge: 30, toAge: 'retire', takeHomeFrom: 'typed', k401: 5000, saveFrom: 'preset', savePreset: 'b1', savings: 20000 })
  })

  it('typed savings on today\'s row switch back to today\'s Budget from the badge', async () => {
    globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
    seedPlan()
    renderApp(<RetirementCalc debts={[]} />)
    expect(screen.getByLabelText(/Into savings per year/)).toHaveValue(20000)
    await userEvent.click(screen.getByRole('button', { name: 'Budget preset for Now: Typed' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: "Today's Budget" }))
    await waitFor(() => expect(stored('retireCalc').autoSavings).toBe(true))
    expect(stored('retireCalc').pay.periods).toEqual([])
  })

  it('an old save with saving lines shows them as money-in events with the same numbers', () => {
    seedPlan({ extras: [{ id: 'a', name: 'IRA', amount: 2000, unit: 'yr', to: '401k' }, { id: 'b', name: 'Side job', amount: 250, unit: 'mo', to: 'savings' }] })
    renderApp(<RetirementCalc debts={[]} />)
    expect(screen.getAllByPlaceholderText('Event name').map((x) => (x as HTMLInputElement).value)).toEqual(['IRA', 'Side job'])
    // 10,000 + 3,750 + 2,000 in the 401k, and 20,000 + 3,000 into savings
    expect(yearRow(30).slice(2, 4)).toEqual(['$15,750', '$28,750'])
    expect(yearRow(40)[3]).toBe('—')
    expect(screen.getAllByText('Until you retire')).toHaveLength(2)
  })

  describe('Need per month from a Budget preset', () => {
    const PRESET_ROWS = [{ id: 'r', name: 'Rent', amount: 1500 }, { id: 'f', name: 'Food', amount: 500 }]
    // what Budget would show for the preset, live subscriptions from the sample data included
    const presetMonthly = () => budgetExpensesOf({ rows: PRESET_ROWS })
    beforeEach(async () => {
      await seedStorage({ budget: { rows: [{ id: 'r', name: 'Rent', amount: 2000 }] }, presets: { expenses: [{ name: 'Retirement', data: PRESET_ROWS }] } })
    })

    it('never picking a preset keeps the typed number and the same results', async () => {
      seedPlan()
      renderApp(<RetirementCalc debts={[]} />)
      expect(screen.getByLabelText(/Need per month/)).toHaveValue(1000)
      expect(screen.getByText(/then take out \$12,000 a year/)).toBeInTheDocument()
      // ages 40 to 59 take 12,000 a year: 250,000 at 39 leaves 238,000 at 40
      expect(yearRow(40)[7]).toBe('$238,000')
      expect(localStorage.getItem('ledger:retireNeedPreset')).toBe('null')
      await screen.findByText(/Your Budget today/)
    })

    it('picking a preset uses its expenses and is saved', async () => {
      seedPlan()
      renderApp(<RetirementCalc debts={[]} />)
      await userEvent.click(screen.getByRole('button', { name: 'Use a Budget preset' }))
      await userEvent.click(await screen.findByRole('menuitem', { name: /Retirement/ }))
      const m = presetMonthly()
      expect(screen.getByText(`From the Retirement preset: ${fmt0(m)} a month`)).toBeInTheDocument()
      expect(screen.getByText(new RegExp(`then take out \\${fmt0(m * 12)} a year`))).toBeInTheDocument()
      // saved by id, so a rename on Budget keeps it
      expect(stored('retireNeedPreset')).toBe(presetIdFor('Retirement'))
      // the typed number is kept for later
      expect(stored('retireCalc').withdrawMo).toBe(1000)
    })

    it('a pick saved by name before ids is saved again by id', async () => {
      seedPlan()
      localStorage.setItem('ledger:retireNeedPreset', JSON.stringify('Retirement'))
      renderApp(<RetirementCalc debts={[]} />)
      expect(await screen.findByText(`From the Retirement preset: ${fmt0(presetMonthly())} a month`)).toBeInTheDocument()
      await waitFor(() => expect(stored('retireNeedPreset')).toBe(presetIdFor('Retirement')))
    })

    it('a deleted preset falls back to the typed number with a note', async () => {
      seedPlan()
      localStorage.setItem('ledger:retireNeedPreset', JSON.stringify('Gone'))
      renderApp(<RetirementCalc debts={[]} />)
      expect(await screen.findByText('The Budget preset you picked is gone, so this uses your typed number.')).toBeInTheDocument()
      expect(screen.getByText(/then take out \$12,000 a year/)).toBeInTheDocument()
    })
  })

  describe('current age from About you', () => {
    const ageBadge = () => within(screen.getByText('Current age').closest('div.relative') as HTMLElement).getByRole('button', { name: 'Auto' })
    it('runs the plan from the About you age on the Balances date and keeps the typed age saved', () => {
      seedPlan()
      localStorage.setItem('ledger:birthDate', JSON.stringify('1990-01-01'))
      localStorage.setItem('ledger:assetsAsOf', JSON.stringify('2023-06-01'))
      renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
      expect(ageBadge()).toHaveAttribute('aria-pressed', 'true')
      expect(yearRow(33)[0]).toBe('33')
      expect(yearRow(32)).toEqual([])
      expect(stored('retireCalc').age).toBe(30)
    })
    it('goes back to the typed age when Auto is turned off', async () => {
      seedPlan()
      localStorage.setItem('ledger:birthDate', JSON.stringify('1990-01-01'))
      localStorage.setItem('ledger:assetsAsOf', JSON.stringify('2023-06-01'))
      renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
      await userEvent.click(ageBadge())
      expect(ageBadge()).toHaveAttribute('aria-pressed', 'false')
      expect(screen.getByLabelText(/Current age/)).toHaveValue(30)
      expect(yearRow(30)[0]).toBe('30')
    })
    it('uses the typed age when About you has none', () => {
      seedPlan()
      renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
      expect(screen.getByLabelText(/Current age/)).toHaveValue(30)
    })
  })

  it('taxes 401k withdrawals on the joint brackets for Married filing jointly', () => {
    seedPlan({ tax401k: true, startSavings: 0, contribSavings: 0, start401k: 2000000, contrib401k: 0, withdrawMo: 8000, retireAge: 60 })
    const single = renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
    const taxSingle = Number((yearRow(61)[6] ?? '').replace(/[^0-9]/g, ''))
    single.unmount()
    localStorage.setItem('ledger:filingStatus', '"mfj"')
    renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
    const taxMfj = Number((yearRow(61)[6] ?? '').replace(/[^0-9]/g, ''))
    expect(taxSingle).toBeGreaterThan(0)
    expect(taxMfj).toBeLessThan(taxSingle)
  })

  it('Contributions grow a year on today\'s row carries into the plan and back', async () => {
    seedPlan({ raisePct: 2 })
    renderApp(<RetirementCalc debts={[]} />)
    expect(screen.getByLabelText(/Contributions grow a year/)).toHaveValue(2)
    // 25,000 at 31 grows 2% a year
    expect(yearRow(32)[3]).toBe(fmt0(25000 * 1.02 ** 2))
    await userEvent.click(screen.getByRole('button', { name: 'Plan pay changes' }))
    await waitFor(() => expect(stored('retireCalc').pay.periods.map((p: { raisePct: number }) => p.raisePct)).toEqual([2, 2]))
    const first = screen.getByLabelText(/Contributions grow a year for Now/)
    await userEvent.clear(first)
    await userEvent.type(first, '4')
    await userEvent.click(screen.getByRole('button', { name: 'Back to one period' }))
    await waitFor(() => expect(stored('retireCalc').pay.periods).toEqual([]))
    expect(stored('retireCalc').raisePct).toBe(4)
    expect(screen.getByLabelText(/Contributions grow a year/)).toHaveValue(4)
  })
})
