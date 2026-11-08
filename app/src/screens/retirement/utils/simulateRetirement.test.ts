import { simulateRetirement } from './simulateRetirement'
import type { RetireSimInput } from '@/screens/retirement/types/RetireSimInput'
import { incomeTaxOnExtra } from '@/shared/utils/incomeTaxOnExtra'

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

  describe('tax on 401k withdrawals', () => {
    const flat20 = (g: number) => g * 0.2
    const texas = (g: number) => incomeTaxOnExtra(0, g, 'tx').total

    it('with no pre-tax money gives exactly the untaxed result', () => {
      const cases: Partial<RetireSimInput>[] = [
        { start401k: 0, base401k: 0 },
        { start401k: 0, base401k: 0, r: 0.06, rAfter: 0.05, taxPct: 15, withdrawMo: 3000, ssMonthly: 1200 },
        { start401k: 0, base401k: 0, age: 62, startSavings: -5000, events: [{ kind: 'out', age: 70, repeat: 'year', amount: 9000, years: 3 }] },
      ]
      for (const o of cases) {
        for (const at of [30, 40, 55, 70]) {
          expect(simulateRetirement(plan({ ...o, incomeTax: texas }), at)).toEqual(simulateRetirement(plan(o), at))
        }
      }
    })

    it('keeps the 401k its own pool after the access age and counts it in the total', () => {
      const res = simulateRetirement(plan({ incomeTax: flat20 }), 40)
      expect(row(res, 59)).toMatchObject({ k: 58750, total: 10000, tax: 0 })
      // savings 10,000 pay the first 10,000 of the 12,000; 2,000 more costs 2,500 pre-tax
      expect(row(res, 60).k).toBe(0)
      expect(row(res, 60).s).toBe(0)
      expect(row(res, 60).tax).toBeCloseTo(500, 1)
      expect(row(res, 60).total).toBeCloseTo(58750 - 2500, 1)
      // a full year from the pool: 12,000 needs 15,000 out
      expect(row(res, 61).tax).toBeCloseTo(3000, 1)
      expect(row(res, 61).total).toBeCloseTo(58750 - 2500 - 15000, 1)
    })

    it('spends regular savings before touching the 401k', () => {
      const res = simulateRetirement(plan({ incomeTax: flat20, startSavings: 500000 }), 40)
      expect(res.rows.every((x) => x.tax === 0)).toBe(true)
    })

    it('runs out sooner than the untaxed plan', () => {
      const o = { age: 55, endAge: 90, start401k: 600000, startSavings: 0, base401k: 0, contribSavings: 0, withdrawMo: 4000 }
      const untaxed = simulateRetirement(plan(o), 60).runOutAge!
      const taxed = simulateRetirement(plan({ ...o, incomeTax: texas }), 60).runOutAge!
      expect(untaxed).toBeGreaterThan(taxed)
    })

    it('a bigger yearly withdrawal pays a higher share in tax', () => {
      const share = (need: number) => {
        const res = simulateRetirement(plan({ age: 60, start401k: 5000000, startSavings: 0, base401k: 0, contribSavings: 0, withdrawMo: need, incomeTax: texas }), 60)
        return row(res, 61).tax / (need * 12)
      }
      expect(share(10000)).toBeGreaterThan(share(4000))
      expect(share(4000)).toBeGreaterThan(share(1500))
    })

    it('takes Roth money last and tax free', () => {
      const res = simulateRetirement(plan({ age: 60, start401k: 0, startRoth: 100000, startSavings: 0, base401k: 0, contribSavings: 0, incomeTax: flat20 }), 60)
      expect(row(res, 60)).toMatchObject({ tax: 0, total: 88000 })
      const mixed = simulateRetirement(plan({ age: 60, start401k: 5000, startRoth: 100000, startSavings: 0, base401k: 0, contribSavings: 0, incomeTax: flat20 }), 60)
      // 5,000 pre-tax nets 4,000, Roth covers the other 8,000
      expect(row(mixed, 60)).toMatchObject({ tax: 1000, total: 92000 })
    })

    it('a Roth pool grows at the full rate while locked and shows with the 401k', () => {
      const res = simulateRetirement(plan({ start401k: 0, base401k: 0, startRoth: 10000, r: 0.1, rAfter: 0.1, incomeTax: flat20 }), 40)
      expect(row(res, 30).k).toBeCloseTo(11000, 6)
    })

    it('new 401k money after the access age stays pre-tax', () => {
      const res = simulateRetirement(plan({ age: 60, start401k: 0, startSavings: 0, base401k: 10000, contribSavings: 0, withdrawMo: 0, incomeTax: flat20 }), 65)
      expect(row(res, 64)).toMatchObject({ s: 0, total: 47500, tax: 0 })
    })

    it('every row adds up with the tax column', () => {
      const res = simulateRetirement(plan({ r: 0.06, rAfter: 0.06, taxPct: 15, startRoth: 20000, withdrawMo: 3000, incomeTax: texas }), 45)
      for (const x of res.rows.filter((y) => y.age >= 60)) {
        const prev = row(res, x.age - 1)
        expect(Math.abs(prev.total + x.contrib + x.growth - x.withdrawal - x.tax - x.total), `age ${x.age}`).toBeLessThan(0.01)
      }
    })

    it('reports the pools as locked or liquid at retirement', () => {
      expect(simulateRetirement(plan({ incomeTax: flat20, startRoth: 1000 }), 30).atRetirement).toEqual({ liquid: 50000, locked: 11000 })
      expect(simulateRetirement(plan({ age: 65, incomeTax: flat20, startRoth: 1000 }), 65).atRetirement).toEqual({ liquid: 61000, locked: 0 })
    })
  })
})
