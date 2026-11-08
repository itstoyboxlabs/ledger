import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/primitives/table'
import { fmt } from '@/shared/utils/fmt'
import { Dot } from '@/shared/ui/Dot'
import { MerchantIcon } from '@/shared/ui/MerchantIcon'
import type { SpendGroup } from '@/screens/spending/types/SpendGroup'

type GroupTableProps = {
  groups: SpendGroup[]
  total: number
  onSelect?: (name: string) => void
  drillable?: boolean
  icons?: boolean
  heading?: string
}

/* ---------- tables ---------- */

export function GroupTable({ groups, total, onSelect, drillable, icons, heading = 'Category' }: GroupTableProps) {
  return (
    <div className="overflow-x-auto overscroll-contain">
    <Table className="w-full text-[13px]">
      <TableHeader>
        <TableRow className="text-left text-[12px] text-[var(--text-secondary)]">
          <TableHead className="pb-2.5 font-normal">{heading}</TableHead>
          <TableHead className="pb-2.5 pr-3 text-right font-normal max-sm:hidden">Transactions</TableHead>
          <TableHead className="pb-2.5 pr-3 text-right font-normal">Total</TableHead>
          <TableHead className="pb-2.5 text-right font-normal">%</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((g) => (
          <TableRow
            key={g.name}
            onClick={() => drillable && onSelect?.(g.name)}
            className={
              'border-t border-[var(--grid)] hover:bg-[var(--surface-2)] transition-colors ' +
              (drillable ? 'cursor-pointer' : '')
            }
          >
            <TableCell className="py-[7px] pr-2">
              <span className="flex items-center gap-3">
                <Dot color={g.color} />
                {icons && <MerchantIcon name={g.name} />}
                <span className="truncate max-sm:whitespace-normal max-sm:break-words">{g.name}</span>
              </span>
            </TableCell>
            <TableCell className="py-[7px] pr-3 text-right tnum text-[var(--text-secondary)] max-sm:hidden">{g.count}</TableCell>
            <TableCell className="py-[7px] pr-3 text-right tnum font-medium">{fmt(g.total)}</TableCell>
            <TableCell className="py-[7px] text-right tnum text-[var(--text-secondary)]">
              {total > 0 ? ((g.total / total) * 100).toFixed(1) + '%' : '\u2014'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  )
}
