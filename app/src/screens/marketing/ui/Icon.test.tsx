import { render } from '@testing-library/react'
import { Icon } from '@/screens/marketing/ui/Icon'

describe('Icon', () => {
  it('references a symbol by name', () => {
    const { container } = render(<Icon name="check" />)
    expect(container.querySelector('use')).toHaveAttribute('href', '#check')
  })
  it('draws a list of paths', () => {
    const { container } = render(<Icon paths={['M0 0', 'M1 1']} />)
    expect(container.querySelectorAll('path')).toHaveLength(2)
  })
  it('draws children', () => {
    const { container } = render(<Icon><circle r="1" /></Icon>)
    expect(container.querySelector('circle')).toBeTruthy()
  })
})
