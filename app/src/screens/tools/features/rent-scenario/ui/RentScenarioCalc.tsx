import { useEffect, useState } from 'react'
import { getBudget } from '@/shared/utils/getBudget'
import { budgetEffRows } from '@/shared/utils/budgetEffRows'
import { normalizeBudgetRow } from '@/shared/utils/normalizeBudgetRow'
import { NO_RENT_ROW } from '@/screens/tools/features/rent-scenario/constants/NO_RENT_ROW'
import { fmt } from '@/shared/utils/fmt'
import { fmt0 } from '@/shared/utils/fmt0'
import { isBudgetRowHidden } from '@/shared/utils/isBudgetRowHidden'
import type { RentScenarioBudget } from '@/screens/tools/types/RentScenarioBudget'
import type { RentScenarioExpense } from '@/screens/tools/types/RentScenarioExpense'
import type { Debt } from '@/shared/types/Debt'
import { Label } from '@/shared/ui/primitives/label'
import { Button } from '@/shared/ui/primitives/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/primitives/table'
import { Card } from '@/shared/ui/Card'
import { DraftNumberInput } from '@/shared/ui/DraftNumberInput'
import { Dropdown } from '@/shared/ui/Dropdown'
import { MerchantIcon } from '@/shared/ui/MerchantIcon'
import { PresetBar } from '@/shared/ui/PresetBar'
import { ToolField } from '@/shared/ui/ToolField'
import { FilingNote } from '@/screens/tools/ui/FilingNote'
import { sumBalances } from '@/shared/utils/sumBalances'
import { useBudgetIncome } from '@/shared/hooks/useBudgetIncome'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { usePresets } from '@/shared/hooks/usePresets'
import { useToolState } from '@/shared/hooks/useToolState'

