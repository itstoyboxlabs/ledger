import { render, screen } from '@testing-library/react'
import { MarketingNav } from '@/screens/marketing/ui/MarketingNav'

describe('MarketingNav', () => {
  it('links to the app, the repo and the tutorial', () => {
    render(<MarketingNav />)
    expect(screen.getByRole('link', { name: 'Try Ledger' })).toHaveAttribute('href', '/app')
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/itstoyboxlabs/ledger')
    expect(screen.getByRole('link', { name: 'Tutorial' })).toHaveAttribute('href', '/tutorial')
  })
  it('marks the active page', () => {
    render(<MarketingNav active="tutorial" />)
    expect(screen.getByRole('link', { name: 'Tutorial' })).toHaveClass('on')
    expect(screen.getByRole('link', { name: 'FAQ' })).not.toHaveClass('on')
  })
})
