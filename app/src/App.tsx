import { getAllTxns } from '@/shared/utils/getAllTxns'
import { getAccounts } from '@/shared/utils/getAccounts'
import { getMonths } from '@/shared/utils/getMonths'
import { CATEGORY_HEX } from '@/shared/constants/CATEGORY_HEX'
import { monthLabel } from '@/shared/utils/monthLabel'
import { spendAmount } from '@/shared/utils/spendAmount'
import { fmt } from '@/shared/utils/fmt'
import { fmt0 } from '@/shared/utils/fmt0'
import { shade } from '@/shared/utils/shade'
import { rollup } from '@/shared/utils/rollup'
import { Fragment, useEffect, useMemo, useRef, useState, Suspense } from 'react'
import { useData } from '@/shared/hooks/useData'
import { getBudget } from '@/shared/utils/getBudget'
import { isLocal } from '@/shared/utils/isLocal'
import type { Transaction } from '@/shared/types/Transaction'

import { TooltipProvider } from '@/shared/ui/primitives/tooltip'
import { Input } from '@/shared/ui/primitives/input'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/shared/ui/primitives/breadcrumb'
import { Card } from '@/shared/ui/Card'
import { CoverageDot } from '@/shared/ui/CoverageDot'
import { Dropdown } from '@/shared/ui/Dropdown'
import { ExportModal } from '@/shared/ui/ExportModal'
import { GroupTable } from '@/screens/spending/ui/GroupTable'
import { Kpi } from '@/shared/ui/Kpi'
import { NAV } from '@/shared/constants/NAV'
import { PageHeader } from '@/shared/ui/PageHeader'
import { RANGE_OPTIONS } from '@/shared/constants/RANGE_OPTIONS'
import { Sidebar } from '@/shared/ui/Sidebar'
import { SkipLink } from '@/shared/ui/SkipLink'
import { SubscriptionsTable } from '@/screens/spending/ui/SubscriptionsTable'
import { ToolPicker } from '@/screens/tools/ui/ToolPicker'
import { TxnTable } from '@/screens/spending/ui/TxnTable'
import { budgetExpensesOf } from '@/shared/utils/budgetExpensesOf'
import { scopeMonthsFor } from '@/screens/spending/utils/scopeMonthsFor'
import { scopedTxns } from '@/screens/spending/utils/scopedTxns'
import { inDrillPath } from '@/screens/spending/utils/inDrillPath'
import { kpiSparks } from '@/screens/spending/utils/kpiSparks'
import { monthlyRows } from '@/screens/spending/utils/monthlyRows'
import { ensureToolShown } from '@/screens/tools/utils/ensureToolShown'
import { scrollToWhenReady } from '@/shared/utils/scrollToWhenReady'
import { roundCents } from '@/shared/utils/roundCents'
import { useDebtLinkMigration } from '@/shared/hooks/useDebtLinkMigration'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { migrateEmployerMatch } from '@/shared/utils/migrateEmployerMatch'
import { lazyNamed } from '@/shared/utils/lazyNamed'
import { prefetchChunks } from '@/shared/utils/prefetchChunks'

// each page is its own chunk, loaded the first time it is opened
const AboutYouView = lazyNamed(() => import('@/screens/about-you/ui/AboutYouView'), 'AboutYouView')
const BalancesPresets = lazyNamed(() => import('@/screens/balances/ui/BalancesPresets'), 'BalancesPresets')
const BalancesView = lazyNamed(() => import('@/screens/balances/ui/BalancesView'), 'BalancesView')
const BudgetView = lazyNamed(() => import('@/screens/budget/ui/BudgetView'), 'BudgetView')
const CashFlowChart = lazyNamed(() => import('@/screens/spending/ui/CashFlowChart'), 'CashFlowChart')
const Donut = lazyNamed(() => import('@/screens/spending/ui/Donut'), 'Donut')
const LogView = lazyNamed(() => import('@/screens/log/ui/LogView'), 'LogView')
const RetirementView = lazyNamed(() => import('@/screens/retirement/ui/RetirementView'), 'RetirementView')
const ToolsView = lazyNamed(() => import('@/screens/tools/ui/ToolsView'), 'ToolsView')
const TrendsChart = lazyNamed(() => import('@/screens/spending/ui/TrendsChart'), 'TrendsChart')

// a quiet placeholder with the chart's height, so only the chart waits if its code is still downloading
const ChartWait = () => <div className="min-h-[300px]" aria-busy="true" />

