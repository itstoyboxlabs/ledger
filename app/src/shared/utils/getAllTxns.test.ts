import { dataStore } from '@/shared/state/dataStore'
import { getAllTxns } from '@/shared/utils/getAllTxns'

describe('getAllTxns', () => {
  it('returns the transactions in the data store', () => {
    const before = dataStore.getState().transactions
    const value = [{ id: 'x', date: '2026-01-01', account: 'chk', amount: 1, kind: 'expense' as const }]
    dataStore.setState({ transactions: value })
    expect(getAllTxns()).toBe(value)
    dataStore.setState({ transactions: before })
  })
})
