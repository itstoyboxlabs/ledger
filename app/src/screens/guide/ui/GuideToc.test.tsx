import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GuideToc } from './GuideToc'
import type { TocEntry } from '@/screens/guide/types/TocEntry'

const toc: TocEntry[] = [
  { id: 'a', title: 'Alpha', children: [{ id: 'a1', title: 'Alpha one', children: [] }] },
  { id: 'b', title: 'Beta', children: [] },
]

describe('GuideToc', () => {
  it('nests subsections under their section', () => {
    render(<GuideToc toc={toc} active={null} onNavigate={vi.fn()} />)
    const nav = screen.getByRole('navigation', { name: 'On this page' })
    const alpha = screen.getByRole('link', { name: 'Alpha' }).closest('li') as HTMLElement
    expect(within(alpha).getByRole('link', { name: 'Alpha one' })).toHaveAttribute('href', '#a1')
    expect(within(nav).getAllByRole('link')).toHaveLength(3)
    expect(screen.getByText('On this page')).toBeInTheDocument()
  })

  it('marks the active heading', () => {
    render(<GuideToc toc={toc} active="a1" onNavigate={vi.fn()} />)
    expect(screen.getByRole('link', { name: 'Alpha one' })).toHaveAttribute('aria-current', 'location')
    expect(screen.getByRole('link', { name: 'Beta' })).not.toHaveAttribute('aria-current')
  })

  it('navigates on click without following the hash', async () => {
    const onNavigate = vi.fn()
    render(<GuideToc toc={toc} active={null} onNavigate={onNavigate} showTitle={false} />)
    await userEvent.click(screen.getByRole('link', { name: 'Beta' }))
    expect(onNavigate).toHaveBeenCalledWith('b')
    expect(screen.queryByText('On this page')).not.toBeInTheDocument()
  })
})
