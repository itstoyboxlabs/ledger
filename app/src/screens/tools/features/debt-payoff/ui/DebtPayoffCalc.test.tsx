import { screen, waitFor } from '@testing-library/react'
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
  it('unticking a debt takes it out of the total', async () => {
    renderApp(<DebtPayoffCalc debts={[debt(), debt({ id: 'd2', name: 'Loan', balance: 500 })]} />)
    await userEvent.click(screen.getByText('All debts'))
    await userEvent.click(await screen.findByRole('menuitemcheckbox', { name: 'Loan' }))
    expect(screen.getByText('$1,000.00')).toBeInTheDocument()
  })
  it('keeps the last ticked debt', async () => {
    renderApp(<DebtPayoffCalc debts={[debt()]} />)
    await userEvent.click(screen.getByText('All debts'))
    await userEvent.click(await screen.findByRole('menuitemcheckbox', { name: 'Card' }))
    expect(screen.getByText('$1,000.00')).toBeInTheDocument()
  })
  it('can take the contribution from the Budget savings', async () => {
    localStorage.setItem('ledger:budgetIncomeOverride', JSON.stringify({ active: 'manual', amount: 1000 }))
    renderApp(<DebtPayoffCalc debts={[debt()]} />)
    await userEvent.click(screen.getByText('What I pay now'))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Budget savings' }))
    // 1000 income less the 250 row
    await waitFor(() => expect(screen.getByLabelText(/Contribution per month/)).toHaveValue(750))
    expect(screen.getByText('2m')).toBeInTheDocument()
    expect(screen.getByText(/Retirement saves this same money/)).toBeInTheDocument()
  })
  it('reads the amounts saved by the first version', () => {
    localStorage.setItem('ledger:debtPayoff', JSON.stringify({ pick: 'd2', perMonth: 0, custom: { d2: 500 } }))
    renderApp(<DebtPayoffCalc debts={[debt(), debt({ id: 'd2', name: 'Loan', balance: 1500 })]} />)
    expect(screen.getByText('$1,500.00')).toBeInTheDocument()
    expect(screen.getByLabelText(/Contribution per month/)).toHaveValue(500)
  })
  it('lists when each debt clears, in the order given, and rolls payments on', () => {
    // 1,000 and 500 with 150 a month: the first gets 100 and the second 50 until the first clears
    renderApp(<DebtPayoffCalc debts={[debt({ payment: 100 }), debt({ id: 'd2', name: 'Loan', balance: 500, payment: 50 })]} />)
    expect(screen.getByText('1. Card')).toBeInTheDocument()
    expect(screen.getByText('2. Loan')).toBeInTheDocument()
    // 10 months in all: 1,500 over 150 a month, since a cleared debt's payment rolls on
    expect(screen.getByText('10m')).toBeInTheDocument()
  })
})
