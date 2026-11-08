import { render, screen } from '@testing-library/react'
import { BalancesCard } from '@/screens/marketing/ui/BalancesCard'

describe('BalancesCard', () => {
  it('shows what is owed and owned', () => {
    render(<BalancesCard />)
    expect(screen.getByText('Total owed')).toBeInTheDocument()
    expect(screen.getByText('Car loan · 6.2% · $480/mo')).toBeInTheDocument()
    expect(screen.getByText('401k · locked until 60')).toBeInTheDocument()
  })
})
