import { mergeData } from './mergeData'
import { getData } from './getData'
import { getAllTxns } from './getAllTxns'
import { getAccounts } from './getAccounts'
import { applyData } from './applyData'
import { seedStorage } from '@/test-utils/seedStorage'
import type { Transaction } from '@/shared/types/Transaction'
import type { TransactionKind } from '@/shared/enums/TransactionKind'
import type { Subscription } from '@/shared/types/Subscription'
import type { Period } from '@/shared/types/Period'

// 'spend' is not a real kind; mergeData does not look at it
const tx = (id: string, date: string, extra: Partial<Transaction> = {}): Transaction => ({ id, date, amount: 10, kind: 'spend' as TransactionKind, account: 'chk', ...extra })

const subscription = (name: string, amount: number): Subscription => ({ name, account: 'chk', cadence: 'monthly', amount, lastSeen: '2026-01-01' })
const period: Period = { account: 'chk', start: '2026-01-01', end: '2026-01-31' }

beforeEach(async () => {
  await seedStorage()
  applyData({ accounts: {}, transactions: [] })
})
afterEach(() => localStorage.clear())

describe('mergeData', () => {
  it('stores the data and loads it into the app', async () => {
    await mergeData({ transactions: [tx('b', '2026-02-01'), tx('a', '2026-01-01')], accounts: { chk: 'Checking ••1234' } })
    expect(getAllTxns().map((t) => t.id)).toEqual(['a', 'b'])
    const saved = await getData()
    expect(saved?.transactions?.map((t) => t.id)).toEqual(['a', 'b'])
    expect(saved?.accounts?.chk).toEqual({ name: 'Checking ••1234', bank: '', type: 'checking', last4: '1234' })
  })
  it('unions transactions by id and the file wins', async () => {
    await mergeData({ transactions: [tx('a', '2026-01-01', { amount: 1 })] })
    await mergeData({ transactions: [tx('a', '2026-01-01', { amount: 99 }), tx('c', '2026-03-01')] })
    expect(getAllTxns()).toHaveLength(2)
    expect(getAllTxns().find((t) => t.id === 'a')?.amount).toBe(99)
  })
  it('replaces every row of a statement that is imported again', async () => {
    await mergeData({ transactions: [
      tx('cc-10-001', '2026-10-01', { statement: 'cc-2026-10' }),
      tx('cc-10-002', '2026-10-02', { statement: 'cc-2026-10' }),
      tx('cc-09-001', '2026-09-01', { statement: 'cc-2026-09' }),
      tx('loose', '2026-10-03'),
    ] })
    // the corrected statement numbers its rows differently
    await mergeData({ transactions: [tx('cc-2026-10-001', '2026-10-02', { statement: 'cc-2026-10', amount: 12 })] })
    expect(getAllTxns().map((t) => t.id)).toEqual(['cc-09-001', 'cc-2026-10-001', 'loose'])
  })
  it('keeps existing rows when the incoming rows have no statement', async () => {
    await mergeData({ transactions: [tx('a', '2026-10-01', { statement: 'cc-2026-10' })] })
    await mergeData({ transactions: [tx('b', '2026-10-02')] })
    expect(getAllTxns().map((t) => t.id)).toEqual(['a', 'b'])
  })
  it('merges subscriptions by name and periods and merchants by key', async () => {
    await mergeData({ transactions: [], subscriptions: [subscription('Net', 1)], merchants: { m1: 'x' }, periods: { p1: period } })
    await mergeData({ transactions: [], subscriptions: [subscription('Net', 2), subscription('Gym', 3)], merchants: { m2: 'y' }, periods: { p2: period } })
    const saved = await getData()
    expect(saved?.subscriptions).toEqual([subscription('Net', 2), subscription('Gym', 3)])
    expect(Object.keys(saved?.merchants ?? {})).toEqual(['m1', 'm2'])
    expect(Object.keys(saved?.periods ?? {})).toEqual(['p1', 'p2'])
  })
  it('switches on a new account in the saved Spending selection', async () => {
    applyData({ accounts: { chk: { name: 'C' } }, transactions: [] })
    localStorage.setItem('ledger:accounts', JSON.stringify(['chk']))
    await mergeData({ transactions: [], accounts: { chk: { name: 'C' }, cc: { name: 'Card', type: 'card' } } })
    expect(JSON.parse(localStorage.getItem('ledger:accounts') ?? 'null')).toEqual(['chk', 'cc'])
    expect(Object.keys(getAccounts())).toEqual(['chk', 'cc'])
  })
  it('leaves the selection alone when none was saved', async () => {
    await mergeData({ transactions: [], accounts: { cc: { name: 'Card' } } })
    expect(localStorage.getItem('ledger:accounts')).toBeNull()
  })
})
