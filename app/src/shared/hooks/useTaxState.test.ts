import { renderHook, act } from '@testing-library/react'
import { persistedStore } from '@/shared/state/persistedStore'
import { DEFAULT_STATE } from '@/shared/constants/DEFAULT_STATE'
import { useTaxState } from './useTaxState'

beforeEach(() => {
  localStorage.clear()
  persistedStore.setState({ entries: {} })
})

describe('useTaxState', () => {
  it('defaults to the default state when nothing is saved', () => {
    expect(renderHook(() => useTaxState()).result.current[0]).toBe(DEFAULT_STATE)
  })

  it('saves a state under the stable key', () => {
    const { result } = renderHook(() => useTaxState())
    act(() => result.current[1]('ca'))
    expect(result.current[0]).toBe('ca')
    expect(JSON.parse(localStorage.getItem('ledger:taxState') ?? 'null')).toBe('ca')
  })

  it('reads an unknown or non-string saved value as the default', () => {
    localStorage.setItem('ledger:taxState', '"atlantis"')
    expect(renderHook(() => useTaxState()).result.current[0]).toBe(DEFAULT_STATE)
    persistedStore.setState({ entries: {} })
    localStorage.setItem('ledger:taxState', '42')
    expect(renderHook(() => useTaxState()).result.current[0]).toBe(DEFAULT_STATE)
  })

  it('shares one value between every component that uses it', () => {
    const a = renderHook(() => useTaxState())
    const b = renderHook(() => useTaxState())
    act(() => a.result.current[1]('ny-nyc'))
    expect(b.result.current[0]).toBe('ny-nyc')
  })
})
