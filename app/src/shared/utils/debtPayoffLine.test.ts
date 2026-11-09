import { debtPayoffLine } from './debtPayoffLine'

describe('debtPayoffLine', () => {
  it('says when it is paid off, at what age and what is freed', () => {
    // 28,490 at 0% and 385 a month is 74 months
    expect(debtPayoffLine(28490, 0, 385, 38)).toBe('Paid off in 6 years 2 months (age 44). Then $385 a month is freed up.')
  })
  it('leaves the age out when it is not known', () => {
    expect(debtPayoffLine(1000, 0, 250, null)).toBe('Paid off in 4 months. Then $250 a month is freed up.')
  })
  it('includes interest', () => {
    // 1,000 at 12% and 100 a month takes 11 months, not 10
    expect(debtPayoffLine(1000, 12, 100, 30)).toBe('Paid off in 11 months (age 30). Then $100 a month is freed up.')
  })
  it('shows cents when the payment has them', () => {
    expect(debtPayoffLine(1000, 0, 250.5, null)).toBe('Paid off in 4 months. Then $250.50 a month is freed up.')
  })
  it('says plainly when the payment does not cover the interest', () => {
    expect(debtPayoffLine(12000, 12, 100, 30)).toBe('Your payment does not cover the interest, so this debt is never paid off at this payment.')
  })
  it('asks for a payment when there is none', () => {
    expect(debtPayoffLine(1000, 5, 0, 30)).toBe('Add a monthly payment to see when this debt is paid off.')
  })
  it('says a cleared debt is already paid off', () => {
    expect(debtPayoffLine(0, 5, 100, 30)).toBe('This debt is already paid off.')
  })
})
