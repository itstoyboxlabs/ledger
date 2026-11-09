import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GettingStartedView } from './GettingStartedView'
import { GUIDE_SECTIONS } from '@/screens/guide/constants/GUIDE_SECTIONS'
import { NAV } from '@/shared/constants/NAV'

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

const setup = () => {
  const goTo = vi.fn()
  const view = render(<GettingStartedView goTo={goTo} />)
  return { goTo, ...view }
}
// the desktop contents (the mobile one stays closed in these tests)
const toc = () => screen.getByRole('navigation', { name: 'On this page' })

describe('GettingStartedView', () => {
  it('renders every section as an h2 and every subsection as an h3', () => {
    setup()
    for (const s of GUIDE_SECTIONS) {
      expect(screen.getByRole('heading', { level: 2, name: s.title })).toHaveAttribute('id', s.id)
      for (const sub of s.subsections) expect(screen.getByRole('heading', { level: 3, name: sub.title })).toHaveAttribute('id', sub.id)
    }
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(GUIDE_SECTIONS.length)
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('has unique heading ids and a heading for every contents link', () => {
    const { container } = setup()
    const ids = [...container.querySelectorAll('h2, h3')].map((h) => h.id)
    expect(new Set(ids).size).toBe(ids.length)
    const links = within(toc()).getAllByRole('link')
    expect(links).toHaveLength(ids.length)
    for (const a of links) expect(document.getElementById(a.getAttribute('href')!.slice(1))).not.toBeNull()
  })

  it('jumps to a heading from the contents and moves focus there', async () => {
    setup()
    await userEvent.click(within(toc()).getByRole('link', { name: '2. Balances' }))
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
    expect(document.activeElement).toHaveAttribute('id', 'step-balances')
    expect(within(toc()).getByRole('link', { name: '2. Balances' })).toHaveAttribute('aria-current', 'location')
  })

  it('switches tabs from links in the text, only to tabs that exist', async () => {
    const { goTo } = setup()
    const tabs = new Set(NAV.map(([id]) => id))
    for (const s of GUIDE_SECTIONS) {
      for (const block of [...s.blocks, ...s.subsections.flatMap((x) => x.blocks)]) {
        if (block.kind === 'importPrompt') continue
        const parts = block.kind === 'p' || block.kind === 'note' ? block.text : block.items.flat()
        for (const p of parts) if (typeof p === 'object' && 'tab' in p) expect(tabs.has(p.tab)).toBe(true)
      }
    }
    await userEvent.click(screen.getAllByRole('button', { name: 'Balances' })[0])
    expect(goTo).toHaveBeenCalledWith('balances')
  })

  it('every anchor in the text points at a heading on the page', () => {
    const { container } = setup()
    const anchors = [...container.querySelectorAll('article a[href^="#"]')]
    expect(anchors.length).toBeGreaterThan(0)
    for (const a of anchors) expect(document.getElementById(a.getAttribute('href')!.slice(1))).not.toBeNull()
  })

  it('keeps the copy free of em dashes and emojis', () => {
    const { container } = setup()
    const text = container.querySelector('article')!.textContent!
    expect(text).not.toMatch(/—/)
    expect(text).not.toMatch(/\p{Extended_Pictographic}/u)
  })
})
