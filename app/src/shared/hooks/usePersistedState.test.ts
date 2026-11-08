import { renderHook, act } from '@testing-library/react'
import { usePersistedState } from './usePersistedState'

beforeEach(() => localStorage.clear())

describe('usePersistedState', () => {
  it('returns the fallback when nothing is saved', () => {
    const { result } = renderHook(() => usePersistedState('k', 5))
    expect(result.current[0]).toBe(5)
  })

  it('reads a saved value', () => {
    localStorage.setItem('ledger:k', JSON.stringify({ a: 1 }))
    const { result } = renderHook(() => usePersistedState('k', null))
    expect(result.current[0]).toEqual({ a: 1 })
  })

  it('falls back when the saved value is corrupted or fails validation', () => {
    localStorage.setItem('ledger:bad', '{nope')
    localStorage.setItem('ledger:str', JSON.stringify('x'))
    expect(renderHook(() => usePersistedState('bad', 'fb')).result.current[0]).toBe('fb')
    expect(renderHook(() => usePersistedState('str', 0, (v) => typeof v === 'number')).result.current[0]).toBe(0)
  })

  it('writes updates to localStorage under the ledger: prefix', () => {
    const { result } = renderHook(() => usePersistedState('k', 1))
    act(() => result.current[1](42))
    expect(result.current[0]).toBe(42)
    expect(localStorage.getItem('ledger:k')).toBe('42')
  })

  it('syncs two hooks that share a key', () => {
    const a = renderHook(() => usePersistedState('shared', 1))
    const b = renderHook(() => usePersistedState('shared', 1))
    act(() => a.result.current[1](9))
    expect(b.result.current[0]).toBe(9)
  })

  it('does not sync hooks with different keys', () => {
    const a = renderHook(() => usePersistedState('one', 1))
    const b = renderHook(() => usePersistedState('two', 1))
    act(() => a.result.current[1](9))
    expect(b.result.current[0]).toBe(1)
  })
})
