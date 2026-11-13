import { moveDebt } from './moveDebt'
import type { Debt } from '@/shared/types/Debt'

const d = (id: string): Debt => ({ id, name: id, balance: 1, apr: 0, payment: 0, budgetRow: null })
const ids = (l: Debt[]) => l.map((x) => x.id)

describe('moveDebt', () => {
  it('moves a debt up a place', () => {
    expect(ids(moveDebt([d('a'), d('b'), d('c')], 'c', -1))).toEqual(['a', 'c', 'b'])
  })
  it('moves a debt down a place', () => {
    expect(ids(moveDebt([d('a'), d('b'), d('c')], 'a', 1))).toEqual(['b', 'a', 'c'])
  })
  it('leaves the ends where they are', () => {
    const l = [d('a'), d('b')]
    expect(moveDebt(l, 'a', -1)).toBe(l)
    expect(moveDebt(l, 'b', 1)).toBe(l)
  })
  it('ignores an unknown id', () => {
    const l = [d('a')]
    expect(moveDebt(l, 'x', 1)).toBe(l)
  })
})
