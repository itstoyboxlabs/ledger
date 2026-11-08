import { statementsPart } from './statementsPart'
import type { TransactionKind } from '@/shared/enums/TransactionKind'

const tx = (id: string, date: string) => ({ id, date, amount: 10, kind: 'expense' as TransactionKind, account: 'chk' })

describe('statementsPart', () => {
  it('drops version, exportedAt and settings and keeps the rest in file order', () => {
    const out = statementsPart({
      version: 1,
      exportedAt: '2026-11-07T00:00:00.000Z',
      updated: '2026-10-31',
      notes: ['Made up.'],
      accounts: { chk: { name: 'C', bank: 'B', type: 'checking', last4: '1234' } },
      transactions: [tx('a', '2026-10-01')],
      settings: { budget: { rows: [] } },
    })
    expect(Object.keys(out)).toEqual(['updated', 'notes', 'accounts', 'transactions', 'merchants', 'periods', 'subscriptions'])
    expect(out.updated).toBe('2026-10-31')
    expect(out.notes).toEqual(['Made up.'])
  })
  it('fills missing sections, upgrades accounts and sorts transactions', () => {
    const out = statementsPart({ accounts: { chk: 'Checking' } as never, transactions: [tx('b', '2026-02-01'), tx('a', '2026-01-01')] })
    expect(out.transactions.map((t) => t.id)).toEqual(['a', 'b'])
    expect(out.accounts.chk.name).toBe('Checking')
    expect(out).toMatchObject({ merchants: {}, periods: {}, subscriptions: [] })
  })
  it('gives the same result when run twice', () => {
    const once = statementsPart({ version: 1, updated: '2026-01-31', accounts: { chk: { name: 'C' } }, transactions: [tx('a', '2026-01-01')] })
    expect(statementsPart(once)).toEqual(once)
  })
})
