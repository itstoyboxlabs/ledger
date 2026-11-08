import { act, renderHook } from '@testing-library/react'
import { useRetireAge } from './useRetireAge'
import { persistedStore } from '@/shared/state/persistedStore'

beforeEach(() => {
  localStorage.clear()
  persistedStore.setState({ entries: {} })
})
const set = (k: string, v: unknown) => localStorage.setItem(`ledger:${k}`, JSON.stringify(v))

describe('useRetireAge', () => {
  it('keeps the typed age when About you has no age', () => {
    const { result } = renderHook(() => useRetireAge(30))
    expect(result.current).toMatchObject({ age: 30, auto: false, aboutAge: null })
  })

  it('uses the age on the Balances date by default once there is a birth date', () => {
    set('birthDate', '1985-12-01')
    set('assetsAsOf', '2025-11-30')
    const { result } = renderHook(() => useRetireAge(30))
    expect(result.current).toMatchObject({ age: 39, auto: true, aboutAge: 39, planning: { source: 'balances', on: '2025-11-30' } })
  })

  it('uses an old typed age as it is', () => {
    set('age', { age: 40, asOf: 2020 })
    expect(renderHook(() => useRetireAge(30)).result.current).toMatchObject({ age: 40, auto: true })
  })

  it('switches to the typed age and back', () => {
    set('birthDate', '1985-12-01')
    set('assetsAsOf', '2025-11-30')
    const { result } = renderHook(() => useRetireAge(30))
    act(() => result.current.toggle())
    expect(result.current).toMatchObject({ age: 30, auto: false })
    expect(localStorage.getItem('ledger:retireAgeAuto')).toBe('false')
    act(() => result.current.toggle())
    expect(result.current).toMatchObject({ age: 39, auto: true })
  })

  it('respects a saved switch that is off', () => {
    set('birthDate', '1985-12-01')
    set('retireAgeAuto', false)
    expect(renderHook(() => useRetireAge(30)).result.current.age).toBe(30)
  })
})
