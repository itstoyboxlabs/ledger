import { RETIRE_DEFAULTS } from '@/screens/retirement/constants/RETIRE_DEFAULTS'
import { RETIRE_LEGACY_DEFAULTS } from '@/screens/retirement/constants/RETIRE_LEGACY_DEFAULTS'
import { typedMerge } from '@/screens/retirement/utils/typedMerge'
import { RetireEventKind } from '@/screens/retirement/enums/RetireEventKind'
import { RetireRepeat } from '@/screens/retirement/enums/RetireRepeat'
import type { RetireEvent } from '@/screens/retirement/types/RetireEvent'
import type { RetireState } from '@/screens/retirement/types/RetireState'
import { isObj } from '@/shared/utils/isObj'
import { validEvent } from '@/screens/retirement/utils/validEvent'
import { normalizePay } from '@/screens/retirement/utils/normalizePay'
import { tidyPayPeriods } from '@/screens/retirement/utils/tidyPayPeriods'

export function normalizeRetire(input: unknown): RetireState {
  if (!isObj(input)) return { ...RETIRE_DEFAULTS }
  const raw = input
  if (Array.isArray(raw.events)) {
    const m = typedMerge(RETIRE_DEFAULTS, raw)
    m.ss = typedMerge(RETIRE_DEFAULTS.ss, raw.ss)
    // saves from before the pay plan read as no plan, so no number moves
    m.pay = { periods: tidyPayPeriods(normalizePay(raw.pay).periods, m.retireAge) }
    // saves from before this existed keep the balances they typed
    m.startFrom = raw.startFrom === 'balances' ? 'balances' : 'typed'
    m.startOff = Array.isArray(raw.startOff) ? raw.startOff.filter((x): x is string => typeof x === 'string') : []
    m.events = raw.events.filter(validEvent).map((e): RetireEvent => ({
      id: e.id,
      name: typeof e.name === 'string' ? e.name : '',
      amount: Number(e.amount) || 0,
      kind: e.kind === 'in' || e.kind === 'debt' ? e.kind : RetireEventKind.out,
      age: Number(e.age) || 0,
      repeat: Object.values(RetireRepeat).includes(e.repeat as RetireRepeat) ? (e.repeat as RetireRepeat) : RetireRepeat.once,
      years: Math.max(1, Number(e.years) || 1),
      ...(e.auto === 'equity' ? { auto: 'equity' } : {}),
      ...(e.kind === 'debt' ? { debtId: typeof e.debtId === 'string' ? e.debtId : '', custom: e.custom === true } : {}),
      // the pool and the stop at retiring apply to plain money in (an Equity payout is cash
      // and already stops when you retire)
      ...(e.kind === 'in' && e.auto !== 'equity' && e.to === '401k' ? { to: '401k' } : {}),
      ...(e.kind === 'in' && e.auto !== 'equity' && e.untilRetire === true && e.repeat !== 'once' ? { untilRetire: true } : {}),
    }))
    // your own saving lines (`extras`, before Events replaced them) become money-in events
    // with the same name, amount and pool, from today until you retire, so no number moves
    const ids = new Set(m.events.map((e) => e.id))
    const extras = (Array.isArray(raw.extras) ? raw.extras : []).filter(validEvent).filter((x) => !ids.has(`extra-${x.id}`))
    m.events = [...m.events, ...extras.map((x): RetireEvent => ({
      id: `extra-${x.id}`,
      name: typeof x.name === 'string' ? x.name : '',
      amount: Number(x.amount) || 0,
      kind: RetireEventKind.in,
      age: m.age,
      // a monthly line stays monthly, so the amount and the yearly total both match
      repeat: x.unit === 'mo' ? RetireRepeat.month : RetireRepeat.year,
      years: Math.max(1, m.retireAge - m.age),
      untilRetire: true,
      ...(x.to === '401k' ? { to: '401k' as const } : {}),
    }))]
    return m
  }
  const o = typedMerge(RETIRE_LEGACY_DEFAULTS, raw)
  const { downAmt, downAge, carAmt, carAge, optAmt, optAge, autoOpt, ...rest } = o
  return {
    ...rest,
    ss: { ...RETIRE_DEFAULTS.ss, on: false },
    startFrom: 'typed',
    startOff: [],
    pay: { periods: [] },
    events: [
      { id: 'down', name: 'House downpayment', amount: downAmt, kind: 'out', age: downAge, repeat: 'once', years: 1 },
      { id: 'car', name: 'Car buyout', amount: carAmt, kind: 'out', age: carAge, repeat: 'once', years: 1 },
      {
        id: 'options', name: 'Options payout', amount: optAmt, kind: 'in', age: optAge, repeat: 'year', years: 4,
        ...(autoOpt ? { auto: 'equity' } : {}),
      },
    ],
  }
}
