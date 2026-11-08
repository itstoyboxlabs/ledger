import { useEffect, useMemo, useState } from 'react'
import type { Debt } from '@/shared/types/Debt'
import type { BudgetRow } from '@/shared/types/BudgetRow'
import type { DebtSchedule } from '@/screens/retirement/types/DebtSchedule'
import type { PortfolioAfter } from '@/screens/retirement/types/PortfolioAfter'
import type { PortfolioRow } from '@/screens/retirement/types/PortfolioRow'
import type { RetireEvent } from '@/screens/retirement/types/RetireEvent'
import type { RetirePhase } from '@/screens/retirement/types/RetirePhase'
import type { RetirePresetData } from '@/screens/retirement/types/RetirePresetData'
import type { RetireSimInput } from '@/screens/retirement/types/RetireSimInput'
import type { RetireState } from '@/screens/retirement/types/RetireState'
import { isObj } from '@/shared/utils/isObj'
import { STATES } from '@/shared/constants/STATES'
import { ssMonthlyBenefit } from '@/shared/utils/ssMonthlyBenefit'
import { getBudget } from '@/shared/utils/getBudget'
import { cn } from '@/shared/utils/cn'
import { fmt } from '@/shared/utils/fmt'
import { fmt0 } from '@/shared/utils/fmt0'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs'
import { Label } from '@/shared/ui/primitives/label'
import { Checkbox } from '@/shared/ui/primitives/checkbox'
import { Button } from '@/shared/ui/primitives/button'

import { Tooltip as UITooltip, TooltipTrigger, TooltipContent } from '@/shared/ui/primitives/tooltip'
import { X, Plus } from 'lucide-react'
import { Input } from '@/shared/ui/primitives/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/primitives/table'
import { AutoToolField } from '@/screens/retirement/ui/AutoToolField'
import { Card } from '@/shared/ui/Card'
import { DEBT_EVENT_TIP } from '@/screens/retirement/constants/DEBT_EVENT_TIP'
import { DEFAULT_PORTFOLIO } from '@/screens/retirement/constants/DEFAULT_PORTFOLIO'
import { DEFAULT_STATE } from '@/shared/constants/DEFAULT_STATE'
import { Dot } from '@/shared/ui/Dot'
import { Dropdown } from '@/shared/ui/Dropdown'
import { EVENT_KINDS } from '@/screens/retirement/constants/EVENT_KINDS'
import { FieldBadge } from '@/screens/retirement/ui/FieldBadge'
import { FieldGroup } from '@/screens/retirement/ui/FieldGroup'
import { HeaderTip } from '@/screens/retirement/ui/HeaderTip'
import { Icon } from '@/shared/ui/Icon'
import { InfoTip } from '@/shared/ui/InfoTip'
import { PortfolioTable } from '@/screens/retirement/ui/PortfolioTable'
import { PayPlanCard } from '@/screens/retirement/ui/PayPlanCard'
import { addPayPeriod } from '@/screens/retirement/utils/addPayPeriod'
import { payBreakdown } from '@/screens/retirement/utils/payBreakdown'
import { resolvePayPeriods } from '@/screens/retirement/utils/resolvePayPeriods'
import { EVENT_POOLS } from '@/screens/retirement/constants/EVENT_POOLS'
import { TodayPayRow } from '@/screens/retirement/ui/TodayPayRow'
import type { BudgetFile } from '@/shared/types/BudgetFile'
import type { RawTakeHome } from '@/shared/types/RawTakeHome'
import { payPlanIssues } from '@/screens/retirement/utils/payPlanIssues'
import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'
import type { RetireSimPay } from '@/screens/retirement/types/RetireSimPay'
import { PresetBar } from '@/shared/ui/PresetBar'
import { REPEAT_OPTIONS } from '@/screens/retirement/constants/REPEAT_OPTIONS'
import { RETIRE_DEFAULTS } from '@/screens/retirement/constants/RETIRE_DEFAULTS'
import { SS_EXPLAIN } from '@/screens/retirement/utils/SS_EXPLAIN'
import { STOCK_DEFAULTS } from '@/shared/constants/STOCK_DEFAULTS'
import { TAKE_HOME_DEFAULTS } from '@/shared/constants/TAKE_HOME_DEFAULTS'
import { ToolField } from '@/shared/ui/ToolField'
import { assetKind } from '@/shared/utils/assetKind'
import { assetPool } from '@/shared/utils/assetPool'
import { budgetExpensesOf } from '@/shared/utils/budgetExpensesOf'
import { budgetIncomeFor } from '@/shared/utils/budgetIncomeFor'
import { debtPaymentOf } from '@/shared/utils/debtPaymentOf'
import { equityPayout } from '@/shared/utils/equityPayout'
import { gainsTaxPct } from '@/screens/retirement/utils/gainsTaxPct'
import { grossUp } from '@/screens/retirement/utils/grossUp'
import { incomeTaxOnExtra } from '@/shared/utils/incomeTaxOnExtra'
import { leftoverAmount } from '@/shared/utils/leftoverAmount'
import { leftoverShare } from '@/shared/utils/leftoverShare'
import { newId } from '@/shared/utils/newId'
import { normalizeLeftover } from '@/shared/utils/normalizeLeftover'
import { normalizeRetire } from '@/screens/retirement/utils/normalizeRetire'
import { normalizeTakeHome } from '@/shared/utils/normalizeTakeHome'
import { payoffEventsByDebt } from '@/screens/retirement/utils/payoffEventsByDebt'
import { simulateRetirement } from '@/screens/retirement/utils/simulateRetirement'
import { sumBalances } from '@/shared/utils/sumBalances'
import { takeHome401kMatchYearly } from '@/shared/utils/takeHome401kMatchYearly'
import { takeHome401kYearly } from '@/screens/retirement/utils/takeHome401kYearly'
import { useAssets } from '@/shared/hooks/useAssets'
import { useIncomeOverride } from '@/shared/hooks/useIncomeOverride'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { usePresets } from '@/shared/hooks/usePresets'
import { useToolState } from '@/shared/hooks/useToolState'
import { NeedPerMonthField } from '@/screens/retirement/ui/NeedPerMonthField'
import { retireNeed } from '@/screens/retirement/utils/retireNeed'
import { budgetPresetOptions } from '@/screens/retirement/utils/budgetPresetOptions'
import { useRetireNeedPreset } from '@/screens/retirement/hooks/useRetireNeedPreset'

type RetirementCalcProps = {
  debts: Debt[]
  goToBalances?: () => void
}

// the numeric fields of the plan that a ToolField edits directly
type NumericRetireKey =
  | 'age' | 'retireAge' | 'accessAge' | 'endAge'
  | 'start401k' | 'startSavings' | 'contrib401k' | 'contribSavings'
  | 'withdrawMo' | 'taxPct' | 'raisePct'

