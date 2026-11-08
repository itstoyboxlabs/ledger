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
import { budgetExpensesOf } from './budgetExpensesOf'
import type { BudgetFile } from '@/shared/types/BudgetFile'
import { BudgetRowSource } from '@/shared/enums/BudgetRowSource'

describe('budgetExpensesOf', () => {
  it('adds rows and live subscriptions', () => {
    load()
    const d: BudgetFile = { rows: [{ id: 'r', name: 'Rent', amount: 1850 }, { id: 'n', name: 'Netflix', amount: 1, source: BudgetRowSource.subscription }] }
    expect(budgetExpensesOf(d)).toBe(1850 + 15 + 12)
  })
  it('skips hidden rows and treats bad amounts as 0', () => {
    load()
    // amounts typed in as text must count as 0 or be read as numbers
    const d = { rows: [{ id: 'a', name: 'A', amount: 'x' }, { id: 'b', name: 'B', amount: 40, hidden: true }, { id: 'c', name: 'C', amount: '25' }], dismissedSubs: { Netflix: '2026-10-12', Spotify: '2026-10-05' } } as unknown as BudgetFile
    expect(budgetExpensesOf(d)).toBe(25)
  })
  it('skips subscriptions that were cancelled', () => {
    load({ subscriptions: [{ name: 'Dropbox', account: 'cc', cadence: 'monthly', amount: 11.99, lastSeen: '2026-10-01', cancelled: true }] })
    expect(budgetExpensesOf({ rows: [] })).toBe(0)
  })
  it('is 0 for an empty file', () => {
    load()
    expect(budgetExpensesOf({ rows: [], dismissedSubs: { Netflix: '2026-10-12', Spotify: '2026-10-05' } })).toBe(0)
  })
})
