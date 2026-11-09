import { renderHook } from '@testing-library/react'
import { persistedStore } from '@/shared/state/persistedStore'
import { usePlanStartAge } from './usePlanStartAge'

beforeEach(() => {
  localStorage.clear()
  persistedStore.setState({ entries: {} })
})
const set = (k: string, v: unknown) => localStorage.setItem(`ledger:${k}`, JSON.stringify(v))

describe('usePlanStartAge', () => {
  it('is null with no About you age and no Retirement plan', () => {
    expect(renderHook(() => usePlanStartAge()).result.current).toBeNull()
  })
  it('does not save anything just by reading', () => {
    renderHook(() => usePlanStartAge())
    expect(localStorage.getItem('ledger:retireCalc')).toBeNull()
    expect(localStorage.getItem('ledger:retireAgeAuto')).toBeNull()
  })
  it('uses the About you age while Auto is on', () => {
    set('birthDate', '1990-11-01')
    set('assetsAsOf', '2025-10-31')
    set('retireCalc', { age: 50 })
    expect(renderHook(() => usePlanStartAge()).result.current).toBe(34)
  })
  it('uses the age typed on Retirement when Auto is off', () => {
    set('birthDate', '1990-11-01')
    set('assetsAsOf', '2025-10-31')
    set('retireCalc', { age: 50 })
    set('retireAgeAuto', false)
    expect(renderHook(() => usePlanStartAge()).result.current).toBe(50)
  })
  it('uses the typed age when About you has none', () => {
    set('retireCalc', { age: 41 })
    expect(renderHook(() => usePlanStartAge()).result.current).toBe(41)
  })
})
