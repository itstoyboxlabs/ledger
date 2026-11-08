import { RETIRE_DEFAULTS } from '@/screens/retirement/constants/RETIRE_DEFAULTS'
import { RETIRE_LEGACY_DEFAULTS } from '@/screens/retirement/constants/RETIRE_LEGACY_DEFAULTS'
import { typedMerge } from '@/screens/retirement/utils/typedMerge'
import { RetireEventKind } from '@/screens/retirement/enums/RetireEventKind'
import { RetireRepeat } from '@/screens/retirement/enums/RetireRepeat'
import type { RetireEvent } from '@/screens/retirement/types/RetireEvent'
import type { RetireExtra } from '@/screens/retirement/types/RetireExtra'
import type { RetireState } from '@/screens/retirement/types/RetireState'
import { isObj } from '@/shared/utils/isObj'
import { validEvent } from '@/screens/retirement/utils/validEvent'

export function normalizeRetire(input: unknown): RetireState {
  if (!isObj(input)) return { ...RETIRE_DEFAULTS }
  const raw = input
  if (Array.isArray(raw.events)) {
    const m = typedMerge(RETIRE_DEFAULTS, raw)
    m.ss = typedMerge(RETIRE_DEFAULTS.ss, raw.ss)
    // saves from before this existed keep the balances they typed
    m.startFrom = raw.startFrom === 'balances' ? 'balances' : 'typed'
    m.startOff = Array.isArray(raw.startOff) ? raw.startOff.filter((x): x is string => typeof x === 'string') : []
    m.extras = (Array.isArray(raw.extras) ? raw.extras : []).filter(validEvent).map((x): RetireExtra => ({
      id: x.id,
      name: typeof x.name === 'string' ? x.name : '',
      amount: Number(x.amount) || 0,
      unit: x.unit === 'mo' ? 'mo' : 'yr',
      to: x.to === '401k' ? '401k' : 'savings',
    }))
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
    }))
    return m
  }
  const o = typedMerge(RETIRE_LEGACY_DEFAULTS, raw)
  const { downAmt, downAge, carAmt, carAge, optAmt, optAge, autoOpt, ...rest } = o
  return {
    ...rest,
    tax401k: RETIRE_DEFAULTS.tax401k,
    ss: { ...RETIRE_DEFAULTS.ss, on: false },
    startFrom: 'typed',
    startOff: [],
    extras: [],
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
