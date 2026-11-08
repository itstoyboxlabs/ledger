import { payoffEventsByDebt } from './payoffEventsByDebt'
import type { RetireEvent } from '@/screens/retirement/types/RetireEvent'

const ev = (id: string, debtId: string, age: number, kind: RetireEvent['kind'] = 'debt'): RetireEvent =>
  ({ id, name: '', amount: 0, kind, age, repeat: 'once', years: 1, debtId })

describe('payoffEventsByDebt', () => {
  it('maps a debt to its payoff event inside the plan', () => {
    const e = ev('e1', 'd1', 40)
    expect(payoffEventsByDebt([e], ['d1'], 30, 90)).toEqual({ d1: e })
  })
  it('counts events at the current age and at the end age', () => {
    expect(Object.keys(payoffEventsByDebt([ev('e1', 'd1', 30), ev('e2', 'd2', 90)], ['d1', 'd2'], 30, 90))).toEqual(['d1', 'd2'])
  })
  it('ignores an event set before today or after the end age', () => {
    expect(payoffEventsByDebt([ev('e1', 'd1', 29), ev('e2', 'd1', 91)], ['d1'], 30, 90)).toEqual({})
  })
  it('skips an out-of-range event and uses a later one that fits', () => {
    const fits = ev('e2', 'd1', 50)
    expect(payoffEventsByDebt([ev('e1', 'd1', 20), fits], ['d1'], 30, 90)).toEqual({ d1: fits })
  })
  it('keeps the first event per debt', () => {
    const first = ev('e1', 'd1', 40)
    expect(payoffEventsByDebt([first, ev('e2', 'd1', 45)], ['d1'], 30, 90)).toEqual({ d1: first })
  })
  it('ignores other kinds and unknown debts', () => {
    expect(payoffEventsByDebt([ev('e1', 'd1', 40, 'out'), ev('e2', 'gone', 40)], ['d1'], 30, 90)).toEqual({})
  })
})
