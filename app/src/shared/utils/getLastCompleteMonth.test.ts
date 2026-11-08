import { dataStore } from '@/shared/state/dataStore'
import { getLastCompleteMonth } from '@/shared/utils/getLastCompleteMonth'

describe('getLastCompleteMonth', () => {
  it('returns the lastCompleteMonth in the data store', () => {
    const before = dataStore.getState().lastCompleteMonth
    const value = '2026-10'
    dataStore.setState({ lastCompleteMonth: value })
    expect(getLastCompleteMonth()).toBe(value)
    dataStore.setState({ lastCompleteMonth: before })
  })
})
