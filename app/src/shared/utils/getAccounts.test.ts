import { dataStore } from '@/shared/state/dataStore'
import { getAccounts } from '@/shared/utils/getAccounts'

describe('getAccounts', () => {
  it('returns the accounts in the data store', () => {
    const before = dataStore.getState().accounts
    const value = { x: { name: 'X', bank: '', type: 'checking' as const, last4: '' } }
    dataStore.setState({ accounts: value })
    expect(getAccounts()).toBe(value)
    dataStore.setState({ accounts: before })
  })
})
