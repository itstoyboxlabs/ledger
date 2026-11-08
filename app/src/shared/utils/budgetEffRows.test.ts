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
import { budgetEffRows } from './budgetEffRows'
import type { BudgetRow } from '@/shared/types/BudgetRow'
import { BudgetRowSource } from '@/shared/enums/BudgetRowSource'

const rent: BudgetRow = { id: 'r', name: 'Rent', amount: 1850, source: 'manual' }
const netflixRow: BudgetRow = { id: 'n', name: 'Netflix', amount: 1, source: 'subscription', hidden: true }

describe('budgetEffRows', () => {
  beforeEach(() => load())
  it('refreshes subscription rows and appends ones with no row', () => {
    const out = budgetEffRows([rent, netflixRow], {})
    expect(out[0]).toBe(rent)
    expect(out[1]).toMatchObject({ id: 'n', amount: 15, hidden: false })
    const live = out[2]
    expect(live).toMatchObject({ id: 'sub-live-Spotify', name: 'Spotify', amount: 12, source: 'subscription', __unsaved: true })
    expect(out).toHaveLength(3)
  })
  it('never lists annual subscriptions', () => {
    const out = budgetEffRows([{ id: 'p', name: 'Prime', amount: 10, source: BudgetRowSource.subscription }, rent], {})
    expect(out.map((r) => r.name)).not.toContain('Prime')
  })
  it('drops dismissed subscriptions until a newer charge', () => {
    expect(budgetEffRows([rent, netflixRow], { Netflix: '2026-10-12', Spotify: '2026-10-05' }).map((r) => r.name)).toEqual(['Rent'])
    expect(budgetEffRows([rent], { Spotify: '2026-09-01' }).map((r) => r.name)).toContain('Spotify')
  })
  it('keeps a hand-added subscription the statements have not seen', () => {
    const hulu: BudgetRow = { id: 'h', name: 'Hulu', amount: 3, source: 'subscription' }
    expect(budgetEffRows([hulu], {}).find((r) => r.id === 'h')?.amount).toBe(3)
  })
})
