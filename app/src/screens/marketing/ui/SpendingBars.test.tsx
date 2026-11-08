import { render, screen } from '@testing-library/react'
import { SpendingBars } from '@/screens/marketing/ui/SpendingBars'

describe('SpendingBars', () => {
  it('draws a bar and a label per month', () => {
    const { container } = render(<SpendingBars months={[{ label: 'Jun', value: 4000 }, { label: 'Jul', value: 5000 }]} />)
    expect(container.querySelectorAll('rect')).toHaveLength(2)
    expect(screen.getByText('Jul')).toBeInTheDocument()
    expect(screen.getByText('$8K')).toBeInTheDocument()
  })
})
