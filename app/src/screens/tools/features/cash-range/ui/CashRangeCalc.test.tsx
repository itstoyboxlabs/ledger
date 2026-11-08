import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { seedStorage } from '@/test-utils/seedStorage'
import { CashRangeCalc } from './CashRangeCalc'

const SEED = {
  budget: {
    rows: [
      { id: 'r1', name: 'Rent', amount: 1000, day: 1 },
      { id: 'r2', name: 'Gym', amount: 50, day: 20 },
      { id: 'r3', name: 'Phone', amount: 30 },
      { id: 'r4', name: 'Secret', amount: 999, day: 2, hidden: true },
      { id: 'r5', name: 'Groceries', amount: 600, prorate: true },
    ],
  },
}

beforeEach(async () => {
  await seedStorage(SEED)
  localStorage.clear()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-08T12:00:00'))
})
afterEach(() => vi.useRealTimers())

describe('CashRangeCalc', () => {
  it('shows a loading state first, then the 1st to 15th rows', async () => {
    renderApp(<CashRangeCalc />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(await screen.findByText('Rent')).toBeInTheDocument()
    expect(screen.getByText('on the 1st')).toBeInTheDocument()
    expect(screen.getByText('undated — assumed')).toBeInTheDocument()
    expect(screen.getByText('prorated, 15 days')).toBeInTheDocument()
    expect(screen.queryByText('Gym')).toBeNull()
    expect(screen.queryByText('Secret')).toBeNull()
    // 1000 + 30 + 600 * 15 / 30
    expect(screen.getAllByText('$1,330.00')).toHaveLength(2)
    expect(screen.getByText('Day 1 – 15 (15 days)')).toBeInTheDocument()
  })
  it('sorts rows by amount, largest first', async () => {
    renderApp(<CashRangeCalc />)
    await screen.findByText('Rent')
    const names = screen.getAllByRole('row').map((r) => r.textContent)
    expect(names[1]).toContain('Rent')
    expect(names[2]).toContain('Groceries')
    expect(names[3]).toContain('Phone')
  })
  it('the second-half button uses the real month length', async () => {
    renderApp(<CashRangeCalc />)
    await screen.findByText('Rent')
    await userEvent.click(screen.getByRole('button', { name: /16th/ }))
    expect(screen.getByText('Day 16 – 30 (15 days)')).toBeInTheDocument()
    expect(screen.getByText('on the 20th')).toBeInTheDocument()
    expect(screen.queryByText('Rent')).toBeNull()
  })
  it('cash on hand adds up terms and shows the leftover', async () => {
    renderApp(<CashRangeCalc />)
    await screen.findByText('Rent')
    await userEvent.type(screen.getByPlaceholderText(/3000 paycheck/), '1000 + 500')
    expect(screen.getByText('= $1,500')).toBeInTheDocument()
    expect(screen.getByText('Leftover after cash on hand')).toBeInTheDocument()
    expect(screen.getByText('$170.00')).toBeInTheDocument()
  })
  it('a shortfall shows a negative leftover', async () => {
    renderApp(<CashRangeCalc />)
    await screen.findByText('Rent')
    await userEvent.type(screen.getByPlaceholderText(/3000 paycheck/), '1000')
    expect(screen.getByText('−$330.00')).toBeInTheDocument()
  })
  it('flags a backwards range', async () => {
    localStorage.setItem('ledger:cashRange', JSON.stringify({ fromDay: 20, toDay: 10, cashOnHand: 0, cashExpr: '' }))
    renderApp(<CashRangeCalc />)
    expect(await screen.findByText(/"To day" must be on or after "From day"/)).toBeInTheDocument()
    expect(screen.queryByRole('table')).toBeNull()
  })
  it('seeds cash on hand from the legacy plain number', async () => {
    localStorage.setItem('ledger:cashRange', JSON.stringify({ fromDay: 1, toDay: 15, cashOnHand: 2000, cashExpr: '' }))
    renderApp(<CashRangeCalc />)
    await screen.findByText('Rent')
    expect(screen.getByPlaceholderText(/3000 paycheck/)).toHaveValue('2000')
    expect(screen.getByText('$670.00')).toBeInTheDocument()
  })
})
