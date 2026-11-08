import { isFilingStatus } from './isFilingStatus'

describe('isFilingStatus', () => {
  it('accepts the two statuses', () => {
    expect(isFilingStatus('single')).toBe(true)
    expect(isFilingStatus('mfj')).toBe(true)
  })
  it('rejects anything else', () => {
    for (const v of ['hoh', 'mfs', '', null, undefined, 1, {}]) expect(isFilingStatus(v)).toBe(false)
  })
})
