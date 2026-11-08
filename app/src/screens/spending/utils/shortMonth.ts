export function shortMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return names[(m as number) - 1] + (m === 1 ? ` '${String(y).slice(2)}` : '')
}
