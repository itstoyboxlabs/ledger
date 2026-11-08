import { render, screen } from '@testing-library/react'
import { HowSection } from '@/screens/marketing/ui/HowSection'

describe('HowSection', () => {
  it('shows three steps and a link to the tutorial', () => {
    render(<HowSection />)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3)
    expect(screen.getByRole('link', { name: 'Watch the tutorial' })).toHaveAttribute('href', '/tutorial')
  })
})
