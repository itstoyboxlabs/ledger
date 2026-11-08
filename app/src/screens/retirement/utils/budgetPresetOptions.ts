import { budgetExpensesOf } from '@/shared/utils/budgetExpensesOf'
import type { BudgetPresetOption } from '@/screens/retirement/types/BudgetPresetOption'
import type { DismissedSubs } from '@/shared/types/DismissedSubs'
import type { Preset } from '@/shared/types/Preset'
import type { BudgetRow } from '@/shared/types/BudgetRow'

// Each saved Budget preset (key `expenses`) with its monthly expenses, worked out exactly as
// the Budget page would show "Budgeted expenses" after applying it: budgetExpensesOf on the
// preset's rows (old rows normalized, hidden rows and stopped subscriptions skipped,
// subscription rows at their live amount, live subscriptions not in the preset added) with
// today's dismissed subscriptions, since a preset does not store those. Debt payment rows
// count like any other row, as they do on Budget. A preset whose data is not a row list is
// left out.
export function budgetPresetOptions(presets: Preset[], dismissed: DismissedSubs | undefined): BudgetPresetOption[] {
  return presets
    .filter((p) => typeof p?.name === 'string' && Array.isArray(p.data))
    .map((p) => ({ id: p.id ?? '', name: p.name, monthly: budgetExpensesOf({ rows: p.data as BudgetRow[], dismissedSubs: dismissed }) }))
}
