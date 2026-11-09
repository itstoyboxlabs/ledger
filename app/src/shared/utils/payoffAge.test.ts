import { payoffAge } from './payoffAge'

describe('payoffAge', () => {
  it('adds the whole years', () => {
    expect(payoffAge(38, 74)).toBe(44)
    expect(payoffAge(38, 11)).toBe(38)
  })
  it('lands on the next age right at a year boundary', () => {
    expect(payoffAge(38, 12)).toBe(39)
  })
  it('is today for a debt that is already clear', () => {
    expect(payoffAge(38, 0)).toBe(38)
  })
})
