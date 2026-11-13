import type { PayContext } from '@/screens/retirement/types/PayContext'
import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'
import type { ResolvedPayPeriod } from '@/screens/retirement/types/ResolvedPayPeriod'
import { budgetSavingsYearly } from '@/shared/utils/budgetSavingsYearly'
import { readBudgetPreset } from '@/shared/utils/readBudgetPreset'
import { payBreakdown } from '@/screens/retirement/utils/payBreakdown'

// Looks up each period's presets. The 401k comes from today's Take-home tool or a
// Take-home preset (its 401k line and match at its salary, no line means 0), or the
// typed dollars. Savings come from the Budget leftover (today's rows or a preset's, with
// the income the Budget would have with that period's Take-home setup), or the typed
// dollars. A preset that no longer exists falls back to the typed values.
export function resolvePayPeriods(periods: PayPeriod[], ctx: PayContext): ResolvedPayPeriod[] {
  return periods.map((p) => {
    const thPreset = p.takeHomeFrom === 'preset' ? ctx.takeHomePresets.find((x) => x.id === p.takeHomePreset) : undefined
    const missingPay = p.takeHomeFrom === 'preset' && !thPreset
    const typedPay = p.takeHomeFrom === 'typed' || missingPay
    const th = thPreset?.data ?? ctx.takeHome
    const m = typedPay ? null : payBreakdown(th, ctx.taxState, ctx.filing)
    const rowsPreset = p.saveFrom === 'preset' ? ctx.budgetPresets.find((x) => x.id === p.savePreset) : undefined
    const missingSave = p.saveFrom === 'preset' && !rowsPreset
    const preset = rowsPreset ? readBudgetPreset(rowsPreset.data) : null
    const rows = p.saveFrom === 'today' ? ctx.budget?.rows : preset?.rows
    // a preset brings its own leftover split and removed subscriptions, unless it was saved before it held them
    const source = ctx.budget && p.saveFrom === 'preset' && preset
      ? { leftover: preset.leftover ?? ctx.budget.leftover, dismissedSubs: preset.dismissedSubs ?? ctx.budget.dismissedSubs }
      : ctx.budget
    const saving = p.saveFrom === 'typed' || missingSave
      ? p.savings
      : source && rows ? budgetSavingsYearly(source, rows, ctx.incomeOf(th)) : 0
    return {
      id: p.id,
      sim: {
        fromAge: p.fromAge, toAge: p.toAge, raisePct: p.raisePct,
        own: m ? m.own : p.k401, match: m ? m.match : 0, capOwn: !!m, saving,
      },
      missingPay,
      missingSave,
    }
  })
}
