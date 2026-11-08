/* ---------- notes ---------- */

export function noteDateLabel(ts: number): string {
  const d = new Date(ts)
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${names[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}
