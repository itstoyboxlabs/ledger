import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GuideHeading } from './GuideHeading'

describe('GuideHeading', () => {
  it('renders an h2 or h3 with the id and a clean name', () => {
    const { rerender } = render(<GuideHeading level={2} id="sec" title="Section" onAnchor={vi.fn()} />)
    const h2 = screen.getByRole('heading', { level: 2, name: 'Section' })
    expect(h2).toHaveAttribute('id', 'sec')
    expect(h2).toHaveAttribute('tabindex', '-1')
    rerender(<GuideHeading level={3} id="sub" title="Sub" onAnchor={vi.fn()} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Sub' })).toHaveAttribute('id', 'sub')
  })

  it('has a link to itself that scrolls there', async () => {
    const onAnchor = vi.fn()
    render(<GuideHeading level={2} id="sec" title="Section" onAnchor={onAnchor} />)
    const link = screen.getByRole('link', { name: 'Link to Section' })
    expect(link).toHaveAttribute('href', '#sec')
    await userEvent.click(link)
    expect(onAnchor).toHaveBeenCalledWith('sec')
  })
})
