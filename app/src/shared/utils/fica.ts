export function fica(gross: number): number {
  const ss = 0.062 * Math.min(gross, 176100)
  const medicare = 0.0145 * gross + (gross > 200000 ? 0.009 * (gross - 200000) : 0)
  return ss + medicare
}
