import { leftoverAmount } from './leftoverAmount'

describe('leftoverAmount', () => {
  it('is income minus expenses', () => expect(leftoverAmount(5000, 3200)).toBe(1800))
  it('never goes below zero', () => expect(leftoverAmount(1000, 1500)).toBe(0))
  it('is zero when equal', () => expect(leftoverAmount(100, 100)).toBe(0))
})
