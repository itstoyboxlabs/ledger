import { render, screen } from '@testing-library/react'
import { ChartTip } from '@/screens/spending/ui/ChartTip'

const payload = [
  { dataKey: 'income', name: 'Income', value: 3000, color: '#0f0' },
  { dataKey: 'spending', name: 'Spending', value: 1234.56, color: '#80f' },
  { dataKey: 'zero', name: 'Zero', value: 0, color: '#fff' },
]

describe('ChartTip', () => {
  it('renders nothing when inactive or empty', () => {
    const { container, rerender } = render(<ChartTip active={false} payload={payload} label="2026-05" />)
    expect(container).toBeEmptyDOMElement()
    rerender(<ChartTip active payload={[]} label="2026-05" />)
    expect(container).toBeEmptyDOMElement()
  })
  it('shows the month label and rounded values', () => {
    render(<ChartTip active payload={payload} label="2026-05" />)
    expect(screen.getByText('May 2026')).toBeInTheDocument()
    expect(screen.getByText('$3,000')).toBeInTheDocument()
    expect(screen.getByText('$1,235')).toBeInTheDocument()
  })
  it('hides zero rows and lists the rest in reverse order', () => {
    render(<ChartTip active payload={payload} label="2026-05" />)
    expect(screen.queryByText('Zero')).not.toBeInTheDocument()
    const names = screen.getAllByText(/Income|Spending/).map((e) => e.textContent.trim())
    expect(names).toEqual(['Spending', 'Income'])
  })
})
