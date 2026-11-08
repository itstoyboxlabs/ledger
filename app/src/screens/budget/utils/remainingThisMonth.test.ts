import { remainingThisMonth } from './remainingThisMonth'

describe('remainingThisMonth', () => {
  it('counts a bill whose day is still to come', () => {
    expect(remainingThisMonth(1500, { day: 20 }, 10, 30)).toBe(1500)
  })
  it('drops a bill once its day has come', () => {
    expect(remainingThisMonth(1500, { day: 10 }, 10, 30)).toBe(0)
    expect(remainingThisMonth(1500, { day: 1 }, 10, 30)).toBe(0)
  })
  it('scales a prorated row by the days left', () => {
    expect(remainingThisMonth(300, { prorate: true }, 10, 30)).toBe(200)
  })
  it('counts a row with no day and no proration in full', () => {
    expect(remainingThisMonth(80, {}, 29, 30)).toBe(80)
  })
})
