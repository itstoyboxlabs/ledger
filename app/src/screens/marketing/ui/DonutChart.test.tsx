import { render, screen } from '@testing-library/react'
import { DonutChart } from '@/screens/marketing/ui/DonutChart'

describe('DonutChart', () => {
  it('draws a ring segment per category and a center label', () => {
    const cats = [{ name: 'A', amount: 1, color: '#111' }, { name: 'B', amount: 3, color: '#222' }]
    const { container } = render(<DonutChart categories={cats} total={4} centerLabel="$4" />)
    expect(container.querySelectorAll('circle')).toHaveLength(2)
    expect(screen.getByText('$4')).toBeInTheDocument()
  })
})