export function RetirementCalc({ debts, goToBalances }: RetirementCalcProps) {
  const [assets] = useAssets()
  const [rawC, setRawC] = usePersistedState<RetireState>(
    'retireCalc', RETIRE_DEFAULTS,
    (v) => isObj(v),
  )
  // normalize on read; the stored value is only rewritten when something is edited
  const c = useMemo(() => normalizeRetire(rawC), [rawC])
  const setC = (next: RetireState) => setRawC(normalizeRetire(next))
  // the inputs Find last failed on; the note shows only while they are unchanged
  const [findNotFoundFor, setFindNotFoundFor] = useState<string | null>(null)
  const validRows = (v: unknown): boolean => Array.isArray(v) && v.every((r) => typeof r?.alloc === 'number' && typeof r?.perf === 'number')
  const [port, setPort] = usePersistedState<PortfolioRow[]>('retirePortfolio', DEFAULT_PORTFOLIO, validRows)
  const [portAfterRaw, setPortAfter] = usePersistedState<PortfolioAfter>(
    'retirePortfolioAfter', { same: true, rows: [] },
    (v) => isObj(v) && typeof v.same === 'boolean' && validRows(v.rows),
  )
  const portAfter = portAfterRaw
  const afterRows = portAfter.same ? port : portAfter.rows
  const [includeDebt, setIncludeDebt] = usePersistedState<boolean>('retireIncludeDebt', true, (v) => typeof v === 'boolean')
  const f = (k: NumericRetireKey) => (v: number) => setC({ ...c, [k]: v })
  const { presets, save, remove } = usePresets<RetirePresetData>('retirement')
  // what pay periods and Need per month can point at, by id so a rename does not break them
  const { presets: takeHomePresets } = usePresets<RawTakeHome>('takeHome', { ids: true })
  const { presets: budgetPresets, loaded: budgetPresetsLoaded } = usePresets<BudgetRow[]>('expenses', { ids: true })
  const presetData: RetirePresetData = { c, port, portAfter, includeDebt }
  const applyPreset = (d: Partial<RetirePresetData> | null | undefined) => {
    // presets saved before Events, Social Security and the split portfolio are in the
    // old shape; normalizeRetire reads them the way the old code did
    if (d?.c) setC(d.c)
    if (Array.isArray(d?.port)) setPort(d.port)
    if (d?.portAfter && typeof d.portAfter.same === 'boolean' && Array.isArray(d.portAfter.rows)) setPortAfter(d.portAfter)
    else setPortAfter({ same: true, rows: [] })
    if (typeof d?.includeDebt === 'boolean') setIncludeDebt(d.includeDebt)
  }

  // "Auto" sources for both contribution fields come from the SAME place: whatever
  // the Budget tab currently shows as monthly income — actual payroll, or its
  // income-override salary if that toggle is on. Budgeting IS the planning source of
  // truth here, so both fields track it instead of a separately-set number.
  const [taxState] = usePersistedState<string>('taxState', DEFAULT_STATE, (v) => String(v) in STATES)
  const [incomeOverride] = useIncomeOverride()
  const [takeHome] = useToolState('takeHome', TAKE_HOME_DEFAULTS)
  const budgetMonthlyIncome = budgetIncomeFor(incomeOverride, takeHome, taxState)
  // 401k needs a GROSS salary to apply the deferral % to: the Take-home pay calc's
  // salary input is that number (always populated, whichever income source the Budget
  // page is on), not the take-home income figure above. The employer match lives on
  // the same deduction (see migrateEmployerMatch) and is a percent of your own share.
  const k401Yearly = takeHome401kYearly(takeHome)
  const k401Match = takeHome401kMatchYearly(takeHome)
  const matchPct = k401Yearly > 0 ? Math.round((k401Match / k401Yearly) * 100) : 0
  const autoContrib401k = k401Yearly + k401Match
  // options payout / yr auto source: the Tools tab's Stock options exit planner,
  // same shared key ('stockCalc2') and math it uses for "Net per year"
  const [stockCalc] = useToolState('stockCalc2', STOCK_DEFAULTS)
  const stockPayout = equityPayout(stockCalc, taxState)
  const autoOptAmt = stockPayout.slice - stockPayout.tax.total
  // Social Security: monthly benefit estimated from the Take-home salary
  const takeHomeSalary = Number(normalizeTakeHome(takeHome).salary) || 0
  const autoSsMonthly = ssMonthlyBenefit(takeHomeSalary, c.ss.claimAge)
  const ssMonthly = !c.ss.on ? 0 : c.ss.auto ? autoSsMonthly : Number(c.ss.monthly) || 0
  const [budgetLeftover, setBudgetLeftover] = useState<number | null>(null)
  // the Budget page's Savings share of what is left, or null when there is none
  const [savingsShare, setSavingsShare] = useState<number | null>(null)
  // percent of what is left that the Budget page sends to savings, or null when none is set
  const [savingsPct, setSavingsPct] = useState<number | null>(null)
  // each debt's own budgeted monthly payment, read live off the SAME Budget rows
  // Josh already edits — matched by name, same convention as the Groceries/Uber
  // Eats/MTA weekly-input quirks (renaming a row loses the link).
  const [budgetRows, setBudgetRows] = useState<BudgetRow[] | null>(null)
  // the whole Budget, for pay periods that save by a Budget preset or today's Budget
  const [budgetFile, setBudgetFile] = useState<BudgetFile | null>(null)
  // Need per month: the typed number, or a picked Budget preset's expenses (see retireNeed)
  const [needPreset, setNeedPreset] = useRetireNeedPreset()
  const needOptions = budgetPresetsLoaded ? budgetPresetOptions(budgetPresets, budgetFile?.dismissedSubs) : null
  // today's Budget "Budgeted expenses", only once the Budget has a row of its own
  const budgetToday = budgetFile && budgetFile.rows.some((r) => r.source !== 'subscription') ? budgetExpensesOf(budgetFile) : null
  const need = retireNeed(needPreset, needOptions, c.withdrawMo)
  const needMo = need.monthly
  // a pick saved by name before presets had ids is saved again by its id
  useEffect(() => {
    if (need.status === 'preset' && need.id && need.id !== needPreset) setNeedPreset(need.id)
  }, [need.status, need.id, needPreset, setNeedPreset])
  const debtPayments = debts.map((d) => debtPaymentOf(d, budgetRows))
  useEffect(() => {
    getBudget()
      .then((d) => {
        // the same rows the Budget page counts (live subscription amounts), so the
        // leftover here matches its "Left over / month"
        const budgetExpenses = budgetExpensesOf(d)
        // never below zero: an overspent Budget saves nothing, it does not take from savings
        const leftover = leftoverAmount(budgetMonthlyIncome, budgetExpenses)
        setBudgetLeftover(leftover)
        // with no allocation at all, everything left goes to savings. Once there is one,
        // only its savings share does (zero if nothing targets savings)
        const alloc = normalizeLeftover(d.leftover)
        setSavingsShare(alloc.length > 0 ? leftoverShare(alloc, 'savings', leftover) : null)
        setSavingsPct(alloc.length > 0 ? Math.min(100, alloc.filter((a) => a.target === 'savings').reduce((t, a) => t + a.pct, 0)) : null)
        setBudgetRows(d.rows)
        setBudgetFile(d)
      })
      .catch(() => {})
  }, [budgetMonthlyIncome])
  const autoContribSavings = (savingsShare ?? budgetLeftover ?? 0) * 12
  // a paid-off debt's payment follows the Budget allocation: the savings share goes into
  // savings and the rest is spent. With no allocation set at all, all of it goes to savings.
  const freedToSavings = savingsPct == null ? 1 : savingsPct / 100
  const baseContrib401k = c.auto401k ? autoContrib401k : c.contrib401k
  const baseContribSavings = c.autoSavings ? autoContribSavings : c.contribSavings
  // events linked to the Equity payout tool take its net per year and its payout years
  // a "pay off a debt" event costs the debt's balance (or a typed amount) once, at its age
  const debtOf = (e: RetireEvent) => debts.find((d) => d.id === e.debtId)
  const events = c.events.map((e): RetireEvent =>
    e.auto === 'equity'
      ? { ...e, kind: 'in', amount: autoOptAmt, years: stockPayout.years, repeat: e.repeat === 'once' ? 'once' : 'year' }
      : e.kind === 'debt'
        ? { ...e, amount: e.custom ? e.amount : debtOf(e)?.balance ?? 0, repeat: 'once', years: 1 }
        : e,
  )
  // debts with a payoff event inside the plan leave the starting hole (they come out of
  // savings at that age instead) and their payment flows into savings from that age on
  const payoffByDebt = payoffEventsByDebt(events, debts.map((d) => d.id), c.age, c.endAge)
  const patchEvent = (id: string, p: Partial<RetireEvent>) => setC({ ...c, events: c.events.map((e) => (e.id === id ? { ...e, ...p } : e)) })
  const addEvent = () =>
    setC({ ...c, events: [...c.events, { id: newId('e'), name: '', amount: 0, kind: 'out', age: c.age + 1, repeat: 'once', years: 1 }] })
  const removeEvent = (id: string) => setC({ ...c, events: c.events.filter((e) => e.id !== id) })

  // Debt payoff → savings waterfall: each of the three shared debts (card, taxes,
  // loans) is paid off independently at ITS OWN budgeted monthly payment (no
  // snowballing between them — Josh's call). balance ÷ payment = months to zero,
  // ignoring interest (same simplification as the Debt payoff tool). The payoff
  // year gets a PRORATED credit for just the months remaining after payoff that
  // year; every year after gets the full 12 months. All of it goes straight to
  // savings — always, regardless of the Savings Auto toggle, since paying down a
  // debt is a real cash-flow fact whether the number above it is auto or typed.
  const debtPayoffSchedule = (balance: number, monthlyPayment: number, startAge: number): DebtSchedule => {
    if (balance <= 0) return { payoffAge: startAge - 1, freedMonthsInPayoffYear: 12 } // already clear
    if (monthlyPayment <= 0) return { payoffAge: Infinity, freedMonthsInPayoffYear: 0 } // never clears at $0/mo
    const months = Math.ceil(balance / monthlyPayment)
    const yearIndex = Math.floor((months - 1) / 12)
    const monthWithinYear = months - yearIndex * 12
    return { payoffAge: startAge + yearIndex, freedMonthsInPayoffYear: 12 - monthWithinYear }
  }
  const freedFromDebt = (sched: DebtSchedule, monthlyPayment: number, age: number): number => {
    if (monthlyPayment <= 0 || age < sched.payoffAge) return 0
    return age === sched.payoffAge ? monthlyPayment * sched.freedMonthsInPayoffYear : monthlyPayment * 12
  }
  const debtSchedules = debts.map((d, i) =>
    payoffByDebt[d.id]
      ? { payoffAge: payoffByDebt[d.id].age, freedMonthsInPayoffYear: 12 }
      : debtPayoffSchedule(d.balance, debtPayments[i], c.age),
  )
  const autoTaxPct = gainsTaxPct(needMo * 12, taxState)
  const taxPct = c.autoTax ? autoTaxPct : c.taxPct
  const weighted = (rows: PortfolioRow[]) => {
    const total = rows.reduce((s: number, x) => s + x.alloc, 0)
    return { total, avg: total > 0 ? rows.reduce((s, x) => s + x.alloc * x.perf, 0) / total : 0 }
  }
  const avgReturn = weighted(port).avg
  const avgReturnAfter = weighted(afterRows).avg
  const r = avgReturn / 100
  const rAfter = avgReturnAfter / 100
  // starting balances: from the Balances page (anything unchecked is left out) or typed
  const fromBalances = c.startFrom === 'balances'
  const startOff = new Set(c.startOff)
  const incAssets = fromBalances ? assets.filter((a) => !startOff.has(a.id)) : []
  // tax on 401k withdrawals: pre-tax money is taxed as income on the way out, Roth is not.
  // Typed in, the 401k box is pre-tax. With the tax off, Roth joins the 401k as before.
  const taxed = c.tax401k
  const incomeTax = (gross: number) => incomeTaxOnExtra(0, gross, taxState).total
  const kindSum = (kind: string) => incAssets.filter((a) => assetPool(a) === '401k' && assetKind(a) === kind).reduce((t, a) => t + a.balance, 0)
  const startRoth = fromBalances ? kindSum('roth') : 0
  const startK = fromBalances ? kindSum('pretax') + (taxed ? 0 : startRoth) : c.start401k
  const startS = fromBalances ? incAssets.filter((a) => assetPool(a) === 'savings').reduce((t, a) => t + a.balance, 0) : c.startSavings
  const holeDebt = sumBalances(debts.filter((d) => !payoffByDebt[d.id] && (!fromBalances || !startOff.has(d.id))))
  const countDebt = fromBalances ? true : includeDebt
  const toggleStart = (id: string) =>
    setC({ ...c, startOff: startOff.has(id) ? c.startOff.filter((x) => x !== id) : [...c.startOff, id] })

  // a debt unticked on the starting balances is left out entirely, so it frees nothing
  const freedPerYear = (age: number) =>
    debtSchedules.reduce((sum, sched, i) =>
      fromBalances && startOff.has(debts[i].id) ? sum : sum + freedFromDebt(sched, debtPayments[i], age), 0) * freedToSavings
  // the model itself is simulateRetirement; this is a function of retireAge so "Find"
  // (below) can replay it against candidate ages
  // the pay plan: each period points at a Take-home preset and a Budget preset, or uses
  // today's, or typed numbers. Empty means today's numbers, exactly as before the plan.
  const periods = c.pay.periods
  const hasPlan = periods.length > 0
  const resolved = resolvePayPeriods(periods, {
    takeHome, takeHomePresets, budget: budgetFile, budgetPresets, taxState,
    incomeOf: (th) => budgetIncomeFor(incomeOverride, th, taxState),
  })
  const simPay: RetireSimPay | undefined = hasPlan
    ? {
      periods: resolved.map((x) => x.sim), planRetireAge: c.retireAge,
    }
    : undefined
  const simInput: RetireSimInput = {
    age: c.age, accessAge: c.accessAge, endAge: c.endAge, pay: simPay, raisePct: c.raisePct,
    start401k: startK, startSavings: startS - (countDebt ? holeDebt : 0),
    // with a plan, a working year no period covers uses today's Take-home and Budget
    base401k: hasPlan ? autoContrib401k : baseContrib401k,
    contribSavings: hasPlan ? autoContribSavings : baseContribSavings, freed: freedPerYear,
    withdrawMo: needMo, ssMonthly, ssClaimAge: c.ss.claimAge, r, rAfter, taxPct,
    // a debt payoff event counts only when it is the one that applies to its debt
    events: events.filter((e) => e.kind !== 'debt' || payoffByDebt[e.debtId ?? ''] === e),
    ...(taxed ? { incomeTax, startRoth } : {}),
  }
  const simulate = (retireAge: number) => simulateRetirement(simInput, retireAge)
  // everything Find depends on; the "no safe age" note clears once any of it changes
  const findKey = JSON.stringify({ ...simInput, plan: hasPlan ? { takeHome, takeHomePresets, budgetPresets, budgetFile, incomeOverride } : null, taxIn: taxed ? taxState : null, freed: Array.from({ length: Math.max(0, c.endAge - c.age + 1) }, (_, i) => freedPerYear(c.age + i)) })
  const findNotFound = findNotFoundFor === findKey
  const { rows, runOutAge, atRetirement } = simulate(c.retireAge)
  const payIssues = payPlanIssues(
    periods.map((p, i) => ({ ...p, missingPay: resolved[i].missingPay, missingSave: resolved[i].missingSave })),
    c.age, c.retireAge, c.endAge,
  )
  // clearing the plan (Back to one period, or removing the last period) keeps the first
  // period's raise on the no-plan row
  const setPeriods = (next: PayPeriod[]) =>
    setC({ ...c, ...(next.length === 0 && periods.length > 0 ? { raisePct: periods[0].raisePct } : {}), pay: { periods: next } })
  // the first period starts from today's sources: Auto stays today's, typed carries over
  const todaySources = {
    takeHomeFrom: c.auto401k ? 'today' : 'typed', takeHomePreset: '',
    k401: c.auto401k ? Math.round(autoContrib401k) : c.contrib401k,
    saveFrom: c.autoSavings ? 'today' : 'typed', savePreset: '', savings: c.autoSavings ? Math.round(autoContribSavings) : c.contribSavings,
    raisePct: c.raisePct,
  } as const
  const addPeriod = () => setPeriods(addPayPeriod(periods, c.age, c.retireAge, todaySources))
  // picking a preset (or typed pay) on today's row turns it into the plan's first period
  const startPlan = (p: Partial<PayPeriod>) =>
    setPeriods([{ id: newId('p'), label: 'Now', fromAge: c.age, toAge: 'retire', ...todaySources, ...p }])
  const takeHomeChoices = takeHomePresets.map((x) => {
    const m = payBreakdown(x.data, taxState)
    return { id: x.id ?? '', name: x.name, k401: m.own + m.match }
  })
  const budgetChoices = budgetPresets.map((x) => ({ id: x.id ?? '', name: x.name }))
  const debtNote = debts.length > 0 && (
    <p className="col-span-2 mt-1 text-[11px] text-[var(--text-muted)]">
      Once a debt from the Balances page is paid off, its monthly payment is split the way
      you set up on the Budget page. For example, if you send 50% of what is left to savings
      and 50% to something else, the freed payment is split 50 and 50 too. If you have not
      set a split, all of it goes to savings.
      {debtPayments.some((p) => !(p > 0)) && ' Add a payment on the Balances page to include it.'}
    </p>
  )
  // balance at a few milestone ages plus the end age, only the ones the projection reaches
  const milestones = [...new Set([60, 70, 80, 90, 100, c.endAge])]
    .sort((a, b) => a - b)
    .filter((a) => a > c.age && a <= c.endAge)
    .map((a) => ({ age: a, total: rows.find((r) => r.age === a)?.total ?? 0 }))

  // "Find" button: earliest retire age (after current age) where money never goes
  // negative through endAge, at today's inputs. Linear scan — cheap (at most ~80
  // candidate ages × ~80 simulated years each) and correct even if survivability
  // isn't perfectly monotonic in retireAge (one-time events land at fixed ages
  // regardless of when you retire).
  const findEarliestSafeRetireAge = () => {
    for (let candidate = c.age + 1; candidate < c.endAge; candidate++) {
      if (simulate(candidate).runOutAge === null) return candidate
    }
    return null
  }

  const phaseTone = (p: RetirePhase) =>
    p === 'working' ? 'var(--good)' : p === 'early-retired' ? '#e8c76a' : 'var(--cat-housing)'

  return (
    <div>
      <p className="text-[13px] text-[var(--text-secondary)]">
        You save until you retire, then take out {fmt0(needMo * 12)} a year.
        {taxed
          ? ` Your 401k opens at ${c.accessAge} and what you take out of it is taxed as income.`
          : ` Your 401k joins your savings at ${c.accessAge}.`}{' '}
        Your funds earn {avgReturn.toFixed(2)}% a year while you work
        {portAfter.same ? '' : ` and ${avgReturnAfter.toFixed(2)}% after`}.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <PresetBar
          presets={presets}
          currentData={presetData}
          onApply={applyPreset}
          onSave={(name: string) => save(name, presetData)}
          onDelete={remove}
          scope="retirement"
        />
      </div>

      {/* variables, grouped so related inputs read together */}
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <FieldGroup label="Timeline">
          <ToolField label="Current age" value={c.age} onChange={f('age')} />
          <div className="relative">
            <ToolField label="Retire at" value={c.retireAge} onChange={f('retireAge')} />
            <FieldBadge
              label="Find"
              active={false}
              onClick={() => {
                const found = findEarliestSafeRetireAge()
                if (found === null) {
                  setFindNotFoundFor(findKey)
                  return
                }
                setFindNotFoundFor(null)
                setC({ ...c, retireAge: found })
              }}
              title="Finds the earliest age you could retire without running out of money, using the numbers on this page."
            />
            {findNotFound && (
              <p className="mt-1.5 text-[11px] text-[var(--bad)]">
                No retire age before {c.endAge} keeps the money from running out. Try saving more or
                lowering what you need each month.
              </p>
            )}
          </div>
          <ToolField label="401k access age" value={c.accessAge} onChange={f('accessAge')} />
          <ToolField label="Plan to age" value={c.endAge} onChange={f('endAge')} />
        </FieldGroup>

        <FieldGroup
          label="Starting balances"
          tip="What you begin with today. Pull it from the Balances page and tick what to include, or type your own numbers."
          gridClass="grid-cols-2"
        >
          <Tabs value={c.startFrom} onValueChange={(v) => setC({ ...c, startFrom: v as RetireState['startFrom'] })} className="col-span-2">
            <TabsList className="w-full">
              <TabsTrigger value="balances" className="py-1.5 text-[13px]">From Balances</TabsTrigger>
              <TabsTrigger value="typed" className="py-1.5 text-[13px]">Type it in</TabsTrigger>
            </TabsList>
          </Tabs>
          {fromBalances ? (
            <div className="col-span-2 flex flex-col gap-1">
              {assets.length === 0 && debts.length === 0 && (
                <p className="text-[13px] text-[var(--text-secondary)]">Nothing on the Balances page yet.</p>
              )}
              {assets.length > 0 && <div className="mt-1 text-[12px] text-[var(--text-muted)]">What you have</div>}
              {assets.map((a) => (
                <Label key={a.id} className="flex items-center gap-2.5 text-[13px] font-normal text-[var(--text-secondary)]">
                  <Checkbox checked={!startOff.has(a.id)} onCheckedChange={() => toggleStart(a.id)} />
                  <span className="min-w-0 flex-1 truncate">{a.name || 'Unnamed'}</span>
                  <span className="text-[11px] text-[var(--text-muted)]">{assetPool(a) === 'savings' ? 'Savings' : assetKind(a) === 'roth' ? 'Retirement account, Roth' : 'Retirement account, pre-tax'}</span>
                  <span className="w-24 text-right tnum">{fmt0(a.balance)}</span>
                </Label>
              ))}
              {debts.length > 0 && <div className="mt-2 text-[12px] text-[var(--text-muted)]">What you owe</div>}
              {debts.map((d) => (
                <Label key={d.id} className="flex items-center gap-2.5 text-[13px] font-normal text-[var(--text-secondary)]">
                  <Checkbox checked={!startOff.has(d.id)} onCheckedChange={() => toggleStart(d.id)} />
                  <span className="min-w-0 flex-1 truncate">{d.name || 'Unnamed'}</span>
                  <span className="w-24 text-right tnum" style={{ color: 'var(--bad)' }}>−{fmt0(d.balance)}</span>
                </Label>
              ))}
              <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2 border-t border-[var(--grid)] pt-2 text-[12px] text-[var(--text-secondary)]">
                <span>
                  Savings start at <span className="tnum font-medium text-white">{fmt0(startS - holeDebt)}</span>
                  {holeDebt > 0 && <span className="text-[var(--text-muted)]"> ({fmt0(startS)} minus {fmt0(holeDebt)} owed)</span>}
                  . Retirement account starts at <span className="tnum font-medium text-white">{fmt0(startK + (taxed ? startRoth : 0))}</span>
                  {taxed && startRoth > 0 && <span className="text-[var(--text-muted)]"> ({fmt0(startRoth)} of it Roth)</span>}.
                </span>
                {goToBalances && (
                  <Button variant="link" size="xs" onClick={goToBalances} className="h-auto p-0 text-[12px] font-normal">
                    Edit on Balances
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <ToolField label="401k now" value={c.start401k} onChange={f('start401k')} step={1000} suffix="$" />
              <ToolField label="Savings now" value={c.startSavings} onChange={f('startSavings')} step={1000} suffix="$" />
              <Label className="col-span-2 flex flex-col justify-end pb-1">
                <span className="text-[12px] text-[var(--text-muted)]">Start in debt</span>
                <Button variant="outline" aria-pressed={includeDebt}
                  onClick={() => setIncludeDebt(!includeDebt)}
                  className={cn('mt-1 h-auto justify-start whitespace-normal px-3 py-2 text-left font-normal', includeDebt ? 'border-[var(--bad)]/40 bg-[var(--bad)]/15 font-medium text-[var(--bad)] hover:bg-[var(--bad)]/20 hover:text-[var(--bad)]' : 'text-[var(--text-muted)]')}
                >
                  {includeDebt ? `Yes, owing ${fmt0(holeDebt)} (from Balances)` : 'No, start at $0'}
                </Button>
              </Label>
            </>
          )}
        </FieldGroup>

        <PayPlanCard
          periods={periods}
          resolved={resolved}
          issues={payIssues}
          todaySalary={takeHomeSalary}
          retireAge={c.retireAge}
          takeHomePresets={takeHomeChoices}
          budgetPresets={budgetChoices}
          onChange={setPeriods}
          onAdd={addPeriod}
          today={
            <TodayPayRow
              takeHomePresets={takeHomeChoices}
              budgetPresets={budgetChoices}
              onPickPay={(v) => {
                const th = takeHomeChoices.find((x) => x.id === v)
                if (th) startPlan({ takeHomeFrom: 'preset', takeHomePreset: th.id, k401: Math.round(th.k401) })
              }}
              k401={{
                auto: c.auto401k,
                autoValue: autoContrib401k,
                autoTip: matchPct > 0
                  ? `You put in ${fmt0(k401Yearly)} a year (from Take-home pay on the Tools page). Your employer adds ${fmt0(k401Match)} with a ${matchPct}% match. Change the salary, 401k or match there.`
                  : `${fmt0(k401Yearly)} a year, from Take-home pay on the Tools page. Add an employer match on the 401k row there if your company adds to it.`,
                value: c.contrib401k,
                onToggleAuto: () => setC({ ...c, auto401k: !c.auto401k }),
                onChange: f('contrib401k'),
              }}
              raise={{ value: c.raisePct, onChange: f('raisePct') }}
              savings={{
                auto: c.autoSavings,
                autoValue: autoContribSavings,
                autoTip: savingsShare !== null
                  ? `Your Savings share of what is left on the Budget page (${fmt(savingsShare)} a month), times 12.`
                  : `What your Budget leaves over each month (${fmt(budgetLeftover ?? 0)}), times 12. Add a Savings share under "What to do with what is left" on the Budget page to make this explicit.`,
                value: c.contribSavings,
                onChange: f('contribSavings'),
                onAuto: (auto) => setC({ ...c, autoSavings: auto }),
                onPickPreset: (id) => startPlan({ saveFrom: 'preset', savePreset: id }),
              }}
            />
          }
          footer={debtNote || undefined}
        />

        <FieldGroup
          label="In retirement"
          tip="What you need each month once you stop working, the tax on what your regular investments earn and the income tax on what you take out of a pre-tax 401k."
          gridClass="grid-cols-2"
        >
          <NeedPerMonthField
            value={c.withdrawMo}
            onChange={f('withdrawMo')}
            need={need}
            options={needOptions}
            today={budgetToday}
            onPick={setNeedPreset}
          />
          <AutoToolField
            label="Tax on investment gains"
            auto={!!c.autoTax}
            onToggleAuto={() => setC({ ...c, autoTax: !c.autoTax })}
            autoValue={autoTaxPct}
            autoTip={`A guess based on living on ${fmt0(needMo * 12)} a year in ${STATES[taxState]?.label}. It adds the federal rate on long-term gains to the state rate, since most states tax gains like income.`}
            value={c.taxPct}
            onChange={f('taxPct')}
            step={1}
            suffix="%"
            format={(v) => `${v}%`}
          />
          <Label className="col-span-2 flex flex-col">
            <span className="text-[12px] text-[var(--text-muted)]">Tax on 401k withdrawals</span>
            <Button variant="outline" aria-pressed={taxed}
              onClick={() => setC({ ...c, tax401k: !taxed })}
              className={cn('mt-1 h-auto justify-start whitespace-normal px-3 py-2 text-left font-normal', taxed ? 'border-[var(--good)]/40 bg-[var(--good)]/15 font-medium text-[var(--good)] hover:bg-[var(--good)]/20 hover:text-[var(--good)]' : 'text-[var(--text-muted)]')}
            >
              {taxed ? `Yes, taxed as income in ${STATES[taxState]?.label}` : 'No, leave the tax out'}
            </Button>
          </Label>
          <p className="col-span-2 text-[11px] text-[var(--text-muted)]">
            {taxed
              ? `Your 401k was never taxed going in, so it is taxed on the way out. To spend ${fmt0(c.withdrawMo * 12)} a year from it you take out about ${fmt0(grossUp(c.withdrawMo * 12, incomeTax))}. Bigger withdrawals reach higher brackets. Savings are spent first and Roth money last. Set each account's type on the Balances page.`
              : 'Your 401k is counted as if it were never taxed, so the plan shows more to spend than you will have. Turn this on to see the difference.'}
          </p>
        </FieldGroup>

        <FieldGroup
          label="Social Security"
          tip="Money from Social Security once you claim it. It covers part of what you need each month. Turn it off to plan as if it will not be there."
          gridClass="grid-cols-2"
        >
          <Label className="col-span-2 flex flex-col">
            <span className="text-[12px] text-[var(--text-muted)]">Include Social Security</span>
            <Button variant="outline" aria-pressed={c.ss.on}
              onClick={() => setC({ ...c, ss: { ...c.ss, on: !c.ss.on } })}
              className={cn('mt-1 h-auto justify-start whitespace-normal px-3 py-2 text-left font-normal', c.ss.on ? 'border-[var(--good)]/40 bg-[var(--good)]/15 font-medium text-[var(--good)] hover:bg-[var(--good)]/20 hover:text-[var(--good)]' : 'text-[var(--text-muted)]')}
            >
              {c.ss.on ? 'Yes, it is part of the plan' : 'No, plan without it'}
            </Button>
          </Label>
          {c.ss.on && (
            <>
              <ToolField
                label="Claim age"
                value={c.ss.claimAge}
                min={62}
                max={70}
                onChange={(v) => setC({ ...c, ss: { ...c.ss, claimAge: v } })}
                tip="The age you start collecting. You can pick any age from 62 to 70. Waiting pays more each month for life: about 70% of the full amount at 62, 100% at 67 and 124% at 70."
              />
              <AutoToolField
                label="Per month"
                auto={c.ss.auto}
                onToggleAuto={() => setC({ ...c, ss: { ...c.ss, auto: !c.ss.auto } })}
                autoValue={autoSsMonthly}
                autoTip={SS_EXPLAIN(takeHomeSalary, c.ss.claimAge, autoSsMonthly)}
                tip={SS_EXPLAIN(takeHomeSalary, c.ss.claimAge, autoSsMonthly)}
                value={c.ss.monthly}
                onChange={(v) => setC({ ...c, ss: { ...c.ss, monthly: v } })}
                step={50}
                suffix="$"
              />
            </>
          )}
        </FieldGroup>

        <FieldGroup
          label="Events"
          tip="Money that comes in or goes out at a certain age, on top of your regular saving. One time, like a down payment, or repeating, like a stock payout over four years or an IRA you add to every year. Money in can go to savings or to a retirement account, which stays locked until your 401k access age."
          className="lg:col-span-2"
          gridClass="grid-cols-1 sm:grid-cols-2"
          action={
            <UITooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon-xs" aria-label="Add event" onClick={addEvent}>
                  <Plus className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Add an event</TooltipContent>
            </UITooltip>
          }
        >
          {c.events.length === 0 && (
            <p className="col-span-full text-[12px] text-[var(--text-muted)]">
              No events yet. Add one for a big purchase, a bonus, an IRA or a stock payout.
            </p>
          )}
          {c.events.map((raw, i) => {
            const e = events[i]
            const linked = e.auto === 'equity'
            const isDebt = e.kind === 'debt'
            const debt = debtOf(e)
            const setKind = (v: string) =>
              patchEvent(e.id, v === 'debt'
                ? { kind: 'debt' as const, auto: undefined, repeat: 'once' as const, years: 1, debtId: raw.debtId || debts[0]?.id || '', custom: false }
                : { kind: v as RetireEvent['kind'], ...(raw.kind === 'debt' ? { debtId: undefined, custom: undefined } : {}), ...(v !== 'in' ? { to: undefined, untilRetire: undefined } : {}) })
            return (
              <div key={e.id} className="rounded-xl bg-[var(--surface-2)] p-3 ring-1 ring-[var(--ring)]">
                <div className="mb-2 flex items-center gap-2">
                  <Input variant="inline"
                    value={raw.name}
                    placeholder="Event name"
                    onChange={(ev) => patchEvent(e.id, { name: ev.target.value })}
                    className="-ml-1.5 flex-1 text-[12px] font-medium"
                  />
                  <Button variant="ghost" size="icon-xs" aria-label="Remove event"
                    onClick={() => removeEvent(e.id)}
                    className="text-[var(--text-muted)] hover:text-[var(--bad)]"
                  ><X className="size-3.5" /></Button>
                </div>
                <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3">
                  <AutoToolField
                    label="Amount"
                    auto={isDebt ? !raw.custom : linked}
                    onToggleAuto={() =>
                      isDebt
                        ? patchEvent(e.id, { custom: !raw.custom, amount: raw.custom ? raw.amount : debt?.balance ?? 0 })
                        : patchEvent(e.id, linked ? { auto: undefined } : { auto: 'equity', kind: 'in', repeat: 'year' })}
                    autoValue={isDebt ? debt?.balance ?? 0 : autoOptAmt}
                    autoTip={isDebt
                      ? `The balance of ${debt?.name || 'this debt'} on the Balances page. Click Auto to type a different amount.`
                      : `Pulled from the Equity payout tool on the Tools page: ${fmt0(stockPayout.gross)} before tax over ${stockPayout.years} ${stockPayout.years === 1 ? 'year' : 'years'}, taxed, is ${fmt0(autoOptAmt)} a year. It stops when you retire. Change the numbers there.`}
                    value={raw.amount}
                    onChange={(v) => patchEvent(e.id, { amount: v })}
                    step={1000}
                    suffix="$"
                  />
                  <Label className="block">
                    <span className="inline-flex items-center gap-1 text-[12px] text-[var(--text-muted)]">
                      Direction
                      {isDebt && <InfoTip tip={DEBT_EVENT_TIP} size={12} />}
                    </span>
                    <div className="mt-1">
                      <Dropdown
                        label="Direction"
                        hideLabel
                        value={e.kind}
                        onChange={(v: string) => { if (!linked) setKind(v) }}
                        className="h-9 w-full justify-between rounded-lg bg-[var(--surface-1)] px-3 shadow-xs"
                        options={EVENT_KINDS}
                      />
                    </div>
                  </Label>
                  {isDebt && (
                    <Label className="block">
                      <span className="text-[12px] text-[var(--text-muted)]">Debt</span>
                      <div className="mt-1">
                        <Dropdown
                          label="Debt"
                          hideLabel
                          value={raw.debtId ?? ''}
                          onChange={(v: string) => patchEvent(e.id, { debtId: v })}
                          className="h-9 w-full justify-between rounded-lg bg-[var(--surface-1)] px-3 shadow-xs"
                          options={debts.length
                            ? debts.map((d) => ({ value: d.id, label: d.name || 'Unnamed debt' }))
                            : [{ value: '', label: 'No debts on Balances' }]}
                        />
                      </div>
                    </Label>
                  )}
                  <ToolField label={isDebt ? 'Pay off at age' : 'Starts at age'} value={raw.age} onChange={(v) => patchEvent(e.id, { age: v })} />
                  {!isDebt && <Label className="block">
                    <span className="text-[12px] text-[var(--text-muted)]">Repeats</span>
                    <div className="mt-1">
                      <Dropdown
                        label="Repeats"
                        hideLabel
                        value={e.repeat}
                        onChange={(v: string) => patchEvent(e.id, { repeat: v as RetireEvent['repeat'] })}
                        className="h-9 w-full justify-between rounded-lg bg-[var(--surface-1)] px-3 shadow-xs"
                        options={linked ? REPEAT_OPTIONS.filter((o) => o.value === 'once' || o.value === 'year') : REPEAT_OPTIONS}
                      />
                    </div>
                  </Label>}
                  {!isDebt && e.repeat !== 'once' && (linked ? (
                    <Label className="block">
                      <span className="text-[12px] text-[var(--text-muted)]">For how many years</span>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <div className="mt-1 cursor-help rounded-lg bg-[var(--surface-1)] px-3 py-2 text-[13px] tnum ring-1 ring-[var(--ring)]">
                            {stockPayout.years}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[260px]">Set by the payout years in the Equity payout tool.</TooltipContent>
                      </UITooltip>
                    </Label>
                  ) : (
                    <div className="relative">
                      {e.kind === 'in' && raw.untilRetire ? (
                        <Label className="block">
                          <span className="inline-flex items-center gap-1 text-[12px] text-[var(--text-muted)]">
                            For how many years
                            <InfoTip tip={`Every year you work, until you retire at ${c.retireAge}. It follows the retire age if you change it.`} size={12} />
                          </span>
                          <div className="mt-1 rounded-lg bg-[var(--surface-1)] px-3 py-2 text-[13px] ring-1 ring-[var(--ring)]">Until you retire</div>
                        </Label>
                      ) : (
                        <ToolField label="For how many years" value={raw.years} onChange={(v) => patchEvent(e.id, { years: Math.max(1, v) })} />
                      )}
                      {e.kind === 'in' && (
                        <FieldBadge
                          label="Until retire"
                          active={!!raw.untilRetire}
                          onClick={() => patchEvent(e.id, raw.untilRetire
                            ? { untilRetire: undefined, years: Math.max(1, c.retireAge - raw.age) }
                            : { untilRetire: true })}
                          title="Stop when you retire, whatever the retire age."
                        />
                      )}
                    </div>
                  ))}
                  {e.kind === 'in' && !linked && (
                    <Label className="block">
                      <span className="text-[12px] text-[var(--text-muted)]">Goes into</span>
                      <div className="mt-1">
                        <Dropdown
                          label="Goes into"
                          hideLabel
                          value={raw.to === '401k' ? '401k' : 'savings'}
                          onChange={(v: string) => patchEvent(e.id, { to: v === '401k' ? '401k' : undefined })}
                          className="h-9 w-full justify-between rounded-lg bg-[var(--surface-1)] px-3 shadow-xs"
                          options={EVENT_POOLS}
                        />
                      </div>
                    </Label>
                  )}
                </div>
              </div>
            )
          })}
        </FieldGroup>
      </div>

      {/* investments: what the money is in and what it earns. A second table only if the
          plan changes after retiring. */}
      <Card className="mt-5 p-5">
        <div className="flex items-center gap-1.5 text-[14px] font-semibold">
          Investments
          <InfoTip tip="The funds your savings and 401k are in, and what you expect them to earn. The projection uses the weighted average of these." />
        </div>
        <div className="mt-3">
          <PortfolioTable heading="While working" rows={port} setRows={setPort} />
        </div>
        {portAfter.same ? (
          <Button
            variant="outline"
            size="sm"
            className="mt-5"
            onClick={() => setPortAfter({ same: false, rows: port.map((x) => ({ ...x })) })}
          >
            <Icon name="plus" size={13} />
            I plan to invest differently after retiring
          </Button>
        ) : (
          <div className="mt-6 border-t border-[var(--grid)] pt-5">
            <PortfolioTable
              heading="After retiring"
              rows={portAfter.rows}
              setRows={(rows) => setPortAfter({ same: false, rows })}
              action={
                <Button variant="ghost" size="sm" onClick={() => setPortAfter({ same: true, rows: portAfter.rows })}>
                  Use the same funds after retiring
                </Button>
              }
            />
          </div>
        )}
      </Card>

      {/* headline */}
      <div className="mt-5 flex flex-wrap gap-3">
        <div className="rounded-lg bg-[var(--surface-2)] px-4 py-2.5 ring-1 ring-[var(--ring)]">
          <div className="text-[11px] text-[var(--text-muted)]">At retirement ({c.retireAge})</div>
          <div className="tnum text-[15px] font-semibold">
            {fmt0(atRetirement?.liquid ?? 0)}
            <span className="ml-1.5 text-[12px] font-normal text-[var(--text-muted)]">
              + {fmt0(atRetirement?.locked ?? 0)} locked in 401k
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-[var(--surface-2)] px-4 py-2.5 ring-1 ring-[var(--ring)]">
          <div className="text-[11px] text-[var(--text-muted)]">Money lasts</div>
          <div className="tnum text-[15px] font-semibold" style={{ color: runOutAge ? 'var(--bad)' : 'var(--good)' }}>
            {runOutAge ? `runs out at ${runOutAge}` : `to ${c.endAge}+`}
          </div>
        </div>
        {milestones.map((m) => (
          <div key={m.age} className="rounded-lg bg-[var(--surface-2)] px-4 py-2.5 ring-1 ring-[var(--ring)]">
            <div className="text-[11px] text-[var(--text-muted)]">Left over at {m.age}</div>
            <div className="tnum text-[15px] font-semibold" style={{ color: m.total >= 0 ? 'var(--good)' : 'var(--bad)' }}>
              {fmt0(m.total)}
            </div>
          </div>
        ))}
      </div>

      {/* year table */}
      <Card className="mt-5 p-5">
      <div className="text-[12px] text-[var(--text-muted)]">Year by year</div>
      {(
        <div tabIndex={0} role="region" aria-label="Year by year projection table" className="mt-2 max-h-[420px] overflow-y-auto overflow-x-auto overscroll-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Table className="w-full text-[13px]">
            <TableHeader className="sticky top-0 z-10 bg-transparent backdrop-blur-xl [&_th]:border-b [&_th]:border-[var(--grid)]">
              <TableRow className="text-left text-[11px] text-[var(--text-muted)]">
                <TableHead className="pb-2 pr-3 font-medium">Age</TableHead>
                <TableHead className="pb-2 pr-3 font-medium">
                  <HeaderTip
                    label="Phase"
                    tip={`Working until ${c.retireAge}. Then retired, living off savings while the 401k stays locked. At ${c.accessAge} the 401k ${taxed ? 'opens' : 'joins your savings'}.`}
                  />
                </TableHead>
                <TableHead className="pb-2 pr-3 text-right font-medium">
                  <HeaderTip
                    label="401k"
                    tip={`Your retirement account. ${hasPlan ? 'Your pay plan sets what goes in each year while you work' : `${fmt0(baseContrib401k)} goes in each year while you work${matchPct > 0 ? ` (your share plus a ${matchPct}% employer match)` : ''}`}, plus any money-in events set to the retirement account. It grows tax free and stays locked until ${c.accessAge}${taxed ? '. Then it counts in your total, and new 401k money adds to it, so this column shows a dash. It is taxed as income as you take it out.' : ', when it moves into your savings. After that new 401k money goes straight to savings, so this column shows a dash.'}`}
                    right
                  />
                </TableHead>
                <TableHead className="pb-2 pr-3 text-right font-medium">
                  <HeaderTip
                    label="Contributions"
                    tip={`New money in that year: 401k ${hasPlan ? 'plus savings, as your pay plan sets them' : `(${fmt0(baseContrib401k)}) plus savings (${fmt0(baseContribSavings)})`}, any money-in events, and payments freed up as debts get paid off. The first year is smaller because the 401k starts 3 months in${hasPlan ? ', and so is the first year of each pay period' : ''}. Regular saving stops the year you retire. In the year your 401k unlocks its balance ${taxed ? 'joins the total' : 'moves into savings'} and shows here too.`}
                    right
                  />
                </TableHead>
                <TableHead className="pb-2 pr-3 text-right font-medium">
                  <HeaderTip
                    label="Growth (liquid)"
                    tip={`What your savings earned that year: last year's balance times ${avgReturn.toFixed(2)}%, less ${taxPct}% tax, about ${(avgReturn * (1 - taxPct / 100)).toFixed(2)}% in all. A balance below zero earns nothing. The 401k grows at the full rate${taxed ? ', in its own column until it opens and here after' : ' in its own column'}.`}
                    right
                  />
                </TableHead>
                <TableHead className="pb-2 pr-3 text-right font-medium">
                  <HeaderTip
                    label="Withdrawals"
                    tip={`What you take out each year. Once retired that is ${fmt0(needMo)} a month${ssMonthly > 0 ? `, minus ${fmt0(ssMonthly)} a month of Social Security from age ${c.ss.claimAge}` : ''}. Money-out events, like a down payment, show here in their year.`}
                    right
                  />
                </TableHead>
                <TableHead className="pb-2 pr-3 text-right font-medium">
                  <HeaderTip
                    label="Tax"
                    tip={taxed
                      ? `Income tax on what you take out of your pre-tax 401k that year, in ${STATES[taxState]?.label}. Your savings are spent first, so it starts once they run low. The more you take out in a year, the higher the bracket.`
                      : 'Tax on 401k withdrawals is off, so this stays empty. Turn it on under In retirement.'}
                    right
                  />
                </TableHead>
                <TableHead className="pb-2 text-right font-medium">
                  <HeaderTip
                    label="Total (liquid)"
                    tip={`Money you can spend right now, in your regular savings. The 401k only counts once it unlocks at ${c.accessAge}${taxed ? ', before the tax you pay as you take it out' : ''}. It starts below zero if you turn on Start in debt. Red means the money ran out.`}
                    right
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.age}
                  className={
                    'border-t border-[var(--grid)] hover:bg-[var(--surface-2)] transition-colors' +
                    (row.age === runOutAge ? ' bg-[#2b1616]' : '')
                  }
                >
                  <TableCell className="py-1 pr-3 tnum">{row.age}</TableCell>
                  <TableCell className="py-1 pr-3">
                    <span className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)]">
                      <Dot color={phaseTone(row.phase)} />
                      {row.phase === 'working' ? 'working' : row.phase === 'early-retired' ? 'retired (pre-401k)' : 'retired'}
                    </span>
                  </TableCell>
                  <TableCell className="py-1 pr-3 text-right tnum text-[var(--text-secondary)]">{row.k > 0 ? fmt0(row.k) : '—'}</TableCell>
                  <TableCell className="py-1 pr-3 text-right tnum text-[var(--text-secondary)]">{row.contrib ? fmt0(row.contrib) : '—'}</TableCell>
                  <TableCell className="py-1 pr-3 text-right tnum text-[var(--text-secondary)]">{fmt0(row.growth)}</TableCell>
                  <TableCell className="py-1 pr-3 text-right tnum text-[var(--text-secondary)]">{row.withdrawal ? '−' + fmt0(row.withdrawal) : '—'}</TableCell>
                  <TableCell className="py-1 pr-3 text-right tnum text-[var(--text-secondary)]">{Math.round(row.tax) ? '−' + fmt0(row.tax) : '—'}</TableCell>
                  <TableCell className="py-1 text-right tnum font-medium" style={{ color: row.total >= 0 ? undefined : 'var(--bad)' }}>
                    {fmt0(row.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      </Card>
      <p className="mt-3 text-[12px] text-[var(--text-muted)]">
        This is a simple model. Your funds earn the same return every year, though real markets go up
        and down. Everything is in today's dollars, so there is no inflation.
        {c.ss.on ? ' Social Security is included.' : ' Social Security is left out.'}
        {taxed && ' 401k withdrawals are taxed at today\'s brackets, and Social Security is not counted as taxable income.'} Savings start
        {countDebt ? ' below zero by the amount you owe, and your saving pays that off first' : ' at your savings balance'}.
      </p>
    </div>
  )
}
