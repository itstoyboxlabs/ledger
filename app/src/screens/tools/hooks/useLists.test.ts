import { renderHook, act } from '@testing-library/react'
import { useLists } from './useLists'

beforeEach(() => localStorage.clear())

const list = { id: 'l1', title: 'Gifts', description: '', items: [] }

describe('useLists', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useLists())
    expect(result.current[0]).toEqual([])
  })
  it('migrates the legacy sell list on first read', () => {
    localStorage.setItem('ledger:sellItems', JSON.stringify([{ id: 'a', name: 'x', amount: 5 }]))
    const { result } = renderHook(() => useLists())
    expect(result.current[0][0].id).toBe('sell')
    expect(JSON.parse(localStorage.getItem('ledger:lists') as string)[0].title).toBe('Selling stuff')
  })
  it('prefers saved lists over the legacy key', () => {
    localStorage.setItem('ledger:sellItems', JSON.stringify([{ id: 'a', name: 'x', amount: 5 }]))
    localStorage.setItem('ledger:lists', JSON.stringify([list]))
    const { result } = renderHook(() => useLists())
    expect(result.current[0]).toEqual([list])
  })
  it('falls back when the saved value is invalid', () => {
    localStorage.setItem('ledger:lists', JSON.stringify([{ bad: true }]))
    const { result } = renderHook(() => useLists())
    expect(result.current[0]).toEqual([])
  })
  it('persists changes and syncs across instances', () => {
    const a = renderHook(() => useLists())
    const b = renderHook(() => useLists())
    act(() => a.result.current[1]([list]))
    expect(JSON.parse(localStorage.getItem('ledger:lists') as string)).toEqual([list])
    expect(b.result.current[0]).toEqual([list])
  })
})
