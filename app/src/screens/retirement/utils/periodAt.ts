import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'

// The pay period that covers one age and how many years into it that age is (for the
// raise), or null when no period does. A period starting before today counts from today.
// Periods never overlap (tidyPayPeriods); if they did, the later one in the list would
// win. From the retire age on, only a period whose until age is past the plan's retire
// age keeps going (saving after you retire).
export function periodAt(
  periods: Pick<PayPeriod, 'fromAge' | 'toAge'>[],
  age: number,
  startAge: number,
  retireAge: number,
  planRetireAge: number,
): { index: number; year: number } | null {
  for (let i = periods.length - 1; i >= 0; i--) {
    const p = periods[i]
    const from = Math.max(p.fromAge, startAge)
    const end = p.toAge === 'retire' ? retireAge : p.toAge
    if (age < from || age >= end) continue
    if (age >= retireAge && (p.toAge === 'retire' || p.toAge <= planRetireAge)) continue
    return { index: i, year: age - from }
  }
  return null
}
