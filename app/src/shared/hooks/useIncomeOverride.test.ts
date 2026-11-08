import { renderHook, act } from '@testing-library/react'
import { useIncomeOverride } from './useIncomeOverride'

beforeEach(() => localStorage.clear())

describe('useIncomeOverride', () => {
  it('defaults to statements income', () => {
    expect(renderHook(() => useIncomeOverride()).result.current[0]).toEqual({ active: false, amount: 0 })
  })

  it('persists a manual amount', () => {
    const { result } = renderHook(() => useIncomeOverride())
    act(() => result.current[1]({ active: 'manual', amount: 5000 }))
    expect(JSON.parse(localStorage.getItem('ledger:budgetIncomeOverride') ?? 'null')).toEqual({ active: 'manual', amount: 5000 })
  })

  it('rejects a saved array', () => {
    localStorage.setItem('ledger:budgetIncomeOverride', '[1]')
    expect(renderHook(() => useIncomeOverride()).result.current[0].active).toBe(false)
  })
})
