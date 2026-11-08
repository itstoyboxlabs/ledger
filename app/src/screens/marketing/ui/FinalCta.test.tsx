import { render, screen } from '@testing-library/react'
import { FinalCta } from '@/screens/marketing/ui/FinalCta'

describe('FinalCta', () => {
  it('has the closing line, the buttons and the footer', () => {
    render(<FinalCta />)
    expect(screen.getByText('Take control of your money.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Try Ledger' })).toHaveAttribute('href', '/app')
    expect(screen.getByText(/Made by Toybox Labs/)).toBeInTheDocument()
  })
})
