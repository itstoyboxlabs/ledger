import { monthLabel } from '@/shared/utils/monthLabel'
import { fmt0 } from '@/shared/utils/fmt0'
import { Dot } from '@/shared/ui/Dot'
import type { ChartTipEntry } from '@/screens/spending/types/ChartTipEntry'

// Recharts hands these in when it clones the tooltip element.
type ChartTipProps = {
  active?: boolean
  payload?: ChartTipEntry[]
  label?: string
}

export function ChartTip({ active, payload, label }: ChartTipProps) {
  if (!active || !payload?.length) return null
  const rows = payload.filter((p) => Math.abs(p.value) > 0.005)
  return (
    <div className="rounded-xl bg-[var(--surface-3)] px-3 py-2.5 text-[12px] ring-1 ring-[var(--ring)] shadow-2xl">
      <div className="mb-1 font-semibold">{monthLabel(label as string)}</div>
      {[...rows].reverse().map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Dot color={p.color} /> {p.name}
          </span>
          <span className="tnum">{fmt0(p.value)}</span>
        </div>
      ))}
    </div>
  )
}
