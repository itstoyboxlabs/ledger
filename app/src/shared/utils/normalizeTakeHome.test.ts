import { normalizeTakeHome } from './normalizeTakeHome'
import type { RawTakeHome } from '@/shared/types/RawTakeHome'

describe('normalizeTakeHome', () => {
  it('fills match on 401k kinds and zeroes the rest', () => {
    // match typed in as text must still count
    const out = normalizeTakeHome({
      salary: 90000,
      deductions: [{ id: 'a', kind: '401k', match: '50' }, { id: 'b', kind: 'roth401k' }, { id: 'c', kind: 'hsa', match: 100 }],
    } as unknown as RawTakeHome)
    expect(out.salary).toBe(90000)
    expect(out.deductions.map((d) => d.match)).toEqual([50, 0, 0])
  })
  it('migrates old fixed fields', () => {
    const out = normalizeTakeHome({ salary: 1, k401Pct: 6 })
    expect(out.deductions).toHaveLength(2)
    expect(out.deductions[0]).toMatchObject({ kind: '401k', amount: 6, match: 0 })
  })
})
