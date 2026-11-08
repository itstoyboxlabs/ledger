import type { ReactNode } from 'react'
import type { PortfolioRow } from '@/screens/retirement/types/PortfolioRow'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/primitives/table'
import { Input } from '@/shared/ui/primitives/input'
import { Button } from '@/shared/ui/primitives/button'
import { X } from 'lucide-react'
import { DraftNumberInput } from '@/shared/ui/DraftNumberInput'
import { InfoTip } from '@/shared/ui/InfoTip'

// An editable fund table with a weighted return. Retirement shows one while you work
// and, if the user wants, a second one for after retiring.
type PortfolioTableProps = {
  heading: string
  rows: PortfolioRow[]
  setRows: (rows: PortfolioRow[]) => void
  action?: ReactNode
}

export function PortfolioTable({ heading, rows, setRows, action }: PortfolioTableProps) {
  const total = rows.reduce((s: number, x) => s + x.alloc, 0)
  const avg = total > 0 ? rows.reduce((s, x) => s + x.alloc * x.perf, 0) / total : 0
  const patch = (i: number, p: Partial<PortfolioRow>) => setRows(rows.map((x, j) => (j === i ? { ...x, ...p } : x)))
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)]">
        {heading}
        {action && <span className="ml-auto">{action}</span>}
      </div>
      <Table className="mt-2 w-full text-[13px]">
        <TableHeader>
          <TableRow className="text-left text-[11px] text-[var(--text-muted)]">
            <TableHead className="pb-1.5 font-medium">Fund</TableHead>
            <TableHead className="pb-1.5 text-right font-medium">Allocation</TableHead>
            <TableHead className="pb-1.5 text-right font-medium">
              <span className="inline-flex items-center gap-1">
                Expected return
                <InfoTip size={12} tip="What you expect each fund to earn a year, on average. This drives the whole projection, so lower it if you move to something more careful." />
              </span>
            </TableHead>
            <TableHead className="w-8"><span className="sr-only">Remove</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((p, i) => (
            <TableRow key={i} className="border-t border-[var(--grid)] hover:bg-[var(--surface-2)] transition-colors group">
              <TableCell className="py-1 pr-2">
                <Input variant="inline" aria-label={`Fund ${i + 1} name`} value={p.name} onChange={(e) => patch(i, { name: e.target.value })} className="-ml-1.5 w-24" />
              </TableCell>
              <TableCell className="py-1 text-right">
                <div className="ml-auto w-[104px]">
                  <DraftNumberInput boxed ariaLabel={`${p.name || `Fund ${i + 1}`} allocation`} suffix="%" step={5} value={p.alloc} onChange={(v) => patch(i, { alloc: v })} className="tnum" />
                </div>
              </TableCell>
              <TableCell className="py-1 text-right">
                <div className="ml-auto w-[104px]">
                  <DraftNumberInput boxed ariaLabel={`${p.name || `Fund ${i + 1}`} expected return`} suffix="%" step={0.1} value={p.perf} onChange={(v) => patch(i, { perf: v })} className="tnum" />
                </div>
              </TableCell>
              <TableCell className="py-1 text-right">
                <Button variant="ghost" size="icon-xs"
                  onClick={() => setRows(rows.filter((_, j) => j !== i))}
                  aria-label={`Remove ${p.name || `fund ${i + 1}`}`}
                  className="text-[var(--text-muted)] opacity-0 hover:text-[var(--bad)] group-hover:opacity-100"
                ><X className="size-3.5" /></Button>
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="border-t border-[var(--baseline)] font-medium">
            <TableCell className="py-1.5">Weighted avg return</TableCell>
            <TableCell className={`py-1.5 text-right tnum ${total !== 100 ? 'text-[var(--warn)]' : ''}`}>{total}%</TableCell>
            <TableCell className="py-1.5 text-right tnum" style={{ color: 'var(--good)' }}>{avg.toFixed(2)}%</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Button variant="outline" size="sm" onClick={() => setRows([...rows, { name: '', alloc: 0, perf: 0 }])} className="mt-2">
        + Add fund
      </Button>
    </div>
  )
}
