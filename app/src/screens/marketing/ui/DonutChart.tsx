import { donutSegments } from '@/screens/marketing/utils/donutSegments'
import type { DemoCategory } from '@/screens/marketing/types/DemoCategory'

type DonutChartProps = { categories: DemoCategory[]; total: number; centerLabel: string }

export function DonutChart({ categories, total, centerLabel }: DonutChartProps) {
  return (
    <div className="donut">
      <svg viewBox="0 0 42 42" width="150" height="150" id="donut" role="img" aria-label="Spending by category">
        {donutSegments(categories, total).map((s, i) => (
          <circle
            key={s.name}
            cx="21"
            cy="21"
            r="15.9155"
            fill="none"
            stroke={s.color}
            strokeWidth="5.2"
            strokeDasharray={s.dashArray}
            strokeDashoffset={s.dashOffset}
            style={{ transitionDelay: `${(0.5 + i * 0.07).toFixed(2)}s` }}
          />
        ))}
      </svg>
      <div className="c">
        <div>
          <small>Total spending</small>
          <b>{centerLabel}</b>
        </div>
      </div>
    </div>
  )
}
