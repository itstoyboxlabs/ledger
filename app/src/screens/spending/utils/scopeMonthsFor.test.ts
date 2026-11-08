import { loadSampleData } from '@/test-utils/loadSampleData'
import { getMonths } from '@/shared/utils/getMonths'
import { getLastCompleteMonth } from '@/shared/utils/getLastCompleteMonth'
import { scopeMonthsFor } from '@/screens/spending/utils/scopeMonthsFor'

describe('scopeMonthsFor', () => {
  beforeEach(() => loadSampleData())

  it('returns every month for all', () => {
    expect(scopeMonthsFor('all')).toEqual(getMonths())
  })
  it('returns just the month when given a known month', () => {
    expect(scopeMonthsFor(getMonths()[1] as string)).toEqual([getMonths()[1]])
  })
  it('anchors ranges on the newest complete month', () => {
    const i = getMonths().indexOf(getLastCompleteMonth() as string)
    expect(scopeMonthsFor('lastMonth')).toEqual([getLastCompleteMonth()])
    expect(scopeMonthsFor('last3')).toEqual(getMonths().slice(Math.max(0, i - 2), i + 1))
    expect(scopeMonthsFor('last6')).toEqual(getMonths().slice(Math.max(0, i - 5), i + 1))
  })
  it('limits year to date to the anchor year', () => {
    const ytd = scopeMonthsFor('ytd')
    const year = (getLastCompleteMonth() as string).slice(0, 4)
    expect(ytd.every((m) => m.startsWith(year))).toBe(true)
    expect(ytd.at(-1)).toBe(getLastCompleteMonth())
  })
  it('falls back to all months for an unknown scope', () => {
    expect(scopeMonthsFor('bogus')).toEqual(getMonths())
  })
})
