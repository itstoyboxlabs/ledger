import { renderHook, act } from '@testing-library/react'
import { useDebts } from './useDebts'
import { LEGACY_DEBTS } from '@/shared/constants/LEGACY_DEBTS'

beforeEach(() => localStorage.clear())

describe('useDebts', () => {
  it('starts empty', () => {
    expect(renderHook(() => useDebts()).result.current[0]).toEqual([])
  })

  it('normalizes a saved list', () => {
    localStorage.setItem('ledger:debts', JSON.stringify([{ id: 'd1', balance: 500, apr: '19.9' }]))
    const { result } = renderHook(() => useDebts())
    expect(result.current[0]).toEqual([{ id: 'd1', name: '', balance: 500, apr: 19.9, payment: 0, budgetRow: null }])
  })

  it('converts the legacy object save into a list and rewrites it once', () => {
    const legacy = Object.fromEntries(LEGACY_DEBTS.map(([k], i) => [k, 100 * (i + 1)]))
    localStorage.setItem('ledger:debts', JSON.stringify(legacy))
    const { result } = renderHook(() => useDebts())
    expect(result.current[0]).toHaveLength(LEGACY_DEBTS.length)
    expect(Array.isArray(JSON.parse(localStorage.getItem('ledger:debts') ?? 'null'))).toBe(true)
  })

  it('persists new debts', () => {
    const { result } = renderHook(() => useDebts())
    act(() => result.current[1]([{ id: 'n', name: 'Loan', balance: 10, apr: 5, payment: 2, budgetRow: null }]))
    expect(result.current[0][0].name).toBe('Loan')
    expect(JSON.parse(localStorage.getItem('ledger:debts') ?? 'null')[0].id).toBe('n')
  })
})
