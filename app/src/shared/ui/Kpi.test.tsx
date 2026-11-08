import { render, screen } from '@testing-library/react'
import { Kpi } from './Kpi'

describe('Kpi', () => {
  it('renders label, value and sub text', () => {
    render(<Kpi label="Income" value="$5,000" sub="per month" />)
    expect(screen.getByText('Income')).toBeInTheDocument()
    expect(screen.getByText('$5,000')).toBeInTheDocument()
    expect(screen.getByText('per month')).toBeInTheDocument()
  })

  it('applies the tone color to the value', () => {
    render(<Kpi label="Net" value="-$20" tone="rgb(255, 0, 0)" />)
    expect(screen.getByText('-$20')).toHaveStyle({ color: 'rgb(255, 0, 0)' })
  })

  it('shows a badge and sparkline when given', () => {
    const { container } = render(<Kpi label="A" value="1" badge={<span>New</span>} spark={[1, 2, 3]} />)
    expect(screen.getByText('New')).toBeInTheDocument()
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0)
  })

  it('shows the actual figures when provided', () => {
    render(<Kpi label="Spend" value="$100" actual={{ label: 'Actual', value: '$120', diff: -20 }} />)
    expect(screen.getByText('Actual')).toBeInTheDocument()
    expect(screen.getByText('$20 short')).toBeInTheDocument()
  })
})
