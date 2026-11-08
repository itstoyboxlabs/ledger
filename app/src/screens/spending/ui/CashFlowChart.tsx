import { ResponsiveContainer, Tooltip, Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { AXIS_TICK } from '@/screens/spending/constants/AXIS_TICK'
import { ChartTip } from '@/screens/spending/ui/ChartTip'
import { compactUsd } from '@/screens/spending/utils/compactUsd'
import { shortMonth } from '@/screens/spending/utils/shortMonth'
import type { MonthlyRow } from '@/screens/spending/types/MonthlyRow'

type CashFlowChartProps = {
  monthly: MonthlyRow[]
  onPick: (month: string) => void
}

// Cash flow tab: income vs spending per month, with net as a line.
export function CashFlowChart({ monthly, onPick }: CashFlowChartProps) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={monthly} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="m" tickFormatter={shortMonth} tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={compactUsd} tick={AXIS_TICK} axisLine={false} tickLine={false} width={44} />
          <Tooltip content={<ChartTip />} isAnimationActive={false} cursor={{ fill: 'rgba(255,255,255,0.04)' }} wrapperStyle={{ zIndex: 50, outline: 'none' }} />
          <Bar dataKey="income" name="Income" fill="#34d17a" radius={[4, 4, 0, 0]} isAnimationActive={false} onClick={(d) => onPick((d as unknown as MonthlyRow).m)} style={{ cursor: 'pointer' }} />
          <Bar dataKey="spending" name="Spending" fill="#8b6cf6" radius={[4, 4, 0, 0]} isAnimationActive={false} onClick={(d) => onPick((d as unknown as MonthlyRow).m)} style={{ cursor: 'pointer' }} />
          <Line dataKey="net" name="Net" stroke="#ffffff" strokeWidth={1.8} dot={{ r: 2.5, fill: '#ffffff' }} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
