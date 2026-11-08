import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'
import type { RetirePay } from '@/screens/retirement/types/RetirePay'
import { PaySource } from '@/screens/retirement/enums/PaySource'
import { isObj } from '@/shared/utils/isObj'
import { validEvent } from '@/screens/retirement/utils/validEvent'

const num = (v: unknown): number => (Number.isFinite(Number(v)) ? Number(v) : 0)
const source = (v: unknown): PaySource | null => (Object.values(PaySource).includes(v as PaySource) ? (v as PaySource) : null)

// The saved pay plan, cleaned. Saves from before the plan existed have none, which reads
// as no periods: today's numbers every working year, so no number moves.
// Earlier versions of a period stored pay: `payFrom` and `payPreset` read as the
// Take-home source, and a typed `salary` with a 401k percent becomes typed 401k dollars
// (salary times percent). The first version (k401 'auto') reads as today's Take-home.
// A period saved with `years` and no until age gets until age = from age + years.
export function normalizePay(raw: unknown): RetirePay {
  if (!isObj(raw) || !Array.isArray(raw.periods)) return { periods: [] }
  return {
    periods: raw.periods.filter(validEvent).map((p): PayPeriod => {
      const hadPay = 'salary' in p
      const takeHomeFrom = source(p.takeHomeFrom) ?? source(p.payFrom) ?? (p.k401 === 'auto' ? PaySource.today : PaySource.typed)
      const k401 = hadPay ? Math.max(0, num(p.salary)) * Math.max(0, num(p.k401)) / 100 : Math.max(0, num(p.k401))
      return {
        id: p.id,
        label: typeof p.label === 'string' ? p.label : '',
        fromAge: num(p.fromAge),
        toAge: p.toAge == null && Number(p.years) > 0 ? num(p.fromAge) + Number(p.years)
          : p.toAge === 'retire' || p.toAge == null ? 'retire' : num(p.toAge),
        raisePct: num(p.raisePct),
        takeHomeFrom,
        takeHomePreset: typeof p.takeHomePreset === 'string' ? p.takeHomePreset : typeof p.payPreset === 'string' ? p.payPreset : '',
        k401,
        saveFrom: source(p.saveFrom) ?? (p.savings === 'auto' || p.savings == null ? PaySource.today : PaySource.typed),
        savePreset: typeof p.savePreset === 'string' ? p.savePreset : '',
        savings: p.savings === 'auto' ? 0 : num(p.savings),
      }
    }),
  }
}
