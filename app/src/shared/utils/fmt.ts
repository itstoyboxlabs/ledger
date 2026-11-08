import { roundCents } from '@/shared/utils/roundCents'

export function fmt(n: number): string {
  // round first so a tiny negative never shows as "−$0.00"
  const r = roundCents(n)
  const sign = r < 0 ? '−' : ''
  return (
    sign +
    '$' +
    Math.abs(r).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  )
}
