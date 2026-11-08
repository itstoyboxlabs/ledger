import { useMemo, useState } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/primitives/table'
import { CATEGORY_HEX } from '@/shared/constants/CATEGORY_HEX'
import { fmt } from '@/shared/utils/fmt'
import { Card } from '@/shared/ui/Card'
import { Dot } from '@/shared/ui/Dot'
import { MerchantIcon } from '@/shared/ui/MerchantIcon'
import { acctName } from '@/shared/utils/acctName'
import { logDayLabel } from '@/shared/utils/logDayLabel'
import { txnValue } from '@/screens/spending/utils/txnValue'
import type { Transaction } from '@/shared/types/Transaction'

type TxnTableProps = {
  txns: Transaction[]
  title: string
}

type TxnSortKey = 'date' | 'amount'

export function TxnTable({ txns, title }: TxnTableProps) {
  const [sortKey, setSortKey] = useState<TxnSortKey>('date')
  const [dir, setDir] = useState<number>(-1)
  const sorted = useMemo(() => {
    const arr = [...txns]
    arr.sort((a, b) => {
      const va = sortKey === 'amount' ? txnValue(a) : a.date
      const vb = sortKey === 'amount' ? txnValue(b) : b.date
      return (va < vb ? -1 : va > vb ? 1 : 0) * dir
    })
    return arr
  }, [txns, sortKey, dir])

  const total = txns.reduce((s, t) => s + txnValue(t), 0)
  const th = (key: TxnSortKey, label: string, right?: boolean) => (
    <TableHead
      onClick={() => {
        if (sortKey === key) setDir(-dir)
        else { setSortKey(key); setDir(key === 'date' ? -1 : -1) }
      }}
      className={`py-2.5 font-normal cursor-pointer select-none hover:text-white ${right ? 'text-right' : 'text-left pl-2'}`}
    >
      {label} {sortKey === key ? (dir === 1 ? '↑' : '↓') : ''}
    </TableHead>
  )

  return (
    <Card className="p-5 [--gx:10%] [--gy:-8%]">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
        <div className="text-right tnum">
          <div className="text-[17px] font-semibold tracking-tight">{fmt(total)}</div>
          <div className="text-[12px] text-[var(--text-muted)]">{txns.length} transactions</div>
        </div>
      </div>
      <div tabIndex={0} role="region" aria-label={`${title} table`} className="max-h-[480px] overflow-y-auto overflow-x-auto overscroll-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Table className="w-full text-[13px]">
          <TableHeader className="sticky top-0 z-10 bg-transparent backdrop-blur-xl [&_th]:border-b [&_th]:border-[var(--grid)]">
            <TableRow className="text-[13px] text-[var(--text-secondary)]">
              {th('date', 'Date')}
              <TableHead className="py-2.5 text-left font-normal">Merchant</TableHead>
              <TableHead className="py-2.5 text-left font-normal max-lg:hidden">Category</TableHead>
              <TableHead className="py-2.5 text-left font-normal max-sm:hidden">Account</TableHead>
              {th('amount', 'Amount', true)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((t) => {
              const v = txnValue(t)
              return (
                <TableRow key={t.id} className="border-t border-[var(--grid)] hover:bg-[var(--surface-2)] transition-colors">
                  <TableCell className="py-2 pl-2 pr-3 tnum text-[var(--text-secondary)] whitespace-nowrap">
                    {logDayLabel(t.date)}
                  </TableCell>
                  <TableCell className="py-2 pr-3">
                    <div className="flex items-center gap-3.5">
                      <MerchantIcon name={t.merchant ?? ''} size={30} />
                      <div className="min-w-0">
                        <div className="font-medium">{t.merchant}</div>
                        <div className="max-w-[380px] truncate text-[11px] uppercase text-[var(--text-muted)] max-sm:max-w-[80px]">
                          {t.desc}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 pr-3 max-lg:hidden">
                    <span className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                      <Dot color={(t.cat ? CATEGORY_HEX[t.cat] : undefined) ?? 'var(--cat-other)'} />
                      {t.sub}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 pr-3 text-[var(--text-secondary)] whitespace-nowrap max-sm:hidden">
                    {acctName(t.account)}
                  </TableCell>
                  <TableCell
                    className="py-2 pr-1 text-right tnum font-semibold whitespace-nowrap"
                    style={v < 0 || t.kind === 'income' ? { color: 'var(--good)' } : undefined}
                  >
                    {fmt(v)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
