// Months to clear `total` paying `perMonth`, or null when it never clears. With an APR
// above 0 it uses the amortization formula (monthly interest on what is left); with no
// APR it is balance divided by payment, rounded up.
export function payoffMonths(total: number, perMonth: number, apr: number): number | null {
  if (total <= 0) return 0
  if (!(perMonth > 0)) return null
  const r = apr / 100 / 12
  if (r > 0) {
    if (perMonth <= r * total) return null
    return Math.ceil(-Math.log(1 - (r * total) / perMonth) / Math.log(1 + r))
  }
  return Math.ceil(total / perMonth)
}
