import { cap401kLines } from './cap401kLines'
import type { DeductionLine } from '@/shared/types/DeductionLine'

const line = (id: string, kind: DeductionLine['kind'], yearly: number): DeductionLine =>
  ({ id, kind, unit: 'yr', amount: yearly, yearly })

describe('cap401kLines', () => {
  it('leaves amounts under the limit alone', () =>
    expect(cap401kLines([line('a', '401k', 20000)])).toEqual([line('a', '401k', 20000)]))
  it('caps a single 401k at 24,500 and marks it', () =>
    expect(cap401kLines([line('a', '401k', 30000)])[0]).toMatchObject({ yearly: 24500, capped: true }))
  it('traditional and Roth share one limit, filled in order', () => {
    const r = cap401kLines([line('a', '401k', 20000), line('b', 'roth401k', 10000)])
    expect(r.map((l) => l.yearly)).toEqual([20000, 4500])
    expect(r[0].capped).toBeUndefined()
    expect(r[1].capped).toBe(true)
  })
  it('does not touch other kinds', () =>
    expect(cap401kLines([line('a', '401k', 30000), line('b', 'insurance', 30000)])[1].yearly).toBe(30000))
})
