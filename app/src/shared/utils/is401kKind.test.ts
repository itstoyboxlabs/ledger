import { is401kKind } from './is401kKind'

describe('is401kKind', () => {
  it('is true for both 401k kinds', () => {
    expect(is401kKind('401k')).toBe(true)
    expect(is401kKind('roth401k')).toBe(true)
  })
  it('is false for others', () => {
    expect(is401kKind('hsa')).toBe(false)
    expect(is401kKind(undefined)).toBe(false)
  })
})
