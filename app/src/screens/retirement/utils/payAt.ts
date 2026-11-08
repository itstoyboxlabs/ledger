import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'

// The pay period that covers one age, and its gross pay that year, or null when no
// period does. A period starting before today counts from today. Raises compound from
// the year it starts. When two periods cover the same age the later one in the list
// wins. From the retire age on, only a period whose until age is past the plan's retire
// age keeps paying (work after you retire).
export function payAt(
  periods: PayPeriod[],
  age: number,
  startAge: number,
  retireAge: number,
  planRetireAge: number,
): { gross: number; index: number } | null {
  for (let i = periods.length - 1; i >= 0; i--) {
    const p = periods[i]
    const from = Math.max(p.fromAge, startAge)
    const end = p.toAge === 'retire' ? retireAge : p.toAge
    if (age < from || age >= end) continue
    if (age >= retireAge && (p.toAge === 'retire' || p.toAge <= planRetireAge)) continue
    const gross = Math.max(0, p.salary) * Math.pow(1 + p.raisePct / 100, age - from)
    return { gross, index: i }
  }
  return null
}
