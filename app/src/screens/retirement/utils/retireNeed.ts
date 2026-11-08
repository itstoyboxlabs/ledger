import type { BudgetPresetOption } from '@/screens/retirement/types/BudgetPresetOption'
import type { RetireNeed } from '@/screens/retirement/types/RetireNeed'

// The monthly need the plan uses. With no preset picked it is the typed number, so plans
// saved before Budget presets could be picked give the same results. A picked preset is
// looked up live by name (Budget presets are keyed by name), so editing it moves the need.
// Until presets load, and after the preset is deleted or renamed, the typed number is used.
export function retireNeed(choice: string | null, options: BudgetPresetOption[] | null, typed: number): RetireNeed {
  if (!choice) return { monthly: typed, status: 'typed', preset: null }
  if (!options) return { monthly: typed, status: 'loading', preset: choice }
  const hit = options.find((o) => o.name === choice)
  return hit
    ? { monthly: hit.monthly, status: 'preset', preset: choice }
    : { monthly: typed, status: 'missing', preset: choice }
}
