import { tidyPayPeriods } from './tidyPayPeriods'
import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'

const p = (id: string, fromAge: number, toAge: PayPeriod['toAge']): PayPeriod => ({
  id, label: '', fromAge, toAge, raisePct: 0,
  takeHomeFrom: 'today', takeHomePreset: '', k401: 0, saveFrom: 'today', savePreset: '', savings: 0,
})
const spans = (ps: PayPeriod[]) => ps.map((x) => [x.fromAge, x.toAge])

describe('tidyPayPeriods', () => {
  it('leaves a clean plan, gaps included, as it is', () => {
    const plan = [p('a', 35, 45), p('b', 45, 50), p('c', 52, 'retire')]
    expect(tidyPayPeriods(plan, 60)).toBe(plan)
  })
  it('moves a start that overlaps up to the previous end', () => {
    expect(spans(tidyPayPeriods([p('a', 35, 45), p('b', 40, 'retire')], 60))).toEqual([[35, 45], [45, 'retire']])
  })
  it('a later end pushes the next periods along', () => {
    expect(spans(tidyPayPeriods([p('a', 35, 50), p('b', 45, 48), p('c', 48, 'retire')], 60))).toEqual([[35, 50], [50, 51], [51, 'retire']])
  })
  it('keeps a numbered end after its start', () => {
    expect(spans(tidyPayPeriods([p('a', 35, 30)], 60))).toEqual([[35, 36]])
  })
  it('a period until retiring makes the next start at the retire age or later', () => {
    expect(spans(tidyPayPeriods([p('a', 35, 'retire'), p('b', 50, 66)], 60))).toEqual([[35, 'retire'], [60, 66]])
  })
  it('trims old saves in list order without reordering them', () => {
    expect(spans(tidyPayPeriods([p('a', 40, 50), p('b', 30, 35)], 60))).toEqual([[40, 50], [50, 51]])
  })
})
