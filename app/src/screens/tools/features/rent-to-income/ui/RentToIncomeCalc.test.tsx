import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { RentToIncomeCalc } from './RentToIncomeCalc'

beforeEach(() => localStorage.clear())

describe('RentToIncomeCalc', () => {
  it('clears the 40x rule by default', () => {
    renderApp(<RentToIncomeCalc />)
    expect(screen.getByText('Your income is 40.0× the rent')).toBeInTheDocument()
    expect(screen.getByText('Clears the 40× they ask for')).toBeInTheDocument()
    expect(screen.getByText('Max rent at 40×')).toBeInTheDocument()
    expect(screen.getByText('$2,500.00')).toBeInTheDocument()
  })
  it('reports being short when rent is higher', async () => {
    renderApp(<RentToIncomeCalc />)
    const rent = screen.getByLabelText(/Monthly rent/)
    await userEvent.clear(rent)
    await userEvent.type(rent, '4000')
    expect(screen.getByText('Your income is 25.0× the rent')).toBeInTheDocument()
    expect(screen.getByText('Short of the 40× they ask for')).toBeInTheDocument()
  })
  it('zero rent shows 0.0x without dividing by zero', async () => {
    renderApp(<RentToIncomeCalc />)
    const rent = screen.getByLabelText(/Monthly rent/)
    await userEvent.clear(rent)
    await userEvent.type(rent, '0')
    expect(screen.getByText('Your income is 0.0× the rent')).toBeInTheDocument()
  })
  it('swap switches to max rent mode and hides the rent field', async () => {
    renderApp(<RentToIncomeCalc />)
    await userEvent.click(screen.getByRole('button', { name: /Swap/ }))
    expect(screen.queryByLabelText(/Monthly rent/)).toBeNull()
    expect(screen.getByText('Max monthly rent at 40×')).toBeInTheDocument()
    expect(screen.getByText('$30,000.00')).toBeInTheDocument()
  })
  it('a zero multiple gives zero max rent', async () => {
    renderApp(<RentToIncomeCalc />)
    const times = screen.getByLabelText(/They ask for/)
    await userEvent.clear(times)
    await userEvent.type(times, '0')
    expect(screen.getByText('Max rent at 0×')).toBeInTheDocument()
    expect(screen.getByText('$0.00')).toBeInTheDocument()
  })
})
