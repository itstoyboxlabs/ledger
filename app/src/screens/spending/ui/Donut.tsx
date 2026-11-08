import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { fmt } from '@/shared/utils/fmt'
import { DonutTooltip } from '@/screens/spending/ui/DonutTooltip'
import { renderActiveShape } from '@/screens/spending/utils/renderActiveShape'
import type { DonutSlice } from '@/screens/spending/types/DonutSlice'
import type { SpendGroup } from '@/screens/spending/types/SpendGroup'

type DonutProps = {
  groups: SpendGroup[]
  total: number
  onSelect?: (name: string) => void
  centerLabel: string
}

export function Donut({ groups, total, onSelect, centerLabel }: DonutProps) {
  const data: DonutSlice[] = groups
    .filter((g) => g.total > 0)
    .map((g) => ({ name: g.name, value: g.total, fill: g.color, count: g.count }))

  return (
    <div className="relative h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="66%"
            outerRadius="94%"
            paddingAngle={2}
            stroke="var(--surface-1)"
            strokeWidth={2}
            activeShape={renderActiveShape}
            isAnimationActive={false}
            onClick={(d) => onSelect?.(d.name as string)}
            style={{ cursor: onSelect ? 'pointer' : 'default', outline: 'none' }}
          >
            {data.map((d: DonutSlice, i: number) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Pie>
          <Tooltip content={<DonutTooltip total={total} />} isAnimationActive={false} wrapperStyle={{ zIndex: 50, outline: 'none' }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center">
        <div className="max-w-[150px] truncate text-[13px] text-[var(--text-secondary)]">
          {centerLabel}
        </div>
        <div className="mt-0.5 text-[24px] font-bold tracking-tight tnum">{fmt(total)}</div>
      </div>
    </div>
  )
}
