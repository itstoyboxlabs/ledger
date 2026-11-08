import { diffLabel } from './diffLabel'

describe('diffLabel', () => {
  it('signs under and over budget', () => {
    expect(diffLabel(50)).toBe('+$50')
    expect(diffLabel(-1250)).toBe('−$1,250')
  })
  it('never doubles the minus sign', () => expect(diffLabel(-50)).not.toContain('−−'))
  it('shows zero as +$0', () => expect(diffLabel(0)).toBe('+$0'))
})
