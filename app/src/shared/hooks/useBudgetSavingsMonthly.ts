import { useEffect, useState } from 'react'
import { useBudgetIncome } from '@/shared/hooks/useBudgetIncome'
import { usePresets } from '@/shared/hooks/usePresets'
import { budgetSavingsYearly } from '@/shared/utils/budgetSavingsYearly'
import { getBudget } from '@/shared/utils/getBudget'
import { readBudgetPreset } from '@/shared/utils/readBudgetPreset'
import type { BudgetFile } from '@/shared/types/BudgetFile'
import type { BudgetPresetData } from '@/shared/types/BudgetPresetData'
import type { BudgetRow } from '@/shared/types/BudgetRow'

// What a Budget puts into savings each month: the savings share of the leftover, or all of it when
// the leftover is not split. Today's Budget, or a saved Budget preset when its id is given (a preset
// brings its own split and removed subscriptions, or today's when it was saved without them).
// Retirement saves the same money. 0 until the Budget loads.
export function useBudgetSavingsMonthly(presetId = ''): number {
  const income = useBudgetIncome()
  const [file, setFile] = useState<BudgetFile | null>(null)
  const { presets } = usePresets<BudgetPresetData | BudgetRow[]>('expenses', { ids: true })
  useEffect(() => {
    getBudget()
      .then(setFile)
      .catch(() => {})
  }, [])
  if (!file) return 0
  const preset = presetId ? readBudgetPreset(presets.find((p) => p.id === presetId)?.data) : null
  if (!preset) return budgetSavingsYearly(file, file.rows, income) / 12
  return budgetSavingsYearly({ leftover: preset.leftover ?? file.leftover, dismissedSubs: preset.dismissedSubs ?? file.dismissedSubs }, preset.rows, income) / 12
}
