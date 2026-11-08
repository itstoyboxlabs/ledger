import { useState } from 'react'
import { fmt } from '@/shared/utils/fmt'
import { getSubscriptions } from '@/shared/utils/getSubscriptions'
import { monthlyCost } from '@/shared/utils/monthlyCost'
import { isActiveSubscription } from '@/shared/utils/isActiveSubscription'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/shared/ui/primitives/table'
import { Button } from '@/shared/ui/primitives/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { MerchantIcon } from '@/shared/ui/MerchantIcon'
import { SUBS_SORT_KEYS } from '@/screens/spending/constants/SUBS_SORT_KEYS'
import { SortHead } from '@/shared/ui/SortHead'
import { acctName } from '@/shared/utils/acctName'
import { nextSort } from '@/shared/utils/nextSort'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { SortDirection } from '@/shared/enums/SortDirection'
import type { SortState } from '@/shared/types/SortState'
import type { SubsValue } from '@/screens/spending/types/SubsValue'

export function SubscriptionsTable() {
  const [sort, setSort] = usePersistedState<SortState>(
    'subsSort2',
    { key: 'month', dir: SortDirection.desc },
    (v) => {
      const s = v as SortState | null
      return !!s && SUBS_SORT_KEYS.includes(s.key) && (s.dir === 'asc' || s.dir === 'desc')
    },
  )
  const [showInactive, setShowInactive] = useState(false)
  const active = getSubscriptions().filter(isActiveSubscription)
  const inactive = getSubscriptions().filter((s) => !isActiveSubscription(s))
  const values: Record<string, SubsValue> = {
    name: (s) => s.name.toLowerCase(),
    billing: (s) => parseInt(String(s.billing ?? '').replace(/\D/g, ''), 10) || 99,
    account: (s) => acctName(s.account).toLowerCase(),
    cadence: (s) => s.cadence,
    price: (s) => s.amount,
    month: (s) => monthlyCost(s),
  }
  const value = values[sort.key] as SubsValue
  const dir = sort.dir === 'asc' ? 1 : -1
  const sorted = [...active].sort((a, b) => {
    const x = value(a)
    const y = value(b)
    return (x < y ? -1 : x > y ? 1 : 0) * dir
  })
  const total = sorted.reduce((s, x) => s + monthlyCost(x), 0)
  const onSort = (k: string) => setSort(nextSort(sort, k))
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold">Subscriptions</h3>
        <div className="text-[13px] text-[var(--text-secondary)] tnum max-sm:hidden">
          {sorted.length} active · ≈{fmt(total)}/month
        </div>
      </div>
      <Table className="w-full text-[13px]">
        <TableHeader>
          <TableRow className="text-left text-[12px] text-[var(--text-muted)]">
            <SortHead id="name" label="Service" sort={sort} onSort={onSort} className="pb-2 font-medium" />
            <SortHead id="billing" label="Bills on" sort={sort} onSort={onSort} className="pb-2 font-medium" />
            <SortHead id="account" label="Billed via" sort={sort} onSort={onSort} className="pb-2 font-medium max-sm:hidden" />
            <SortHead id="cadence" label="Cadence" sort={sort} onSort={onSort} className="pb-2 font-medium max-md:hidden" />
            <SortHead id="price" label="Price" sort={sort} onSort={onSort} right className="pb-2 pr-3 font-medium max-md:hidden" />
            <SortHead id="month" label="≈ / month" sort={sort} onSort={onSort} right className="whitespace-nowrap pb-2 font-medium" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((s) => (
            <TableRow key={s.name} className="border-t border-[var(--grid)] hover:bg-[var(--surface-2)] transition-colors">
              <TableCell className="py-2 pr-3 font-medium">
                <span className="flex items-center gap-2">
                  <MerchantIcon name={s.name} /> {s.name}
                </span>
              </TableCell>
              <TableCell className="py-2 pr-3 text-[var(--text-secondary)] whitespace-nowrap">{s.billing}</TableCell>
              <TableCell className="py-2 pr-3 text-[var(--text-secondary)] whitespace-nowrap max-sm:hidden">
                {acctName(s.account)}
              </TableCell>
              <TableCell className="py-2 pr-3 text-[var(--text-secondary)] max-md:hidden">{s.cadence}</TableCell>
              <TableCell className="py-2 pr-3 text-right tnum whitespace-nowrap max-md:hidden">
                {fmt(s.amount)}
                {s.cadence === 'annual' && <span className="text-[var(--text-muted)]">/yr</span>}
              </TableCell>
              <TableCell className="py-2 text-right tnum">{fmt(monthlyCost(s))}</TableCell>
            </TableRow>
          ))}
          <TableRow className="border-t border-[var(--baseline)] font-semibold">
            <TableCell className="py-2" colSpan={2}>Estimated monthly total</TableCell>
            {/* empty cells mirror the columns that hide on small screens, so the total
                lines up under the last column at every width */}
            <TableCell className="p-0 max-sm:hidden" />
            <TableCell className="p-0 max-md:hidden" />
            <TableCell className="p-0 max-md:hidden" />
            <TableCell className="py-2 text-right tnum">{fmt(total)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <p className="mt-3 text-[12px] text-[var(--text-muted)]">
        Shows subscriptions that charged in the last month, and a ~ means it has only been seen once.
      </p>
      {inactive.length > 0 && (
        <div className="mt-1">
          <Button variant="ghost" size="xs"
            onClick={() => setShowInactive(!showInactive)}
            aria-expanded={showInactive}
            className="-ml-2 h-6 gap-1 px-2 text-[12px] font-normal text-[var(--text-muted)] hover:text-white"
          >
            {showInactive ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
            {inactive.length} not seen recently
          </Button>
          {showInactive && (
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-muted)]">
              {inactive.map((s) => s.name).join(', ')}
            </p>
          )}
        </div>
      )}
    </Card>
  )
}
