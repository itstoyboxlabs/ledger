import { SUBS_SORT_KEYS } from '@/screens/spending/constants/SUBS_SORT_KEYS'

describe('SUBS_SORT_KEYS', () => {
  it('lists every sortable subscription column once', () => {
    expect(SUBS_SORT_KEYS).toEqual(['name', 'billing', 'account', 'cadence', 'price', 'month'])
    expect(new Set(SUBS_SORT_KEYS).size).toBe(SUBS_SORT_KEYS.length)
  })
})
