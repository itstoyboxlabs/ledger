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
        { id: 'a', label: 'Now', fromAge: '35', toAge: 45, salary: '90000', raisePct: 3, k401: 6, savings: 12000 },
        { id: 'b', fromAge: 45, toAge: 'retire', salary: -1, k401: 'auto' },
        { label: 'no id' },
        null,
      ],
    })
    expect(out.periods).toEqual([
      { id: 'a', label: 'Now', fromAge: 35, toAge: 45, salary: 90000, raisePct: 3, k401: 6, savings: 12000 },
      { id: 'b', label: '', fromAge: 45, toAge: 'retire', salary: 0, raisePct: 0, k401: 'auto', savings: 'auto' },
    ])
  })
  it('keeps zero as no 401k, not Auto', () => {
    expect(normalizePay({ periods: [{ id: 'a', k401: 0, savings: 0 }] }).periods[0]).toMatchObject({ k401: 0, savings: 0 })
  })
})
