import type { ReactNode } from 'react'
import { fmt0 } from '@/shared/utils/fmt0'

// The "what really happened" half of a KPI: the same figure measured from the
// statements for one month, plus how far the plan missed. Rendered under a hairline
// so the planned number stays the headline — these cards are a budget first.
type KpiActualProps = {
  label: ReactNode
  value: ReactNode
  diff?: number | null
  negWord?: string
  posWord?: string
}

export function KpiActual({ label, value, diff, negWord = 'short', posWord = 'ahead' }: KpiActualProps) {
  const whole = diff == null ? 0 : Math.round(Math.abs(diff))
  return (
    <div className="kpi-actual mt-2.5 border-t border-[var(--grid)] pt-2 text-[12px]">
      <div className="text-[var(--text-muted)]">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-2">
        <span className="text-[15px] font-medium tnum text-[var(--text-secondary)]">{value}</span>
        {diff != null && whole > 0 && (
          <span className="tnum" style={{ color: diff < 0 ? 'var(--bad)' : 'var(--good)' }}>
            {fmt0(whole)} {diff < 0 ? negWord : posWord}
          </span>
        )}
      </div>
    </div>
  )
}
