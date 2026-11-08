import { spendAmount } from './spendAmount'
import type { Transaction } from '@/shared/types/Transaction'

describe('spendAmount', () => {
  it('adds expenses', () => {
    expect(spendAmount({ kind: 'expense', amount: 12.5 })).toBe(12.5)
  })
  it('subtracts refunds', () => {
    expect(spendAmount({ kind: 'refund', amount: 10 })).toBe(-10)
  })
  it('ignores income and other kinds', () => {
    expect(spendAmount({ kind: 'income', amount: 4000 })).toBe(0)
    expect(spendAmount({ kind: 'transfer', amount: 50 })).toBe(0)
    expect(spendAmount({ amount: 50 } as Transaction)).toBe(0)
  })
  it('handles zero amounts', () => {
    expect(spendAmount({ kind: 'expense', amount: 0 })).toBe(0)
  })
})
