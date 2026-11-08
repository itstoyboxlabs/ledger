import type { BudgetFile } from '@/shared/types/BudgetFile'
import type { BudgetRow } from '@/shared/types/BudgetRow'
import type { Preset } from '@/shared/types/Preset'
import type { RawTakeHome } from '@/shared/types/RawTakeHome'

// What pay periods are looked up against. `budget` is null until the Budget loads.
// `incomeOf` is the Budget's monthly income for a Take-home setup, by the Budget's own
// income rules (statements, a typed amount, or the Take-home tool).
export interface PayContext {
  takeHome: RawTakeHome
  takeHomePresets: Preset<RawTakeHome>[]
  budget: BudgetFile | null
  budgetPresets: Preset<BudgetRow[]>[]
  taxState: string
  incomeOf: (th: RawTakeHome) => number
}
