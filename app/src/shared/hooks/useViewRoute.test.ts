import { act, renderHook } from '@testing-library/react'
import { useViewRoute } from '@/shared/hooks/useViewRoute'

const ok = (v: unknown) => typeof v === 'string'

describe('useViewRoute', () => {
  beforeEach(() => localStorage.clear())

  it('opens the screen named by the address', () => {
    window.history.replaceState(null, '', '/app/retirement')
    const { result } = renderHook(() => useViewRoute(ok))
    expect(result.current[0]).toBe('retirement')
  })

  it('rewrites /app to the saved screen', () => {
    localStorage.setItem('ledger:view', JSON.stringify('budget'))
    window.history.replaceState(null, '', '/app')
    const { result } = renderHook(() => useViewRoute(ok))
    expect(result.current[0]).toBe('budget')
    expect(window.location.pathname).toBe('/app/budget')
  })

  it('changes the address when the screen changes, and follows the back button', () => {
    window.history.replaceState(null, '', '/app/spending')
    const { result } = renderHook(() => useViewRoute(ok))
    act(() => result.current[1]('log'))
    expect(window.location.pathname).toBe('/app/log')
    expect(result.current[0]).toBe('log')
    act(() => {
      window.history.replaceState(null, '', '/app/spending')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(result.current[0]).toBe('actuals')
  })

  it('stays on the open screen when back lands on an address that is no screen', () => {
    window.history.replaceState(null, '', '/app/budget')
    const { result } = renderHook(() => useViewRoute(ok))
    act(() => {
      window.history.replaceState(null, '', '/app/upload')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(result.current[0]).toBe('budget')
    expect(window.location.pathname).toBe('/app/budget')
  })

  it('shows the saved screen for an address that names none', () => {
    localStorage.setItem('ledger:view', JSON.stringify('log'))
    window.history.replaceState(null, '', '/app/upload')
    const { result } = renderHook(() => useViewRoute(ok))
    expect(result.current[0]).toBe('log')
    expect(window.location.pathname).toBe('/app/log')
  })
})
