import { render, act } from '@testing-library/react'
import { useScrollReveal } from '@/screens/marketing/hooks/useScrollReveal'

function Page() {
  useScrollReveal()
  return (
    <div>
      <div className="reveal" data-testid="one">one</div>
      <div className="reveal-kids" data-testid="group">
        <span data-testid="a">a</span>
        <span data-testid="b">b</span>
      </div>
      <div className="card" data-testid="card">card</div>
    </div>
  )
}

describe('useScrollReveal', () => {
  const original = globalThis.IntersectionObserver
  const setObserver = (value: unknown) => {
    globalThis.IntersectionObserver = value as typeof IntersectionObserver
  }
  afterEach(() => {
    setObserver(original)
    document.documentElement.classList.remove('js')
  })

  it('shows everything at once when there is no IntersectionObserver', () => {
    setObserver(undefined)
    const { getByTestId } = render(<Page />)
    expect(getByTestId('one')).toHaveAttribute('data-in')
    expect(getByTestId('card')).toHaveAttribute('data-drawn')
  })

  it('staggers the children of a group', () => {
    setObserver(undefined)
    const { getByTestId } = render(<Page />)
    expect(getByTestId('a').style.getPropertyValue('--d')).toBe('0.00s')
    expect(getByTestId('b').style.getPropertyValue('--d')).toBe('0.09s')
  })

  it('reveals an element when it scrolls into view', () => {
    const callbacks: ((entries: unknown[]) => void)[] = []
    setObserver(
      class {
        constructor(cb: (entries: unknown[]) => void) {
          callbacks.push(cb)
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
    const { getByTestId, unmount } = render(<Page />)
    expect(document.documentElement).toHaveClass('js')
    expect(getByTestId('one')).not.toHaveAttribute('data-in')
    act(() => callbacks[0]([{ isIntersecting: true, target: getByTestId('one') }]))
    expect(getByTestId('one')).toHaveAttribute('data-in')
    act(() => callbacks[1]([{ isIntersecting: true, target: getByTestId('card') }]))
    expect(getByTestId('card')).toHaveAttribute('data-drawn')
    unmount()
    expect(document.documentElement).not.toHaveClass('js')
  })
})
