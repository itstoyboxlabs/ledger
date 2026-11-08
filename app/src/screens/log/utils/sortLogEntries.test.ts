import type { LogEntry } from '@/shared/types/LogEntry'
import { sortLogEntries } from './sortLogEntries'

const e = (id: string, p: Partial<LogEntry>): LogEntry => ({ id, date: '2026-05-01', amount: 0, note: '', rowId: 'r1', createdAt: 0, ...p })
const entries = [
  e('a', { date: '2026-05-02', amount: 20, note: 'burrito', rowId: 'r2', createdAt: 1 }),
  e('b', { date: '2026-05-03', amount: 5, note: 'Apple', rowId: 'r1', createdAt: 2 }),
  e('c', { date: '2026-05-01', amount: 12, note: '', rowId: 'r3', createdAt: 3 }),
]
const names: Record<string, string> = { r1: 'Groceries', r2: 'Restaurants' }
const rowName = (id: string) => names[id] ?? ''
const ids = (list: LogEntry[]) => list.map((x) => x.id)

describe('sortLogEntries', () => {
  it('sorts by date, newest first', () => {
    expect(ids(sortLogEntries(entries, { key: 'date', dir: -1 }, rowName))).toEqual(['b', 'a', 'c'])
  })
  it('sorts by amount either way', () => {
    expect(ids(sortLogEntries(entries, { key: 'amount', dir: 1 }, rowName))).toEqual(['b', 'c', 'a'])
    expect(ids(sortLogEntries(entries, { key: 'amount', dir: -1 }, rowName))).toEqual(['a', 'c', 'b'])
  })
  it('sorts notes ignoring case, empty first going up', () => {
    expect(ids(sortLogEntries(entries, { key: 'note', dir: 1 }, rowName))).toEqual(['c', 'b', 'a'])
  })
  it('sorts by the row name, a removed row reading as empty', () => {
    expect(ids(sortLogEntries(entries, { key: 'row', dir: 1 }, rowName))).toEqual(['c', 'b', 'a'])
  })
  it('breaks ties newest created first', () => {
    const tie = [e('x', { createdAt: 1 }), e('y', { createdAt: 5 })]
    expect(ids(sortLogEntries(tie, { key: 'date', dir: 1 }, rowName))).toEqual(['y', 'x'])
  })
  it('does not change the list it is given', () => {
    const copy = [...entries]
    sortLogEntries(entries, { key: 'amount', dir: 1 }, rowName)
    expect(entries).toEqual(copy)
  })
})
