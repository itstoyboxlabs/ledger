import { incomeSourceOf } from './incomeSourceOf'
import type { IncomeOverride } from '@/shared/types/IncomeOverride'

describe('incomeSourceOf', () => {
  it('reads the override flag', () => {
    expect(incomeSourceOf({ active: 'manual' })).toBe('manual')
    expect(incomeSourceOf({ active: true })).toBe('tool')
  })
  it('defaults to statements', () => {
    expect(incomeSourceOf({ active: false })).toBe('statements')
    expect(incomeSourceOf({} as IncomeOverride)).toBe('statements')
    expect(incomeSourceOf(undefined)).toBe('statements')
  })
})
