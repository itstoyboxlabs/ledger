import { render, screen } from '@testing-library/react'
import { BentoGrid } from '@/screens/marketing/ui/BentoGrid'

describe('BentoGrid', () => {
  it('shows four cards and links to the tutorial', () => {
    render(<BentoGrid />)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4)
    expect(screen.getByRole('link', { name: 'Watch the tutorial' })).toHaveAttribute('href', '/tutorial')
    expect(screen.getByText('ledger-data.json')).toBeInTheDocument()
  })
})
