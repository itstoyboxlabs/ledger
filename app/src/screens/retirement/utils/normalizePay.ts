import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'
import type { RetirePay } from '@/screens/retirement/types/RetirePay'
import { isObj } from '@/shared/utils/isObj'
import { validEvent } from '@/screens/retirement/utils/validEvent'

const num = (v: unknown): number => (Number.isFinite(Number(v)) ? Number(v) : 0)
const autoOr = (v: unknown): number | 'auto' => (v === 'auto' || v == null ? 'auto' : Math.max(0, num(v)))

// The saved pay plan, cleaned. Saves from before the plan existed have none, which reads
// as no periods: today's pay every working year, so no number moves.
export function normalizePay(raw: unknown): RetirePay {
  if (!isObj(raw) || !Array.isArray(raw.periods)) return { periods: [] }
  return {
    periods: raw.periods.filter(validEvent).map((p): PayPeriod => ({
      id: p.id,
      label: typeof p.label === 'string' ? p.label : '',
      fromAge: num(p.fromAge),
      toAge: p.toAge === 'retire' || p.toAge == null ? 'retire' : num(p.toAge),
      salary: Math.max(0, num(p.salary)),
      raisePct: num(p.raisePct),
      k401: autoOr(p.k401),
      savings: p.savings === 'auto' || p.savings == null ? 'auto' : num(p.savings),
    })),
  }
}
