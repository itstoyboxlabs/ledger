// How old you are once a debt is paid off: your age now plus the whole years it takes.
// 6 years 2 months from 38 is 44. Retirement frees the payment from the same point.
export function payoffAge(startAge: number, months: number): number {
  return startAge + Math.floor(months / 12)
}
