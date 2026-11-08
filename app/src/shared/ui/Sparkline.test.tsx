import { render } from '@testing-library/react'
import { Sparkline } from './Sparkline'

describe('Sparkline', () => {
  it('renders nothing for fewer than two points', () => {
    expect(render(<Sparkline points={[1]} color="red" />).container.firstChild).toBeNull()
    expect(render(<Sparkline color="red" />).container.firstChild).toBeNull()
  })

  it('draws a line and area scaled to its own range', () => {
    const { container } = render(<Sparkline points={[0, 5, 10]} color="red" width={100} height={50} />)
    const paths = container.querySelectorAll('path')
    expect(paths).toHaveLength(2)
    expect(paths[1].getAttribute('d')).toBe('M0.0 46.0 L50.0 26.0 L100.0 6.0')
  })

  it('handles a flat series without dividing by zero', () => {
    const { container } = render(<Sparkline points={[3, 3, 3]} color="red" />)
    expect(container.querySelectorAll('path')[1].getAttribute('d')).not.toMatch(/NaN/)
  })
})
