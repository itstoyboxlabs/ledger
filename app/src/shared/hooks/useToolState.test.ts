import { renderHook, act } from '@testing-library/react'
import { useToolState } from './useToolState'

beforeEach(() => localStorage.clear())
const DEFAULTS = { rate: 5, name: 'x', on: true }

describe('useToolState', () => {
  it('returns the defaults when nothing is saved', () => {
    expect(renderHook(() => useToolState('t', DEFAULTS)).result.current[0]).toEqual(DEFAULTS)
  })

  it('fills keys added later from the defaults', () => {
    localStorage.setItem('ledger:t', JSON.stringify({ rate: 7 }))
    expect(renderHook(() => useToolState('t', DEFAULTS)).result.current[0]).toEqual({ rate: 7, name: 'x', on: true })
  })

  it('drops unknown keys and values of the wrong type', () => {
    localStorage.setItem('ledger:t', JSON.stringify({ rate: 'high', gone: 1, name: 'y' }))
    expect(renderHook(() => useToolState('t', DEFAULTS)).result.current[0]).toEqual({ rate: 5, name: 'y', on: true })
  })

  it('persists updates', () => {
    const { result } = renderHook(() => useToolState('t', DEFAULTS))
    act(() => result.current[1]({ ...DEFAULTS, rate: 9 }))
    expect(result.current[0].rate).toBe(9)
    expect(JSON.parse(localStorage.getItem('ledger:t') ?? 'null').rate).toBe(9)
  })

  it('ignores a saved array', () => {
    localStorage.setItem('ledger:t', '[1,2]')
    expect(renderHook(() => useToolState('t', DEFAULTS)).result.current[0]).toEqual(DEFAULTS)
  })

  it('gives a functional update the merged value', () => {
    localStorage.setItem('ledger:t', JSON.stringify({ rate: 7, gone: 1 }))
    const { result } = renderHook(() => useToolState('t', DEFAULTS))
    let seen: typeof DEFAULTS | undefined
    act(() => result.current[1]((prev) => { seen = prev; return { ...prev, rate: prev.rate + 1 } }))
    expect(seen).toEqual({ rate: 7, name: 'x', on: true })
    expect(result.current[0]).toEqual({ rate: 8, name: 'x', on: true })
  })
})
