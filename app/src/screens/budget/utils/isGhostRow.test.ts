import type { GhostRow } from '@/screens/budget/types/GhostRow'
import type { EffectiveBudgetRow } from '@/shared/types/EffectiveBudgetRow'
import { isGhostRow } from './isGhostRow'

describe('isGhostRow', () => {
  it('is true for a ghost row', () => {
    const g: GhostRow = { id: 'g1', name: 'Shopping', amount: 40, txns: [], __ghost: true }
    expect(isGhostRow(g)).toBe(true)
  })
  it('is false for a real row and the section markers', () => {
    expect(isGhostRow({ id: 'r1', name: 'Rent', amount: 1000 } as EffectiveBudgetRow)).toBe(false)
    expect(isGhostRow('ghost-header')).toBe(false)
    expect(isGhostRow('ghost-total')).toBe(false)
    expect(isGhostRow(null)).toBe(false)
  })
})
