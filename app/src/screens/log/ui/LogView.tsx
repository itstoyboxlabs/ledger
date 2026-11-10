import { track } from '@/shared/utils/track'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { BudgetFile } from '@/shared/types/BudgetFile'
import type { BudgetRow } from '@/shared/types/BudgetRow'
import type { LogEntry } from '@/shared/types/LogEntry'
import type { LogSort } from '@/screens/log/types/LogSort'
import { getBudget } from '@/shared/utils/getBudget'
import { saveBudget } from '@/shared/utils/saveBudget'
import { getLog } from '@/shared/utils/getLog'
import { saveLog } from '@/shared/utils/saveLog'
import { monthLabel } from '@/shared/utils/monthLabel'
import { fmt } from '@/shared/utils/fmt'
import { isBudgetRowHidden } from '@/shared/utils/isBudgetRowHidden'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/primitives/table'
import { SortHead } from '@/shared/ui/SortHead'

import { Label } from '@/shared/ui/primitives/label'
import { Input } from '@/shared/ui/primitives/input'
import { Button } from '@/shared/ui/primitives/button'
import { X } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Dropdown } from '@/shared/ui/Dropdown'
import { Icon } from '@/shared/ui/Icon'
import { LogMeter } from '@/screens/log/ui/LogMeter'
import { MerchantIcon } from '@/shared/ui/MerchantIcon'
import { Stepper } from '@/shared/ui/Stepper'
import { budgetExpensesOf } from '@/shared/utils/budgetExpensesOf'
import { leftoverAmount } from '@/shared/utils/leftoverAmount'
import { leftoverShare } from '@/shared/utils/leftoverShare'
import { logDayLabel } from '@/shared/utils/logDayLabel'
import { logTotalsByRow } from '@/screens/log/utils/logTotalsByRow'
import { logTracked } from '@/screens/log/utils/logTracked'
import { nextLogSort } from '@/screens/log/utils/nextLogSort'
import { sortLogEntries } from '@/screens/log/utils/sortLogEntries'
import { normalizeBudgetRow } from '@/shared/utils/normalizeBudgetRow'
import { normalizeLeftover } from '@/shared/utils/normalizeLeftover'
import { parseSumExpr } from '@/shared/utils/parseSumExpr'
import { shiftMonth } from '@/screens/log/utils/shiftMonth'
import { todayYmd } from '@/screens/log/utils/todayYmd'
import { useBudgetIncome } from '@/shared/hooks/useBudgetIncome'
import { usePersistedState } from '@/shared/hooks/usePersistedState'

