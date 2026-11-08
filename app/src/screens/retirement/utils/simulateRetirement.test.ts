import { simulateRetirement } from './simulateRetirement'
import type { RetireSimInput } from '@/screens/retirement/types/RetireSimInput'
import type { RetireSimPay } from '@/screens/retirement/types/RetireSimPay'
import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'
import { ssMonthlyBenefit } from '@/shared/utils/ssMonthlyBenefit'

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

// Pinned from the projection as it was before the pay plan existed. Old saves (no plan)
// must keep producing exactly these numbers.
describe('simulateRetirement with no pay plan (regression)', () => {
  const input: RetireSimInput = {
    age: 35, accessAge: 60, endAge: 95, start401k: 40000, startSavings: 25000,
    base401k: 6000, extras401k: 1200, contribSavings: 18000, freed: (a) => (a >= 38 ? 2400 : 0),
    withdrawMo: 4500, ssMonthly: 1800, ssClaimAge: 67, r: 0.07, rAfter: 0.05, taxPct: 15,
    events: [
      { kind: 'in', age: 40, repeat: 'once', amount: 20000, years: 1 },
      { kind: 'out', age: 50, repeat: 'year', amount: 5000, years: 4 },
      { kind: 'in', age: 53, repeat: 'year', amount: 3000, years: 3, auto: 'equity' },
      { kind: 'out', age: 70, repeat: 'month', amount: 300, years: 3 },
    ],
  }
  const PIN: Record<number, [number, number, number, number, number]> = {
    // age: k, total, contrib, growth, withdrawal
    35: [48500, 44487.5, 23700, 1487.5000000000002, 0],
    40: [109429.07981095, 188397.35691433892, 47600, 8311.319241532012, 0],
    53: [408719.74944837444, 764484.9413959354, 30600, 41899.05994625593, 5000],
    55: [466756.6385052487, 814790.0967138758, 0, 35418.301304882225, 54000],
    60: [0, 1305055.6355001996, 595712.8918987265, 31119.4883482615, 54000],
    67: [0, 1338313.7231252927, 0, 55880.41557105509, 32400],
    72: [0, 1460294.793641652, 0, 61000.02755853258, 36000],
    95: [0, 2580247.566623537, 0, 106510.81206858544, 32400],
  }
  for (const pay of [undefined, { periods: [] } as unknown as RetireSimPay]) {
    it(`gives the same rows as before ${pay ? 'with an empty plan' : 'with no plan'}`, () => {
      const res = simulateRetirement({ ...input, pay }, 55)
      for (const [age, [k, total, contrib, growth, withdrawal]] of Object.entries(PIN)) {
        expect(row(res, Number(age))).toMatchObject({ k, total, s: total, contrib, growth, withdrawal })
      }
      expect(res.runOutAge).toBeNull()
      expect(res.atRetirement).toEqual({ liquid: 833371.7954089935, locked: 444530.13190976065 })
      expect(res.ssMonthly).toBe(1800)
      const early = simulateRetirement({ ...input, pay }, 45)
      expect(early.runOutAge).toBe(51)
      expect(row(early, 95).total).toBe(-1390445.1657454837)
    })
  }
})

// a hand-checkable pay plan: take-home is 70% of pay, the 401k is 5% (or the typed
// percent) capped at 20,000 and the employer adds half of it
const math: RetireSimPay['math'] = (gross, k401) => {
  if (!(gross > 0)) return { net: 0, own: 0, match: 0 }
  const own = Math.min(20000, gross * (k401 === 'auto' ? 5 : k401) / 100)
  return { net: gross * 0.7, own, match: own / 2 }
}
const period = (o: Partial<PayPeriod> = {}): PayPeriod => ({
  id: 'p', label: '', fromAge: 30, toAge: 'retire', salary: 100000, raisePct: 0, k401: 'auto', savings: 'auto', ...o,
})
const withPlan = (periods: PayPeriod[], o: Partial<RetireSimInput> = {}, p: Partial<RetireSimPay> = {}): RetireSimInput =>
  plan({
    salary: 100000, base401k: 7500, contribSavings: 20000,
    pay: { periods, planRetireAge: 40, todaySalary: 100000, math, budgetSavings: 20000, extrasSavings: 0, ssFromPlan: false, ...p },
    ...o,
  })

