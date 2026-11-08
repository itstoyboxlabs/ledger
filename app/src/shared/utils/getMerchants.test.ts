import { dataStore } from '@/shared/state/dataStore'
import { getMerchants } from '@/shared/utils/getMerchants'

describe('getMerchants', () => {
  it('returns the merchants in the data store', () => {
    const before = dataStore.getState().merchants
    const value = { x: 'x.com' }
    dataStore.setState({ merchants: value })
    expect(getMerchants()).toBe(value)
    dataStore.setState({ merchants: before })
  })
})
