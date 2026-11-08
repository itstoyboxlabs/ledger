import { dataStore } from '@/shared/state/dataStore'
import { getSubscriptions } from '@/shared/utils/getSubscriptions'

describe('getSubscriptions', () => {
  it('returns the subscriptions in the data store', () => {
    const before = dataStore.getState().subscriptions
    const value = [{ name: 'X', account: 'chk', cadence: 'monthly' as const, amount: 1, lastSeen: '2026-01-01' }]
    dataStore.setState({ subscriptions: value })
    expect(getSubscriptions()).toBe(value)
    dataStore.setState({ subscriptions: before })
  })
})
