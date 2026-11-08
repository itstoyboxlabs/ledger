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
    expect(out.extras).toEqual([{ id: 'x', name: '', amount: 12, unit: 'mo', to: '401k' }])
    expect(out.events[0]).toEqual({ id: 'e1', name: 'Car', amount: 500, kind: 'out', age: 45, repeat: 'once', years: 1 })
    expect(out.events[1]).toMatchObject({ kind: 'debt', debtId: '', custom: false, auto: 'equity', repeat: '2year', years: 3 })
    expect(out.events).toHaveLength(2)
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
})
