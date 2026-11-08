import type { BudgetPresetOption } from '@/screens/retirement/types/BudgetPresetOption'
import type { RetireNeed } from '@/screens/retirement/types/RetireNeed'

// The monthly need the plan uses. With no preset picked it is the typed number, so plans
// saved before Budget presets could be picked give the same results. The pick is a preset
// id, so a rename on Budget keeps it; a name stored before presets had ids still matches
// (the page then saves the id in its place). The preset is looked up live, so editing it
// moves the need. Until presets load, and after the preset is deleted, the typed number
// is used.
export function retireNeed(choice: string | null, options: BudgetPresetOption[] | null, typed: number): RetireNeed {
  if (!choice) return { monthly: typed, status: 'typed', preset: null, id: null }
  if (!options) return { monthly: typed, status: 'loading', preset: null, id: choice }
  const hit = options.find((o) => o.id === choice) ?? options.find((o) => o.name === choice)
  return hit
    ? { monthly: hit.monthly, status: 'preset', preset: hit.name, id: hit.id }
    : { monthly: typed, status: 'missing', preset: null, id: choice }
}
