import { render } from '@testing-library/react'
import { Statement } from '@/screens/marketing/ui/Statement'

describe('Statement', () => {
  it('shows the bright first sentence and the rest', () => {
    const { container } = render(<Statement />)
    expect(container.querySelector('span')).toHaveTextContent('Ledger turns your bank statements into a plan.')
    expect(container.querySelector('p')).toHaveTextContent('No bank login needed.')
  })
})
