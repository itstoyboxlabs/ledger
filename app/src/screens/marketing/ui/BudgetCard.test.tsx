import { render, screen } from '@testing-library/react'
import { BudgetCard } from '@/screens/marketing/ui/BudgetCard'

describe('BudgetCard', () => {
  it('shows income, leftovers and rows', () => {
    render(<BudgetCard />)
    expect(screen.getByText('Monthly income')).toBeInTheDocument()
    expect(screen.getByText('$3,300')).toBeInTheDocument()
    expect(screen.getByText('· 2 sub items')).toBeInTheDocument()
  })
})
