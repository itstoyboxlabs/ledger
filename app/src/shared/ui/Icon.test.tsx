import { render } from '@testing-library/react'
import { Icon } from './Icon'
import { ICON_PATHS } from '@/shared/constants/ICON_PATHS'

describe('Icon', () => {
  it('renders an svg at the given size', () => {
    const { container } = render(<Icon name="dollar" size={24} className="x" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '24')
    expect(svg).toHaveClass('shrink-0', 'x')
    expect(svg?.children.length).toBeGreaterThan(0)
  })

  it('defaults to 18px', () => {
    const { container } = render(<Icon name="dollar" />)
    expect(container.querySelector('svg')).toHaveAttribute('width', '18')
  })

  it('renders an empty svg for an unknown name', () => {
    const { container } = render(<Icon name="nope" />)
    expect(container.querySelector('svg')?.children).toHaveLength(0)
  })

  it('has a path set for every name the nav uses', async () => {
    const { NAV } = await import('@/shared/constants/NAV')
    for (const [, , icon] of NAV) expect((ICON_PATHS as Record<string, unknown>)[icon]).toBeTruthy()
  })
})
