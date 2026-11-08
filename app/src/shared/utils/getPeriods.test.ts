import { dataStore } from '@/shared/state/dataStore'
import { getPeriods } from '@/shared/utils/getPeriods'

describe('getPeriods', () => {
  it('returns the periods in the data store', () => {
    const before = dataStore.getState().periods
    const value = { x: { account: 'chk', start: '2026-01-01', end: '2026-01-31' } }
    dataStore.setState({ periods: value })
    expect(getPeriods()).toBe(value)
    dataStore.setState({ periods: before })
  })
})
