import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { StockCalc } from './StockCalc'

beforeEach(() => localStorage.clear())
const save = (v: unknown) => localStorage.setItem('ledger:stockCalc2', JSON.stringify(v))

describe('StockCalc', () => {
  it('defaults to options with nothing to pay out', () => {
    renderApp(<StockCalc taxState="tx" />)
    expect(screen.getByText('Equity payout')).toBeInTheDocument()
    expect(screen.getByText('Delta per share')).toBeInTheDocument()
    expect(screen.getByLabelText(/Your price \(strike\)/)).toBeInTheDocument()
    expect(screen.getByText('Net profit (after tax)')).toBeInTheDocument()
    expect(screen.getAllByText('$0.00').length).toBeGreaterThan(0)
  })
  it('computes delta and gross for options', () => {
    save({ type: 'nso', exit: 20, strike: 10, shares: 1000, salary: 100000, years: 1, heldOver: false })
    renderApp(<StockCalc taxState="tx" />)
    expect(screen.getByText('$10.00')).toBeInTheDocument()
    expect(screen.getByText('$10,000.00')).toBeInTheDocument()
  })
  it('RSUs have no strike field and say Shares', () => {
    save({ type: 'rsu', exit: 20, strike: 10, shares: 500, salary: 100000, years: 1, heldOver: false })
    renderApp(<StockCalc taxState="tx" />)
    expect(screen.queryByLabelText(/Your price/)).toBeNull()
    expect(screen.getByLabelText('Shares')).toBeInTheDocument()
    expect(screen.getByText('Value per share')).toBeInTheDocument()
    expect(screen.getByText('$10,000.00')).toBeInTheDocument()
  })
  it('names the tax state in the notes', () => {
    renderApp(<StockCalc taxState="ny" />)
    expect(screen.getByText(/in New York\./)).toBeInTheDocument()
  })
  it('ISO shows the held-over toggle that changes the explanation', async () => {
    save({ type: 'iso', exit: 20, strike: 10, shares: 1000, salary: 100000, years: 1, heldOver: false })
    renderApp(<StockCalc taxState="tx" />)
    expect(screen.getByText(/Turn on the toggle/)).toBeInTheDocument()
    expect(screen.getByText(/No Social Security or Medicare on ISO shares/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('checkbox', { name: /Held over a year/ }))
    expect(screen.getByText(/long-term capital gain/)).toBeInTheDocument()
  })
  it('splits net over the payout years', () => {
    save({ type: 'nso', exit: 20, strike: 10, shares: 1000, salary: 0, years: 2, heldOver: false })
    renderApp(<StockCalc taxState="tx" />)
    expect(screen.getByText('Net per year (over 2)')).toBeInTheDocument()
  })
  it('uses the joint tables and says so for Married filing jointly', () => {
    save({ type: 'nso', exit: 20, strike: 10, shares: 10000, salary: 100000, years: 1, heldOver: false })
    localStorage.setItem('ledger:filingStatus', '"mfj"')
    const go = vi.fn()
    renderApp(<StockCalc taxState="tx" filing="mfj" goToAboutYou={go} />)
    expect(screen.getByText(/Using Married filing jointly from About you/)).toBeInTheDocument()
  })
  it('shows no filing note for a single filer', () => {
    renderApp(<StockCalc taxState="tx" />)
    expect(screen.queryByText(/Married filing jointly/)).not.toBeInTheDocument()
  })
})
