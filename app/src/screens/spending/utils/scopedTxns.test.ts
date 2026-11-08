import type { Transaction } from '@/shared/types/Transaction'
import { scopedTxns } from '@/screens/spending/utils/scopedTxns'

const t = (id: string, date: string, account: string, kind: Transaction['kind'] = 'expense'): Transaction =>
  ({ id, date, account, kind, amount: 1 }) as Transaction
const TXNS = [t('a', '2026-09-03', 'cc'), t('b', '2026-10-03', 'cc'), t('c', '2026-10-04', 'chk', 'transfer'), t('d', '2026-10-05', 'sav')]

describe('scopedTxns', () => {
  it('keeps only the months in scope', () => {
    expect(scopedTxns(TXNS, ['2026-10'], ['cc', 'chk', 'sav']).map((x) => x.id)).toEqual(['b', 'c', 'd'])
  })
  it('honors the account toggles', () => {
    expect(scopedTxns(TXNS, ['2026-09', '2026-10'], ['cc', 'chk']).map((x) => x.id)).toEqual(['a', 'b', 'c'])
  })
  it('keeps transfers', () => {
    expect(scopedTxns(TXNS, ['2026-10'], ['chk']).map((x) => x.kind)).toEqual(['transfer'])
  })
})
