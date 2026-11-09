import { scrollToHeading } from './scrollToHeading'

const mockMotion = (reduce: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({ matches: reduce && q.includes('reduce'), media: q })) as unknown as typeof window.matchMedia
}

describe('scrollToHeading', () => {
  let scroll: ReturnType<typeof vi.fn>
  beforeEach(() => {
    document.body.innerHTML = '<h2 id="here" tabindex="-1">Here</h2>'
    scroll = vi.fn()
    Element.prototype.scrollIntoView = scroll as unknown as Element['scrollIntoView']
  })

  it('scrolls smoothly to the heading and focuses it', () => {
    mockMotion(false)
    expect(scrollToHeading('here')).toBe(true)
    expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    expect(document.activeElement?.id).toBe('here')
  })

  it('jumps without animation when reduced motion is on', () => {
    mockMotion(true)
    scrollToHeading('here')
    expect(scroll).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' })
  })

  it('does nothing for a missing heading', () => {
    expect(scrollToHeading('nowhere')).toBe(false)
    expect(scroll).not.toHaveBeenCalled()
  })
})
