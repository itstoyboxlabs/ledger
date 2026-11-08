import { Fragment, useEffect, useRef, useState } from 'react'
import { getMonths } from '@/shared/utils/getMonths'
import { monthCompareLabel } from '@/shared/utils/monthCompareLabel'
import { getLastCompleteMonth } from '@/shared/utils/getLastCompleteMonth'
import { spendAmount } from '@/shared/utils/spendAmount'
import { fmt } from '@/shared/utils/fmt'
import { fmt0 } from '@/shared/utils/fmt0'
import { getSubscriptions } from '@/shared/utils/getSubscriptions'
import { isBudgetRowHidden } from '@/shared/utils/isBudgetRowHidden'
import { STATES } from '@/shared/constants/STATES'
import { getBudget } from '@/shared/utils/getBudget'
import { saveBudget } from '@/shared/utils/saveBudget'
import { isLocal } from '@/shared/utils/isLocal'
import { cn } from '@/shared/utils/cn'
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent } from '@/shared/ui/primitives/tooltip'
import { Button } from '@/shared/ui/primitives/button'
import { X, ChevronRight, ExternalLink, Ellipsis } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem } from '@/shared/ui/primitives/dropdown-menu'
import { Toggle } from '@/shared/ui/primitives/toggle'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/primitives/table'
import { Input } from '@/shared/ui/primitives/input'

import type { BudgetRow } from '@/shared/types/BudgetRow'
import type { BudgetRowLike } from '@/shared/types/BudgetRowLike'
import type { EffectiveBudgetRow } from '@/shared/types/EffectiveBudgetRow'
import type { DismissedSubs } from '@/shared/types/DismissedSubs'
import type { LeftoverAllocation } from '@/shared/types/LeftoverAllocation'
import type { BudgetSaveState } from '@/screens/budget/types/BudgetSaveState'
import type { BudgetEditSnapshot } from '@/screens/budget/types/BudgetEditSnapshot'
import type { BudgetTableItem } from '@/screens/budget/types/BudgetTableItem'
import type { GhostRow } from '@/screens/budget/types/GhostRow'
import type { SortState } from '@/shared/types/SortState'
import type { BudgetSort } from '@/screens/budget/types/BudgetSort'
import { AddRowModal } from '@/screens/budget/ui/AddRowModal'
import { Card } from '@/shared/ui/Card'
import { CoverageDot } from '@/shared/ui/CoverageDot'
import { DEFAULT_STATE } from '@/shared/constants/DEFAULT_STATE'
import { DraftNumberInput } from '@/shared/ui/DraftNumberInput'
import { Dropdown } from '@/shared/ui/Dropdown'
import { INCOME_SOURCES } from '@/screens/budget/constants/INCOME_SOURCES'
import { Icon } from '@/shared/ui/Icon'
import { InfoTip } from '@/shared/ui/InfoTip'
import { Kpi } from '@/shared/ui/Kpi'
import { LeftoverBadge } from '@/screens/budget/ui/LeftoverBadge'
import { MerchantIcon } from '@/shared/ui/MerchantIcon'
import { PresetBar } from '@/shared/ui/PresetBar'
import { RETIRE_ROW_RE } from '@/screens/budget/constants/RETIRE_ROW_RE'
import { RoundedAmountInput } from '@/screens/budget/ui/RoundedAmountInput'
import { RowEditModal } from '@/screens/budget/ui/RowEditModal'
import { SortHead } from '@/shared/ui/SortHead'
import { TAKE_HOME_DEFAULTS } from '@/shared/constants/TAKE_HOME_DEFAULTS'
import { actualForBudgetRow } from '@/shared/utils/actualForBudgetRow'
import { budgetEffRows } from '@/shared/utils/budgetEffRows'
import { budgetIncomeFor } from '@/shared/utils/budgetIncomeFor'
import { deductionLabel } from '@/shared/utils/deductionLabel'
import { derivedMonthlyIncome } from '@/shared/utils/derivedMonthlyIncome'
import { ghostRowsForMonth } from '@/screens/budget/utils/ghostRowsForMonth'
import { incomeSourceOf } from '@/shared/utils/incomeSourceOf'
import { isDismissedSub } from '@/shared/utils/isDismissedSub'
import { leftoverAmount } from '@/shared/utils/leftoverAmount'
import { leftoverShare } from '@/shared/utils/leftoverShare'
import { nextSort } from '@/shared/utils/nextSort'
import { normalizeBudgetRow } from '@/shared/utils/normalizeBudgetRow'
import { normalizeLeftover } from '@/shared/utils/normalizeLeftover'
import { normalizeTakeHome } from '@/shared/utils/normalizeTakeHome'
import { totalSpendForMonth } from '@/screens/budget/utils/totalSpendForMonth'
import { useIncomeOverride } from '@/shared/hooks/useIncomeOverride'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { usePresets } from '@/shared/hooks/usePresets'
import { useToolState } from '@/shared/hooks/useToolState'

type BudgetViewProps = {
  goToTools: (anchor: string) => void
  goToLog: () => void
}

// table body entries are real rows, ghost rows, or the section markers
const isGhostRow = (r: BudgetTableItem): r is GhostRow => r !== null && typeof r === 'object' && '__ghost' in r

