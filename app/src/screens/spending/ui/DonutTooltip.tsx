import { fmt } from '@/shared/utils/fmt'
import { Dot } from '@/shared/ui/Dot'
import type { DonutSlice } from '@/screens/spending/types/DonutSlice'

type DonutTooltipProps = {
  active?: boolean
  payload?: { payload: DonutSlice }[]
  total: number
}

export function DonutTooltip({ active, payload, total }: DonutTooltipProps) {
  if (!active || !payload?.length) return null
  const d = (payload[0] as { payload: DonutSlice }).payload
  return (
    <div className="rounded-lg bg-[var(--surface-3)] px-3 py-2 text-[13px] ring-1 ring-[var(--ring)] shadow-xl">
      <div className="flex items-center gap-2 font-medium">
        <Dot color={d.fill} /> {d.name}
      </div>
      <div className="mt-1 text-[var(--text-secondary)] tnum">
        {fmt(d.value)} · {((d.value / total) * 100).toFixed(1)}% · {d.count} txns
      </div>
    </div>
  )
}