describe('simulateRetirement with a pay plan', () => {
  it('one period at today\'s pay gives the same numbers as no plan', () => {
    const a = simulateRetirement(withPlan([period()]), 40)
    const b = simulateRetirement(withPlan([], {}), 40)
    expect(a.rows).toEqual(b.rows)
    expect(row(a, 30).pay).toBe(100000)
    expect(row(a, 40).pay).toBe(0)
  })

  it('compounds a raise and the 401k follows the pay', () => {
    const res = simulateRetirement(withPlan([period({ raisePct: 3 })], { endAge: 45 }), 45)
    expect(row(res, 40).pay).toBeCloseTo(100000 * 1.03 ** 10, 6)
    const prev = row(res, 39)
    const k = 7500 * 1.03 ** 10
    expect(row(res, 40).k - prev.k).toBeCloseTo(k, 6)
  })

  it('a pay cut lowers savings by the take-home difference, not the gross one', () => {
    const res = simulateRetirement(withPlan([period({ toAge: 35 }), period({ id: 'b', fromAge: 35, salary: 60000 })]), 40)
    // 40,000 less pay is 28,000 less take-home; the 401k drops from 7,500 to 4,500
    expect(row(res, 34).contrib).toBe(7500 + 20000)
    expect(row(res, 36).contrib).toBe(4500 + 20000 - 28000)
  })

  it('a year off saves nothing into the 401k, draws on savings and the 401k still grows', () => {
    const res = simulateRetirement(withPlan([period({ toAge: 33 }), period({ id: 'off', fromAge: 33, toAge: 34, salary: 0 }), period({ id: 'c', fromAge: 34 })], { r: 0.05, rAfter: 0.05 }), 40)
    const prevK = row(res, 32).k
    expect(row(res, 33).pay).toBe(0)
    expect(row(res, 33).k).toBeCloseTo(prevK * 1.05, 6)
    // savings: 20,000 from the Budget less 70,000 of take-home that is gone
    expect(row(res, 33).contrib).toBe(-50000)
  })

  it('each period can set its own 401k percent and savings', () => {
    const res = simulateRetirement(withPlan([period({ toAge: 35 }), period({ id: 'b', fromAge: 35, salary: 80000, k401: 0, savings: 8000 })]), 40)
    expect(row(res, 36).contrib).toBe(8000)
    expect(row(res, 36).k).toBe(row(res, 35).k)
  })

  it('caps the 401k deferral and the match follows the capped amount', () => {
    const res = simulateRetirement(withPlan([period({ salary: 500000, k401: 10 })], { start401k: 0 }), 40)
    expect(row(res, 31).k - row(res, 30).k).toBe(30000)
  })

  it('a new period starts with a 75% 401k year, a raise does not', () => {
    const res = simulateRetirement(withPlan([period({ toAge: 35, raisePct: 2 }), period({ id: 'b', fromAge: 35 })], { start401k: 0 }), 40)
    const add = (a: number) => row(res, a).k - row(res, a - 1).k
    expect(row(res, 30).k).toBe(7500 * 0.75)
    expect(add(31)).toBeCloseTo(7500 * 1.02, 6)
    expect(add(35)).toBe(7500 * 0.75)
    expect(add(36)).toBe(7500)
  })

  it('part time from 62 to 66 after retiring at 60 lowers withdrawals in those years only', () => {
    const periods = [period({ toAge: 60 }), period({ id: 'pt', fromAge: 62, toAge: 66, salary: 10000, k401: 0 })]
    const res = simulateRetirement(withPlan(periods, { withdrawMo: 1000, endAge: 70, retireAge: 60 } as Partial<RetireSimInput>, { planRetireAge: 60 }), 60)
    expect(row(res, 61).withdrawal).toBe(12000)
    expect(row(res, 62).withdrawal).toBe(12000 - 7000)
    expect(row(res, 65).withdrawal).toBe(5000)
    expect(row(res, 66).withdrawal).toBe(12000)
    expect(row(res, 62).pay).toBe(10000)
    expect(row(res, 62).phase).toBe('retired')
  })

  it('pay after retiring beyond the need is saved', () => {
    const periods = [period({ toAge: 50, k401: 0 })]
    const res = simulateRetirement(withPlan(periods, { withdrawMo: 1000 }), 40)
    // 100,000 pay is 70,000 take-home, 12,000 covers the need, 58,000 is saved
    expect(row(res, 45)).toMatchObject({ withdrawal: 0, contrib: 58000 })
    expect(row(res, 50)).toMatchObject({ withdrawal: 12000, contrib: 0 })
  })

  it('years no period covers keep today\'s numbers', () => {
    const res = simulateRetirement(withPlan([period({ toAge: 33, salary: 50000 }), period({ id: 'b', fromAge: 36, salary: 50000 })]), 40)
    expect(row(res, 34)).toMatchObject({ pay: 100000, contrib: 7500 + 20000 })
    // the first of those years is a new start for the 401k
    expect(row(res, 33).contrib).toBe(7500 * 0.75 + 20000)
  })

  it('Social Security on Auto follows the plan\'s earnings', () => {
    const ss = (periods: PayPeriod[]) =>
      simulateRetirement(withPlan(periods, { age: 30, endAge: 90, ssClaimAge: 67 }, { ssFromPlan: true, planRetireAge: 65 }), 65).ssMonthly
    const steady = ss([period()])
    // 8 years before today plus 35 working years, all at 100,000
    expect(steady).toBeCloseTo(ssMonthlyBenefit(100000, 67), 6)
    expect(ss([period({ raisePct: 2 })])).toBeGreaterThan(steady)
    expect(ss([period({ toAge: 40 }), period({ id: 'off', fromAge: 40, salary: 0 })])).toBeLessThan(steady)
  })

  it('a pay cut moves the earliest safe retire age later', () => {
    const earliest = (periods: PayPeriod[]) => {
      const input = withPlan(periods, { r: 0.05, rAfter: 0.05, withdrawMo: 4000, startSavings: 0, start401k: 0 }, { planRetireAge: 60 })
      for (let a = 31; a < 90; a++) if (simulateRetirement(input, a).runOutAge === null) return a
      return null
    }
    const base = earliest([period()])!
    expect(earliest([period({ toAge: 35 }), period({ id: 'b', fromAge: 35, salary: 70000 })])!).toBeGreaterThan(base)
  })
})
