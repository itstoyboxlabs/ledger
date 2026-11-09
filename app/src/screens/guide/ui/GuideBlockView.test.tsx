import { render, screen } from '@testing-library/react'
import { GuideBlockView } from './GuideBlockView'
import type { GuideBlock } from '@/screens/guide/types/GuideBlock'

const show = (block: GuideBlock) => render(<GuideBlockView block={block} goTo={vi.fn()} onAnchor={vi.fn()} />)

describe('GuideBlockView', () => {
  it('renders a paragraph', () => {
    show({ kind: 'p', text: ['Hello there.'] })
    expect(screen.getByText('Hello there.').tagName).toBe('P')
  })

  it('renders a note with its title', () => {
    show({ kind: 'note', title: 'Heads up', text: ['Export first.'] })
    expect(screen.getByText('Heads up')).toBeInTheDocument()
    expect(screen.getByText('Export first.')).toBeInTheDocument()
  })

  it('renders a bulleted list', () => {
    show({ kind: 'list', items: [['One'], ['Two']] })
    expect(screen.getByRole('list').tagName).toBe('UL')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('renders numbered steps', () => {
    show({ kind: 'steps', items: [['First'], ['Second'], ['Third']] })
    expect(screen.getByRole('list').tagName).toBe('OL')
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['First', 'Second', 'Third'])
  })
})
