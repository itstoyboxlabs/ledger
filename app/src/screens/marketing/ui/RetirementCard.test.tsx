import { render, screen } from '@testing-library/react'
import { RetirementCard } from '@/screens/marketing/ui/RetirementCard'

describe('RetirementCard', () => {
  it('shows the year by year table', () => {
    render(<RetirementCard />)
    expect(screen.getAllByRole('row')).toHaveLength(7)
    expect(screen.getByText('−$80,000 · house')).toHaveClass('neg')
  })
})
