import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { seedStorage } from '@/test-utils/seedStorage'
import { loadSampleData } from '@/test-utils/loadSampleData'
import { RetirementCalc } from './RetirementCalc'
import type { Debt } from '@/shared/types/Debt'

const stored = (k: string) => JSON.parse(localStorage.getItem(`ledger:${k}`) as string)

// a hand-checkable plan: 0% return, no tax, no Social Security, typed balances
const BASE = {
  age: 30, retireAge: 40, accessAge: 60, endAge: 90,
  start401k: 10000, startSavings: 50000, startFrom: 'typed', startOff: [],
  contrib401k: 5000, contribSavings: 20000, auto401k: false, autoSavings: false,
  withdrawMo: 1000, taxPct: 0, autoTax: false,
  ss: { on: false, claimAge: 67, auto: true, monthly: 0 },
  events: [], extras: [],
}
const seedPlan = (o: Record<string, unknown> = {}) => {
  localStorage.setItem('ledger:retireCalc', JSON.stringify({ ...BASE, ...o }))
  localStorage.setItem('ledger:retirePortfolio', JSON.stringify([{ name: 'Cash', alloc: 100, perf: 0 }]))
}
const debt = (o: Partial<Debt> = {}): Debt => ({ id: 'd1', name: 'Card', balance: 1000, apr: 0, payment: 250, budgetRow: null, ...o })
// the cells of one year in the table: age, phase, 401k, contributions, growth, withdrawals, total
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
    expect(screen.getByText(/Your 401k joins your\s+savings at 60/)).toBeInTheDocument()
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
    expect(await screen.findByText(/No retire age before/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Retire at/)).toHaveValue(60)
  })

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
    expect(yearRow(70)[6]).toBe('$197,500')
    expect(yearRow(61)[2]).toBe('—')
  })

  it('opens the 401k from the start when already past the access age', () => {
    seedPlan({ age: 65, retireAge: 66, endAge: 70, start401k: 100000, startSavings: 0, contrib401k: 10000, contribSavings: 0 })
    renderApp(<RetirementCalc debts={[]} />)
    expect(yearRow(70)[6]).toBe('$47,500')
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
    expect(yearRow(60).slice(3)).toEqual(['$58,750', '$0', '−$12,000', '$56,750'])
  })

  it('a payoff event outside the plan does not take the debt out of the hole', async () => {
    localStorage.setItem('ledger:retireIncludeDebt', 'true')
    seedPlan({ events: [{ id: 'e1', name: '', amount: 0, kind: 'debt', age: 20, repeat: 'once', years: 1, debtId: 'd1' }] })
    renderApp(<RetirementCalc debts={[debt({ balance: 6000, payment: 0 })]} />)
    expect(screen.getByText(/Yes, owing \$6,000/)).toBeInTheDocument()
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
    expect(await screen.findByText(/No retire age before/)).toBeInTheDocument()
    const need = screen.getByLabelText(/Need per month/)
    await userEvent.clear(need)
    await userEvent.type(need, '99000')
    await waitFor(() => expect(screen.queryByText(/No retire age before/)).toBeNull())
  })

  it('adds a chip for the end age, once', () => {
    seedPlan({ endAge: 85 })
    const { unmount } = renderApp(<RetirementCalc debts={[]} />)
    expect(chipText('Left over at 85')).toContain('$')
    unmount()
    seedPlan({ endAge: 90 })
    renderApp(<RetirementCalc debts={[]} />)
    expect(screen.getAllByText('Left over at 90')).toHaveLength(1)
  })
})
