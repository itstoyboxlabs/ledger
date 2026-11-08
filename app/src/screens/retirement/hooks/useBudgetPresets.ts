import { useEffect, useState } from 'react'
import { getBudget } from '@/shared/utils/getBudget'
import { getPresets } from '@/shared/utils/getPresets'
import { budgetExpensesOf } from '@/shared/utils/budgetExpensesOf'
import { budgetPresetOptions } from '@/screens/retirement/utils/budgetPresetOptions'
import type { Presets } from '@/shared/types/Presets'
import type { BudgetPresetOption } from '@/screens/retirement/types/BudgetPresetOption'

type BudgetPresets = {
  // saved Budget presets with their monthly expenses, null until they load
  options: BudgetPresetOption[] | null
  // today's Budget "Budgeted expenses", null until it loads or when Budget has no rows of its own
  today: number | null
}

// Budget presets and today's Budget expenses, read once when Retirement opens. Budget is
// its own page, so coming back here after editing a preset reads it again.
export function useBudgetPresets(): BudgetPresets {
  const [state, setState] = useState<BudgetPresets>({ options: null, today: null })
  useEffect(() => {
    let live = true
    Promise.all([getPresets().catch((): Presets => ({})), getBudget().catch(() => null)])
      .then(([presets, budget]) => {
        if (!live) return
        const list = Array.isArray(presets?.expenses) ? presets.expenses : []
        const rows = budget?.rows ?? []
        setState({
          options: budgetPresetOptions(list, budget?.dismissedSubs),
          // the same rule the app uses for "Budgeted expenses" elsewhere: none until there is a row of your own
          today: budget && rows.some((r) => r.source !== 'subscription') ? budgetExpensesOf(budget) : null,
        })
      })
    return () => { live = false }
  }, [])
  return state
}
