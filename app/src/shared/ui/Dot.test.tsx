import { render } from '@testing-library/react'
import { Dot } from './Dot'

describe('Dot', () => {
  it('paints the given color', () => {
    const { container } = render(<Dot color="rgb(255, 0, 0)" />)
    expect(container.firstChild).toHaveStyle({ background: 'rgb(255, 0, 0)' })
  })
})
