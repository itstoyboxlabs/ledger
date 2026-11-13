import { screen } from '@testing-library/react'
import { renderApp } from '@/test-utils/renderApp'
import { seedStorage } from '@/test-utils/seedStorage'
import { useBudgetSavingsMonthly } from './useBudgetSavingsMonthly'

function Probe() {
  return <span>saves {Math.round(useBudgetSavingsMonthly())}</span>
}

beforeEach(() => {
  localStorage.clear()
})

describe('useBudgetSavingsMonthly', () => {
  it('saves the whole leftover when it is not split', async () => {
    await seedStorage({ budget: { rows: [{ id: 'r1', name: 'Rent', amount: 2000 }] } })
    localStorage.setItem('ledger:budgetIncomeOverride', JSON.stringify({ active: 'manual', amount: 3000 }))
    renderApp(<Probe />)
    expect(await screen.findByText('saves 1000')).toBeInTheDocument()
  })
  it('saves only the savings share once the leftover is split', async () => {
    await seedStorage({
      budget: {
        rows: [{ id: 'r1', name: 'Rent', amount: 2000 }],
        leftover: [{ id: 'a', target: 'savings', pct: 30 }, { id: 'b', target: 'r1', pct: 70 }],
      },
    })
    localStorage.setItem('ledger:budgetIncomeOverride', JSON.stringify({ active: 'manual', amount: 3000 }))
    renderApp(<Probe />)
    expect(await screen.findByText('saves 300')).toBeInTheDocument()
  })
})
