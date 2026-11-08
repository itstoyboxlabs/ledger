import { render, screen } from '@testing-library/react'
import { KpiActual } from './KpiActual'

describe('KpiActual', () => {
  it('shows a shortfall in the bad color with the negative word', () => {
    render(<KpiActual label="Actual" value="$1,200" diff={-150.4} />)
    expect(screen.getByText('$150 short')).toHaveAttribute('style', expect.stringContaining('--bad'))
  })

  it('shows a surplus with the positive word', () => {
    render(<KpiActual label="Actual" value="$1,200" diff={80} />)
    expect(screen.getByText('$80 ahead')).toHaveAttribute('style', expect.stringContaining('--good'))
  })

  it('uses custom words', () => {
    render(<KpiActual label="a" value="v" diff={-5} negWord="over" posWord="under" />)
    expect(screen.getByText('$5 over')).toBeInTheDocument()
  })

  it('hides the diff when null or rounds to zero', () => {
    const { rerender } = render(<KpiActual label="a" value="v" diff={null} />)
    expect(screen.queryByText(/short|ahead/)).toBeNull()
    rerender(<KpiActual label="a" value="v" diff={0.4} />)
    expect(screen.queryByText(/short|ahead/)).toBeNull()
  })
})
