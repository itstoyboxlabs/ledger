import { sortDebtsByApr } from './sortDebtsByApr'
import type { Debt } from '@/shared/types/Debt'

const d = (id: string, apr: number): Debt => ({ id, name: id, balance: 1, apr, payment: 0, budgetRow: null })

describe('sortDebtsByApr', () => {
  it('puts the highest rate first', () => {
    expect(sortDebtsByApr([d('a', 4), d('b', 22), d('c', 9)]).map((x) => x.id)).toEqual(['b', 'c', 'a'])
  })
  it('keeps the order of equal rates', () => {
    expect(sortDebtsByApr([d('a', 5), d('b', 5), d('c', 5)]).map((x) => x.id)).toEqual(['a', 'b', 'c'])
  })
  it('does not change the list it was given', () => {
    const l = [d('a', 1), d('b', 2)]
    sortDebtsByApr(l)
    expect(l.map((x) => x.id)).toEqual(['a', 'b'])
  })
})
