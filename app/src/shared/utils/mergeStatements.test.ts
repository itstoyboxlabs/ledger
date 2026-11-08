import { mergeStatements } from './mergeStatements'
import type { Transaction } from '@/shared/types/Transaction'
import type { TransactionKind } from '@/shared/enums/TransactionKind'
import type { Subscription } from '@/shared/types/Subscription'
import type { Period } from '@/shared/types/Period'
import type { TransactionsData } from '@/shared/types/TransactionsData'

// 'spend' is not a real kind; mergeStatements does not look at it
const tx = (id: string, date: string, extra: Partial<Transaction> = {}): Transaction => ({ id, date, amount: 10, kind: 'spend' as TransactionKind, account: 'chk', ...extra })
const subscription = (name: string, amount: number): Subscription => ({ name, account: 'chk', cadence: 'monthly', amount, lastSeen: '2026-01-01' })
const period: Period = { account: 'chk', start: '2026-01-01', end: '2026-01-31' }
const empty = (): TransactionsData => ({ accounts: {}, merchants: {}, periods: {}, subscriptions: [], transactions: [] })

describe('mergeStatements', () => {
  it('sorts transactions by date and upgrades legacy accounts', () => {
    const out = mergeStatements(empty(), { transactions: [tx('b', '2026-02-01'), tx('a', '2026-01-01')], accounts: { chk: 'Checking ••1234' } })
    expect(out.transactions.map((t) => t.id)).toEqual(['a', 'b'])
    expect(out.accounts.chk).toEqual({ name: 'Checking ••1234', bank: '', type: 'checking', last4: '1234' })
  })
  it('unions transactions by id and the later file wins', () => {
    const first = mergeStatements(empty(), { transactions: [tx('a', '2026-01-01', { amount: 1 })] })
    const out = mergeStatements(first, { transactions: [tx('a', '2026-01-01', { amount: 99 }), tx('c', '2026-03-01')] })
    expect(out.transactions).toHaveLength(2)
    expect(out.transactions.find((t) => t.id === 'a')?.amount).toBe(99)
  })
  it('replaces every row of a statement that appears again', () => {
    const first = mergeStatements(empty(), { transactions: [
      tx('cc-10-001', '2026-10-01', { statement: 'cc-2026-10' }),
      tx('cc-10-002', '2026-10-02', { statement: 'cc-2026-10' }),
      tx('cc-09-001', '2026-09-01', { statement: 'cc-2026-09' }),
      tx('loose', '2026-10-03'),
    ] })
    // the corrected statement numbers its rows differently
    const out = mergeStatements(first, { transactions: [tx('cc-2026-10-001', '2026-10-02', { statement: 'cc-2026-10', amount: 12 })] })
    expect(out.transactions.map((t) => t.id)).toEqual(['cc-09-001', 'cc-2026-10-001', 'loose'])
  })
  it('keeps earlier rows when the later rows have no statement', () => {
    const first = mergeStatements(empty(), { transactions: [tx('a', '2026-10-01', { statement: 'cc-2026-10' })] })
    expect(mergeStatements(first, { transactions: [tx('b', '2026-10-02')] }).transactions.map((t) => t.id)).toEqual(['a', 'b'])
  })
  it('merges subscriptions by name and periods and merchants by key', () => {
    const first = mergeStatements(empty(), { subscriptions: [subscription('Net', 1)], merchants: { m1: 'x' }, periods: { p1: period } })
    const out = mergeStatements(first, { subscriptions: [subscription('Net', 2), subscription('Gym', 3)], merchants: { m2: 'y' }, periods: { p2: period } })
    expect(out.subscriptions).toEqual([subscription('Net', 2), subscription('Gym', 3)])
    expect(Object.keys(out.merchants)).toEqual(['m1', 'm2'])
    expect(Object.keys(out.periods)).toEqual(['p1', 'p2'])
  })
  it('does not change the base it was given', () => {
    const base = empty()
    mergeStatements(base, { transactions: [tx('a', '2026-01-01')], accounts: { chk: { name: 'C' } } })
    expect(base).toEqual(empty())
  })
})
