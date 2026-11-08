import type { ReactNode } from 'react'
import { Card } from '@/shared/ui/Card'
import { InfoTip } from '@/shared/ui/InfoTip'

// visually clusters related ToolFields under a small label, in their own subtly
// shaded box — for tools with enough inputs that a flat grid gets hard to scan
type FieldGroupProps = {
  label: string
  tip?: string
  action?: ReactNode
  gridClass?: string
  className?: string
  children: ReactNode
}

export function FieldGroup({ label, tip, action, gridClass = 'grid-cols-2 sm:grid-cols-3', className = '', children }: FieldGroupProps) {
  return (
    <Card className={`p-5 ${className}`}>
      <div className="mb-3 flex items-center gap-1.5 text-[14px] font-semibold">
        <h2 className="flex items-center gap-1.5">
          {label}
          {tip && <InfoTip tip={tip} />}
        </h2>
        {action && <span className="ml-auto">{action}</span>}
      </div>
      <div className={`grid gap-3 ${gridClass}`}>{children}</div>
    </Card>
  )
}
