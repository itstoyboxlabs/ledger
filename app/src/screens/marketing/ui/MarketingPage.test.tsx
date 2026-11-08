import { render, screen } from '@testing-library/react'
import { MarketingPage } from '@/screens/marketing/ui/MarketingPage'

describe('MarketingPage', () => {
  it('shows the landing page by default', () => {
    render(<MarketingPage route="home" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('A private financial planning app')
  })
  it('shows the tutorial for the tutorial route', () => {
    render(<MarketingPage route="tutorial" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Learn Ledger')
  })
})
