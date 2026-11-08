import { render, screen } from '@testing-library/react'
import { SubscriptionsFound } from '@/screens/marketing/ui/SubscriptionsFound'

describe('SubscriptionsFound', () => {
  it('lists each subscription with its price', () => {
    render(<SubscriptionsFound items={[{ name: 'Netflix', price: '$17.99' }]} />)
    expect(screen.getByText('Subscriptions found')).toBeInTheDocument()
    expect(screen.getByText('$17.99')).toBeInTheDocument()
  })
})
