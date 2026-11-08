import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { RentalCostCalc } from './RentalCostCalc'

beforeEach(() => localStorage.clear())

describe('RentalCostCalc', () => {
  it('shows the default one month free deal', () => {
    renderApp(<RentalCostCalc />)
    expect(screen.getByText('Effective rental cost')).toBeInTheDocument()
    expect(screen.getByText('$2,291.67')).toBeInTheDocument()
    expect(screen.getByText('$27,500.00')).toBeInTheDocument()
  })
  it('recomputes when months free change and saves the value', async () => {
    renderApp(<RentalCostCalc />)
    const free = screen.getByLabelText(/Months free/)
    await userEvent.clear(free)
    await userEvent.type(free, '2')
    expect(screen.getByText('$2,083.33')).toBeInTheDocument()
    expect(screen.getByText('$25,000.00')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('ledger:rentalCalc') as string).monthsFree).toBe(2)
  })
  it('never goes below zero cost for more than 12 free months', async () => {
    renderApp(<RentalCostCalc />)
    const free = screen.getByLabelText(/Months free/)
    await userEvent.clear(free)
    await userEvent.type(free, '15')
    expect(screen.getAllByText('$0.00')).toHaveLength(2)
  })
  it('restores saved inputs', () => {
    localStorage.setItem('ledger:rentalCalc', JSON.stringify({ rent: 3000, monthsFree: 0 }))
    renderApp(<RentalCostCalc />)
    expect(screen.getByText('$36,000.00')).toBeInTheDocument()
  })
})