// downloaded while the browser is idle so the first visit to a tab or chart does not blank the page
const IDLE_CHUNKS = [Donut, TrendsChart, CashFlowChart, BudgetView, LogView, ToolsView, RetirementView, BalancesView].map((c) => c.preload)

// runs once when the app loads: moves an old saved employer match onto the 401k deduction
migrateEmployerMatch()

export default function App() {
  useDebtLinkMigration()
  const [month, setMonth] = usePersistedState(
    'month', 'all',
    (v) => typeof v === 'string' && (v === 'all' || getMonths().includes(v) || RANGE_OPTIONS.some(([k]) => k === v)),
  )
  const [accounts, setAccounts] = usePersistedState<string[]>(
    'accounts', Object.keys(getAccounts()),
    (v) => Array.isArray(v) && v.every((a) => typeof a === 'string' && a in getAccounts()),
  )
  const [path, setPath] = usePersistedState<string[]>(
    'path', [], // [] | [cat] | [cat, sub]
    (v) => Array.isArray(v) && v.length <= 2 && v.every((p) => typeof p === 'string'),
  )
  const [view, setView] = usePersistedState(
    'view', 'actuals',
    (v) => typeof v === 'string' && ['actuals', 'about', 'budget', 'log', 'tools', 'retirement', 'balances'].includes(v),
  )
  const [showExport, setShowExport] = useState(false)
  const dataCtx = useData()
  if (!dataCtx) throw new Error('App must be rendered inside the data provider.')
  const uploadRef = useRef<HTMLInputElement>(null)

  const scopeMonths = useMemo(() => scopeMonthsFor(month), [month])
  // every kind (transfers too) in the month scope and on the switched-on accounts
  const scoped = useMemo(() => scopedTxns(getAllTxns(), scopeMonths, accounts), [scopeMonths, accounts])

  const spendTxns = scoped.filter((t) => t.kind === 'expense' || t.kind === 'refund')
  const incomeTxns = scoped.filter((t) => t.kind === 'income')

  const spending = spendTxns.reduce((s, t) => s + spendAmount(t), 0)
  const income = incomeTxns.reduce((s, t) => s + t.amount, 0)
  // rounded to cents so float noise never shows as a negative zero
  const net = roundCents(income - spending)

  // drill scope
  const inScope = spendTxns.filter((t) => inDrillPath(t, path))
  const level = path.length // 0 cat, 1 sub, 2 merchant
  const keyFn = level === 0 ? (t: Transaction) => t.cat ?? '' : level === 1 ? (t: Transaction) => t.sub ?? '' : (t: Transaction) => t.merchant ?? ''
  const baseHex = level === 0 ? '#7d8597' : CATEGORY_HEX[path[0]] ?? '#7d8597'
  const groups = rollup(inScope, keyFn).map((g, i) => ({
    ...g,
    color:
      level === 0
        ? CATEGORY_HEX[g.name] ?? '#7d8597'
        : shade(baseHex, Math.min(0.55, i * (level === 1 ? 0.16 : 0.09))),
  }))
  const scopeTotal = groups.reduce((s, g) => s + g.total, 0)

  const crumbs = ['All spending', ...path]

  const [tab, setTab] = usePersistedState(
    'actualsTab', 'category',
    (v) => typeof v === 'string' && ['category', 'trends', 'cashflow'].includes(v),
  )

  // budgeted monthly total, for the Spending KPI's "over / under budget" line
  const [budgetTotal, setBudgetTotal] = useState<number | null>(null)
  useEffect(() => prefetchChunks(IDLE_CHUNKS), [])

  useEffect(() => {
    if (view !== 'actuals') return
    getBudget()
      // the same total the Budget page shows (it includes subscriptions at their live amounts)
      // no budget yet (only subscriptions) means nothing to compare against
      .then((d) => setBudgetTotal((d.rows || []).some((r) => r.source !== 'subscription') ? budgetExpensesOf(d) : null))
      .catch(() => {})
  }, [view])

  // one row per month on record (account filter applied): totals + spending by category
  const monthly = useMemo(() => monthlyRows(getAllTxns(), getMonths(), accounts), [accounts])
  const trendCats = Object.keys(CATEGORY_HEX).filter((c) => monthly.some((r) => r[c]))

  // KPI sparklines: running totals through the month, or month-by-month for "All months"
  const sparks = useMemo(() => kpiSparks(scopeMonths, monthly, scoped), [scopeMonths, monthly, scoped])

  // compare against the window of the same length just before this one (a month
  // against the month before it, 3 months against the 3 before them)
  const nMonths = scopeMonths.length
  const firstIdx = getMonths().indexOf(scopeMonths[0] ?? '')
  const prevWindow = month === 'all' || firstIdx - nMonths < 0 ? null : monthly.slice(firstIdx - nMonths, firstIdx)
  const vsPrev = prevWindow ? roundCents(net - prevWindow.reduce((t, r) => t + r.net, 0)) : null
  const prevName = nMonths === 1 ? monthLabel(prevWindow?.[0]?.m ?? getMonths()[0]).slice(0, 3) : `previous ${nMonths} months`
  const allAccounts = accounts.length === Object.keys(getAccounts()).length
  const vsBudget = month !== 'all' && allAccounts && budgetTotal != null ? spending - budgetTotal * nMonths : null
  const [, pageTitle, , pageSubtitle] = NAV.find((n) => n[0] === view) ?? NAV.find((n) => n[0] === 'actuals') ?? NAV[0]

  return (
    <TooltipProvider delayDuration={150}>
    <div className="flex min-h-screen max-lg:flex-col">
      <SkipLink />
      <Sidebar
        view={view}
        setView={setView}
        accounts={accounts}
        setAccounts={setAccounts}
        onExport={() => setShowExport(true)}
        onUpload={isLocal() ? null : () => uploadRef.current?.click()}
      />
      {!isLocal() && (
        <Input
          ref={uploadRef}
          type="file"
          accept=".json,application/json"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = [...(e.target.files ?? [])]
            e.target.value = ''
            if (files.length) dataCtx.importFiles(files)
          }}
        />
      )}
      <Suspense fallback={null}>
      <main id="main" tabIndex={-1} data-view={view} className="min-w-0 flex-1 px-5 py-6 outline-none lg:px-11 lg:py-8">
      <div className="mx-auto max-w-[1320px]">
      <PageHeader title={pageTitle} subtitle={pageSubtitle}>
        {view === 'actuals' && (
          <>
            <Dropdown
              label="Month"
              hideLabel
              icon="calendar"
              value={month}
              onChange={setMonth}
              options={[
                { value: 'all', label: 'All months' },
                ...RANGE_OPTIONS.map(([value, label]) => ({ value, label })),
                ...[...getMonths()].reverse().map((m) => ({
                  value: m,
                  label: monthLabel(m),
                  badge: <CoverageDot month={m} />,
                })),
              ]}
            />
          </>
        )}
        {view === 'tools' && <ToolPicker />}
        {view === 'balances' && <BalancesPresets />}
      </PageHeader>
      {showExport && <ExportModal onClose={() => setShowExport(false)} notify={dataCtx.notify} />}

      {view === 'budget' && (
        <BudgetView
          goToLog={() => setView('log')}
          goToTools={(anchor: string) => {
            // make sure the Take-home pay tool is switched on in the Tools picker
            ensureToolShown('takehome')
            setView('tools')
            // the Tools view mounts on a later render
            scrollToWhenReady(anchor)
          }}
        />
      )}
      {view === 'log' && <LogView />}
      {view === 'about' && <AboutYouView />}
      {view === 'tools' && <ToolsView goToAboutYou={() => setView('about')} />}
      {view === 'retirement' && <RetirementView goToBalances={() => setView('balances')} />}
      {view === 'balances' && <BalancesView />}

      {view === 'actuals' && (
      <>
      {/* kpis */}
      <div className="kpi-row mt-7 flex flex-wrap gap-5">
        <Kpi
          label="Spending"
          icon="arrowUp"
          iconColor="var(--bad)"
          value={fmt(spending)}
          sub={
            <>
              {spendTxns.length} transactions
              {nMonths > 1 && (
                <div className="mt-0.5 text-[var(--text-muted)]">{fmt0(spending / nMonths)} a month</div>
              )}
              {vsBudget != null && (
                <div className="mt-0.5 font-medium" style={{ color: vsBudget <= 0 ? 'var(--good)' : 'var(--bad)' }}>
                  {fmt0(Math.abs(vsBudget))} {vsBudget <= 0 ? 'under' : 'over'} budget
                </div>
              )}
            </>
          }
          spark={sparks.spend}
          sparkColor="#8b6cf6"
        />
        <Kpi
          label="Income"
          icon="arrowDown"
          iconColor="var(--good)"
          value={fmt(income)}
          sub={`${incomeTxns.length} deposits`}
          spark={sparks.income}
          sparkColor="#34d17a"
        />
        <Kpi
          label="Net"
          icon="dollar"
          iconColor={net >= 0 ? 'var(--good)' : 'var(--bad)'}
          value={(net < 0 ? '−' : '') + fmt(Math.abs(net))}
          tone={net >= 0 ? 'var(--good)' : 'var(--bad)'}
          sub={
            vsPrev != null ? (
              <span className="font-medium" style={{ color: vsPrev >= 0 ? 'var(--good)' : 'var(--bad)' }}>
                {fmt0(Math.abs(vsPrev))} {vsPrev >= 0 ? 'better' : 'worse'} than {prevName}
              </span>
            ) : (
              'income minus spending'
            )
          }
          spark={sparks.net}
          sparkColor={net >= 0 ? '#34d17a' : '#f2606c'}
        />
      </div>

      {/* category drilldown / trends / cash flow, with the month summary alongside */}
      <div className="mt-5">
        <Card className="min-w-0 p-5">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <Tabs value={tab} onValueChange={setTab} className="max-sm:w-full">
              <TabsList className="max-sm:w-full">
                <TabsTrigger value="category" className="max-sm:px-1.5 max-sm:text-[12px]">
                  <span className="sm:hidden">Category</span>
                  <span className="max-sm:hidden">Spending by category</span>
                </TabsTrigger>
                <TabsTrigger value="trends" className="max-sm:px-1.5 max-sm:text-[12px]">Trends</TabsTrigger>
                <TabsTrigger value="cashflow" className="max-sm:px-1.5 max-sm:text-[12px]">Cash flow</TabsTrigger>
              </TabsList>
            </Tabs>
            {tab === 'category' && path.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList className="gap-1.5 text-[13px] sm:gap-1.5">
                  {crumbs.map((c, i) => (
                    <Fragment key={i}>
                      {i > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {i === crumbs.length - 1 ? (
                          <BreadcrumbPage className="font-semibold">{c}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <button type="button" className="cursor-pointer" onClick={() => setPath(path.slice(0, i))}>
                              {c}
                            </button>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>

          {tab === 'category' && (
            <>
              <div className="mt-2 grid grid-cols-[minmax(0,1fr)] items-center gap-6 md:grid-cols-[300px_minmax(0,1fr)]">
                <Suspense fallback={<ChartWait />}>
                  <Donut
                    groups={groups}
                    total={scopeTotal}
                    centerLabel={level === 0 ? 'Total spending' : path[path.length - 1]}
                    onSelect={level < 2 ? (name: string) => setPath([...path, name]) : undefined}
                  />
                </Suspense>
                <div className="min-w-0">
                  <GroupTable
                    groups={groups}
                    total={scopeTotal}
                    drillable={level < 2}
                    icons={level === 2}
                    heading={level === 0 ? 'Category' : level === 1 ? 'Group' : 'Merchant'}
                    onSelect={(name: string) => setPath([...path, name])}
                  />
                </div>
              </div>
            </>
          )}
          {tab === 'trends' && (
            <div className="mt-4">
              <Suspense fallback={<ChartWait />}>
                <TrendsChart monthly={monthly} cats={trendCats} onPick={setMonth} />
              </Suspense>
            </div>
          )}
          {tab === 'cashflow' && (
            <div className="mt-4">
              <Suspense fallback={<ChartWait />}>
                <CashFlowChart monthly={monthly} onPick={setMonth} />
              </Suspense>
            </div>
          )}
        </Card>
      </div>

      {/* transactions in current scope */}
      <div className="mt-5">
        <TxnTable
          txns={inScope}
          title={path.length ? `Transactions: ${path.join(' / ')}` : 'All spending transactions'}
        />
      </div>

      {/* income */}
      {incomeTxns.length > 0 && (
        <div className="mt-5">
          <TxnTable txns={incomeTxns} title="Income" />
        </div>
      )}

      {/* subscriptions */}
      <div className="mt-5">
        <SubscriptionsTable />
      </div>

      <p className="mt-6 text-[12px] leading-relaxed text-[var(--text-muted)]">
        Transfers between your own accounts (like a card payment from checking) are excluded from
        spending and income so nothing is double-counted. Refunds (shown in green) net against
        their category. Categorized by hand from the statement PDFs; totals machine-verified
        against each statement's own summary.
      </p>
      </>
      )}
      </div>
      </main>
      </Suspense>
    </div>
    </TooltipProvider>
  )
}
