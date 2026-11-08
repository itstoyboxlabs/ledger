import { render, screen } from '@testing-library/react'
import { HeroCopy } from '@/screens/marketing/ui/HeroCopy'

describe('HeroCopy', () => {
  it('shows the headline and the two buttons', () => {
    const { container } = render(<HeroCopy />)
    expect(container.querySelector('h1')).toHaveTextContent("Financial planning that doesn't oversimplify you.")
    expect(screen.getByRole('link', { name: 'Try Ledger' })).toHaveAttribute('href', '/app')
    expect(screen.getByRole('link', { name: /View on GitHub/ })).toHaveAttribute('href', 'https://github.com/itstoyboxlabs/ledger')
  })
})
