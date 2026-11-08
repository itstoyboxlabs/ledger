import { scrollToWhenReady } from './scrollToWhenReady'

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('scrollToWhenReady', () => {
  it('scrolls once the element appears', () => {
    scrollToWhenReady('target')
    vi.advanceTimersByTime(100)
    const el = document.createElement('div')
    el.id = 'target'
    el.scrollIntoView = vi.fn()
    document.body.appendChild(el)
    vi.advanceTimersByTime(50)
    expect(el.scrollIntoView).toHaveBeenCalledWith({ block: 'start' })
  })
  it('stops polling after about a second when it never appears', () => {
    const spy = vi.spyOn(document, 'getElementById')
    scrollToWhenReady('missing')
    vi.advanceTimersByTime(5000)
    expect(spy).toHaveBeenCalledTimes(21)
  })
})
