import { dataStore } from '@/shared/state/dataStore'
import { getMonths } from '@/shared/utils/getMonths'

describe('getMonths', () => {
  it('returns the months in the data store', () => {
    const before = dataStore.getState().months
    const value = ['2026-01']
    dataStore.setState({ months: value })
    expect(getMonths()).toBe(value)
    dataStore.setState({ months: before })
  })
})
