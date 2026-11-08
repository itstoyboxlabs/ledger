import { simulateRetirement } from './simulateRetirement'
import type { RetireSimInput } from '@/screens/retirement/types/RetireSimInput'

// 0% return, no tax, no Social Security, so every number can be checked by hand
const plan = (o: Partial<RetireSimInput> = {}): RetireSimInput => ({
  age: 30, accessAge: 60, endAge: 90, start401k: 10000, startSavings: 50000,
  base401k: 5000, extras401k: 0, contribSavings: 20000, freed: () => 0,
  withdrawMo: 1000, ssMonthly: 0, ssClaimAge: 67, r: 0, rAfter: 0, taxPct: 0, events: [],
  ...o,
})
const row = (res: ReturnType<typeof simulateRetirement>, age: number) => res.rows.find((x) => x.age === age)!

describe('simulateRetirement', () => {
  it('locks the 401k until the access age, then moves it into savings', () => {
    const res = simulateRetirement(plan(), 40)
    expect(row(res, 59)).toMatchObject({ k: 58750, total: 10000 })
    expect(row(res, 60)).toMatchObject({ k: 0, total: 56750 })
  })

  it('keeps 401k money paid in after the access age in savings', () => {
    const res = simulateRetirement(plan({ age: 55, endAge: 70, start401k: 100000, startSavings: 0, base401k: 10000, contribSavings: 0, withdrawMo: 0 }), 65)
    expect(row(res, 70).total).toBe(197500)
    expect(res.rows.filter((x) => x.age >= 60).every((x) => x.k === 0)).toBe(true)
  })

  it('starts with the 401k in savings when already past the access age', () => {
    const res = simulateRetirement(plan({ age: 65, endAge: 70, start401k: 100000, startSavings: 0, base401k: 10000, contribSavings: 0 }), 66)
    expect(res.runOutAge).toBeNull()
    expect(row(res, 70).total).toBe(47500)
    expect(res.rows.every((x) => x.k === 0)).toBe(true)
  })

  it('reports the starting balances at retirement when retiring now', () => {
    expect(simulateRetirement(plan(), 30).atRetirement).toEqual({ liquid: 50000, locked: 10000 })
    expect(simulateRetirement(plan({ age: 65 }), 65).atRetirement).toEqual({ liquid: 60000, locked: 0 })
  })

  it('reports the last working year at retirement otherwise', () => {
    expect(simulateRetirement(plan(), 40).atRetirement).toEqual({ liquid: 250000, locked: 58750 })
  })

  it('every row from the access age on adds up, the move included', () => {
    const res = simulateRetirement(plan({ r: 0.06, rAfter: 0.06, taxPct: 15 }), 65)
    for (const x of res.rows.filter((y) => y.age >= 60)) {
      const prev = row(res, x.age - 1)
      expect(Math.abs(prev.total + x.contrib + x.growth - x.withdrawal - x.total), `age ${x.age}`).toBeLessThan(1e-6)
    }
    // the access year shows the whole 401k moving in, on top of that year's saving
    expect(row(res, 60).contrib).toBeGreaterThan(row(res, 59).k)
  })

  it('adds freed debt payments and events, and runs out when savings go negative', () => {
    const res = simulateRetirement(plan({
      freed: (a) => (a >= 35 ? 1000 : 0),
      events: [{ kind: 'out', age: 45, repeat: 'once', amount: 300000, years: 1 }],
    }), 40)
    expect(row(res, 35).contrib).toBe(5000 + 20000 + 1000)
    expect(row(res, 45).withdrawal).toBe(312000)
    expect(res.runOutAge).toBe(45)
  })

  it('stops an Equity linked event once retired', () => {
    const res = simulateRetirement(plan({ events: [{ kind: 'in', age: 38, repeat: 'year', amount: 1000, years: 5, auto: 'equity' }] }), 40)
    expect(row(res, 39).contrib).toBe(26000)
    expect(row(res, 40).contrib).toBe(0)
  })
})
