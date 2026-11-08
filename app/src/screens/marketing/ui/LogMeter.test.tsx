import { render, screen } from '@testing-library/react'
import { LogMeter } from '@/screens/marketing/ui/LogMeter'

describe('LogMeter', () => {
  it('shows what is spent, the limit and what is left', () => {
    const { container } = render(<LogMeter meter={{ name: 'Groceries', spent: '$87', of: '$480', width: '18%', left: '$393 left' }} />)
    expect(screen.getByText('Groceries')).toBeInTheDocument()
    expect(screen.getByText('$393 left')).toBeInTheDocument()
    expect(container.querySelector('.bar i')).toHaveStyle({ width: '18%' })
  })
})
