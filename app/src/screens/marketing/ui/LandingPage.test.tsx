import { render, screen, fireEvent } from '@testing-library/react'
import { LandingPage } from '@/screens/marketing/ui/LandingPage'

describe('LandingPage', () => {
  it('shows the hero and links to the app and the repo', () => {
    render(<LandingPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('A private financial planning app for real life.')
    expect(screen.getAllByRole('link', { name: 'Try Ledger' })[0]).toHaveAttribute('href', '/app')
    expect(screen.getAllByRole('link', { name: /GitHub/ })[0]).toHaveAttribute('href', 'https://github.com/itstoyboxlabs/ledger')
  })
  it('switches the feature tab', () => {
    const { container } = render(<LandingPage />)
    fireEvent.click(screen.getByRole('tab', { name: 'Budget' }))
    expect(container.querySelector('.panel.on')).toHaveAttribute('data-p', 'budget')
  })
  it('opens Retirement from the long-term plan button', () => {
    const { container } = render(<LandingPage />)
    fireEvent.click(screen.getByRole('link', { name: 'Explore Retirement' }))
    expect(container.querySelector('.panel.on')).toHaveAttribute('data-p', 'retirement')
  })
})
