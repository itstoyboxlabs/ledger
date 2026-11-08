import { loadSampleData } from '@/test-utils/loadSampleData'
import { getAllTxns } from '@/shared/utils/getAllTxns'
import { monthOf } from '@/shared/utils/monthOf'
import { spendAmount } from '@/shared/utils/spendAmount'
import { getMonths } from '@/shared/utils/getMonths'
import { totalSpendForMonth } from './totalSpendForMonth'

describe('totalSpendForMonth', () => {
  beforeEach(() => loadSampleData())
  it('sums spendAmount over a month', () => {
    const m = getMonths()[1]
    const expected = getAllTxns().filter((t) => monthOf(t) === m).reduce((s, t) => s + spendAmount(t), 0)
    expect(totalSpendForMonth(m)).toBeCloseTo(expected, 6)
    expect(totalSpendForMonth(m)).toBeGreaterThan(0)
  })
  it('is zero for a month with no transactions', () => {
    expect(totalSpendForMonth('1999-01')).toBe(0)
  })
  it('only counts the requested month', () => {
    const all = getMonths().reduce((s, m) => s + totalSpendForMonth(m), 0)
    const whole = getAllTxns().reduce((s, t) => s + spendAmount(t), 0)
    expect(all).toBeCloseTo(whole, 4)
  })
})
