import type { Subscription } from '@/shared/types/Subscription'
import type { Transaction } from '@/shared/types/Transaction'
import type { TransactionsData } from '@/shared/types/TransactionsData'
import type { TransactionKind } from '@/shared/enums/TransactionKind'
import { applyData } from '@/shared/utils/applyData'

const SUBS: Subscription[] = [
  { name: 'Netflix', account: 'cc', cadence: 'monthly', amount: 15.49, lastSeen: '2026-10-12' },
  { name: 'Spotify', account: 'cc', cadence: 'monthly', amount: 11.99, lastSeen: '2026-10-05' },
  { name: 'Prime', account: 'cc', cadence: 'annual', amount: 120, lastSeen: '2026-03-01' },
]
export const tx = (id: string, date: string, kind: TransactionKind, amount: number, merchant: string, cat: string, sub: string, extra: Partial<Transaction> = {}): Transaction => ({ id, date, account: 'chk', kind, amount, merchant, cat, sub, ...extra })
const TXNS = [
  tx('1', '2026-10-03', 'expense', 50, "Trader Joe's", 'Food & Dining', 'Groceries'),
  tx('2', '2026-10-10', 'expense', 30, "Trader Joe's", 'Food & Dining', 'Groceries'),
  tx('3', '2026-10-12', 'refund', 10, "Trader Joe's", 'Food & Dining', 'Groceries'),
  tx('4', '2026-09-05', 'expense', 99, "Trader Joe's", 'Food & Dining', 'Groceries'),
  tx('5', '2026-10-12', 'expense', 15.49, 'Netflix', 'Subscriptions & Software', 'Streaming'),
  tx('6', '2026-10-01', 'expense', 1850, 'Rent', 'Housing', 'Rent'),
  tx('7', '2026-10-15', 'income', 4000, 'Employer', 'Income', 'Payroll'),
  tx('8', '2026-10-30', 'income', 4200, 'Employer', 'Income', 'Payroll'),
  tx('9', '2026-09-15', 'income', 2000, 'Employer', 'Income', 'Payroll', { partial: true }),
  tx('10', '2026-10-20', 'income', 900, 'Venmo', 'Income', 'Other Income'),
  tx('11', '2026-10-21', 'expense', 7.5, 'Hulu', 'Subscriptions & Software', 'Streaming'),
]
const load = (over: Partial<TransactionsData> = {}) => applyData({ accounts: {}, periods: {}, subscriptions: SUBS, transactions: TXNS, ...over })
import { derivedMonthlyIncome } from './derivedMonthlyIncome'

describe('derivedMonthlyIncome', () => {
  it('doubles the average full semi-monthly paycheck and skips partial and non-payroll income', () => {
    load()
    expect(derivedMonthlyIncome()).toBe(8200)
  })
  it('multiplies by the pay frequency read from the paydays', () => {
    const pay = (id: string, date: string) => tx(id, date, 'income', 2000, 'Employer', 'Income', 'Payroll')
    load({ transactions: [pay('a', '2026-09-04'), pay('b', '2026-09-18'), pay('c', '2026-10-02')] })
    expect(derivedMonthlyIncome()).toBeCloseTo((2000 * 26) / 12, 6)
    load({ transactions: [pay('a', '2026-09-04'), pay('b', '2026-09-11'), pay('c', '2026-09-18')] })
    expect(derivedMonthlyIncome()).toBeCloseTo((2000 * 52) / 12, 6)
    load({ transactions: [pay('a', '2026-08-28'), pay('b', '2026-09-28'), pay('c', '2026-10-28')] })
    expect(derivedMonthlyIncome()).toBe(2000)
  })
  it('falls back to twice a month with a single full paycheck', () => {
    load({ transactions: [tx('a', '2026-10-15', 'income', 3000, 'Employer', 'Income', 'Payroll')] })
    expect(derivedMonthlyIncome()).toBe(6000)
  })
  it('is 0 with no paychecks', () => {
    load({ transactions: TXNS.filter((t) => t.sub !== 'Payroll') })
    expect(derivedMonthlyIncome()).toBe(0)
  })
})
