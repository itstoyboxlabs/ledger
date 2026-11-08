import { budgetSavingsYearly } from './budgetSavingsYearly'
import type { BudgetRow } from '@/shared/types/BudgetRow'

const rows = [{ id: 'r1', name: 'Rent', amount: 2000 }, { id: 'r2', name: 'Food', amount: 500 }] as BudgetRow[]

describe('budgetSavingsYearly', () => {
  it('saves the whole leftover with no allocation', () => {
    expect(budgetSavingsYearly({}, rows, 4000)).toBe(1500 * 12)
  })
  it('saves only the savings share once there is an allocation', () => {
    const leftover = [{ id: 'a', target: 'savings', pct: 40 }, { id: 'b', target: 'r1', pct: 60 }]
    expect(budgetSavingsYearly({ leftover }, rows, 4000)).toBe(600 * 12)
  })
  it('never saves less than nothing when overspent', () => {
    expect(budgetSavingsYearly({}, rows, 1000)).toBe(0)
  })
})
