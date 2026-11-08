import { render, screen } from '@testing-library/react'
import { DonutTooltip } from '@/screens/spending/ui/DonutTooltip'

const payload = [{ payload: { name: 'Groceries', value: 250, fill: '#0a0', count: 7 } }]

describe('DonutTooltip', () => {
  it('renders nothing when inactive or empty', () => {
    const { container, rerender } = render(<DonutTooltip active={false} payload={payload} total={1000} />)
    expect(container).toBeEmptyDOMElement()
    rerender(<DonutTooltip active payload={[]} total={1000} />)
    expect(container).toBeEmptyDOMElement()
  })
  it('shows name, amount, share and count', () => {
    render(<DonutTooltip active payload={payload} total={1000} />)
    expect(screen.getByText('Groceries')).toBeInTheDocument()
    expect(screen.getByText('$250.00 · 25.0% · 7 txns')).toBeInTheDocument()
  })
})
