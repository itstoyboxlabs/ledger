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
const tx = (id: string, date: string, kind: TransactionKind, amount: number, merchant: string, cat: string, sub: string, extra: Partial<Transaction> = {}): Transaction => ({ id, date, account: 'chk', kind, amount, merchant, cat, sub, ...extra })
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
import { taxOn } from '@/shared/utils/taxOn'
import { budgetIncomeFor } from './budgetIncomeFor'
import { takeHomeMonthly } from './takeHomeMonthly'
import type { RawTakeHome } from '@/shared/types/RawTakeHome'

describe('budgetIncomeFor', () => {
  beforeEach(() => load())
  const th: RawTakeHome = { salary: 120000, deductions: [] }
  it('uses the manual amount', () => {
    expect(budgetIncomeFor({ active: 'manual', amount: '3500' as unknown as number }, th, 'wy')).toBe(3500)
    expect(budgetIncomeFor({ active: 'manual', amount: 'abc' as unknown as number }, th, 'wy')).toBe(0)
  })
  it('uses the take-home tool', () => {
    const got = budgetIncomeFor({ active: true }, th, 'wy')
    expect(got).toBe(takeHomeMonthly(th, 'wy'))
    expect(got).toBeCloseTo((120000 - taxOn(120000, 'wy').total) / 12, 5)
  })
  it('falls back to statement paychecks', () => {
    expect(budgetIncomeFor(undefined, th, 'wy')).toBe(8200)
    expect(budgetIncomeFor({ active: false }, th, 'wy')).toBe(8200)
  })
})
