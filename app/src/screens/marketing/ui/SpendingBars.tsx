import { barChartLayout } from '@/screens/marketing/utils/barChartLayout'
import type { BarMonth } from '@/screens/marketing/types/BarMonth'

type SpendingBarsProps = { months: BarMonth[] }

export function SpendingBars({ months }: SpendingBarsProps) {
  const { grid, bars } = barChartLayout(months)
  return (
    <svg viewBox="0 0 440 210" width="100%" id="bars" role="img" aria-label="Monthly spending">
      <defs>
        <linearGradient id="bd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a78e8" />
          <stop offset="1" stopColor="#2f3a8f" />
        </linearGradient>
        <linearGradient id="bl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a3adff" />
          <stop offset="1" stopColor="#6272f0" />
        </linearGradient>
      </defs>
      {grid.map((g) => (
        <g key={g.label}>
          <text x="34" y={g.y + 4} fill="#8a93ad" fontSize="11" textAnchor="end">
            {g.label}
          </text>
          <line x1="42" x2="440" y1={g.y} y2={g.y} stroke="rgba(255,255,255,.06)" />
        </g>
      ))}
      {bars.map((b, i) => (
        <g key={b.label}>
          <rect x={b.x} y={b.y} width={b.width} height={b.height} rx="3" fill={b.last ? 'url(#bl)' : 'url(#bd)'} style={{ transitionDelay: `${(0.1 + i * 0.08).toFixed(2)}s` }} />
          <text x={b.labelX} y={b.labelY} fill="#cdd3e3" fontSize="11" textAnchor="middle">
            {b.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
