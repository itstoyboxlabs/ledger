import type { ReactNode } from 'react'
import { TableRow, TableCell } from '@/shared/ui/primitives/table'
import { InfoTip } from '@/shared/ui/InfoTip'

type ToolRowProps = {
  label: ReactNode
  value: ReactNode
  bold?: boolean
  tone?: string
  tip?: string
}

export function ToolRow({ label, value, bold, tone, tip }: ToolRowProps) {
  return (
    <TableRow className="border-t border-[var(--grid)] hover:bg-[var(--surface-2)] transition-colors">
      <TableCell className={`py-2 ${bold ? 'font-semibold' : 'text-[var(--text-secondary)]'}`}>
        <span className="inline-flex items-center gap-1.5">
          {label}
          {tip && <InfoTip tip={tip} />}
        </span>
      </TableCell>
      <TableCell className={`py-2 text-right tnum ${bold ? 'font-semibold' : ''}`} style={tone ? { color: tone } : undefined}>
        {value}
      </TableCell>
    </TableRow>
  )
}
