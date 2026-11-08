import { renderHook } from '@testing-library/react'
import { useBudgetIncome } from './useBudgetIncome'
import { loadSampleData } from '@/test-utils/loadSampleData'
import { derivedMonthlyIncome } from '@/shared/utils/derivedMonthlyIncome'

beforeEach(() => {
  localStorage.clear()
  loadSampleData()
})

describe('useBudgetIncome', () => {
  it('uses the statements figure by default', () => {
    const { result } = renderHook(() => useBudgetIncome())
    expect(result.current).toBe(derivedMonthlyIncome())
  })

  it('uses the typed amount when set to manual', () => {
    localStorage.setItem('ledger:budgetIncomeOverride', JSON.stringify({ active: 'manual', amount: 4321 }))
    expect(renderHook(() => useBudgetIncome()).result.current).toBe(4321)
  })

  it('uses the take-home tool figure when the tool is the source', () => {
    localStorage.setItem('ledger:budgetIncomeOverride', JSON.stringify({ active: true, amount: 0 }))
    const { result } = renderHook(() => useBudgetIncome())
    expect(result.current).toBeGreaterThan(0)
    expect(result.current).toBeLessThan(80000 / 12)
  })
})
