import { debtPaymentOf } from './debtPaymentOf'
import type { BudgetRow } from '@/shared/types/BudgetRow'
import type { Debt } from '@/shared/types/Debt'

describe('debtPaymentOf', () => {
  // the second amount is bad text on purpose
  const rows = [{ id: 'r1', name: 'A', amount: 250 }, { id: 'r2', name: 'B', amount: 'x' }] as unknown as BudgetRow[]
  it('uses the typed payment when no budget row is linked', () => {
    expect(debtPaymentOf({ budgetRow: null, payment: 75 }, rows)).toBe(75)
    expect(debtPaymentOf({ budgetRow: null, payment: '30' as unknown as number }, rows)).toBe(30)
  })
  it('uses the linked budget row amount', () => expect(debtPaymentOf({ budgetRow: 'r1', payment: 5 }, rows)).toBe(250))
  it('is 0 for a missing row, bad amount or missing rows', () => {
    expect(debtPaymentOf({ budgetRow: 'gone', payment: 0 }, rows)).toBe(0)
    expect(debtPaymentOf({ budgetRow: 'r2', payment: 0 }, rows)).toBe(0)
    expect(debtPaymentOf({ budgetRow: 'r1', payment: 0 }, undefined)).toBe(0)
    expect(debtPaymentOf({} as Debt, rows)).toBe(0)
  })
})
