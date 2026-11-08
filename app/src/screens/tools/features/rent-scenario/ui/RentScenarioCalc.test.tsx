import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Debt } from '@/shared/types/Debt'
import { renderApp } from '@/test-utils/renderApp'
import { seedStorage } from '@/test-utils/seedStorage'
import { RentScenarioCalc } from './RentScenarioCalc'

const SEED = {
  budget: {
    rows: [
      { id: 'rent', name: 'Rent', amount: 2000 },
      { id: 'food', name: 'Food', amount: 500 },
      { id: 'gym', name: 'Gym', amount: 100 },
      { id: 'old', name: 'Old', amount: 700, hidden: true },
    ],
  },
}

beforeEach(async () => {
  await seedStorage(SEED)
  localStorage.clear()
  localStorage.setItem('ledger:rentScenario3', JSON.stringify({ from: 1000, to: 3000, step: 1000, rentRow: '' }))
})

const debts: Debt[] = [{ id: 'd', name: 'Card', balance: 1200, apr: 0, payment: 0, budgetRow: null }]

describe('RentScenarioCalc', () => {
  it('loads, then lists one row per rent step', async () => {
    renderApp(<RentScenarioCalc debts={[]} />)
    expect(screen.getByText('Loading rent scenarios…')).toBeInTheDocument()
    expect(await screen.findByText('Rent scenarios')).toBeInTheDocument()
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows).toHaveLength(3)
    expect(rows[0]).toHaveTextContent('$1,000')
    expect(rows[2]).toHaveTextContent('$3,000')
  })
  it('links the row named Rent and marks the closest scenario', async () => {
    renderApp(<RentScenarioCalc debts={[]} />)
    expect(await screen.findByText(/closest to current \(\$2,000\)/)).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('ledger:rentScenario3') as string).rentRow).toBe('rent')
  })
  it('non-rent expenses exclude the rent row and hidden rows', async () => {
    renderApp(<RentScenarioCalc debts={[]} />)
    expect(await screen.findByRole('button', { name: /Expenses used · \$600\.00\/mo/ })).toBeInTheDocument()
  })
  it('each $1,000 of rent takes $1,000 off what is left per month', async () => {
    renderApp(<RentScenarioCalc debts={[]} />)
    await screen.findByText('Rent scenarios')
    const left = (i: number) => Number((screen.getAllByRole('row')[i + 1].querySelectorAll('td')[1].textContent ?? '').replace('−', '-').replace(/[^0-9.-]/g, ''))
    expect(left(0) - left(1)).toBe(1000)
    expect(left(1) - left(2)).toBe(1000)
  })
  it('uses a typed monthly income: left over, debt payoff time, and a dash when negative', async () => {
    localStorage.setItem('ledger:budgetIncomeOverride', JSON.stringify({ active: 'manual', amount: 5000 }))
    localStorage.setItem('ledger:rentScenario3', JSON.stringify({ from: 1000, to: 5000, step: 4000, rentRow: '' }))
    renderApp(<RentScenarioCalc debts={debts} />)
    await screen.findByText('Rent scenarios')
    const rows = screen.getAllByRole('row').slice(1)
    // 5000 - 600 - 1000 = 3400 left, 1200 debt clears in 1 month
    expect(rows[0]).toHaveTextContent('$3,400.00')
    expect(rows[0]).toHaveTextContent('1m')
    // 5000 - 600 - 5000 = -600
    expect(rows[1]).toHaveTextContent('−$600.00')
    expect(rows[1].querySelectorAll('td')[3].textContent).toBe('—')
  })
  it('overriding an expense is flagged and can be reset', async () => {
    renderApp(<RentScenarioCalc debts={[]} />)
    await screen.findByText('Rent scenarios')
    await userEvent.click(screen.getByRole('button', { name: /Expenses used/ }))
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.queryByText('Old')).toBeNull()
    const foodInput = screen.getAllByRole('spinbutton').find((i) => (i as HTMLInputElement).value === '500') as HTMLElement
    await userEvent.clear(foodInput)
    await userEvent.type(foodInput, '300')
    expect(screen.getByText('1 overridden')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Expenses used · \$400\.00\/mo/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Reset to budget defaults' }))
    expect(screen.queryByText('1 overridden')).toBeNull()
    expect(screen.getByRole('button', { name: /Expenses used · \$600\.00\/mo/ })).toBeInTheDocument()
  })
})
