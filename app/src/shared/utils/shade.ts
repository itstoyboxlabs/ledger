// lighten a hex toward white by pct (0..1) — for sub-level shades of a parent hue
export function shade(hex: string, pct: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255
  const mix = (c: number): number => Math.round(c + (255 - c) * pct)
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}
