import { loadSampleData } from '@/test-utils/loadSampleData'
import { getMonths } from '@/shared/utils/getMonths'
import { ghostRowsForMonth } from './ghostRowsForMonth'
import { totalSpendForMonth } from './totalSpendForMonth'

describe('ghostRowsForMonth', () => {
  beforeEach(() => loadSampleData())
  it('with no budget rows, every dollar of spend shows up as ghosts', () => {
    const m = getMonths()[1]
    const ghosts = ghostRowsForMonth(m, [])
    const sum = ghosts.reduce((s, g) => s + g.amount, 0)
    expect(ghosts.length).toBeGreaterThan(0)
    expect(sum).toBeCloseTo(totalSpendForMonth(m), 4)
  })
  it('builds read-only ghost rows named category · subcategory, biggest first', () => {
    const ghosts = ghostRowsForMonth(getMonths()[1], [])
    for (const g of ghosts) {
      expect(g.__ghost).toBe(true)
      expect(g.id).toBe(`ghost-${g.name}`)
      expect(g.name).toContain(' · ')
    }
    const amounts = ghosts.map((g) => g.amount)
    expect(amounts).toEqual([...amounts].sort((a, b) => b - a))
  })
  it('sorts each ghost\'s charges largest first', () => {
    for (const g of ghostRowsForMonth(getMonths()[1], [])) {
      const sizes = g.txns.map((t) => Math.abs(t.amount))
      expect(sizes).toEqual([...sizes].sort((a, b) => b - a))
    }
  })
  it('a budget row that matches a group removes it', () => {
    const m = getMonths()[1]
    const first = ghostRowsForMonth(m, [])[0]
    const [cat, sub] = first.name.split(' · ')
    const rest = ghostRowsForMonth(m, [{ id: 'x', name: 'X', amount: 1, match: { cat, sub } }])
    expect(rest.find((g) => g.name === first.name)).toBeUndefined()
  })
  it('returns nothing for a month without data', () => {
    expect(ghostRowsForMonth('1999-01', [])).toEqual([])
  })
})
