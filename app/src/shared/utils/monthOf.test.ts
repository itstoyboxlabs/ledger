import { monthOf } from './monthOf'
import type { Transaction } from '@/shared/types/Transaction'

describe('monthOf', () => {
  it('returns the YYYY-MM prefix of the date', () => {
    expect(monthOf({ date: '2026-10-03' })).toBe('2026-10')
    expect(monthOf({ date: '2026-01-31' })).toBe('2026-01')
  })
  it('works at year boundaries', () => {
    expect(monthOf({ date: '2025-12-31' })).toBe('2025-12')
    expect(monthOf({ date: '2026-01-01' })).toBe('2026-01')
  })
  it('ignores other transaction fields', () => {
    expect(monthOf({ date: '2026-03-09', amount: 5, kind: 'expense' } as Transaction)).toBe('2026-03')
  })
})
