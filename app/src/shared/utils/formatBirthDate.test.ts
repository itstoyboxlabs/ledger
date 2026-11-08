import { formatBirthDate } from './formatBirthDate'

describe('formatBirthDate', () => {
  it('turns YYYY-MM-DD into MM-DD-YYYY', () => {
    expect(formatBirthDate('1990-04-05')).toBe('04-05-1990')
  })
})