export function BudgetView({ goToTools, goToLog }: BudgetViewProps) {
  const [rows, setRows] = useState<BudgetRow[] | null>(null)
  const [saveState, setSaveState] = useState<BudgetSaveState>('saved') // saved | saving | error
  const [showAdd, setShowAdd] = useState(false)
  // open row editor: the row as it was when the modal opened (for Cancel)
  const [editSnap, setEditSnap] = useState<BudgetEditSnapshot | null>(null)
  // column sort for the expenses and subscription rows. key null = file order for
  // expenses and biggest first for subscriptions (how the page always worked).
  const [sort, setSort] = usePersistedState<BudgetSort>(
    'budgetSort',
    { key: null, dir: 'desc' },
    (v) => {
      const s = v as BudgetSort | null
      return !!s && [null, 'name', 'amount', 'actual', 'diff'].includes(s.key) && (s.dir === 'asc' || s.dir === 'desc')
    },
  )
  const [restMode, setRestMode] = usePersistedState('restMode', false, (v) => typeof v === 'boolean')
  const [optsOpen, setOptsOpen] = useState(false) // phone menu
  const [presetsOpen, setPresetsOpen] = useState(false)
  const [compareMode, setCompareMode] = usePersistedState('budgetCompareMode', false, (v) => typeof v === 'boolean')
  // defaults to the newest FULLY covered month — the newest month overall is
  // normally still mid-statement and would read artificially cheap
  // which "Not budgeted" groups are expanded to show their individual charges
  const [openGhosts, setOpenGhosts] = usePersistedState<string[]>(
    'budgetOpenGhosts', [], (v) => Array.isArray(v) && v.every((x) => typeof x === 'string'),
  )
  const toggleGhost = (id: string) =>
    setOpenGhosts(openGhosts.includes(id) ? openGhosts.filter((x) => x !== id) : [...openGhosts, id])
  const [compareMonth, setCompareMonth] = usePersistedState<string>(
    'budgetCompareMonth2', getLastCompleteMonth() ?? '', (v) => getMonths().includes(v as string),
  )
  // income source: statements, the Take-home tool, or a typed number (see
  // INCOME_SOURCES). The salary / 401k / medical inputs behind the tool figure are the
  // Tools tab's Take-home pay calc (`takeHome`), read directly, so there is one place to
  // tune the hypothetical and it accounts for the 401k deferral and pre-tax premiums.
  const [incomeOverride, setIncomeOverride] = useIncomeOverride()
  const incomeSource = incomeSourceOf(incomeOverride)
  const [takeHome] = useToolState('takeHome', TAKE_HOME_DEFAULTS)
  // what to do with what is left: [{ id, target: 'savings' | row id, pct }], saved in
  // budget.json as `leftover` (left out of the file while empty)
  const [leftoverAlloc, setLeftoverAlloc] = useState<LeftoverAllocation[]>([])
  const leftoverRef = useRef(leftoverAlloc)
  leftoverRef.current = leftoverAlloc
  const [taxState] = usePersistedState('taxState', DEFAULT_STATE, (v) => (v as string) in STATES)
  const {
    presets: expensePresets,
    save: saveExpensePreset,
    remove: removeExpensePreset,
  } = usePresets<BudgetRow[]>('expenses')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // subscription rows have three states:
  //  visible     — charging per statements, not hidden by Josh -> counted in totals
  //  soft-hidden — Josh hid it for planning ("just cancelled") -> not counted, revealable
  //  auto-hidden — statements show it stopped charging          -> not counted, revealable
  // A soft-hidden row whose subscription is STILL charging is the alarm case.
  const rowState = (r: BudgetRowLike) =>
    isBudgetRowHidden(r) ? 'auto' : r.hidden ? 'soft' : 'visible'

  // rest-of-month math: rows with a billing day count only if still upcoming;
  // prorate rows scale by days left; rows with neither count in full (unknown date).
  const now = new Date()
  const today = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysLeft = daysInMonth - today
  // a row that receives a share of the leftover has that much more to spend this month
  const remainingOf = (r: BudgetRow) => {
    const amt = (Number(r.amount) || 0) + extraOf(r)
    if (r.day != null) return r.day > today ? amt : 0
    if (r.prorate) return (amt * daysLeft) / daysInMonth
    return amt
  }

  const saveStateRef = useRef(saveState)
  saveStateRef.current = saveState

  // Subscriptions Josh removed from the budget: { name: that subscription's lastSeen
  // charge date at the moment he removed it }. A removal only lasts until the
  // statements show a NEWER charge — then the row comes back on its own, which is the
  // "oh, Canva is back, I must have resubscribed" signal. Stored in budget.json as
  // `dismissedSubs`; the file row also gets `hidden: true` so the Tools calculators
  // (which read budget.json directly) stop counting it too.
  const [dismissed, setDismissed] = useState<DismissedSubs>({})
  const dismissedRef = useRef(dismissed)
  dismissedRef.current = dismissed

  useEffect(() => {
    const load = () =>
      getBudget()
        .then((d) => {
          // an edit landed while this fetch was in flight (a click that also focused
          // the window fires both): the file is about to be rewritten, so what we
          // just read is stale and must not replace the edited state
          if (saveStateRef.current === 'saving') return
          // drop removals that a newer statement charge has overridden
          const dz = { ...(d.dismissedSubs || {}) }
          let rowsIn = d.rows.map(normalizeBudgetRow)
          let changed = false
          for (const [name, at] of Object.entries(dz)) {
            const sub = getSubscriptions().find((x) => x.name === name)
            if (sub && sub.lastSeen > at) {
              delete dz[name]
              rowsIn = rowsIn.map((r) => (r.name === name && r.source === 'subscription' ? { ...r, hidden: false } : r))
              changed = true
            }
          }
          setDismissed(dz)
          dismissedRef.current = dz
          const lo = normalizeLeftover(d.leftover)
          setLeftoverAlloc(lo)
          leftoverRef.current = lo
          if (changed) persist(rowsIn, dz)
          else setRows(rowsIn)
        })
        .catch(() => setSaveState('error'))
    load()
    // refetch when the window regains focus so external edits to budget.json
    // (e.g. an assistant's monthly refresh) aren't clobbered by a stale in-app save
    const onFocus = () => {
      if (saveStateRef.current !== 'saving') load()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const persist = (next: BudgetRow[], nextDismissed?: DismissedSubs, nextLeftover?: LeftoverAllocation[]) => {
    setRows(next)
    saveStateRef.current = 'saving' // synchronously, so an in-flight reload sees it
    if (nextDismissed) {
      setDismissed(nextDismissed)
      dismissedRef.current = nextDismissed
    }
    if (nextLeftover) {
      setLeftoverAlloc(nextLeftover)
      leftoverRef.current = nextLeftover
    }
    setSaveState('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveBudget({
        updated: new Date().toISOString().slice(0, 10),
        rows: next,
        dismissedSubs: dismissedRef.current,
        ...(leftoverRef.current.length ? { leftover: leftoverRef.current } : {}),
      })
        .then(() => setSaveState('saved'))
        .catch(() => setSaveState('error'))
    }, 500)
  }

  if (!rows) {
    return (
      <Card className="mt-6 p-8 text-center text-[var(--text-muted)]">
        {saveState === 'error' ? 'Could not load budget data.' : 'Loading budget…'}
      </Card>
    )
  }

  // Subscriptions are no longer hand-maintained. Their budgeted amount IS the real
  // latest observed charge from the statements (`SUBSCRIPTIONS`, refreshed by the
  // monthly import), annuals spread to their monthly equivalent — which is why
  // there's no "reset to actual" button and no hide/unhide toggle any more: a
  // subscription you cancelled ages out of the list on its own, and one you forgot
  // to add shows up the moment it bills.
  //
  // Deliberately the LATEST SINGLE CHARGE, not a month's sum: billing dates drift,
  // so a calendar month can catch two charges (one month can catch a subscription twice)
  // or none, and neither is what the subscription costs per month. The vs-Actual
  // column still shows the real month sum — that's the whole point of comparing.
  // The whole derivation lives in budgetEffRows so the Log and Retirement pages count
  // the same rows this page does.
  const isDismissed = (name: string) => isDismissedSub(dismissed, name)
  // ✕ on a subscription row. With a statement match: remember the charge date it was
  // removed at, so only a newer charge brings it back. Without one (billed somewhere
  // the statements can't see) there is nothing to bring it back, so the row just goes.
  const dismissSub = (r: BudgetRowLike) => {
    const sub = getSubscriptions().find((x) => x.name === r.name)
    if (!sub) return persist(rows.filter((x) => x.id !== r.id))
    persist(
      rows.map((x) => (x.name === r.name && x.source === 'subscription' ? { ...x, hidden: true } : x)),
      { ...dismissed, [r.name]: sub.lastSeen },
    )
  }
  const restoreSub = (name: string) => {
    const next = { ...dismissed }
    delete next[name]
    persist(
      rows.map((x) => (x.name === name && x.source === 'subscription' ? { ...x, hidden: false } : x)),
      next,
    )
  }
  const dismissedNames = Object.keys(dismissed).filter(isDismissed).sort()
  const effRows = budgetEffRows(rows, dismissed)

  const counted = effRows.filter((r) => rowState(r) === 'visible')
  const expenses = counted.reduce((s, r) => s + (Number(r.amount) || 0), 0)
  const actualIncome = derivedMonthlyIncome()
  const income = budgetIncomeFor(incomeOverride, takeHome, taxState)
  const monthly = income - expenses
  const setIncomeSource = (source: string) =>
    setIncomeOverride({
      active: source === 'manual' ? 'manual' : source === 'tool',
      amount: source === 'manual' && !(Number(incomeOverride.amount) > 0) ? Math.round(income) : Number(incomeOverride.amount) || 0,
    })
  // what is left and where it goes (see normalizeLeftover)
  const leftoverAmt = leftoverAmount(income, expenses)
  const extraOf = (r: BudgetRowLike & { id?: string }) => leftoverShare(leftoverAlloc, r.id ?? '', leftoverAmt)
  const allocPct = leftoverAlloc.reduce((s, a) => s + a.pct, 0)
  const allocTargets = [
    { value: 'savings', label: 'Savings' },
    ...rows.filter((r) => r.source !== 'subscription').map((r) => ({ value: r.id, label: r.name || 'Unnamed row' })),
  ]
  const setAlloc = (id: string, p: Partial<LeftoverAllocation>) =>
    persist(rows, undefined, leftoverAlloc.map((a) => {
      if (a.id !== id) return a
      const next = { ...a, ...p }
      // the shares can't add up past 100
      const others = leftoverAlloc.filter((x) => x.id !== id).reduce((s, x) => s + x.pct, 0)
      return { ...next, pct: Math.min(Math.max(0, Number(next.pct) || 0), Math.max(0, 100 - others)) }
    }))
  const addAlloc = () =>
    persist(rows, undefined, [
      ...leftoverAlloc,
      { id: `l${Date.now().toString(36)}`, target: leftoverAlloc.some((a) => a.target === 'savings') ? allocTargets[1]?.value ?? 'savings' : 'savings', pct: Math.max(0, 100 - allocPct) },
    ])
  const removeAlloc = (id: string) => persist(rows, undefined, leftoverAlloc.filter((a) => a.id !== id))
  // a 401k row here would count money that never reaches the bank (statements and the
  // Take-home figure both already have it taken out)
  const doubleCounted = incomeSource !== 'manual' && counted.some((r) => RETIRE_ROW_RE.test(r.name || ''))
  const visible = (r: BudgetRow) => {
    if (rowState(r) !== 'visible') return false
    return !restMode || remainingOf(r) > 0
  }
  const rowValue = (r: BudgetRow) => (restMode ? remainingOf(r) : Number(r.amount) || 0)
  // display-only sort (file order untouched). Rows with no actual go last either way.
  // a null key (file order) is "no column"; SortHead only compares it with column ids
  const sortState = sort as SortState
  const sortKey = !compareMode && (sort.key === 'actual' || sort.key === 'diff') ? null : sort.key
  const sortValue = (r: BudgetRow): string | number | null => {
    if (sortKey === 'name') return r.name.toLowerCase()
    if (sortKey === 'amount') return rowValue(r)
    const actual = actualForBudgetRow(r, compareMonth)
    if (actual === null) return null
    return sortKey === 'actual' ? actual : Math.round(r.amount) - Math.round(actual)
  }
  const sortRows = <R extends BudgetRow>(list: R[], fallback?: (a: R, b: R) => number): R[] => {
    if (!sortKey) return fallback ? [...list].sort(fallback) : list
    const dir = sort.dir === 'asc' ? 1 : -1
    return list
      .map((r): [R, string | number | null] => [r, sortValue(r)])
      .sort(([, a], [, b]) => {
        if (a === null || b === null) return a === b ? 0 : a === null ? 1 : -1
        return (a < b ? -1 : a > b ? 1 : 0) * dir
      })
      .map(([r]) => r)
  }
  const subRows = sortRows(
    effRows.filter((r) => r.source === 'subscription').filter(visible),
    (a, b) => rowValue(b) - rowValue(a),
  )
  const mainRows = sortRows(effRows.filter((r) => r.source !== 'subscription').filter(visible))
  // totals only ever count visible-state rows
  const subTotal = counted.filter((r) => r.source === 'subscription').reduce((s, r) => s + rowValue(r), 0)
  const visibleTotal = counted.reduce((s, r) => s + rowValue(r), 0)
  // vs-Actual: every dollar spent in the cycle is accounted for — matched rows
  // plus ghost rows for whatever no budget row claims — so the Actual column's
  // grand total is real total spend, not just the part we could line up.
  const ghostRows = compareMode ? ghostRowsForMonth(compareMonth, effRows) : []
  const ghostTotal = ghostRows.reduce((s, r) => s + r.amount, 0)
  const subActual = counted
    .filter((r) => r.source === 'subscription')
    .reduce((s, r) => s + (actualForBudgetRow(r, compareMonth) ?? 0), 0)
  const totalActual = totalSpendForMonth(compareMonth)
  // KPI "actual" half — the same five figures measured from the statements for the
  // month the vs-Actual selector is on (defaults to the last fully covered month, so
  // these are meaningful even with the comparison view switched off).
  // Income is deliberately held at the planned figure (avg full paycheck x 2, or the
  // override) rather than the month's real deposits. Real deposits swing wildly on
  // things that aren't earnings — July 2026 read $11,524 only because of $2,800 of
  // Venmo cashouts — which made "actual left over" look positive in a month that
  // overspent by thousands. Holding income fixed makes these lines answer the
  // question actually being asked: what did the SPENDING do to the plan.
  const actualLeftover = income - totalActual
  const actualMonthLabel = `Actual, ${monthCompareLabel(compareMonth)}`

  const update = (id: string, patch: Partial<BudgetRow>) =>
    persist(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const remove = (id: string) => persist(rows.filter((r) => r.id !== id))
  const addRow = ({ name, amount, source, type, items }: Omit<BudgetRow, 'id'>) => {
    const id = `m${Date.now().toString(36)}`
    if (type === 'breakdown') {
      persist([...rows, { id, name, amount, source, type, items: (items ?? []).filter((it) => it.name.trim() || Number(it.amount) > 0) }])
    } else {
      persist([...rows, { id, name, amount, source, type: 'simple' }])
    }
  }
  // the pencil: remember the row for Cancel. A subscription that only exists in the
  // statements has no budget row yet, so it gets one the first time it is edited.
  const openEdit = (r: EffectiveBudgetRow) => {
    const { __unsaved, ...saved } = r
    if (__unsaved) persist([...rows, saved])
    setEditSnap(saved)
  }

  return (
    <>
      {/* summary */}
      <div className="kpi-budget mt-7 flex flex-col gap-5">
        <div className="flex flex-wrap gap-5">
          <Card className="kpi-wide px-5 py-4 flex-1 min-w-[200px]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 text-[14px] text-[var(--text-secondary)]">
                <Icon name="arrowDown" size={18} style={{ color: 'var(--good)' }} />
                Monthly income
              </div>
              <Dropdown
                label="Income source"
                hideLabel
                value={incomeSource}
                onChange={setIncomeSource}
                options={INCOME_SOURCES.map((o) =>
                  o.value !== 'tool' ? o : {
                    ...o,
                    // jump to the tool without picking this option
                    trailing: () => (
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              goToTools('take-home-pay')
                            }}
                            // the menu item selects on pointer up, so stop that too
                            onPointerDown={(e) => e.stopPropagation()}
                            onPointerUp={(e) => e.stopPropagation()}
                            aria-label="Open the Take-home pay tool"
                            className="h-5 w-5 text-[var(--text-muted)] hover:bg-transparent hover:text-white"
                          >
                            <ExternalLink className="size-[13px]" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Open the Take-home pay tool</TooltipContent>
                      </UITooltip>
                    ),
                  },
                )}
                className="h-6 gap-1.5 px-2 text-[11px] text-[var(--text-muted)] hover:text-white [&>span]:font-normal"
              />
            </div>
            <div className="mt-2 text-[30px] font-bold leading-tight tracking-tight tnum" style={{ color: 'var(--good)' }}>
              {fmt0(income)}
            </div>
            {incomeSource === 'manual' ? (
              <div className="mt-2 text-[12px] leading-relaxed text-[var(--text-muted)]">
                A number you typed. Change it any time.
                <div className="mt-2 w-[170px] show-spinners">
                  <DraftNumberInput
                    boxed
                    value={Number(incomeOverride.amount) || 0}
                    step={100}
                    min={0}
                    suffix="$"
                    onChange={(v) => setIncomeOverride({ active: 'manual', amount: Math.max(0, v) })}
                    className="h-8 text-[13px] tnum"
                  />
                </div>
              </div>
            ) : incomeSource === 'tool' ? (
              <div className="mt-2 text-[12px] leading-relaxed text-[var(--text-muted)]">
                Estimated from the Take-home pay tool so the budget uses a realistic monthly income
                instead of whatever landed in your account this month.
                <ul className="mt-1.5 list-disc pl-4 text-[var(--text-secondary)]">
                  <li>Salary <span className="tnum">{fmt0(takeHome.salary)}</span> a year</li>
                  {normalizeTakeHome(takeHome).deductions.map((d) => (
                    <li key={d.id}>
                      {deductionLabel(d.kind)}{' '}
                      <span className="tnum">
                        {d.unit === 'pct' ? `${Number(d.amount) || 0}%` : `${fmt0(Number(d.amount) || 0)} a ${d.unit === 'mo' ? 'month' : 'year'}`}
                      </span>
                    </li>
                  ))}
                  <li>Taxed in {STATES[taxState]?.label}</li>
                </ul>
                <Button variant="link"
                  onClick={() => goToTools('take-home-pay')}
                  className="mt-1.5 h-auto p-0 text-[12px] font-normal text-[var(--text-secondary)] underline decoration-[var(--text-muted)] hover:text-white"
                >
                  Edit on the Tools tab
                </Button>
              </div>
            ) : (
              <div className="mt-2 text-[12px] leading-relaxed text-[var(--text-muted)]">
                Your average paycheck from your statements, times 2 a month. Payroll deductions like
                401k and insurance are already taken out.
              </div>
            )}
          </Card>
          <Kpi
            label="Budgeted expenses"
            icon="arrowUp"
            value={fmt0(expenses)}
            sub={`${rows.length} line items`}
            actual={{
              label: `Actual spending, ${monthCompareLabel(compareMonth)}`,
              value: fmt0(totalActual),
              diff: expenses - totalActual,
              negWord: 'over budget',
              posWord: 'under budget',
            }}
          />
        </div>
        <div className="flex flex-wrap gap-5">
          <Kpi
            label="Left over / month"
            icon="layers"
            iconColor="var(--text-secondary)"
            badge={<LeftoverBadge />}
            value={fmt0(monthly)}
            tone={monthly >= 0 ? 'var(--good)' : 'var(--bad)'}
            sub="income − expenses"
            actual={{
              label: actualMonthLabel,
              value: fmt0(actualLeftover),
              diff: actualLeftover - monthly,
            }}
          />
          <Kpi
            label="Left over / year"
            icon="calendar"
            iconColor="var(--text-secondary)"
            badge={<LeftoverBadge />}
            value={fmt0(monthly * 12)}
            tone={monthly >= 0 ? 'var(--good)' : 'var(--bad)'}
            sub="monthly × 12"
            actual={{
              label: `${actualMonthLabel} \u00d7 12`,
              value: fmt0(actualLeftover * 12),
              diff: (actualLeftover - monthly) * 12,
            }}
          />
        </div>
      </div>

      {/* editable expenses table */}
      <Card className="mt-6 p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-[15px] font-semibold">
            Expenses
            {restMode && (
              <span className="ml-2 text-[12px] font-normal text-[#e8c76a]">
                remaining this month · {daysLeft} days left
              </span>
            )}
          </h3>
          {/* phones: one menu button instead of a row of buttons */}
          <div className="relative flex items-center gap-2 sm:hidden">
            <DropdownMenu open={optsOpen} onOpenChange={setOptsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Expense options">
                  <Ellipsis className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[220px] rounded-xl">
                {!restMode && (
                  <DropdownMenuItem onSelect={() => setTimeout(() => setPresetsOpen(true), 50)} className="justify-between pl-8 text-[13px]">
                    Presets
                    <ChevronRight className="size-3.5 text-[var(--text-muted)]" />
                  </DropdownMenuItem>
                )}
                <DropdownMenuCheckboxItem
                  checked={!!restMode}
                  onCheckedChange={(v) => { setRestMode(v); if (v) setCompareMode(false) }}
                  className="text-[13px]"
                >
                  Remaining this month
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={!!compareMode}
                  onCheckedChange={(v) => { setCompareMode(v); if (v) setRestMode(false) }}
                  className="text-[13px]"
                >
                  Compare to actual
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {!restMode && (
              <PresetBar
                hideTrigger
                open={presetsOpen}
                onOpenChange={setPresetsOpen}
                presets={expensePresets.map((p) => ({ ...p, data: p.data.map(normalizeBudgetRow) }))}
                currentData={rows}
                onApply={(data) => persist(data.map(normalizeBudgetRow))}
                onSave={(name) => saveExpensePreset(name, rows)}
                scope="expenses"
                onDelete={removeExpensePreset}
              />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 max-sm:hidden">
            {saveState === 'error' && (
              <div className="text-[12px] text-[var(--bad)]">save failed. Is the dev server running?</div>
            )}
            {!restMode && (
              <PresetBar
                presets={expensePresets.map((p) => ({ ...p, data: p.data.map(normalizeBudgetRow) }))}
                currentData={rows}
                onApply={(data) => persist(data.map(normalizeBudgetRow))}
                onSave={(name) => saveExpensePreset(name, rows)}
                scope="expenses"
                onDelete={removeExpensePreset}
              />
            )}
            <UITooltip>
              <TooltipTrigger asChild>
                <Toggle variant="outline" size="sm" pressed={!!restMode}
                  onClick={() => {
                    setRestMode(!restMode)
                    if (!restMode) setCompareMode(false)
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 2v4M16 2v4" />
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M3 10h18" />
                    <path d="m14 15-3 3 3 3" transform="translate(1,-1.5) scale(0.9)" />
                  </svg>
                  Remaining this month
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Only shows what is still to come this month. A bill that already came out, like rent on the 1st, is hidden once its day has passed. Things you pay for all month, like groceries, stay on the list with what is left after what you have logged in the{' '}
                <Button variant="link"
                  onClick={goToLog}
                  className="h-auto p-0 text-[length:inherit] font-normal underline"
                >
                  Log tab
                </Button>.
              </TooltipContent>
            </UITooltip>
            <UITooltip>
              <TooltipTrigger asChild>
                <Toggle variant="outline" size="sm" pressed={!!compareMode}
                  onClick={() => {
                    setCompareMode(!compareMode)
                    if (!compareMode) setRestMode(false)
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" />
                    <path d="M7 14l4-4 3 3 5-6" />
                  </svg>
                  Compare to actual
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Adds a column with what you really spent on each row, from your statements. Then pick which month to compare against.
              </TooltipContent>
            </UITooltip>
            {compareMode && (
              <Dropdown
                label="Month"
                value={compareMonth}
                onChange={setCompareMonth}
                className="h-8 rounded-lg px-3 text-[13px]"
                options={[...getMonths()].reverse().map((m) => ({
                  value: m,
                  label: monthCompareLabel(m),
                  badge: <CoverageDot month={m} />,
                }))}
              />
            )}
          </div>
        </div>
        {compareMode && (
          <div className="mb-3 sm:hidden">
            <Dropdown
              label="Month"
              value={compareMonth}
              onChange={setCompareMonth}
              className="h-8 rounded-lg px-3 text-[13px]"
              options={[...getMonths()].reverse().map((m) => ({
                value: m,
                label: monthCompareLabel(m),
                badge: <CoverageDot month={m} />,
              }))}
            />
          </div>
        )}
        {doubleCounted && (
          <p className="mb-3 text-[12px] leading-relaxed text-[var(--text-muted)]">
            Heads up: 401k money comes out of your paycheck before it reaches your bank, so a 401k
            row here counts it twice. Set it up on the{' '}
            <Button variant="link"
              onClick={() => goToTools('take-home-pay')}
              className="h-auto p-0 text-[12px] font-normal text-[var(--text-secondary)] underline decoration-[var(--text-muted)] hover:text-white"
            >
              Take-home tool
            </Button>{' '}
            instead.
          </p>
        )}
        <Table className="w-full text-[13px]">
          <TableHeader>
            <TableRow className="text-left text-[12px] text-[var(--text-muted)]">
              <SortHead id="name" label="Name" sort={sortState} onSort={(k) => setSort(nextSort(sortState, k))} className="pb-2 font-medium" />
              <SortHead id="amount" label={compareMode ? 'Budget' : 'Amount / month'} sort={sortState} onSort={(k) => setSort(nextSort(sortState, k))} right className="pb-2 pr-2 font-medium" />
              {compareMode && (
                <>
                  <SortHead id="actual" label={<>Actual<span className="max-sm:hidden"> ({monthCompareLabel(compareMonth)})</span></>} sort={sortState} onSort={(k) => setSort(nextSort(sortState, k))} right className="pb-2 pr-2 font-medium" />
                  <SortHead id="diff" label="Diff" sort={sortState} onSort={(k) => setSort(nextSort(sortState, k))} right className="pb-2 pr-2 font-medium" />
                </>
              )}
              <TableHead className="pb-2 w-8 max-sm:w-5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {([
              ...mainRows,
              ...(ghostRows.length ? ['ghost-header', ...ghostRows, 'ghost-total'] : []),
              null,
              ...subRows,
            ] as BudgetTableItem[]).map((r) =>
              isGhostRow(r) ? (
                <Fragment key={r.id}>
                  <TableRow
                    onClick={() => toggleGhost(r.id)}
                    title={`Show the ${r.txns.length} charge${r.txns.length === 1 ? '' : 's'} behind this`}
                    className="cursor-pointer border-t border-[var(--grid)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
                  >
                    <TableCell className="py-1 pr-3 pl-2">
                      <span className="flex items-center gap-1.5">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          className={`shrink-0 text-[var(--text-muted)] transition-transform ${openGhosts.includes(r.id) ? 'rotate-180' : ''}`}
                        >
                          <path d="M1 3.5 L5 7.5 L9 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="italic">{r.name}</span>
                        <span className="text-[11px] not-italic text-[var(--text-muted)]">
                          {r.txns.length}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="py-1 pr-2 text-right tnum text-[var(--text-muted)]">—</TableCell>
                    <TableCell className="py-1 text-right tnum">{fmt0(r.amount)}</TableCell>
                    <TableCell className="py-1 text-right tnum" style={{ color: 'var(--bad)' }}>
                      −{fmt0(r.amount)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  {openGhosts.includes(r.id) &&
                    r.txns.map((t) => (
                      <TableRow key={t.id} className="border-t border-[var(--grid)]">
                        <TableCell className="py-1 pl-8 pr-3">
                          <span className="flex items-center gap-2">
                            <MerchantIcon name={t.merchant ?? ''} />
                            <span className="text-[12px] text-[var(--text-secondary)]">{t.merchant}</span>
                            <span className="text-[11px] text-[var(--text-muted)]">
                              {t.date.slice(5).replace('-', '/')}
                              {t.kind === 'refund' && ' · refund'}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="py-1 text-right text-[12px] tnum text-[var(--text-muted)]">
                          {fmt(spendAmount(t))}
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    ))}
                </Fragment>
              ) : r === 'ghost-header' ? (
                <TableRow key="ghost-header">
                  <TableCell colSpan={5} className="pb-1 pt-5">
                    <span className="text-[12px] font-medium text-[var(--text-muted)]">
                      Not budgeted
                      <span className="ml-2 font-normal normal-case">
                        spending this month that no row above covers
                      </span>
                    </span>
                  </TableCell>
                </TableRow>
              ) : r === 'ghost-total' ? (
                <TableRow key="ghost-total" className="border-t border-[var(--grid)] font-medium text-[var(--text-secondary)]">
                  <TableCell className="py-1">Not budgeted total</TableCell>
                  <TableCell className="py-1 pr-2 text-right tnum text-[var(--text-muted)]">—</TableCell>
                  <TableCell className="py-1 text-right tnum">{fmt0(ghostTotal)}</TableCell>
                  <TableCell className="py-1 text-right tnum" style={{ color: 'var(--bad)' }}>
                    −{fmt0(ghostTotal)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ) : r === null ? (
                <TableRow key="subs-header">
                  <TableCell colSpan={compareMode ? 5 : 3} className="pb-1 pt-5">
                    <span className="flex items-center justify-between gap-2.5">
                      <span className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-muted)]">
                        Subscriptions
                        <InfoTip tip="Subscriptions are added here automatically when they show up on a statement. You can remove one you have cancelled, but if it charges again it comes back, so you always know what is still billing you." />
                      </span>
                      <span className="text-[11px] font-normal normal-case text-[var(--text-muted)]">
                        live · latest charge
                      </span>
                    </span>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow
                  key={r.id}
                  className={
                    'border-t border-[var(--grid)] group hover:bg-[var(--surface-2)] transition-colors' +
                    (rowState(r) !== 'visible' ? ' opacity-55' : '')
                  }
                >
                  <TableCell className="py-1 pr-3">
                    <span className="flex items-center gap-2">
                      <MerchantIcon name={r.name} />
                      {r.source === 'subscription' ? (
                        <span className="py-1">{r.name}</span>
                      ) : (
                        <Input variant="inline"
                          value={r.name}
                          placeholder="name"
                          onChange={(e) => update(r.id, { name: e.target.value })}
                          // sized to the name so the pencil sits right after the text
                          style={{ fieldSizing: 'content' }}
                          className="-ml-1.5 w-auto min-w-[4ch]"
                        />
                      )}
                      {!restMode && r.source !== 'subscription' && (
                        <Button variant="ghost" size="icon-xs"
                          onClick={() => openEdit(r)}
                          aria-label={r.type === 'breakdown' ? 'Edit sub items' : 'Edit row'}
                          className={cn(
                            'text-[var(--text-secondary)] hover:text-white',
                            r.type !== 'breakdown' && 'opacity-0 focus-visible:opacity-100 group-hover:opacity-100',
                          )}
                        >
                          <Icon name="pencil" size={14} />
                        </Button>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="py-1 text-right">
                    {!restMode && extraOf(r) > 0 && (
                      <span className="mr-2 text-[11px] text-[var(--text-muted)]">
                        +{fmt0(extraOf(r))} from leftover
                      </span>
                    )}
                    {restMode ? (
                      <span className="py-1 tnum">
                        {extraOf(r) > 0 && (
                          <span className="mr-2 text-[11px] text-[var(--text-muted)]">
                            +{fmt0(extraOf(r))} from leftover
                          </span>
                        )}
                        {r.prorate && (
                          <span className="mr-2 text-[11px] text-[var(--text-muted)]">
                            {fmt0(r.amount)} × {daysLeft}/{daysInMonth}
                          </span>
                        )}
                        {r.day != null && (
                          <span className="mr-2 text-[11px] text-[var(--text-muted)]">
                            on the {r.day}
                            {['th', 'st', 'nd', 'rd'][r.day % 10 > 3 || (r.day % 100) - (r.day % 10) === 10 ? 0 : r.day % 10]}
                          </span>
                        )}
                        {fmt0(rowValue(r))}
                      </span>
                    ) : r.source === 'subscription' ? (
                      <span
                        className="inline-block w-28 py-1 pr-2 text-right tnum max-sm:w-[72px]"
                        title="The latest charge observed on a statement (annual plans shown per month)"
                      >
                        {fmt0(r.amount)}
                      </span>
                    ) : r.type === 'breakdown' ? (
                      <Button variant="ghost"
                        onClick={() => openEdit(r)}
                        className="-mr-1.5 h-7 w-28 justify-end px-1.5 font-normal tnum max-sm:w-[72px]"
                        title="Built from its sub items. Click to edit."
                      >
                        {Math.round(r.amount)}
                      </Button>
                    ) : (
                      <RoundedAmountInput value={r.amount} onCommit={(v) => update(r.id, { amount: v })} />
                    )}
                  </TableCell>
                  {compareMode && (() => {
                    const actual = actualForBudgetRow(r, compareMonth)
                    // both sides rounded before subtracting — every amount on this
                    // page is whole dollars, so an unrounded diff renders "−$0"
                    const diff = actual === null ? null : Math.round(r.amount) - Math.round(actual) // positive = under budget
                    return (
                      <>
                        <TableCell className="py-1 text-right tnum text-[var(--text-secondary)]">
                          {actual === null ? '—' : fmt0(actual)}
                        </TableCell>
                        <TableCell
                          className="py-1 text-right tnum"
                          style={diff === null ? undefined : { color: diff < 0 ? 'var(--bad)' : 'var(--good)' }}
                        >
                          {diff === null ? '—' : (diff < 0 ? '−' : '+') + fmt0(Math.abs(diff))}
                        </TableCell>
                      </>
                    )
                  })()}
                  <TableCell className="py-1 text-right">
                    {!restMode && (
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon-xs"
                            onClick={() => (r.source === 'subscription' ? dismissSub(r) : remove(r.id))}
                            aria-label={r.source === 'subscription' ? 'Remove until it charges again' : 'Remove row'}
                            className="text-[var(--text-muted)] opacity-0 hover:text-[var(--bad)] focus-visible:opacity-100 group-hover:opacity-100"
                          >
                            <X className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          {r.source === 'subscription' ? 'Remove until it charges again' : 'Remove row'}
                        </TooltipContent>
                      </UITooltip>
                    )}
                  </TableCell>
                </TableRow>
              ),
            )}
            {dismissedNames.length > 0 && !restMode && (
              <TableRow>
                <TableCell colSpan={compareMode ? 5 : 3} className="pb-2 pt-1.5">
                  <span className="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                    Removed until they charge again:
                    {dismissedNames.map((name) => (
                      <Button
                        key={name}
                        variant="outline"
                        size="xs"
                        onClick={() => restoreSub(name)}
                        title={`Put ${name} back`}
                        className="h-5 gap-1 px-1.5 text-[11px] font-normal text-[var(--text-secondary)] hover:text-white"
                      >
                        {name}
                        <Icon name="plus" size={10} />
                      </Button>
                    ))}
                  </span>
                </TableCell>
              </TableRow>
            )}
            <TableRow className="border-t border-[var(--baseline)] font-medium">
              <TableCell className="py-2 text-[var(--text-secondary)]">Subscriptions total</TableCell>
              <TableCell className="py-2 text-right tnum text-[var(--text-secondary)]">{fmt0(subTotal)}</TableCell>
              {compareMode && (
                <>
                  <TableCell className="py-2 text-right tnum text-[var(--text-secondary)]">{fmt0(subActual)}</TableCell>
                  <TableCell
                    className="py-2 text-right tnum"
                    style={{ color: subTotal - subActual < 0 ? 'var(--bad)' : 'var(--good)' }}
                  >
                    {(subTotal - subActual < 0 ? '−' : '+') + fmt0(Math.abs(subTotal - subActual))}
                  </TableCell>
                </>
              )}
              <TableCell></TableCell>
            </TableRow>
            <TableRow className="border-t border-[var(--baseline)] font-semibold">
              <TableCell className="py-2">{restMode ? 'Remaining until end of month' : 'Total'}</TableCell>
              <TableCell className="py-2 text-right tnum">{fmt0(restMode ? visibleTotal : expenses)}</TableCell>
              {compareMode && (
                <>
                  <TableCell className="py-2 text-right tnum">{fmt0(totalActual)}</TableCell>
                  <TableCell
                    className="py-2 text-right tnum"
                    style={{ color: expenses - totalActual < 0 ? 'var(--bad)' : 'var(--good)' }}
                    title="Every dollar spent this month, including the not-budgeted rows above"
                  >
                    {(expenses - totalActual < 0 ? '−' : '+') + fmt0(Math.abs(expenses - totalActual))}
                  </TableCell>
                </>
              )}
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Button variant="outline" size="sm"
          onClick={() => setShowAdd(true)}
          className="mt-3"
        >
          + Add row
        </Button>
        {!restMode && (
          <div id="leftover-plan" className="mt-6 border-t border-[var(--grid)] pt-4">
            <div className="flex items-center gap-1.5 text-[13px] font-semibold">
              What to do with what is left
              <InfoTip tip="Only applies when there is money left over. If you overspend, nothing is taken from anything." />
              <span className="ml-auto text-[12px] font-normal tnum text-[var(--text-muted)]">{fmt0(leftoverAmt)} left this month</span>
            </div>
            {leftoverAlloc.length > 0 && (
              <div className="mt-3 flex flex-col gap-2 show-spinners">
                {leftoverAlloc.map((a) => (
                  <div key={a.id} className="group flex flex-wrap items-center gap-2">
                    <div className="min-w-[180px]">
                      <Dropdown
                        label="Goes to"
                        hideLabel
                        value={allocTargets.some((t) => t.value === a.target) ? a.target : 'savings'}
                        onChange={(target) => setAlloc(a.id, { target })}
                        className="h-8 w-full justify-between rounded-lg bg-[var(--surface-1)] px-3 text-[13px] shadow-xs"
                        options={allocTargets}
                      />
                    </div>
                    <div className="w-[96px]">
                      <DraftNumberInput
                        boxed
                        value={a.pct}
                        step={5}
                        min={0}
                        max={100}
                        suffix="%"
                        onChange={(v) => setAlloc(a.id, { pct: v })}
                        className="h-8 text-[13px] tnum"
                      />
                    </div>
                    <span className="w-20 text-right text-[13px] tnum text-[var(--text-secondary)]">
                      {fmt0((leftoverAmt * a.pct) / 100)}
                    </span>
                    <Button variant="ghost" size="icon-xs"
                      onClick={() => removeAlloc(a.id)}
                      aria-label="Remove"
                      className="text-[var(--text-muted)] opacity-0 hover:bg-transparent hover:text-[var(--bad)] focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" onClick={addAlloc} disabled={allocPct >= 100}>
                <Icon name="plus" size={13} />
                Add
              </Button>
              {allocPct > 100 ? (
                <span className="text-[12px]" style={{ color: 'var(--bad)' }}>Over 100%</span>
              ) : allocPct < 100 ? (
                <span className="text-[12px] tnum text-[var(--text-muted)]">
                  {100 - allocPct}% unassigned ({fmt0((leftoverAmt * (100 - allocPct)) / 100)})
                </span>
              ) : null}
            </div>
          </div>
        )}
        {showAdd && <AddRowModal onAdd={addRow} onClose={() => setShowAdd(false)} />}
        {editSnap && rows.find((r) => r.id === editSnap.id) && (
          <RowEditModal
            row={rows.find((r) => r.id === editSnap.id) as BudgetRow}
            onChange={(patch) => update(editSnap.id, patch)}
            onCancel={() => {
              const { __new, ...snap } = editSnap
              persist(__new ? rows.filter((r) => r.id !== snap.id) : rows.map((r) => (r.id === snap.id ? snap : r)))
              setEditSnap(null)
            }}
            onClose={() => setEditSnap(null)}
          />
        )}
        <p className="mt-4 text-[12px] leading-relaxed text-[var(--text-muted)]">
          {isLocal() ? (
            <>Edits save to <span className="tnum">data/budget.json</span>.</>
          ) : (
            'Edits save in this browser. Export your settings to keep a copy.'
          )}
        </p>
      </Card>
    </>
  )
}
