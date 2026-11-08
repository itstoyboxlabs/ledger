import { renderHook, act } from '@testing-library/react'
import { useAssets } from './useAssets'

beforeEach(() => localStorage.clear())

describe('useAssets', () => {
  it('starts empty', () => {
    expect(renderHook(() => useAssets()).result.current[0]).toEqual([])
  })

  it('persists assets under ledger:assets', () => {
    const { result } = renderHook(() => useAssets())
    const list = [{ id: 'a1', name: 'Savings', balance: 1200 }]
    act(() => result.current[1](list))
    expect(JSON.parse(localStorage.getItem('ledger:assets') ?? 'null')).toEqual(list)
  })

  it('ignores a saved list with a bad entry', () => {
    localStorage.setItem('ledger:assets', JSON.stringify([{ id: 'a1', balance: '5' }]))
    expect(renderHook(() => useAssets()).result.current[0]).toEqual([])
  })

  it('accepts a valid saved list', () => {
    const list = [{ id: 'a1', name: 'k', balance: 0, pool: '401k' }]
    localStorage.setItem('ledger:assets', JSON.stringify(list))
    expect(renderHook(() => useAssets()).result.current[0]).toEqual(list)
  })
})
