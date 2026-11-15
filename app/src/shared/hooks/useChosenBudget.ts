import { useEffect, useMemo, useState } from 'react'
import { getBudget } from '@/shared/utils/getBudget'
import { readBudgetPreset } from '@/shared/utils/readBudgetPreset'
import { usePresets } from '@/shared/hooks/usePresets'
import type { BudgetFile } from '@/shared/types/BudgetFile'
import type { BudgetPresetData } from '@/shared/types/BudgetPresetData'
import type { BudgetRow } from '@/shared/types/BudgetRow'

// The Budget a tool is working from: today's Budget, or a saved Budget when its id is given (a saved
// Budget brings its own removed subscriptions). Null until the Budget loads. `options` fills a picker.
export function useChosenBudget(id: string): {
  budget: Pick<BudgetFile, 'rows' | 'dismissedSubs'> | null
  options: { value: string; label: string }[]
} {
  const [file, setFile] = useState<BudgetFile | null>(null)
  const { presets } = usePresets<BudgetPresetData | BudgetRow[]>('expenses', { ids: true })
  useEffect(() => {
    getBudget()
      .then(setFile)
      .catch(() => {})
  }, [])
  const options = [{ value: 'today', label: "Today's Budget" }, ...presets.filter((p) => p.id).map((p) => ({ value: p.id as string, label: p.name }))]
  const picked = id ? readBudgetPreset(presets.find((p) => p.id === id)?.data) : null
  const budget = useMemo(
    () => (file ? { rows: picked?.rows ?? file.rows, dismissedSubs: picked?.dismissedSubs ?? file.dismissedSubs } : null),
    [file, picked],
  )
  return { budget, options }
}
