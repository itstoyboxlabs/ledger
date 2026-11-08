import type { Transaction } from '@/shared/types/Transaction'
import { monthlyRows } from './monthlyRows'

const t = (date: string, kind: Transaction['kind'], amount: number, cat?: string, account = 'cc'): Transaction =>
  ({ id: `${date}${kind}${amount}`, date, account, kind, amount, cat }) as Transaction

const TXNS = [
  t('2026-09-02', 'income', 3000, undefined, 'chk'),
  t('2026-09-03', 'expense', 100, 'Food & Dining'),
  t('2026-09-04', 'refund', 20, 'Food & Dining'),
  t('2026-09-05', 'expense', 50, 'Shopping'),
  t('2026-09-06', 'transfer', 900, undefined, 'chk'),
  t('2026-10-01', 'expense', 40, 'Shopping', 'other'),
]

describe('monthlyRows', () => {
  it('totals income, spending, net and each category per month', () => {
    expect(monthlyRows(TXNS, ['2026-09'], ['cc', 'chk'])).toEqual([
      { m: '2026-09', income: 3000, spending: 130, net: 2870, 'Food & Dining': 80, Shopping: 50 },
    ])
  })
  it('returns a zero row for a month with nothing on the chosen accounts', () => {
    expect(monthlyRows(TXNS, ['2026-10'], ['cc', 'chk'])).toEqual([{ m: '2026-10', income: 0, spending: 0, net: 0 }])
  })
  it('honors the account toggles', () => {
    expect(monthlyRows(TXNS, ['2026-09', '2026-10'], ['other']).map((r) => r.spending)).toEqual([0, 40])
  })
})
