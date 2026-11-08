import { eventAmountAt } from './eventAmountAt'
import type { RetireEvent } from '@/screens/retirement/types/RetireEvent'

const ev = (age: number, repeat: RetireEvent['repeat']) => ({ age, repeat })

describe('eventAmountAt', () => {
  it('once pays only at the start age', () => {
    const e = ev(40, 'once')
    expect(eventAmountAt(e, 40, 100, 1)).toBe(100)
    expect(eventAmountAt(e, 39, 100, 1)).toBe(0)
    expect(eventAmountAt(e, 41, 100, 1)).toBe(0)
  })
  it('year pays each year inside the window', () => {
    const e = ev(40, 'year')
    expect(eventAmountAt(e, 39, 100, 3)).toBe(0)
    expect([40, 41, 42].map((a) => eventAmountAt(e, a, 100, 3))).toEqual([100, 100, 100])
    expect(eventAmountAt(e, 43, 100, 3)).toBe(0)
  })
  it('month sums twelve months', () => {
    expect(eventAmountAt(ev(40, 'month'), 41, 50, 5)).toBe(600)
  })
  it('2year pays every second year from the start', () => {
    const e = ev(40, '2year')
    expect([40, 41, 42, 43].map((a) => eventAmountAt(e, a, 10, 4))).toEqual([10, 0, 10, 0])
  })
  it('handles zero amounts', () => {
    expect(eventAmountAt(ev(40, 'once'), 40, 0, 1)).toBe(0)
  })
})
