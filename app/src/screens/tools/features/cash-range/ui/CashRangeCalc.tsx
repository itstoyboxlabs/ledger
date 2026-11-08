import { useEffect, useState } from 'react'
import type { BudgetRow } from '@/shared/types/BudgetRow'
import { getBudget } from '@/shared/utils/getBudget'
import { fmt } from '@/shared/utils/fmt'
import { fmt0 } from '@/shared/utils/fmt0'
import { isBudgetRowHidden } from '@/shared/utils/isBudgetRowHidden'
import { Button } from '@/shared/ui/primitives/button'
import { Label } from '@/shared/ui/primitives/label'
import { Input } from '@/shared/ui/primitives/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/primitives/table'
import { Card } from '@/shared/ui/Card'
import { MerchantIcon } from '@/shared/ui/MerchantIcon'
import { ToolField } from '@/shared/ui/ToolField'
import { amountInDayRange } from '@/screens/tools/features/cash-range/utils/amountInDayRange'
import { parseSumExpr } from '@/shared/utils/parseSumExpr'
import { useToolState } from '@/shared/hooks/useToolState'

// "How much cash do I need between two days of the month?" — e.g. this paycheck
// to the next. Same day/prorate/hidden-row rules as Rest of month, generalized to
// any day-of-month range. Optional cash-on-hand input shows the leftover.
export function CashRangeCalc() {
  const [c, setC] = useToolState('cashRange', {
    fromDay: 1,
    toDay: 15,
    cashOnHand: 0, // legacy plain number, seeds cashExpr until the field is first edited
    cashExpr: '', // running-total string, e.g. "3200 checking + 4315 paycheck"
  })
  const [budgetRows, setBudgetRows] = useState<BudgetRow[] | null>(null)
  useEffect(() => {
    getBudget()
      .then((d) => setBudgetRows(d.rows.filter((r) => !r.hidden && !isBudgetRowHidden(r))))
      .catch(() => {})
  }, [])

  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

  if (!budgetRows) {
    return <Card className="p-5 text-[13px] text-[var(--text-muted)]">Loading…</Card>
  }

  const validRange = c.toDay >= c.fromDay
  const rows = validRange
    ? budgetRows
        .map((r) => ({ row: r, amount: amountInDayRange(r, c.fromDay, c.toDay, daysInMonth) }))
        .filter((x) => x.amount > 0.005)
        .sort((a, b) => b.amount - a.amount)
    : []
  const total = rows.reduce((s, x) => s + x.amount, 0)
  // one-time migration: an old plain-number value shows up as the starting text, and
  // the moment the field is edited it's zeroed so clearing the box can't resurrect it
  const cashExpr = c.cashExpr || (c.cashOnHand ? String(c.cashOnHand) : '')
  const cash = parseSumExpr(cashExpr)
  const leftover = cash.total - total
  const days = validRange ? c.toDay - c.fromDay + 1 : 0
  const ord = (n: number): string => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th')

  return (
    <Card className="p-5">
      <h3 className="text-[15px] font-semibold">Cash needed between two days of the month</h3>
      <p className="mt-1 text-[12px] text-[var(--text-muted)]">
        See how much of your budget comes due between two days of the month, so you know how much
        cash you need to cover it. For example, to see what's due from the 1st to the 15th, enter
        1 and 15. Then put what you'll have in Cash on hand, like a $3,000 paycheck plus $500 from
        a sale, to see what's left. Bills come from the Budget tab by their billing day.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm"
          onClick={() => setC({ ...c, fromDay: 1, toDay: 15 })}
        >
          1st → 15th
        </Button>
        <Button variant="outline" size="sm"
          onClick={() => setC({ ...c, fromDay: 16, toDay: daysInMonth })}
        >
          16th → end of month
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ToolField label="From day" value={c.fromDay} onChange={(v: number) => setC({ ...c, fromDay: v })} />
        <ToolField label="To day" value={c.toDay} onChange={(v: number) => setC({ ...c, toDay: v })} />
        <Label className="block sm:col-span-2">
          <span className="text-[12px] text-[var(--text-muted)]">
            Cash on hand <span className="normal-case text-[var(--text-muted)]">(optional)</span>
          </span>
          <div className="relative mt-1">
            <Input
              type="text"
              value={cashExpr}
              placeholder="3000 paycheck + 400 from a sale"
              onChange={(e) => setC({ ...c, cashExpr: e.target.value, cashOnHand: 0 })}
              className={cash.terms.length > 0 ? 'pr-28' : ''}
            />
            {cash.terms.length > 0 && (
              <span className="pointer-events-none absolute inset-y-1 right-1 flex items-center rounded-md bg-[var(--surface-2)] px-2.5 text-[12px] font-medium tnum ring-1 ring-[var(--ring)]">
                = {fmt0(cash.total)}
              </span>
            )}
          </div>
        </Label>
      </div>

      {!validRange ? (
        <p className="mt-5 text-[13px] text-[var(--bad)]">"To day" must be on or after "From day".</p>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="rounded-lg bg-[var(--surface-2)] px-4 py-2.5 ring-1 ring-[var(--ring)]">
              <div className="text-[11px] text-[var(--text-muted)]">
                Day {c.fromDay} – {c.toDay} ({days} days)
              </div>
              <div className="tnum text-[15px] font-semibold">{fmt(total)}</div>
            </div>
            {cash.terms.length > 0 && (
              <div className="rounded-lg bg-[var(--surface-2)] px-4 py-2.5 ring-1 ring-[var(--ring)]">
                <div className="text-[11px] text-[var(--text-muted)]">Leftover after cash on hand</div>
                <div className="tnum text-[15px] font-semibold" style={{ color: leftover >= 0 ? 'var(--good)' : 'var(--bad)' }}>
                  {fmt(leftover)}
                </div>
              </div>
            )}
          </div>

          <Table className="mt-5 w-full select-none text-[13px]">
            <TableHeader>
              <TableRow className="text-left text-[12px] text-[var(--text-muted)]">
                <TableHead className="pb-2 font-medium">Expense</TableHead>
                <TableHead className="pb-2 text-right font-medium">Timing</TableHead>
                <TableHead className="pb-2 text-right font-medium">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ row, amount }) => (
                <TableRow key={row.id} className="border-t border-[var(--grid)] hover:bg-[var(--surface-2)] transition-colors">
                  <TableCell className="py-1.5 pr-3">
                    <span className="flex items-center gap-2">
                      <MerchantIcon name={row.name} size={16} />
                      {row.name}
                    </span>
                  </TableCell>
                  <TableCell className="py-1.5 text-right text-[12px] text-[var(--text-muted)]">
                    {row.day != null
                      ? `on the ${ord(row.day)}`
                      : row.prorate
                        ? `prorated, ${days} days`
                        : 'undated — assumed'}
                  </TableCell>
                  <TableCell className="py-1.5 text-right tnum">{fmt(amount)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t border-[var(--baseline)] font-semibold">
                <TableCell className="py-2" colSpan={2}>Total</TableCell>
                <TableCell className="py-2 text-right tnum">{fmt(total)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </>
      )}
    </Card>
  )
}
