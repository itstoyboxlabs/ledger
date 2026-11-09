import { act, renderHook } from '@testing-library/react'
import { useActiveSection } from './useActiveSection'

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void
let callback: Callback
let observed: Element[]
let disconnect: () => void

class FakeObserver {
  constructor(cb: Callback) {
    callback = cb
    observed = []
  }
  observe(el: Element) { observed.push(el) }
  unobserve() {}
  disconnect() { disconnect() }
}

const entry = (id: string, isIntersecting: boolean, top: number) => ({
  target: document.getElementById(id) as Element,
  isIntersecting,
  boundingClientRect: { top } as DOMRectReadOnly,
  rootBounds: { top: 0 } as DOMRectReadOnly,
})

describe('useActiveSection', () => {
  beforeEach(() => {
    document.body.innerHTML = '<h2 id="a"></h2><h3 id="a1"></h3><h2 id="b"></h2>'
    disconnect = vi.fn()
    vi.stubGlobal('IntersectionObserver', FakeObserver)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('starts on the first heading and watches every one', () => {
    const { result } = renderHook(() => useActiveSection(['a', 'a1', 'b']))
    expect(result.current[0]).toBe('a')
    expect(observed.map((e) => e.id)).toEqual(['a', 'a1', 'b'])
  })

  it('follows the last heading the reader has reached', () => {
    const { result } = renderHook(() => useActiveSection(['a', 'a1', 'b']))
    act(() => callback([entry('a', true, 10), entry('a1', false, 600), entry('b', false, 1400)]))
    expect(result.current[0]).toBe('a')
    act(() => callback([entry('a', false, -40), entry('a1', true, 80)]))
    expect(result.current[0]).toBe('a1')
    act(() => callback([entry('a1', false, -20), entry('b', true, 120)]))
    expect(result.current[0]).toBe('b')
  })

  it('goes back up when a heading drops below the line again', () => {
    const { result } = renderHook(() => useActiveSection(['a', 'a1', 'b']))
    act(() => callback([entry('a', false, -500), entry('a1', false, -200), entry('b', true, 50)]))
    expect(result.current[0]).toBe('b')
    act(() => callback([entry('b', false, 700)]))
    expect(result.current[0]).toBe('a1')
  })

  it('can be set by hand and stops watching on unmount', () => {
    const { result, unmount } = renderHook(() => useActiveSection(['a', 'a1', 'b']))
    act(() => result.current[1]('b'))
    expect(result.current[0]).toBe('b')
    unmount()
    expect(disconnect).toHaveBeenCalled()
  })
})
