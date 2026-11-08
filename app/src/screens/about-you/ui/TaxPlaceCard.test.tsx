import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { TaxPlaceCard } from './TaxPlaceCard'

beforeEach(() => localStorage.clear())

describe('TaxPlaceCard', () => {
  it('defaults to Texas', () => {
    renderApp(<TaxPlaceCard />)
    expect(screen.getByRole('heading', { level: 2, name: /Tax state and city/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /State\s*Texas/ })).toBeInTheDocument()
  })

  it('reads the state saved by the old Balances picker', () => {
    localStorage.setItem('ledger:taxState', '"ny-nyc"')
    renderApp(<TaxPlaceCard />)
    expect(screen.getByRole('button', { name: /State\s*New York \(NYC\)/ })).toBeInTheDocument()
    expect(screen.getByText(/plus NYC/)).toBeInTheDocument()
  })

  it('saves a new state under the same key', async () => {
    renderApp(<TaxPlaceCard />)
    await userEvent.click(screen.getByRole('button', { name: /State/ }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'California' }))
    expect(JSON.parse(localStorage.getItem('ledger:taxState') ?? 'null')).toBe('ca')
  })

  it('names the filing status', () => {
    localStorage.setItem('ledger:filingStatus', '"mfj"')
    renderApp(<TaxPlaceCard />)
    expect(screen.getByText(/married filing jointly/)).toBeInTheDocument()
  })
})
