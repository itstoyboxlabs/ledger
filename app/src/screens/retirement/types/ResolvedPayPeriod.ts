import type { SimPayPeriod } from '@/screens/retirement/types/SimPayPeriod'

// A pay period with its presets looked up. `missingPay` and `missingSave` mean the chosen
// Take-home or Budget preset is gone and the typed values are used instead.
export interface ResolvedPayPeriod {
  id: string
  sim: SimPayPeriod
  missingPay: boolean
  missingSave: boolean
}
