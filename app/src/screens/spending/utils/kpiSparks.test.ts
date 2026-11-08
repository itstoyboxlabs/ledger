import type { Transaction } from '@/shared/types/Transaction'
import { kpiSparks } from './kpiSparks'

const t = (date: string, kind: Transaction['kind'], amount: number): Transaction =>
  ({ id: `${date}${kind}`, date, account: 'cc', kind, amount }) as Transaction

const monthly = [
  { m: '2026-08', income: 100, spending: 60, net: 40 },
  { m: '2026-09', income: 200, spending: 50, net: 150 },
  { m: '2026-10', income: 300, spending: 400, net: -100 },
]

describe('kpiSparks', () => {
  it('has one point per month for a range', () => {
    expect(kpiSparks(['2026-09', '2026-10'], monthly, [])).toEqual({ spend: [50, 400], income: [200, 300], net: [150, -100] })
  })
  it('runs day by day through a single month', () => {
    const s = kpiSparks(['2026-09'], monthly, [t('2026-09-02', 'expense', 10), t('2026-09-03', 'income', 100), t('2026-09-03', 'refund', 4)])
    expect(s.spend).toHaveLength(30)
    expect(s.spend.slice(0, 4)).toEqual([0, 10, 6, 6])
    expect(s.income.slice(0, 4)).toEqual([0, 0, 100, 100])
    expect(s.net.at(-1)).toBe(94)
  })
  it('leaves transfers out', () => {
    const s = kpiSparks(['2026-09'], monthly, [t('2026-09-02', 'transfer', 500)])
    expect(s.spend.at(-1)).toBe(0)
    expect(s.income.at(-1)).toBe(0)
  })
})
