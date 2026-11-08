import type { ReactNode } from 'react'
import type { SortState } from '@/shared/types/SortState'
import { TableHead } from '@/shared/ui/primitives/table'
import { cn } from '@/shared/utils/cn'

// Sortable column header, same pattern as the transaction table's Date column: click
// toggles ascending and descending, an arrow marks the active column.
type SortHeadProps = {
  id: string
  label: ReactNode
  sort: SortState
  onSort: (id: string) => void
  right?: boolean
  className?: string
}

export function SortHead({ id, label, sort, onSort, right, className }: SortHeadProps) {
  const active = sort.key === id
  return (
    <TableHead
      onClick={() => onSort(id)}
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
      className={cn('cursor-pointer select-none hover:text-white', right && 'text-right', className)}
    >
      {label} {active ? (sort.dir === 'asc' ? '\u2191' : '\u2193') : ''}
    </TableHead>
  )
}
