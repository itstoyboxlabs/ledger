import { retirementCurve } from '@/screens/marketing/utils/retirementCurve'
import type { RetirementPoint } from '@/screens/marketing/types/RetirementPoint'

type RetirementCurveProps = {
  points: RetirementPoint[]
  markAge: number
  markValue: number
  markLabel: string
  markValueLabel: string
}

// Savings plus 401k by age, with a marker where retirement starts.
export function RetirementCurve({ points, markAge, markValue, markLabel, markValueLabel }: RetirementCurveProps) {
  const c = retirementCurve(points, markAge, markValue)
  const { x, y } = c.mark
  return (
    <svg viewBox="0 0 520 215" width="100%" id="curve" role="img" aria-label="Projected balance by age">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8b98ff" stopOpacity=".45" />
          <stop offset="1" stopColor="#8b98ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={c.area} fill="url(#cg)" />
      <path d={c.line} fill="none" stroke="#8b98ff" strokeWidth="2.5" />
      <line x1={c.left} x2={c.right} y1={c.base} y2={c.base} stroke="rgba(255,255,255,.15)" />
      <line x1={x} x2={x} y1={y} y2={c.base} stroke="rgba(255,255,255,.35)" strokeDasharray="3 3" />
      <circle cx={x} cy={y} r="6" fill="#8b98ff" stroke="#eef0ff" strokeWidth="2" />
      <rect x={x - 52} y={y - 62} width="104" height="42" rx="7" fill="#0e1424" stroke="rgba(255,255,255,.45)" />
      <text x={x} y={y - 45} fill="#eef5f2" fontSize="11.5" textAnchor="middle">
        {markLabel}
      </text>
      <text x={x} y={y - 29} fill="#eef5f2" fontSize="11.5" fontWeight="700" textAnchor="middle">
        {markValueLabel}
      </text>
      {c.ticks.map((t) => (
        <text key={t.age} x={t.x} y="207" fill="#cdd3e3" fontSize="11" textAnchor="middle">
          {t.age}
        </text>
      ))}
    </svg>
  )
}
