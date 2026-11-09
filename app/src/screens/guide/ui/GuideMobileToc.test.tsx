import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GuideMobileToc } from './GuideMobileToc'
import type { TocEntry } from '@/screens/guide/types/TocEntry'

const toc: TocEntry[] = [{ id: 'a', title: 'Alpha', children: [{ id: 'a1', title: 'Alpha one', children: [] }] }]

describe('GuideMobileToc', () => {
  it('starts closed and opens on click', async () => {
    render(<GuideMobileToc toc={toc} active={null} onNavigate={vi.fn()} />)
    const button = screen.getByRole('button', { name: 'On this page' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: 'Alpha' })).not.toBeInTheDocument()
    await userEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(document.getElementById(button.getAttribute('aria-controls') as string)).toContainElement(screen.getByRole('link', { name: 'Alpha' }))
  })

  it('closes after picking a heading', async () => {
    const onNavigate = vi.fn()
    render(<GuideMobileToc toc={toc} active={null} onNavigate={onNavigate} />)
    await userEvent.click(screen.getByRole('button', { name: 'On this page' }))
    await userEvent.click(screen.getByRole('link', { name: 'Alpha one' }))
    expect(onNavigate).toHaveBeenCalledWith('a1')
    expect(screen.getByRole('button', { name: 'On this page' })).toHaveAttribute('aria-expanded', 'false')
  })
})
