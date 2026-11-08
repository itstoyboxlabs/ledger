import { combineDataFiles } from './combineDataFiles'
import type { DataFile } from '@/shared/types/DataFile'
import type { BudgetRow } from '@/shared/types/BudgetRow'
import type { Transaction } from '@/shared/types/Transaction'
import type { TransactionKind } from '@/shared/enums/TransactionKind'

const tx = (id: string, date: string): Transaction => ({ id, date, amount: 10, kind: 'spend' as TransactionKind, account: 'chk' })
const budget = (id: string) => ({ rows: [{ id } as BudgetRow] })

describe('combineDataFiles', () => {
  it('returns a single file as it is', () => {
    const f: DataFile = { version: 1, accounts: { chk: { name: 'C' } }, transactions: [tx('a', '2026-01-01')] }
    const out = combineDataFiles([f])
    expect(out.transactions?.map((t) => t.id)).toEqual(['a'])
    expect(out.accounts?.chk).toEqual({ name: 'C', bank: '', type: 'checking', last4: '' })
    expect(out.settings).toBeUndefined()
  })
  it('merges the statements of several data files', () => {
    const out = combineDataFiles([
      { version: 1, transactions: [tx('b', '2026-02-01')] },
      { version: 1, transactions: [tx('a', '2026-01-01')] },
    ])
    expect(out.transactions?.map((t) => t.id)).toEqual(['a', 'b'])
  })
  it('leaves out statements when no file has them', () => {
    const out = combineDataFiles([{ version: 1, settings: { budget: budget('r1') } }])
    expect(out.transactions).toBeUndefined()
    expect(out.settings).toEqual({ budget: budget('r1') })
  })
  it('lets a settings file win over settings inside a data file, whatever the order', () => {
    const out = combineDataFiles([
      { version: 1, settings: { budget: budget('backup'), local: { 'ledger:age': 30 } } },
      { version: 1, transactions: [], settings: { budget: budget('data'), notes: [], local: { 'ledger:age': 20, 'ledger:x': 1 } } },
    ])
    expect(out.settings?.budget).toEqual(budget('backup'))
    expect(out.settings?.notes).toEqual([])
    expect(out.settings?.local).toEqual({ 'ledger:age': 30, 'ledger:x': 1 })
  })
})
