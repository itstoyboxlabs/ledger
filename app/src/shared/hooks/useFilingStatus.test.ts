import { renderHook, act } from '@testing-library/react'
import { persistedStore } from '@/shared/state/persistedStore'
import { useFilingStatus } from './useFilingStatus'

beforeEach(() => {
  localStorage.clear()
  persistedStore.setState({ entries: {} })
})

describe('useFilingStatus', () => {
  it('defaults to single when nothing is saved', () => {
    expect(renderHook(() => useFilingStatus()).result.current[0]).toBe('single')
  })

  it('saves married filing jointly under a stable key', () => {
    const { result } = renderHook(() => useFilingStatus())
    act(() => result.current[1]('mfj'))
    expect(result.current[0]).toBe('mfj')
    expect(JSON.parse(localStorage.getItem('ledger:filingStatus') ?? 'null')).toBe('mfj')
  })

  it('reads an unknown saved value as single', () => {
    localStorage.setItem('ledger:filingStatus', '"hoh"')
    expect(renderHook(() => useFilingStatus()).result.current[0]).toBe('single')
  })
})
