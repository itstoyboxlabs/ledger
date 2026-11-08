import { render, screen } from '@testing-library/react'
import { MarketingFooter } from '@/screens/marketing/ui/MarketingFooter'

describe('MarketingFooter', () => {
  it('shows the Toybox Labs line and email', () => {
    render(<MarketingFooter />)
    expect(screen.getByText(/Made by Toybox Labs/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'itstoyboxlabs@gmail.com' })).toHaveAttribute('href', 'mailto:itstoyboxlabs@gmail.com')
  })
})
