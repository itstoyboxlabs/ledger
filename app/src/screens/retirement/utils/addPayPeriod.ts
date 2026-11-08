import { PAY_PERIOD_STEP } from '@/screens/retirement/constants/PAY_PERIOD_STEP'
import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'
import { newId } from '@/shared/utils/newId'

type Today = Omit<PayPeriod, 'id' | 'label' | 'fromAge' | 'toAge' | 'raisePct'>

// The plan after "Add a pay period". An empty plan starts with a "Now" period from today
// with today's sources, then a change. A new period starts where the last one ends, or
// some years after it starts when it runs until you retire (the last one then ends there,
// so the two never overlap). It copies the last period's sources and typed values.
export function addPayPeriod(periods: PayPeriod[], age: number, retireAge: number, today: Today): PayPeriod[] {
  const list = periods.length > 0
    ? periods
    : [{ id: newId('p'), label: 'Now', fromAge: age, toAge: 'retire' as const, raisePct: 0, ...today }]
  const last = list[list.length - 1]
  const from = Math.max(last.fromAge, age)
  let start = last.toAge === 'retire' ? Math.min(from + PAY_PERIOD_STEP, retireAge - 1) : last.toAge
  if (start <= from) start = from + 1
  const { id: _id, label: _label, fromAge: _from, toAge: _to, raisePct: _raise, ...sources } = last
  const next: PayPeriod = {
    id: newId('p'), label: '', fromAge: start, toAge: start >= retireAge ? start + 5 : 'retire', raisePct: 0, ...sources,
  }
  return [...list.slice(0, -1), last.toAge === 'retire' ? { ...last, toAge: start } : last, next]
}
