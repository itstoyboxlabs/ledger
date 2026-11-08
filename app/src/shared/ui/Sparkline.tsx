import { useRef } from 'react'

// Tiny trend line for a KPI card: line + soft area fill, no axes. `points` is a
// plain number series; it's scaled to its own min/max.
type SparklineProps = { points?: number[]; color: string; width?: number; height?: number }

export function Sparkline({ points, color, width = 170, height = 52 }: SparklineProps) {
  const id = useRef('sp' + Math.random().toString(36).slice(2, 8)).current
  if (!points || points.length < 2) return null
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const xy = points.map((v, i) => [
    (i / (points.length - 1)) * width,
    height - 4 - ((v - min) / span) * (height - 10),
  ])
  const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0 max-sm:hidden" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.38" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${width} ${height} L0 ${height} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
