import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Debt } from '@/shared/types/Debt'
import { renderApp } from '@/test-utils/renderApp'
import { seedStorage } from '@/test-utils/seedStorage'
import { DebtPayoffCalc } from './DebtPayoffCalc'

beforeEach(async () => {
  await seedStorage({ budget: { rows: [{ id: 'b1', name: 'Card payment', amount: 250 }] } })
  localStorage.clear()
})

const debt = (o?: Partial<Debt>): Debt => ({ id: 'd1', name: 'Card', balance: 1000, apr: 0, payment: 100, budgetRow: null, ...o })

describe('DebtPayoffCalc', () => {
  it('asks for a debt when there are none', () => {
    renderApp(<DebtPayoffCalc debts={[]} />)
    expect(screen.getByText(/Add a debt on the Balances page/)).toBeInTheDocument()
  })
  it('uses the saved payment: 1000 at 100 a month is 10 months', () => {
    renderApp(<DebtPayoffCalc debts={[debt()]} />)
    expect(screen.getByText('$1,000.00')).toBeInTheDocument()
    expect(screen.getByText('10m')).toBeInTheDocument()
    expect(screen.getByLabelText(/Contribution per month/)).toHaveValue(100)
  })
  it('shows years and months for long payoffs', () => {
    renderApp(<DebtPayoffCalc debts={[debt({ balance: 3000 })]} />)
    expect(screen.getByText('2y 6m')).toBeInTheDocument()
  })
  it('adds interest into the time', () => {
    renderApp(<DebtPayoffCalc debts={[debt({ apr: 12 })]} />)
    expect(screen.getByText('11m')).toBeInTheDocument()
    expect(screen.getByText('Time to pay off (includes interest)')).toBeInTheDocument()
  })
  it('shows a dash when the payment never clears the debt', () => {
    renderApp(<DebtPayoffCalc debts={[debt({ balance: 12000, apr: 12, payment: 100 })]} />)
    expect(screen.getAllByText('—')).toHaveLength(2)
  })
  it('reads the payment from a linked budget row', async () => {
    renderApp(<DebtPayoffCalc debts={[debt({ budgetRow: 'b1', payment: 0 })]} />)
    expect(await screen.findByText('4m')).toBeInTheDocument()
    expect(screen.getByLabelText(/Contribution per month/)).toHaveValue(250)
  })
  it('a typed contribution overrides the usual payment', async () => {
    renderApp(<DebtPayoffCalc debts={[debt(), debt({ id: 'd2', name: 'Loan', balance: 500 })]} />)
    expect(screen.getByText('$1,500.00')).toBeInTheDocument()
    const c = screen.getByLabelText(/Contribution per month/)
    await userEvent.clear(c)
    await userEvent.type(c, '500')
    expect(screen.getByText('3m')).toBeInTheDocument()
  })
  it('dates the payoff by calendar month from the 31st', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-31T12:00:00'))
    renderApp(<DebtPayoffCalc debts={[debt({ balance: 400 })]} />)
    expect(screen.getByText('Feb 2027')).toBeInTheDocument()
    vi.useRealTimers()
  })
  it('uses the typed payment when the linked budget row was deleted', async () => {
    renderApp(<DebtPayoffCalc debts={[debt({ budgetRow: 'deleted', payment: 100 })]} />)
    expect(await screen.findByText('10m')).toBeInTheDocument()
  })
})
