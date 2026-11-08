// rounds to whole cents so float noise (0.1 + 0.2 - 0.3) never reads as a sign
export function roundCents(n: number): number {
  const r = Math.round(n * 100) / 100
  return r === 0 ? 0 : r
}
