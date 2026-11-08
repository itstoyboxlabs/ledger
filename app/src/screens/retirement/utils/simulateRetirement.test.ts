import { simulateRetirement } from './simulateRetirement'
import type { RetireSimInput } from '@/screens/retirement/types/RetireSimInput'
import type { RetireSimPay } from '@/screens/retirement/types/RetireSimPay'
import { normalizeRetire } from './normalizeRetire'
import type { SimPayPeriod } from '@/screens/retirement/types/SimPayPeriod'
import { K401_DEFERRAL_LIMIT } from '@/shared/constants/K401_DEFERRAL_LIMIT'

// 0% return, no tax, no Social Security, so every number can be checked by hand
const plan = (o: Partial<RetireSimInput> = {}): RetireSimInput => ({
  age: 30, accessAge: 60, endAge: 90, start401k: 10000, startSavings: 50000,
  base401k: 5000, contribSavings: 20000, freed: () => 0,
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

// Pinned from the projection as it was before the pay plan existed, when this save had
// a 1,200 a year retirement account saving line (`extras`). Old saves (no plan) must keep
// producing exactly these numbers, with that line read back as a money-in event.
describe('simulateRetirement with no pay plan (regression)', () => {
  const migrated = normalizeRetire({
    events: [], age: 35, retireAge: 55,
    extras: [{ id: 'ira', name: 'IRA', amount: 1200, unit: 'yr', to: '401k' }],
  }).events
  const input: RetireSimInput = {
    age: 35, accessAge: 60, endAge: 95, start401k: 40000, startSavings: 25000,
    base401k: 6000, contribSavings: 18000, freed: (a) => (a >= 38 ? 2400 : 0),
    withdrawMo: 4500, ssMonthly: 1800, ssClaimAge: 67, r: 0.07, rAfter: 0.05, taxPct: 15,
    events: [
      ...migrated,
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
      const early = simulateRetirement({ ...input, pay }, 45)
      expect(early.runOutAge).toBe(51)
      expect(row(early, 95).total).toBe(-1390445.1657454837)
    })
  }

  it('reads an old savings line the same way: every working year, stopping at any retire age', () => {
    const events = normalizeRetire({ events: [], age: 30, retireAge: 40, extras: [{ id: 'x', name: 'Side job', amount: 250, unit: 'mo', to: 'savings' }] }).events
    const res = simulateRetirement(plan({ events }), 40)
    expect(row(res, 30).contrib).toBe(5000 * 0.75 + 20000 + 3000)
    expect(row(res, 39).contrib).toBe(25000 + 3000)
    expect(row(res, 40).contrib).toBe(0)
    // trying a later retire age keeps the line going until then
    expect(row(simulateRetirement(plan({ events }), 45), 44).contrib).toBe(28000)
  })
})

describe('simulateRetirement Contributions grow a year with no plan', () => {
  it('0 or missing changes nothing', () => {
    expect(simulateRetirement(plan({ raisePct: 0 }), 40).rows).toEqual(simulateRetirement(plan(), 40).rows)
  })
  it('grows today\'s 401k and savings each working year, not freed payments', () => {
    const res = simulateRetirement(plan({ raisePct: 3, freed: () => 100 }), 40)
    expect(row(res, 30).contrib).toBe(5000 * 0.75 + 20000 * 1 + 100)
    expect(row(res, 35).contrib).toBeCloseTo((5000 + 20000) * 1.03 ** 5 + 100, 6)
    expect(row(res, 40).contrib).toBe(0)
  })
})

describe('simulateRetirement money-in events into the retirement account', () => {
  it('lock the money in the 401k with no first-year rule, until the access age', () => {
    const res = simulateRetirement(plan({ events: [{ kind: 'in', to: '401k', age: 30, repeat: 'year', amount: 2000, years: 40 }] }), 40)
    expect(row(res, 30)).toMatchObject({ k: 10000 + 3750 + 2000, total: 70000, contrib: 23750 + 2000 })
    // retired before 60, the yearly event keeps going into the locked pool
    expect(row(res, 41).k - row(res, 40).k).toBe(2000)
    // from the access age on it lands in savings
    expect(row(res, 61).total - row(res, 60).total).toBe(2000 - 12000)
  })
})

// a hand-checkable pay plan: 5,000 of your own into the 401k plus a 2,500 match, and
// 20,000 into savings, unless a period says otherwise
const period = (o: Partial<SimPayPeriod> = {}): SimPayPeriod => ({
  fromAge: 30, toAge: 'retire', raisePct: 0, own: 5000, match: 2500, capOwn: true, saving: 20000, ...o,
})
const withPlan = (periods: SimPayPeriod[], o: Partial<RetireSimInput> = {}, p: Partial<RetireSimPay> = {}): RetireSimInput =>
  plan({
    base401k: 7500, contribSavings: 20000,
    pay: { periods, planRetireAge: 40, ...p },
    ...o,
  })

describe('simulateRetirement with a pay plan', () => {
  it('one period with today\'s numbers gives the same rows as no plan', () => {
    expect(simulateRetirement(withPlan([period()]), 40).rows).toEqual(simulateRetirement(withPlan([]), 40).rows)
  })

  it('a raise grows the 401k and savings each year of the period', () => {
    const res = simulateRetirement(withPlan([period({ raisePct: 3 })], { endAge: 45 }), 45)
    const g = 1.03 ** 10
    expect(row(res, 40).k - row(res, 39).k).toBeCloseTo(7500 * g, 6)
    expect(row(res, 40).s - row(res, 39).s).toBeCloseTo(20000 * g, 6)
  })

  it('a later period with no 401k and less saving takes over at its from age', () => {
    const res = simulateRetirement(withPlan([period({ toAge: 35 }), period({ fromAge: 35, own: 0, match: 0, saving: 8000 })]), 40)
    expect(row(res, 34).contrib).toBe(7500 + 20000)
    expect(row(res, 35).contrib).toBe(8000)
    expect(row(res, 36).k).toBe(row(res, 35).k)
  })

  it('a year with nothing saved still grows the 401k', () => {
    const res = simulateRetirement(withPlan([period({ toAge: 33 }), period({ fromAge: 33, toAge: 34, own: 0, match: 0, saving: -5000 }), period({ fromAge: 34 })], { r: 0.05, rAfter: 0.05 }), 40)
    expect(row(res, 33).k).toBeCloseTo(row(res, 32).k * 1.05, 6)
    expect(row(res, 33).contrib).toBe(-5000)
  })

  it('a raise never takes your share past the deferral limit, and the match follows', () => {
    const res = simulateRetirement(withPlan([period({ own: 24000, match: 12000, raisePct: 10 })], { start401k: 0 }), 40)
    expect(row(res, 35).k - row(res, 34).k).toBe(K401_DEFERRAL_LIMIT * 1.5)
  })

  it('typed 401k dollars are not capped', () => {
    const res = simulateRetirement(withPlan([period({ own: 40000, match: 0, capOwn: false })], { start401k: 0 }), 40)
    expect(row(res, 31).k - row(res, 30).k).toBe(40000)
  })

  it('a new period starts with a 75% 401k year, a raise does not', () => {
    const res = simulateRetirement(withPlan([period({ toAge: 35, raisePct: 2 }), period({ fromAge: 35 })], { start401k: 0 }), 40)
    const add = (a: number) => row(res, a).k - row(res, a - 1).k
    expect(row(res, 30).k).toBe(7500 * 0.75)
    expect(add(31)).toBeCloseTo(7500 * 1.02, 6)
    expect(add(35)).toBe(7500 * 0.75)
    expect(add(36)).toBe(7500)
  })

  it('a period from 62 to 66 after retiring at 60 keeps saving in those years only', () => {
    const periods = [period({ toAge: 60 }), period({ fromAge: 62, toAge: 66, own: 0, match: 0, saving: 6000 })]
    const res = simulateRetirement(withPlan(periods, { withdrawMo: 1000, endAge: 70 }, { planRetireAge: 60 }), 60)
    expect(row(res, 61)).toMatchObject({ contrib: 0, withdrawal: 12000 })
    expect(row(res, 62)).toMatchObject({ contrib: 6000, withdrawal: 12000, phase: 'retired' })
    expect(row(res, 66).contrib).toBe(0)
  })

  it('years no period covers keep today\'s numbers', () => {
    const res = simulateRetirement(withPlan([period({ toAge: 33, saving: 1000 }), period({ fromAge: 36, saving: 1000 })]), 40)
    // the first of those years is a new start for the 401k
    expect(row(res, 33).contrib).toBe(7500 * 0.75 + 20000)
    expect(row(res, 34).contrib).toBe(7500 + 20000)
    expect(row(res, 37).contrib).toBe(7500 + 1000)
  })

  it('a smaller saving moves the earliest safe retire age later', () => {
    const earliest = (periods: SimPayPeriod[]) => {
      const input = withPlan(periods, { r: 0.05, rAfter: 0.05, withdrawMo: 4000, startSavings: 0, start401k: 0 }, { planRetireAge: 60 })
      for (let a = 31; a < 90; a++) if (simulateRetirement(input, a).runOutAge === null) return a
      return null
    }
    const base = earliest([period()])!
    expect(earliest([period({ toAge: 35 }), period({ fromAge: 35, saving: 5000 })])!).toBeGreaterThan(base)
  })
})
