import type { RawTransactionsData } from '@/shared/types/RawTransactionsData'
import { applyData } from '@/shared/utils/applyData'
import { getAllTxns } from '@/shared/utils/getAllTxns'
import { getMonths } from '@/shared/utils/getMonths'
import { getAccounts } from '@/shared/utils/getAccounts'

const raw: RawTransactionsData = {
  accounts: { chk: { name: 'Checking', bank: 'Test Bank', type: 'checking', last4: '1111' } },
  transactions: [
    { id: 'a', date: '2026-05-03', account: 'chk', kind: 'expense', amount: 10 },
    { id: 'b', date: '2026-06-03', account: 'chk', kind: 'expense', amount: 20 },
    { id: 'c', date: '2026-06-09', account: 'chk', kind: 'expense', amount: 30 },
  ],
}

describe('applyData', () => {
  it('stores the transactions and the sorted, unique months', () => {
    applyData(raw)
    expect(getAllTxns()).toHaveLength(3)
    expect(getMonths()).toEqual(['2026-05', '2026-06'])
  })

  it('upgrades the accounts and tolerates missing sections', () => {
    applyData({ accounts: { chk: 'Checking 1234' }, transactions: [] })
    expect(getAccounts().chk.name).toBeTruthy()
    expect(getAllTxns()).toEqual([])
  })
})
