import type { Debt } from '@/shared/types/Debt'
import { Label } from '@/shared/ui/primitives/label'
import { Table, TableBody } from '@/shared/ui/primitives/table'
import { fmt } from '@/shared/utils/fmt'
import { Card } from '@/shared/ui/Card'
import { Dropdown } from '@/shared/ui/Dropdown'
import { ToolField } from '@/shared/ui/ToolField'
import { ToolRow } from '@/screens/tools/ui/ToolRow'
import { debtPaymentOf } from '@/shared/utils/debtPaymentOf'
import { rollingPayoff } from '@/shared/utils/rollingPayoff'
import { sumBalances } from '@/shared/utils/sumBalances'
import { useBudgetRows } from '@/shared/hooks/useBudgetRows'
import { usePresets } from '@/shared/hooks/usePresets'
import type { BudgetPresetData } from '@/shared/types/BudgetPresetData'
import type { BudgetRow } from '@/shared/types/BudgetRow'
import { useBudgetSavingsMonthly } from '@/shared/hooks/useBudgetSavingsMonthly'
import { CONTRIBUTION_SOURCES } from '@/screens/tools/features/debt-payoff/constants/CONTRIBUTION_SOURCES'
import { toggleDebtPick } from '@/screens/tools/features/debt-payoff/utils/toggleDebtPick'
import { useToolState } from '@/shared/hooks/useToolState'

export function DebtPayoffCalc({ debts }: { debts: Debt[] }) {
  const [c, setC] = useToolState('debtPayoff', {
    picks: [] as string[],
    source: '',
    budget: '',
    typed: 0,
    // the first version kept one debt, one amount for all and one amount per debt
    pick: 'all',
    perMonth: 0,
    custom: {} as Record<string, number>,
  })
  const rows = useBudgetRows()
  const budgetSavings = useBudgetSavingsMonthly(c.budget)
  const { presets: budgetPresets } = usePresets<BudgetPresetData | BudgetRow[]>('expenses', { ids: true })
  const budgetOptions = [{ value: 'today', label: "Today's Budget" }, ...budgetPresets.filter((p) => p.id).map((p) => ({ value: p.id as string, label: p.name }))]
  const allIds = debts.map((d) => d.id)
  const legacyPicks = c.pick !== 'all' && allIds.includes(c.pick) ? [c.pick] : []
  const picks = (c.picks.length ? c.picks : legacyPicks).filter((id) => allIds.includes(id))
  const sel = picks.length ? debts.filter((d) => picks.includes(d.id)) : debts
  const total = sumBalances(sel)
  // what the Balances page says you pay now (a linked Budget row or a typed payment)
  const usualEach = sel.map((d) => debtPaymentOf(d, rows))
  const usual = usualEach.reduce((t, p) => t + p, 0)
  const legacyTyped = sel.length === 1 && typeof c.custom[sel[0].id] === 'number' ? c.custom[sel[0].id] : sel.length > 1 ? c.perMonth : 0
  const source = c.source || (legacyTyped > 0 ? 'typed' : 'usual')
  const typed = c.source ? c.typed : legacyTyped
  const contribution = source === 'budget' ? Math.round(budgetSavings) : source === 'typed' ? typed : usual
  const setContribution = (v: number) => setC({ ...c, source: 'typed', typed: v })
  const setPicks = (next: string[]) => setC({ ...c, picks: next, pick: 'all' })
  // paid in the order of the Balances page: each debt its own payment first, the rest to the first
  // one still owing, and a cleared debt's payment rolls on to the next
  const plan = rollingPayoff(sel.map((d, i) => ({ ...d, payment: usualEach[i] })), contribution)
  const months = plan.total
  const interest = sel.some((d) => d.apr > 0)
  const ok = months !== null && contribution > 0
  const y = ok && months !== null ? Math.floor(months / 12) : 0
  const m = ok && months !== null ? months % 12 : 0
  // from the 1st, so adding months from the 29th to 31st never rolls into the month after
  const now = new Date()
  const done = new Date(now.getFullYear(), now.getMonth() + (ok && months !== null ? months : 0), 1)
  const labelOf = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  const doneLabel = labelOf(done)
  const dateOf = (n: number | null) => (n === null ? '—' : labelOf(new Date(now.getFullYear(), now.getMonth() + n, 1)))

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
            {source === 'budget' ? (
              <>
                <Label className="block">
                  <span className="text-[12px] text-[var(--text-muted)]">Which Budget</span>
                  <div className="mt-1">
                    <Dropdown
                      label="Budget"
                      hideLabel
                      value={c.budget && budgetOptions.some((o) => o.value === c.budget) ? c.budget : 'today'}
                      onChange={(v: string) => setC({ ...c, budget: v === 'today' ? '' : v })}
                      className="h-9 w-full justify-between rounded-lg bg-[var(--surface-1)] px-3 shadow-xs"
                      options={budgetOptions}
                    />
                  </div>
                </Label>
                <Label className="block">
                  <span className="text-[12px] text-[var(--text-muted)]">Contribution per month</span>
                  <div className="mt-1 rounded-lg bg-[var(--surface-1)] px-3 py-2 text-[13px] tnum ring-1 ring-[var(--ring)]">{fmt(contribution)}</div>
                </Label>
                <p className="col-span-2 text-[12px] text-[var(--text-muted)]">
                  {budgetSavings > 0
                    ? 'The savings share of that Budget leftover. Retirement saves this same money, so it is not counted twice.'
                    : 'That Budget has no savings left over. Change what is left on the Budget page.'}
                </p>
              </>
            ) : (
              <div className="col-span-2">
                <ToolField label="Contribution per month" value={contribution} onChange={setContribution} step={100} suffix="$" />
              </div>
            )}
          </div>
          <Table className="mt-4 w-full text-[13px]">
            <TableBody>
              <ToolRow label="Total debt" value={fmt(total)} />
              <ToolRow
                label={interest ? 'Time to pay off (includes interest)' : 'Time to pay off'}
                value={ok ? (y > 0 ? `${y}y ${m}m` : `${m}m`) : '—'}
                bold
                tone="var(--good)"
                tip={
                  sel.length > 1
                    ? 'Debts are paid in the order on the Balances page. Each keeps its own rate. The contribution covers every payment first, then the rest goes to the first debt, and a debt that clears passes its payment on to the next. If the money does not cover the monthly interest a debt never clears.'
                    : interest
                      ? `Uses ${sel[0].apr.toFixed(2)}% APR. If the payment does not cover the monthly interest the debt never clears.`
                      : 'Total debt divided by what you put in each month. Add an APR on the Balances page to include interest.'
                }
              />
              <ToolRow label="Debt-free date" value={ok ? doneLabel : '—'} />
              {sel.length > 1 &&
                sel.map((d, i) => (
                  <ToolRow key={d.id} label={`${i + 1}. ${d.name || 'Unnamed debt'}`} value={ok ? dateOf(plan.months[i]) : '—'} />
                ))}
            </TableBody>
          </Table>
        </>
      )}
    </Card>
  )
}
