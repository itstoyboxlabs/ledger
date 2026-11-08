import { render, screen } from '@testing-library/react'
import { SpendingCard } from '@/screens/marketing/ui/SpendingCard'

describe('SpendingCard', () => {
  it('shows the month total and the subscriptions', () => {
    render(<SpendingCard />)
    expect(screen.getByText('$6,405')).toBeInTheDocument()
    expect(screen.getByText('Planet Fitness', { exact: false })).toBeInTheDocument()
  })
})