// Rent scenario table — "if my rent were X, what's left over per month / per year?"
// Income and non-rent expenses come live from the Budget tab.
export function RentScenarioCalc({ debts, goToAboutYou }: { debts: Debt[]; goToAboutYou?: () => void }) {
  const [c, setC] = useToolState('rentScenario3', { from: 1000, to: 4000, step: 500, rentRow: '' })
  const [budget, setBudget] = useState<RentScenarioBudget | null>(null)
  // scenario-local expense overrides (by budget row id) — never touch the real budget
  const [overrides, setOverrides] = usePersistedState<Record<string, number>>(
    'rentScenarioOverrides', {},
    (v) => !!v && typeof v === 'object' && !Array.isArray(v),
  )
  const [showExpenses, setShowExpenses] = useState(false)
  const { presets, save, remove } = usePresets<Record<string, number>>('rentScenario')
  useEffect(() => {
    getBudget()
      .then((d) => {
        // the rent row is a saved link (rentRow). First run: link the row named Rent.
        // Read the rows the way the Budget page does, so subscriptions count here too.
        const effective = budgetEffRows(d.rows.map(normalizeBudgetRow), d.dismissedSubs)
        let rentRow = effective.find((r) => r.id === c.rentRow)
        if (!c.rentRow) {
          const byName = effective.find((r) => r.name === 'Rent')
          if (byName) {
            rentRow = byName
            setC((prev) => (prev.rentRow ? prev : { ...prev, rentRow: byName.id }))
          }
        }
        setBudget({
          currentRent: Number(rentRow?.amount) || 0,
          allRows: effective.filter((r) => !r.hidden && !isBudgetRowHidden(r)),
          rows: effective
            .filter((r) => r !== rentRow && !r.hidden && !isBudgetRowHidden(r))
            .map((r) => ({ id: r.id, name: r.name, amount: Number(r.amount) || 0 })),
        })
      })
      .catch(() => {})
  }, [c.rentRow]) // eslint-disable-line react-hooks/exhaustive-deps

  const income = useBudgetIncome()
  if (!budget) {
    return (
      <Card className="p-5 text-[13px] text-[var(--text-muted)]">Loading rent scenarios…</Card>
    )
  }

  // overrides are keyed by row id, so a deleted row sheds its own: only rows still in the
  // budget are read, saved to presets or kept on the next edit
  const liveOverrides = Object.fromEntries(
    Object.entries(overrides).filter(([id]) => budget.rows.some((r) => r.id === id)),
  )
  const effectiveAmount = (r: RentScenarioExpense): number => (overrides[r.id] != null ? overrides[r.id] : r.amount)
  const overriddenCount = budget.rows.filter((r) => overrides[r.id] != null && overrides[r.id] !== r.amount).length
  const nonRent = budget.rows.reduce((s, r) => s + effectiveAmount(r), 0)

  const MAX_ROWS = 40
  const rents: number[] = []
  const step = Math.max(50, c.step)
  for (let r = c.from; r <= c.to + 0.001 && rents.length < MAX_ROWS; r += step) rents.push(r)
  const truncated = rents.length === MAX_ROWS && rents[MAX_ROWS - 1] + step <= c.to + 0.001
  // no marker without a current rent to compare against
  const closest = budget.currentRent > 0
    ? rents.reduce(
        (best, r) => (Math.abs(r - budget.currentRent) < Math.abs(best - budget.currentRent) ? r : best),
        rents[0] ?? 0,
      )
    : null

  const incomeTip = `Monthly income from the Budget tab: average full paycheck × 2/month, derived from actual payroll deposits in your statements (${fmt(income)}).`
  const expenseTip = `Everything on your Budget tab EXCEPT the Rent row — each scenario substitutes its own rent. Currently ${fmt(nonRent)}/month of non-rent expenses${overriddenCount ? ` (${overriddenCount} row${overriddenCount > 1 ? 's' : ''} overridden just for this tool — see "Expenses used")` : ' (straight from the Budget tab)'}.`

  const totalDebt = sumBalances(debts)
  const payoffLabel = (leftPerMonth: number): string => {
    if (totalDebt <= 0 || leftPerMonth <= 0) return '—'
    const months = Math.ceil(totalDebt / leftPerMonth)
    if (months > 1200) return '100+ yrs'
    const y = Math.floor(months / 12)
    const m = months % 12
    return y > 0 ? `${y}y ${m}m` : `${m}m`
  }
  const payoffTip = `Total debt from the shared debts above (${fmt(totalDebt)}) ÷ that row's monthly leftover, assuming every leftover dollar goes to debt. Ignores interest, so real payoff runs longer — especially on the card.`

  return (
    <Card className="p-5">
      <h2 className="text-[15px] font-semibold">Rent scenarios</h2>
      <p className="mt-1 text-[12px] text-[var(--text-muted)]">
        This helps you figure out how much rent you can afford. Try a few rents,
        like $3,000 or $5,000, and see what you'd have left each month after everything else. Income
        and expenses come from your Budget tab: {fmt0(income)} a month coming in,{' '}
        {fmt0(nonRent)} going out besides rent.
      </p>
      <FilingNote onOpen={goToAboutYou} />
      <div className="mt-4 grid grid-cols-3 gap-3">
        <ToolField label="From" value={c.from} onChange={(v: number) => setC({ ...c, from: v })} step={250} suffix="$" />
        <ToolField label="To" value={c.to} onChange={(v: number) => setC({ ...c, to: v })} step={250} suffix="$" />
        <ToolField label="Step" value={c.step} onChange={(v: number) => setC({ ...c, step: v })} step={50} suffix="$" />
      </div>
      <Label className="mt-3 block max-w-[320px]">
        <span className="text-[12px] text-[var(--text-muted)]">Your rent comes from</span>
        <div className="mt-1">
          <Dropdown
            label="Rent row"
            hideLabel
            value={budget.allRows.some((r) => r.id === c.rentRow) ? c.rentRow : NO_RENT_ROW}
            onChange={(v: string) => setC({ ...c, rentRow: v })}
            className="h-9 w-full justify-between rounded-lg bg-[var(--surface-1)] px-3 shadow-xs"
            options={[
              { value: NO_RENT_ROW, label: 'No budget row' },
              ...[...budget.allRows].sort((a, b) => a.name.localeCompare(b.name)).map((r) => ({ value: r.id, label: r.name })),
            ]}
          />
        </div>
      </Label>

      {/* scenario-local expenses copy */}
      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm"
            onClick={() => setShowExpenses(!showExpenses)}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" className={`transition-transform ${showExpenses ? 'rotate-180' : ''}`}>
              <path d="M1 3.5 L5 7.5 L9 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Expenses used · {fmt(nonRent)}/mo
            {overriddenCount > 0 && (
              <span className="text-[var(--warn)]">{overriddenCount} overridden</span>
            )}
          </Button>
          {overriddenCount > 0 && (
            <Button variant="outline" size="sm"
              onClick={() => setOverrides({})}
              className="text-[var(--text-secondary)] hover:text-white"
            >
              Reset to budget defaults
            </Button>
          )}
          <PresetBar
            presets={presets}
            currentData={liveOverrides}
            onApply={(d: Record<string, number>) => setOverrides(d)}
            onSave={(name: string) => save(name, liveOverrides)}
            onDelete={remove}
            canSave={overriddenCount > 0}
            scope="rentScenario"
          />
        </div>
        {showExpenses && (
          <div tabIndex={0} role="region" aria-label="Budget expenses used in this scenario" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-3 max-h-[300px] overflow-y-auto overflow-x-hidden overscroll-contain rounded-lg bg-[var(--surface-2)]/40 p-3 ring-1 ring-[var(--ring)] max-sm:p-2">
            <Table className="w-full text-[13px]">
              <TableHeader>
                <TableRow className="text-left text-[11px] text-[var(--text-muted)]">
                  <TableHead className="pb-1.5 font-medium">Expense</TableHead>
                  <TableHead className="pb-1.5 text-right font-medium">Budget</TableHead>
                  <TableHead className="pb-1.5 pl-4 text-right font-medium max-sm:pl-2">Used here</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budget.rows.map((r) => {
                  const overridden = overrides[r.id] != null && overrides[r.id] !== r.amount
                  return (
                    <TableRow key={r.id} className="border-t border-[var(--grid)] hover:bg-[var(--surface-2)] transition-colors">
                      <TableCell className="py-1 pr-3">
                        <span className="flex items-center gap-2">
                          <MerchantIcon name={r.name} size={15} />
                          <span className="truncate">{r.name}</span>
                        </span>
                      </TableCell>
                      <TableCell className={`py-1 text-right tnum ${overridden ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-secondary)]'}`}>
                        {fmt(r.amount)}
                      </TableCell>
                      <TableCell className="py-1 pl-4 text-right max-sm:pl-2">
                        <DraftNumberInput
                          ariaLabel={`${r.name} amount used here`}
                          step={1}
                          value={effectiveAmount(r)}
                          onChange={(v: number) => setOverrides({ ...liveOverrides, [r.id]: v })}
                          className={
                            'w-24 max-sm:w-20 border-input bg-[var(--surface-1)] text-right tnum ' +
                            (overridden ? 'border-[#5c4a1d] text-[var(--warn)]' : '')
                          }
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <p className="mt-2 text-[11px] text-[var(--text-muted)]">
              Overrides only affect this tool — your real Budget tab is untouched.
            </p>
          </div>
        )}
      </div>
      {c.from > c.to ? (
        <p className="mt-5 text-[13px] text-[var(--bad)]">"To" must be at least "From".</p>
      ) : (
        <>
          <Table className="mt-5 w-full text-[13px]">
            <TableHeader>
              <TableRow className="text-left text-[12px] text-[var(--text-muted)]">
                <TableHead className="pb-2 font-medium">Rent / mo</TableHead>
                <TableHead className="pb-2 text-right font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    Left / month
                    <span className="group/tip relative inline-flex normal-case tracking-normal">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="cursor-help text-[var(--text-muted)]">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
                      </svg>
                      <span className="pointer-events-none absolute bottom-full right-0 z-40 mb-2 w-[280px] rounded-lg bg-[var(--surface-3)] px-3 py-2 text-[12px] font-normal leading-relaxed text-[var(--text-secondary)] opacity-0 shadow-xl ring-1 ring-[var(--ring)] transition-opacity group-hover/tip:opacity-100">
                        {incomeTip} Minus scenario rent, minus non-rent expenses: {expenseTip}
                      </span>
                    </span>
                  </span>
                </TableHead>
                <TableHead className="pb-2 text-right font-medium">Left / year</TableHead>
                <TableHead className="pb-2 text-right font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    Debt paid off in
                    <span className="group/tip2 relative inline-flex normal-case tracking-normal">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="cursor-help text-[var(--text-muted)]">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
                      </svg>
                      <span className="pointer-events-none absolute bottom-full right-0 z-40 mb-2 w-[280px] rounded-lg bg-[var(--surface-3)] px-3 py-2 text-[12px] font-normal leading-relaxed text-[var(--text-secondary)] opacity-0 shadow-xl ring-1 ring-[var(--ring)] transition-opacity group-hover/tip2:opacity-100">
                        {payoffTip}
                      </span>
                    </span>
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rents.map((r) => {
                const left = income - nonRent - r
                const isCurrent = r === closest
                return (
                  <TableRow
                    key={r}
                    className={
                      'border-t border-[var(--grid)] hover:bg-[var(--surface-2)] transition-colors' +
                      (isCurrent ? ' bg-[var(--surface-2)]' : '')
                    }
                  >
                    <TableCell className="py-1.5 tnum">
                      {fmt0(r)}
                      {isCurrent && (
                        <span className="ml-2 text-[11px] text-[var(--warn)]">← closest to current ({fmt0(budget.currentRent)})</span>
                      )}
                    </TableCell>
                    <TableCell className="py-1.5 text-right tnum" style={{ color: left >= 0 ? 'var(--good)' : 'var(--bad)' }}>
                      {fmt(left)}
                    </TableCell>
                    <TableCell className="py-1.5 text-right tnum" style={{ color: left >= 0 ? 'var(--good)' : 'var(--bad)' }}>
                      {fmt(left * 12)}
                    </TableCell>
                    <TableCell className="py-1.5 text-right tnum text-[var(--text-secondary)]">
                      {payoffLabel(left)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {truncated && (
            <p className="mt-2 text-[11px] text-[var(--text-muted)]">Showing the first {MAX_ROWS} rows. Raise the step to reach {fmt0(c.to)}.</p>
          )}
        </>
      )}
    </Card>
  )
}
