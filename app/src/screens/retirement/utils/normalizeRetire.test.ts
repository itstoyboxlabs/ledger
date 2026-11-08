import { normalizeRetire } from './normalizeRetire'
import { RETIRE_DEFAULTS } from '../constants/RETIRE_DEFAULTS'

describe('normalizeRetire', () => {
  it('returns defaults for non-objects', () => {
    expect(normalizeRetire(null)).toEqual(RETIRE_DEFAULTS)
    expect(normalizeRetire([])).toEqual(RETIRE_DEFAULTS)
    expect(normalizeRetire('x')).toEqual(RETIRE_DEFAULTS)
  })
  it('cleans a new-shape save', () => {
    const out = normalizeRetire({
      age: 40, retireAge: 'bad', startFrom: 'nope', startOff: ['a', 3],
      ss: { on: false, claimAge: 70 },
      extras: [{ id: 'x', name: 5, amount: '12', unit: 'mo', to: '401k' }, { name: 'no id' }],
      events: [
        { id: 'e1', name: 'Car', amount: '500', kind: 'weird', age: '45', repeat: 'bogus', years: 0 },
        { id: 'e2', kind: 'debt', debtId: 7, auto: 'equity', repeat: '2year', years: 3 },
        null,
      ],
    })
    expect(out.age).toBe(40)
    expect(out.retireAge).toBe(RETIRE_DEFAULTS.retireAge)
    expect(out.startFrom).toBe('typed')
    expect(out.startOff).toEqual(['a'])
    expect(out.ss).toEqual({ ...RETIRE_DEFAULTS.ss, on: false, claimAge: 70 })
    expect(out).not.toHaveProperty('extras')
    expect(out.events[0]).toEqual({ id: 'e1', name: 'Car', amount: 500, kind: 'out', age: 45, repeat: 'once', years: 1 })
    expect(out.events[1]).toMatchObject({ kind: 'debt', debtId: '', custom: false, auto: 'equity', repeat: '2year', years: 3 })
    // the saving line became a money-in event at the end
    expect(out.events).toHaveLength(3)
    expect(out.events[2]).toEqual({ id: 'extra-x', name: '', amount: 12, kind: 'in', age: 40, repeat: 'month', years: 20, untilRetire: true, to: '401k' })
  })
  it('keeps startFrom balances', () => {
    expect(normalizeRetire({ events: [], startFrom: 'balances' }).startFrom).toBe('balances')
  })
  it('converts the legacy shape into three events', () => {
    const out = normalizeRetire({ age: 30, downAmt: 1000, downAge: 33, optAmt: 200, optAge: 35, autoOpt: true })
    expect(out.age).toBe(30)
    expect(out.ss.on).toBe(false)
    expect(out.startFrom).toBe('typed')
    expect(out.events.map((e) => e.id)).toEqual(['down', 'car', 'options'])
    expect(out.events[0]).toMatchObject({ amount: 1000, age: 33, kind: 'out' })
    expect(out.events[2]).toMatchObject({ amount: 200, kind: 'in', repeat: 'year', years: 4, auto: 'equity' })
    expect(out).not.toHaveProperty('downAmt')
  })
  it('uses the legacy defaults for an empty legacy object', () => {
    const out = normalizeRetire({})
    expect(out.endAge).toBe(120)
    expect(out.events[1].amount).toBe(29000)
    expect(out.events[2]).not.toHaveProperty('auto')
  })
  it('reads a save from before the pay plan as no plan and changes nothing else', () => {
    const old = {
      age: 41, retireAge: 58, accessAge: 60, endAge: 92, start401k: 1000, startSavings: 2000, startFrom: 'typed', startOff: [],
      contrib401k: 5000, contribSavings: 9000, auto401k: false, autoSavings: true, withdrawMo: 4000, taxPct: 12, autoTax: false,
      ss: { on: true, claimAge: 68, auto: false, monthly: 1500 }, events: [],
    }
    expect(normalizeRetire(old)).toEqual({ ...old, raisePct: 0, pay: { periods: [] } })
    expect(normalizeRetire({ age: 30 }).pay).toEqual({ periods: [] })
  })
  it('keeps the no-plan raise and reads a bad one as 0', () => {
    expect(normalizeRetire({ events: [], raisePct: 3 }).raisePct).toBe(3)
    expect(normalizeRetire({ events: [], raisePct: 'x' }).raisePct).toBe(0)
    expect(normalizeRetire({ age: 30 }).raisePct).toBe(0)
  })
  it('keeps a saved pay plan', () => {
    const pay = { periods: [{ id: 'a', label: 'Now', fromAge: 35, toAge: 45, raisePct: 2, takeHomeFrom: 'preset', takeHomePreset: 'th1', k401: 3600, saveFrom: 'today', savePreset: '', savings: 0 }] }
    expect(normalizeRetire({ events: [], pay }).pay).toEqual(pay)
  })
  it('trims a saved pay plan whose periods overlap', () => {
    const period = (id: string, fromAge: number, toAge: number | 'retire') => ({
      id, label: '', fromAge, toAge, raisePct: 0, takeHomeFrom: 'today', takeHomePreset: '', k401: 0, saveFrom: 'today', savePreset: '', savings: 0,
    })
    const out = normalizeRetire({ events: [], retireAge: 60, pay: { periods: [period('a', 35, 45), period('b', 40, 'retire')] } })
    expect(out.pay.periods.map((x) => [x.fromAge, x.toAge])).toEqual([[35, 45], [45, 'retire']])
  })
  it('turns saving lines into money-in events until the retire age, once', () => {
    const out = normalizeRetire({ events: [], age: 30, retireAge: 45, extras: [{ id: 'a', name: 'IRA', amount: 6000, unit: 'yr', to: 'savings' }] })
    expect(out.events).toEqual([{ id: 'extra-a', name: 'IRA', amount: 6000, kind: 'in', age: 30, repeat: 'year', years: 15, untilRetire: true }])
    // reading the result again changes nothing
    expect(normalizeRetire({ ...out, extras: [{ id: 'a', name: 'IRA', amount: 6000, unit: 'yr', to: 'savings' }] }).events).toEqual(out.events)
  })
  it('keeps the pool and the until retire flag only on money in', () => {
    const out = normalizeRetire({ events: [
      { id: 'a', kind: 'in', to: '401k', untilRetire: true, repeat: 'year', age: 30, years: 2 },
      { id: 'b', kind: 'out', to: '401k', untilRetire: true, repeat: 'year', age: 30, years: 2 },
      { id: 'c', kind: 'in', untilRetire: true, repeat: 'once', age: 30 },
    ] })
    expect(out.events[0]).toMatchObject({ to: '401k', untilRetire: true })
    expect(out.events[1]).not.toHaveProperty('to')
    expect(out.events[1]).not.toHaveProperty('untilRetire')
    expect(out.events[2]).not.toHaveProperty('untilRetire')
  })
})
