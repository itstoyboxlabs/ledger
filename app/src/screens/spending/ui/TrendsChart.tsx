import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { CATEGORY_HEX } from '@/shared/constants/CATEGORY_HEX'
import { AXIS_TICK } from '@/screens/spending/constants/AXIS_TICK'
import { ChartTip } from '@/screens/spending/ui/ChartTip'
import { compactUsd } from '@/screens/spending/utils/compactUsd'
import { shortMonth } from '@/screens/spending/utils/shortMonth'
import type { MonthlyRow } from '@/screens/spending/types/MonthlyRow'

type TrendsChartProps = {
  monthly: MonthlyRow[]
  cats: string[]
  onPick: (month: string) => void
}

// Trends tab: spending per month, stacked by category. Click a bar to open that month.
export function TrendsChart({ monthly, cats, onPick }: TrendsChartProps) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthly} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="m" tickFormatter={shortMonth} tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={compactUsd} tick={AXIS_TICK} axisLine={false} tickLine={false} width={44} />
          <Tooltip content={<ChartTip />} isAnimationActive={false} cursor={{ fill: 'rgba(255,255,255,0.04)' }} wrapperStyle={{ zIndex: 50, outline: 'none' }} />
          {cats.map((c, i) => (
            <Bar
              key={c}
              dataKey={c}
              name={c}
              stackId="s"
              fill={CATEGORY_HEX[c] ?? '#7d8597'}
              isAnimationActive={false}
              radius={i === cats.length - 1 ? [4, 4, 0, 0] : 0}
              onClick={(d) => onPick((d as unknown as MonthlyRow).m)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
