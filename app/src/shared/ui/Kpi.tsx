import type { ComponentProps, ReactNode } from 'react'
import { Card } from '@/shared/ui/Card'
import { Icon } from '@/shared/ui/Icon'
import { KpiActual } from '@/shared/ui/KpiActual'
import { Sparkline } from '@/shared/ui/Sparkline'

type KpiProps = {
  label: ReactNode
  value: ReactNode
  tone?: string
  sub?: ReactNode
  actual?: ComponentProps<typeof KpiActual>
  icon?: string
  iconColor?: string
  spark?: number[]
  sparkColor?: string
  badge?: ReactNode
}

export function Kpi({ label, value, tone, sub, actual, icon, iconColor, spark, sparkColor, badge }: KpiProps) {
  return (
    <Card className="relative px-5 py-4 flex-1 min-w-[200px]">
      {badge && <div className="absolute right-4 top-3.5">{badge}</div>}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="kpi-label flex items-center gap-2.5 text-[14px] text-[var(--text-secondary)]">
            {icon && <Icon name={icon} size={18} style={{ color: iconColor ?? 'var(--accent)' }} />}
            {label}
          </div>
          <div
            className="kpi-value mt-2 whitespace-nowrap text-[30px] font-bold leading-tight tracking-tight tnum"
            style={tone ? { color: tone } : undefined}
          >
            {value}
          </div>
          {sub && <div className="kpi-sub mt-1 text-[13px] text-[var(--text-secondary)]">{sub}</div>}
        </div>
        {spark && <Sparkline points={spark} color={sparkColor ?? 'var(--accent)'} />}
      </div>
      {actual && <KpiActual {...actual} />}
    </Card>
  )
}
