import { normalizePay } from './normalizePay'

describe('normalizePay', () => {
  it('reads a missing or broken plan as no periods', () => {
    expect(normalizePay(undefined)).toEqual({ periods: [] })
    expect(normalizePay({ periods: 'x' })).toEqual({ periods: [] })
    expect(normalizePay([])).toEqual({ periods: [] })
  })
  it('cleans each period and drops ones without an id', () => {
    const out = normalizePay({
      periods: [
        { id: 'a', label: 'Now', fromAge: '35', toAge: 45, raisePct: 3, takeHomeFrom: 'preset', takeHomePreset: 'th1', k401: '6000', saveFrom: 'preset', savePreset: 'b1', savings: 12000 },
        { id: 'b', fromAge: 45, toAge: 'retire', takeHomeFrom: 'bogus', k401: -1, saveFrom: 'today' },
        { label: 'no id' },
        null,
      ],
    })
    expect(out.periods).toEqual([
      { id: 'a', label: 'Now', fromAge: 35, toAge: 45, raisePct: 3, takeHomeFrom: 'preset', takeHomePreset: 'th1', k401: 6000, saveFrom: 'preset', savePreset: 'b1', savings: 12000 },
      { id: 'b', label: '', fromAge: 45, toAge: 'retire', raisePct: 0, takeHomeFrom: 'typed', takeHomePreset: '', k401: 0, saveFrom: 'today', savePreset: '', savings: 0 },
    ])
  })
  it('reads periods saved with pay', () => {
    const [a, b, c] = normalizePay({ periods: [
      { id: 'a', fromAge: 35, payFrom: 'preset', payPreset: 'th1', salary: 90000, k401: 4, saveFrom: 'today' },
      { id: 'b', fromAge: 45, payFrom: 'typed', salary: 50000, k401: 6, saveFrom: 'typed', savings: 8000 },
      { id: 'c', fromAge: 50, salary: 50000, k401: 'auto', savings: 'auto' },
    ] }).periods
    expect(a).toMatchObject({ takeHomeFrom: 'preset', takeHomePreset: 'th1', k401: 3600, saveFrom: 'today' })
    expect(b).toMatchObject({ takeHomeFrom: 'typed', k401: 3000, saveFrom: 'typed', savings: 8000 })
    expect(c).toMatchObject({ takeHomeFrom: 'today', saveFrom: 'today' })
    expect(a).not.toHaveProperty('salary')
  })
  it('turns a number of years into an until age', () => {
    expect(normalizePay({ periods: [{ id: 'a', fromAge: 35, years: 10 }] }).periods[0].toAge).toBe(45)
    expect(normalizePay({ periods: [{ id: 'a', fromAge: 35, toAge: 50, years: 10 }] }).periods[0].toAge).toBe(50)
  })
})
