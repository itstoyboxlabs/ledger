import { renderHook, act } from '@testing-library/react'
import { persistedStore } from '@/shared/state/persistedStore'
import { useAboutYouAge } from './useAboutYouAge'

beforeEach(() => {
  localStorage.clear()
  persistedStore.setState({ entries: {} })
})
const year = new Date().getFullYear()

describe('useAboutYouAge', () => {
  it('has no age until one is typed', () => {
    const { result } = renderHook(() => useAboutYouAge())
    expect(result.current.entry).toBeNull()
    expect(result.current.age).toBeNull()
  })

  it('saves the typed age with this year', () => {
    const { result } = renderHook(() => useAboutYouAge())
    act(() => result.current.setAge(41))
    expect(result.current.age).toBe(41)
    expect(JSON.parse(localStorage.getItem('ledger:age') ?? 'null')).toEqual({ age: 41, asOf: year })
  })

  it('adds the years since the age was typed', () => {
    localStorage.setItem('ledger:age', JSON.stringify({ age: 30, asOf: year - 3 }))
    expect(renderHook(() => useAboutYouAge()).result.current.age).toBe(33)
  })

  it('clears back to no age', () => {
    const { result } = renderHook(() => useAboutYouAge())
    act(() => result.current.setAge(41))
    act(() => result.current.clear())
    expect(result.current.age).toBeNull()
  })

  it('ignores a broken saved value', () => {
    localStorage.setItem('ledger:age', '"thirty"')
    expect(renderHook(() => useAboutYouAge()).result.current.age).toBeNull()
  })
})
