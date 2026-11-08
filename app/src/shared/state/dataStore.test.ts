import { dataStore } from '@/shared/state/dataStore'

describe('dataStore', () => {
  it('starts empty', () => {
    const s = dataStore.getState()
    expect(s.transactions).toEqual([])
    expect(s.accounts).toEqual({})
    expect(s.lastCompleteMonth).toBeUndefined()
  })

  it('can be replaced and read back', () => {
    dataStore.setState({ months: ['2026-01'] })
    expect(dataStore.getState().months).toEqual(['2026-01'])
    dataStore.setState({ months: [] })
  })
})
