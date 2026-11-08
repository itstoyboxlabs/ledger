import { renderHook, act } from '@testing-library/react'
import { useToolCatalog } from './useToolCatalog'
import { useLists } from './useLists'
import { TOOL_LIST } from '@/screens/tools/constants/TOOL_LIST'

beforeEach(() => localStorage.clear())

describe('useToolCatalog', () => {
  it('is the built-in tools when there are no lists', () => {
    const { result } = renderHook(() => useToolCatalog())
    expect(result.current).toEqual(TOOL_LIST)
  })
  it('appends lists after the built-ins with fallbacks for blank fields', () => {
    localStorage.setItem('ledger:lists', JSON.stringify([
      { id: 'l1', title: 'Gifts', description: 'For mom', items: [] },
      { id: 'l2', title: '', description: '', items: [] },
    ]))
    const { result } = renderHook(() => useToolCatalog())
    const tail = result.current.slice(TOOL_LIST.length)
    expect(tail).toEqual([
      ['l1', 'Gifts', 'For mom'],
      ['l2', 'Untitled list', 'A list of items and what they add up to.'],
    ])
  })
  it('updates when a list is added elsewhere', () => {
    const cat = renderHook(() => useToolCatalog())
    const lists = renderHook(() => useLists())
    act(() => lists.result.current[1]([{ id: 'n', title: 'New', description: 'd', items: [] }]))
    expect(cat.result.current.at(-1)).toEqual(['n', 'New', 'd'])
  })
})
