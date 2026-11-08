import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'

// Keeps pay periods in age order with no overlap. A period covers its from age up to,
// not including, its end, so the end age is the next period's first year (35 to 45, then
// 45 on). Each period starts at the previous one's end or later: an earlier start is
// moved up to it, which is also how an edit that moves an end pushes the next period
// along, and how older saves that overlap are trimmed. A numbered end stays at least one
// year after the start. "When I retire" ends at the retire age. Gaps are left alone.
export function tidyPayPeriods(periods: PayPeriod[], retireAge: number): PayPeriod[] {
  let prevEnd = -Infinity
  let changed = false
  const out = periods.map((p): PayPeriod => {
    const fromAge = Math.max(p.fromAge, prevEnd)
    const toAge: PayPeriod['toAge'] = p.toAge === 'retire' ? 'retire' : Math.max(p.toAge, fromAge + 1)
    prevEnd = toAge === 'retire' ? Math.max(retireAge, fromAge) : toAge
    if (fromAge === p.fromAge && toAge === p.toAge) return p
    changed = true
    return { ...p, fromAge, toAge }
  })
  return changed ? out : periods
}
