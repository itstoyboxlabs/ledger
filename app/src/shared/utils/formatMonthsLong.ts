// A number of months in words: "6 years 2 months", "1 year", "5 months". 0 is "0 months".
export function formatMonthsLong(months: number): string {
  const y = Math.floor(months / 12)
  const m = months % 12
  const years = y === 1 ? '1 year' : `${y} years`
  const rest = m === 1 ? '1 month' : `${m} months`
  if (y === 0) return rest
  return m === 0 ? years : `${years} ${rest}`
}
