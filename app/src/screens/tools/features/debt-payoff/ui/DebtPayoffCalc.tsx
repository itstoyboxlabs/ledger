import type { Debt } from '@/shared/types/Debt'
import { Label } from '@/shared/ui/primitives/label'
import { Table, TableBody } from '@/shared/ui/primitives/table'
import { fmt } from '@/shared/utils/fmt'
import { Card } from '@/shared/ui/Card'
import { Dropdown } from '@/shared/ui/Dropdown'
import { ToolField } from '@/shared/ui/ToolField'
import { ToolRow } from '@/screens/tools/ui/ToolRow'
import { debtPaymentOf } from '@/shared/utils/debtPaymentOf'
import { payoffMonths } from '@/shared/utils/payoffMonths'
import { sumBalances } from '@/shared/utils/sumBalances'
import { weightedApr } from '@/shared/utils/weightedApr'
import { useBudgetRows } from '@/shared/hooks/useBudgetRows'
import { useBudgetSavingsMonthly } from '@/shared/hooks/useBudgetSavingsMonthly'
import { CONTRIBUTION_SOURCES } from '@/screens/tools/features/debt-payoff/constants/CONTRIBUTION_SOURCES'
import { toggleDebtPick } from '@/screens/tools/features/debt-payoff/utils/toggleDebtPick'
import { useToolState } from '@/shared/hooks/useToolState'

export function DebtPayoffCalc({ debts }: { debts: Debt[] }) {
  const [c, setC] = useToolState('debtPayoff', {
    picks: [] as string[],
    source: '',
    typed: 0,
    // the first version kept one debt, one amount for all and one amount per debt
    pick: 'all',
    perMonth: 0,
    custom: {} as Record<string, number>,
  })
  const rows = useBudgetRows()
  const budgetSavings = useBudgetSavingsMonthly()
  const allIds = debts.map((d) => d.id)
  const legacyPicks = c.pick !== 'all' && allIds.includes(c.pick) ? [c.pick] : []
  const picks = (c.picks.length ? c.picks : legacyPicks).filter((id) => allIds.includes(id))
  const sel = picks.length ? debts.filter((d) => picks.includes(d.id)) : debts
  const total = sumBalances(sel)
  // what the Balances page says you pay now (a linked Budget row or a typed payment)
  const usual = sel.reduce((s, d) => s + debtPaymentOf(d, rows), 0)
  const legacyTyped = sel.length === 1 && typeof c.custom[sel[0].id] === 'number' ? c.custom[sel[0].id] : sel.length > 1 ? c.perMonth : 0
  const source = c.source || (legacyTyped > 0 ? 'typed' : 'usual')
  const typed = c.source ? c.typed : legacyTyped
  const contribution = source === 'budget' ? Math.round(budgetSavings) : source === 'typed' ? typed : usual
  const setContribution = (v: number) => setC({ ...c, source: 'typed', typed: v })
  const setPicks = (next: string[]) => setC({ ...c, picks: next, pick: 'all' })
  // all debts together use the balance-weighted rate
  const apr = weightedApr(sel)
  const months = payoffMonths(total, contribution, apr)
  const ok = months !== null && contribution > 0
  const y = ok && months !== null ? Math.floor(months / 12) : 0
  const m = ok && months !== null ? months % 12 : 0
  // from the 1st, so adding months from the 29th to 31st never rolls into the month after
  const now = new Date()
  const done = new Date(now.getFullYear(), now.getMonth() + (ok && months !== null ? months : 0), 1)
  const doneLabel = done.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  const mixed = sel.length > 1 && sel.filter((d) => d.apr > 0).length > 0

  return (
    <Card className="p-5">
      <h2 className="text-[15px] font-semibold">Debt payoff</h2>
      <p className="mt-1 text-[12px] text-[var(--text-muted)]">
        Pick the debts to pay off and say how much you put toward them each month. This shows how long
        it takes to pay off and the date you are debt free. Debts come from the Balances page.
      </p>
      {debts.length === 0 ? (
        <p className="mt-4 text-[13px] text-[var(--text-secondary)]">Add a debt on the Balances page to use this.</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Label className="block">
              <span className="text-[12px] text-[var(--text-muted)]">Pay off</span>
              <div className="mt-1">
                <Dropdown
                  label="Debt"
                  hideLabel
                  values={picks.length ? picks : allIds}
                  onToggle={(id: string) => setPicks(toggleDebtPick(picks, allIds, id))}
                  className="h-9 w-full justify-between rounded-lg bg-[var(--surface-1)] px-3 shadow-xs"
                  options={debts.map((d) => ({ value: d.id, label: d.name || 'Unnamed debt' }))}
                />
              </div>
            </Label>
            <Label className="block">
              <span className="text-[12px] text-[var(--text-muted)]">Money comes from</span>
              <div className="mt-1">
                <Dropdown
                  label="Source"
                  hideLabel
                  value={source}
                  onChange={(v: string) => setC({ ...c, source: v, typed: v === 'typed' ? contribution : typed })}
                  className="h-9 w-full justify-between rounded-lg bg-[var(--surface-1)] px-3 shadow-xs"
                  options={CONTRIBUTION_SOURCES}
                />
              </div>
            </Label>
            <div className="col-span-2">
              <ToolField label="Contribution per month" value={contribution} onChange={setContribution} step={100} suffix="$" />
              {source === 'budget' && (
                <p className="mt-1.5 text-[12px] text-[var(--text-muted)]">
                  {budgetSavings > 0
                    ? 'The savings share of your Budget leftover. Retirement saves this same money, so it is not counted twice.'
                    : 'Your Budget has no savings left over. Change what is left on the Budget page.'}
                </p>
              )}
            </div>
          </div>
          <Table className="mt-4 w-full text-[13px]">
            <TableBody>
              <ToolRow label="Total debt" value={fmt(total)} />
              <ToolRow
                label={apr > 0 ? 'Time to pay off (includes interest)' : 'Time to pay off'}
                value={ok ? (y > 0 ? `${y}y ${m}m` : `${m}m`) : '—'}
                bold
                tone="var(--good)"
                tip={
                  apr > 0
                    ? `Uses ${apr.toFixed(2)}% APR${mixed ? ' (the average rate across your debts, weighted by balance)' : ''}. If the payment does not cover the monthly interest the debt never clears.`
                    : 'Total debt divided by what you put in each month. Add an APR on the Balances page to include interest.'
                }
              />
              <ToolRow label="Debt-free date" value={ok ? doneLabel : '—'} />
            </TableBody>
          </Table>
        </>
      )}
    </Card>
  )
}
