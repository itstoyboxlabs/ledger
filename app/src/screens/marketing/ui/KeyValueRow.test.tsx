import { render, screen } from '@testing-library/react'
import { KeyValueRow } from '@/screens/marketing/ui/KeyValueRow'

describe('KeyValueRow', () => {
  it('shows label and amount with a tone', () => {
    render(<KeyValueRow label="Tax" amount="−$5" tone="neg" />)
    expect(screen.getByText('Tax')).toBeInTheDocument()
    expect(screen.getByText('−$5')).toHaveClass('neg')
  })
})
