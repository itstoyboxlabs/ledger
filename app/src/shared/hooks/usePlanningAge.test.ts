import { renderHook } from '@testing-library/react'
import { persistedStore } from '@/shared/state/persistedStore'
import { todayIso } from '@/shared/utils/todayIso'
import { ageOn } from '@/shared/utils/ageOn'
import { usePlanningAge } from './usePlanningAge'

beforeEach(() => {
  localStorage.clear()
  persistedStore.setState({ entries: {} })
})
const set = (k: string, v: unknown) => localStorage.setItem(`ledger:${k}`, JSON.stringify(v))

describe('usePlanningAge', () => {
  it('is null with no birth date or age', () => {
    expect(renderHook(() => usePlanningAge()).result.current).toBeNull()
  })

  it('uses the age on the Balances as of date', () => {
    set('birthDate', '1990-11-01')
    set('assetsAsOf', '2025-10-31')
    expect(renderHook(() => usePlanningAge()).result.current).toEqual({ age: 34, source: 'balances', on: '2025-10-31' })
  })

  it('uses today when Balances has no date', () => {
    set('birthDate', '1990-11-01')
    const today = todayIso()
    expect(renderHook(() => usePlanningAge()).result.current).toEqual({ age: ageOn('1990-11-01', today), source: 'today', on: today })
  })

  it('reads an old typed age as fixed', () => {
    set('age', { age: 41, asOf: 2020 })
    set('assetsAsOf', '2026-10-31')
    expect(renderHook(() => usePlanningAge()).result.current).toEqual({ age: 41, source: 'saved', on: null })
  })
})
