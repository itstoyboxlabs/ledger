// 3300 of 6405.05 -> "51.5%"
export function percentOf(value: number, total: number): string {
  return ((value / total) * 100).toFixed(1) + '%'
}
