import { act, renderHook } from '@testing-library/react'
import { useRetireAge } from './useRetireAge'
import { persistedStore } from '@/shared/state/persistedStore'

const year = new Date().getFullYear()
beforeEach(() => {
  localStorage.clear()
  persistedStore.setState({ entries: {} })
})

describe('useRetireAge', () => {
  it('keeps the typed age when About you has no age', () => {
    const { result } = renderHook(() => useRetireAge(30))
    expect(result.current).toMatchObject({ age: 30, auto: false, aboutAge: null })
  })

  it('uses the About you age by default once there is one', () => {
    localStorage.setItem('ledger:age', JSON.stringify({ age: 40, asOf: year - 1 }))
    const { result } = renderHook(() => useRetireAge(30))
    expect(result.current).toMatchObject({ age: 41, auto: true, aboutAge: 41 })
  })

  it('switches to the typed age and back', () => {
    localStorage.setItem('ledger:age', JSON.stringify({ age: 40, asOf: year }))
    const { result } = renderHook(() => useRetireAge(30))
    act(() => result.current.toggle())
    expect(result.current).toMatchObject({ age: 30, auto: false })
    expect(localStorage.getItem('ledger:retireAgeAuto')).toBe('false')
    act(() => result.current.toggle())
    expect(result.current).toMatchObject({ age: 40, auto: true })
  })

  it('respects a saved switch that is off', () => {
    localStorage.setItem('ledger:age', JSON.stringify({ age: 40, asOf: year }))
    localStorage.setItem('ledger:retireAgeAuto', 'false')
    expect(renderHook(() => useRetireAge(30)).result.current.age).toBe(30)
  })
})
