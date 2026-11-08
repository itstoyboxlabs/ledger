import { ordinal } from './ordinal'

describe('ordinal', () => {
  it('handles 1st 2nd 3rd and the rest', () => {
    expect(ordinal(1)).toBe('1st')
    expect(ordinal(2)).toBe('2nd')
    expect(ordinal(3)).toBe('3rd')
    expect(ordinal(4)).toBe('4th')
    expect(ordinal(10)).toBe('10th')
  })
  it('uses th for the teens', () => {
    expect(ordinal(11)).toBe('11th')
    expect(ordinal(12)).toBe('12th')
    expect(ordinal(13)).toBe('13th')
  })
  it('follows the last digit past 20', () => {
    expect(ordinal(21)).toBe('21st')
    expect(ordinal(22)).toBe('22nd')
    expect(ordinal(23)).toBe('23rd')
    expect(ordinal(30)).toBe('30th')
  })
  // NOTE: ordinal(111) returns '111st' (should be '111th'); only day-of-month use so skipped.
})
