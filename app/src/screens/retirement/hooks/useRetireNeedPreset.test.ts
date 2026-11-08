import { act, renderHook } from '@testing-library/react'
import { useRetireNeedPreset } from './useRetireNeedPreset'
import { persistedStore } from '@/shared/state/persistedStore'

beforeEach(() => {
  localStorage.clear()
  persistedStore.setState({ entries: {} })
})

describe('useRetireNeedPreset', () => {
  it('is null when nothing is stored, so old plans keep the typed number', () => {
    const { result } = renderHook(() => useRetireNeedPreset())
    expect(result.current[0]).toBeNull()
  })
  it('reads a stored preset name', () => {
    localStorage.setItem('ledger:retireNeedPreset', JSON.stringify('Retirement'))
    const { result } = renderHook(() => useRetireNeedPreset())
    expect(result.current[0]).toBe('Retirement')
  })
  it('ignores a bad stored value', () => {
    localStorage.setItem('ledger:retireNeedPreset', JSON.stringify({ name: 'x' }))
    const { result } = renderHook(() => useRetireNeedPreset())
    expect(result.current[0]).toBeNull()
  })
  it('saves a pick and clears it again', () => {
    const { result } = renderHook(() => useRetireNeedPreset())
    act(() => result.current[1]('Lean'))
    expect(JSON.parse(localStorage.getItem('ledger:retireNeedPreset') as string)).toBe('Lean')
    act(() => result.current[1](null))
    expect(result.current[0]).toBeNull()
  })
})
