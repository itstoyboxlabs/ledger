import type { LogEntry } from '@/shared/types/LogEntry'
import { logTotalsByRow } from './logTotalsByRow'

const e = (rowId: string, amount: number): LogEntry => ({ id: `${rowId}${amount}`, date: '2026-05-01', amount, note: '', rowId, createdAt: 0 })

describe('logTotalsByRow', () => {
  it('sums and counts entries per row', () => {
    expect(logTotalsByRow([e('a', 10), e('a', 5), e('b', 3)])).toEqual({ spent: { a: 15, b: 3 }, count: { a: 2, b: 1 } })
  })
  it('counts a row whose entries net to zero', () => {
    expect(logTotalsByRow([e('a', 10), e('a', -10)])).toEqual({ spent: { a: 0 }, count: { a: 2 } })
  })
  it('is empty with no entries', () => {
    expect(logTotalsByRow([])).toEqual({ spent: {}, count: {} })
  })
})