// Hand-entered purchases between statements. Budget stays a static plan; this is
// where "I bought a burrito yesterday" goes so the soft rows (Unexpected,
// Restaurants/Uber, Groceries, …) can be watched in real time. Once the month's
// statements are imported the Budget tab's actuals take over and this log is
// just history.
export function LogView() {
  const [entries, setEntries] = useState<LogEntry[] | null>(null)
  const [budgetFile, setBudgetFile] = useState<BudgetFile | null>(null) // the whole budget file, saved back when a meter is hidden
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved')
  const [loadError, setLoadError] = useState(false)
  const [ym, setYm] = useState(todayYmd().slice(0, 7))
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayYmd())
  const [rowId, setRowId] = usePersistedState('logRow', '', (v) => typeof v === 'string')
  const [sort, setSort] = useState<LogSort>({ key: 'date', dir: -1 })
  const amountRef = useRef<HTMLInputElement>(null)
  // log and budget writes run one at a time, each on a fresh read, so quick clicks
  // here and edits in another tab do not overwrite each other
  const writeQueue = useRef<Promise<unknown>>(Promise.resolve())
  const pendingLogWrites = useRef(0)
  const queueWrite = (job: () => Promise<unknown>) => {
    writeQueue.current = writeQueue.current.then(job, job)
    return writeQueue.current
  }
  // for the Budget page's leftover shares: a row that receives one has a bigger meter
  const income = useBudgetIncome()

  const load = () => {
    setLoadError(false)
    Promise.all([getLog(), getBudget()])
      .then(([log, budget]) => {
        setEntries(log.entries || [])
        setBudgetFile({ ...budget, rows: budget.rows.map(normalizeBudgetRow) })
      })
      .catch(() => setLoadError(true))
  }
  useEffect(load, [])
  const budgetRows = budgetFile && budgetFile.rows.filter((r) => !r.hidden && !isBudgetRowHidden(r))

  // Applies one change (add or delete) on screen right away, then to a fresh read of
  // the saved log, so entries added in another tab are kept. Saved right away: adding
  // or deleting is one action, and a delay could lose it if the page closes.
  const persist = (change: (list: LogEntry[]) => LogEntry[]) => {
    setEntries((prev) => change(prev ?? []))
    track('log_changed')
    setSaveState('saving')
    pendingLogWrites.current++
    queueWrite(async () => {
      try {
        const next = change((await getLog()).entries || [])
        await saveLog(next)
        // show the merged list once nothing newer is still waiting, so a queued add does not blink out
        if (pendingLogWrites.current === 1) setEntries(next)
      } finally {
        pendingLogWrites.current--
      }
    })
      .then(() => setSaveState('saved'))
      .catch(() => setSaveState('error'))
  }

  if (loadError) {
    return (
      <Card className="mt-6 flex items-center justify-between gap-3 p-5 text-[13px]">
        <span className="text-[var(--bad)]">Could not load the log.</span>
        <Button variant="outline" size="sm" onClick={load}>Retry</Button>
      </Card>
    )
  }
  if (!entries || !budgetRows) {
    return <Card className="mt-6 p-5 text-[13px] text-[var(--text-muted)]">Loading…</Card>
  }

  // every saved row, hidden ones too, so an entry on a hidden row or a stopped
  // subscription still shows its row's name. Only a deleted row reads "Removed row".
  const rowById = Object.fromEntries(budgetFile.rows.map((r) => [r.id, r]))
  // anything in the Budget expenses table can be logged against (we don't know what the
  // user pays by hand). Subscriptions autopay on their own, so they're left out.
  const logRows = budgetRows
    .filter((r) => r.source !== 'subscription')
    .sort((a, b) => a.name.localeCompare(b.name))
  // until a row is picked, default to the one you logged against most recently
  const lastLogged = [...entries].sort((a, b) => b.createdAt - a.createdAt).find((e) => logRows.some((r) => r.id === e.rowId))
  const defaultRow = logRows.find((r) => r.id === lastLogged?.rowId) ?? logRows[0]
  const activeRowId = logRows.some((r) => r.id === rowId) ? rowId : defaultRow?.id ?? ''

  const monthEntries = entries
    .filter((e) => e.date.startsWith(ym))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
  const { spent: spentByRow, count: countByRow } = logTotalsByRow(monthEntries)
  // meters: see logTracked. Subscriptions autopay, so they never get one. A row with a
  // share of the Budget leftover ("What to do with what is left") has that much more.
  const leftoverAlloc = normalizeLeftover(budgetFile.leftover)
  const leftoverAmt = leftoverAmount(income, budgetExpensesOf(budgetFile))
  const meterRow = (r: BudgetRow): BudgetRow => {
    const extra = leftoverShare(leftoverAlloc, r.id, leftoverAmt)
    return extra > 0 ? { ...r, amount: (Number(r.amount) || 0) + extra } : r
  }
  const shownMeters = budgetRows.filter((r) => r.source !== 'subscription' && logTracked(r, (countByRow[r.id] ?? 0) > 0))
  const hiddenMeters = logRows.filter((r) => r.trackInLog === false)
  const total = monthEntries.reduce((s, e) => s + e.amount, 0)
  const isThisMonth = ym === todayYmd().slice(0, 7)

  // the entries table sorts by a clicked header; ties fall back to newest first
  const sortedEntries = sortLogEntries(monthEntries, sort, (id) => rowById[id]?.name ?? '')
  const headSort = { key: sort.key, dir: sort.dir === 1 ? 'asc' : 'desc' } as const
  const th = (key: LogSort['key'], label: string, right?: boolean) => (
    <SortHead id={key} label={label} sort={headSort} onSort={() => setSort(nextLogSort(sort, key))} right={right} className="pb-2 font-medium" />
  )

  const addEntry = () => {
    // a negative amount is a credit (a refund, something sold) that offsets the row
    const n = parseSumExpr(amount).total
    if (!(Math.abs(n) >= 0.005) || !activeRowId) return
    // a typed date past today would sit in a month the arrows never reach, so it becomes today
    const today = todayYmd()
    const entry: LogEntry = {
      id: `log${Date.now().toString(36)}`,
      date: date > today ? today : date,
      amount: Math.round(n * 100) / 100,
      note: note.trim(),
      rowId: activeRowId,
      createdAt: Date.now(),
    }
    persist((list) => [...list, entry])
    setAmount('')
    setNote('')
    setDate(todayYmd())
    amountRef.current?.focus()
  }
  const deleteEntry = (id: string) => persist((list) => list.filter((e) => e.id !== id))
  // hide or restore a meter: `trackInLog` is saved on the budget row itself. The budget is
  // read again first and only that field changes, so newer edits from Budget are kept.
  const setTracked = (id: string, trackInLog: boolean) => {
    const patch = (rows: BudgetRow[]) => rows.map((r) => (r.id === id ? { ...r, trackInLog } : r))
    setBudgetFile((prev) => prev && { ...prev, rows: patch(prev.rows) })
    track('budget_changed')
    queueWrite(async () => {
      const fresh = await getBudget()
      const next: BudgetFile = { ...fresh, updated: todayYmd(), rows: patch(fresh.rows) }
      await saveBudget(next)
      setBudgetFile({ ...next, rows: next.rows.map(normalizeBudgetRow) })
    }).catch(() => setSaveState('error'))
  }

  const onEnter = (e: KeyboardEvent) => e.key === 'Enter' && addEntry()

  return (
    <>
      <Card className="mt-6 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold">Log a purchase</h2>
            <p className="mt-1 text-[12px] text-[var(--text-muted)]">
              Statements lag by weeks, so log what you spend on the rows you pay toward during the
              month, like groceries, restaurants or transit, to see if you're on track. Enter them by
              hand, or paste recent transactions from your bank into an AI assistant and have it do it. A
              negative amount, like a refund or something you sold, takes money back off a row.
            </p>
          </div>
          {saveState === 'error' && <div className="text-[12px] text-[var(--bad)]">save failed</div>}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-[120px_1fr_auto_150px_auto]">
          <Label className="block">
            <span className="text-[12px] text-[var(--text-muted)]">Amount</span>
            <span className="group/num relative mt-1 block w-full">
              <Input
                ref={amountRef}
                type="text"
                value={amount}
                placeholder="14.50"
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={onEnter}
                className="no-native-spin pr-8"
              />
              <Stepper
                value={parseFloat(amount) || 0}
                step={1}
                onChange={(v) => setAmount(String(v))}
              />
            </span>
          </Label>
          <Label className="block">
            <span className="text-[12px] text-[var(--text-muted)]">Note</span>
            <Input
              type="text"
              value={note}
              placeholder="burrito"
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={onEnter}
              spellCheck={false}
              className="mt-1"
            />
          </Label>
          <Label className="block">
            <span className="text-[12px] text-[var(--text-muted)]">Counts against</span>
            <div className="mt-1">
              <Dropdown
                label="Row"
                value={activeRowId}
                onChange={setRowId}
                className="w-full justify-between rounded-lg bg-[var(--surface-1)] shadow-xs"
                options={logRows.map((r) => ({
                  value: r.id,
                  label: r.name,
                  badge: <MerchantIcon name={r.name} size={14} />,
                }))}
              />
            </div>
          </Label>
          <Label className="block">
            <span className="text-[12px] text-[var(--text-muted)]">Date</span>
            <Input
              type="date"
              value={date}
              max={todayYmd()}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              onKeyDown={onEnter}
              className="mt-1 [color-scheme:dark]"
            />
          </Label>
          <div className="flex items-end">
            <Button
              onClick={addEntry}
              disabled={!(Math.abs(parseSumExpr(amount).total) >= 0.005)}
              className="w-full sm:w-auto"
            >
              Add
            </Button>
          </div>
        </div>
      </Card>

      <Card className="mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"
              onClick={() => setYm(shiftMonth(ym, -1))}
              title="Previous month"
              aria-label="Previous month"
              className="px-2.5"
            >
              ‹
            </Button>
            <h2 className="text-[15px] font-semibold">
              {monthLabel(ym)}
              {isThisMonth && <span className="ml-2 text-[12px] font-normal text-[var(--text-muted)]">so far</span>}
            </h2>
            <Button variant="outline" size="sm"
              onClick={() => setYm(shiftMonth(ym, 1))}
              disabled={isThisMonth}
              title="Next month"
              aria-label="Next month"
              className="px-2.5"
            >
              ›
            </Button>
          </div>
          <div className="text-[12px] text-[var(--text-muted)]">
            Logged <span className="tnum font-medium text-[var(--text-primary)]">{fmt(total)}</span> across{' '}
            {monthEntries.length} {monthEntries.length === 1 ? 'entry' : 'entries'}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shownMeters.map((r) => (
            <LogMeter key={r.id} row={meterRow(r)} spent={spentByRow[r.id] ?? 0} onHide={() => setTracked(r.id, false)} />
          ))}
        </div>
        {hiddenMeters.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            Hidden meters:
            {hiddenMeters.map((r) => (
              <Button
                key={r.id}
                variant="outline"
                size="xs"
                onClick={() => setTracked(r.id, true)}
                title={`Show the ${r.name} meter again`}
                className="h-5 gap-1 px-1.5 text-[11px] font-normal text-[var(--text-secondary)] hover:text-white"
              >
                {r.name}
                <Icon name="plus" size={10} />
              </Button>
            ))}
          </div>
        )}

        {monthEntries.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-[var(--text-muted)]">Nothing logged this month.</div>
        ) : (
          <Table className="mt-5 w-full select-none text-[13px]">
            <TableHeader>
              <TableRow className="text-left text-[12px] text-[var(--text-muted)]">
                {th('date', 'Date')}
                {th('note', 'Note')}
                {th('row', 'Counts against')}
                {th('amount', 'Amount', true)}
                <TableHead className="pb-2"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEntries.map((e) => (
                <TableRow key={e.id} className="group border-t border-[var(--grid)] hover:bg-[var(--surface-2)] transition-colors">
                  <TableCell className="py-1.5 pr-3 tnum text-[var(--text-muted)]">{logDayLabel(e.date)}</TableCell>
                  <TableCell className="py-1.5 pr-3">{e.note || <span className="text-[var(--text-muted)]">—</span>}</TableCell>
                  <TableCell className="py-1.5 pr-3">
                    <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <MerchantIcon name={rowById[e.rowId]?.name ?? '?'} size={14} />
                      {rowById[e.rowId]?.name ?? 'Removed row'}
                    </span>
                  </TableCell>
                  <TableCell className="py-1.5 text-right tnum" style={e.amount < 0 ? { color: 'var(--good)' } : undefined}>{fmt(e.amount)}</TableCell>
                  <TableCell className="py-1.5 pl-3 text-right">
                    <Button variant="ghost" size="icon-xs"
                      onClick={() => deleteEntry(e.id)}
                      title="Delete entry"
                      aria-label="Delete entry"
                      className="text-[var(--text-muted)] opacity-0 hover:text-[var(--bad)] focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <X className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t border-[var(--baseline)] font-semibold">
                <TableCell className="py-2" colSpan={3}>Total</TableCell>
                <TableCell className="py-2 text-right tnum">{fmt(total)}</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  )
}
