import type { BudgetRow } from '@/shared/types/BudgetRow'
import { amountInDayRange as calc } from './amountInDayRange'

// minimal fixtures: only the fields the calculation reads
const amountInDayRange = (row: object, from: number, to: number, days: number): number =>
  calc(row as unknown as BudgetRow, from, to, days)

describe('amountInDayRange', () => {
  it('counts a dated row once when its day is inside the range', () => {
    expect(amountInDayRange({ amount: 100, day: 10 }, 5, 15, 30)).toBe(100)
  })
  it('includes the boundary days', () => {
    expect(amountInDayRange({ amount: 100, day: 5 }, 5, 15, 30)).toBe(100)
    expect(amountInDayRange({ amount: 100, day: 15 }, 5, 15, 30)).toBe(100)
  })
  it('skips a dated row outside the range', () => {
    expect(amountInDayRange({ amount: 100, day: 4 }, 5, 15, 30)).toBe(0)
    expect(amountInDayRange({ amount: 100, day: 16 }, 5, 15, 30)).toBe(0)
  })
  it('prorates by days in range over the month length', () => {
    expect(amountInDayRange({ amount: 300, prorate: true }, 1, 10, 30)).toBe(100)
  })
  it('counts undated, non-prorated rows in full', () => {
    expect(amountInDayRange({ amount: 42 }, 1, 2, 30)).toBe(42)
  })
  it('treats a bad amount as zero', () => {
    expect(amountInDayRange({ amount: 'abc', day: 3 }, 1, 5, 30)).toBe(0)
    expect(amountInDayRange({ day: 3 }, 1, 5, 30)).toBe(0)
  })
  it('a day of 0 is dated and falls outside a 1-based range', () => {
    expect(amountInDayRange({ amount: 10, day: 0 }, 1, 31, 31)).toBe(0)
  })
  it('counts a row on the 29th to 31st on a shorter month\'s last day', () => {
    expect(amountInDayRange({ amount: 100, day: 31 }, 16, 28, 28)).toBe(100)
    expect(amountInDayRange({ amount: 100, day: 30 }, 16, 31, 28)).toBe(100)
    expect(amountInDayRange({ amount: 100, day: 31 }, 1, 15, 28)).toBe(0)
  })
  it('treats a from day below 1 as the 1st', () => {
    expect(amountInDayRange({ amount: 300, prorate: true }, -5, 10, 30)).toBe(100)
  })
})
