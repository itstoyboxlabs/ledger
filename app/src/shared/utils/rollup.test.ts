import { rollup } from './rollup'
import type { Transaction } from '@/shared/types/Transaction'
import type { TransactionKind } from '@/shared/enums/TransactionKind'

const t = (id: number, kind: TransactionKind, amount: number, cat: string): Transaction => ({ id: String(id), date: '2026-01-01', account: 'chk', kind, amount, cat })

describe('rollup', () => {
  const txns = [
    t(1, 'expense', 50, 'Food'),
    t(2, 'expense', 30, 'Food'),
    t(3, 'refund', 10, 'Food'),
    t(4, 'expense', 100, 'Housing'),
    t(5, 'income', 999, 'Income'),
  ]
  it('groups, totals and counts by key', () => {
    const out = rollup(txns, (x) => x.cat as string)
    const food = out.find((g) => g.name === 'Food')
    expect(food?.total).toBe(70)
    expect(food?.count).toBe(3)
    expect(food?.txns).toHaveLength(3)
  })
  it('sorts by total descending', () => {
    expect(rollup(txns, (x) => x.cat as string).map((g) => g.name)).toEqual(['Housing', 'Food', 'Income'])
  })
  it('counts income but adds nothing to the total', () => {
    const inc = rollup(txns, (x) => x.cat as string).find((g) => g.name === 'Income')
    expect(inc?.total).toBe(0)
    expect(inc?.count).toBe(1)
  })
  it('returns an empty list for no transactions', () => {
    expect(rollup([], (x) => x.cat as string)).toEqual([])
  })
  it('can go negative when refunds exceed spending', () => {
    expect(rollup([t(1, 'refund', 20, 'A')], (x) => x.cat as string)[0]?.total).toBe(-20)
  })
})
