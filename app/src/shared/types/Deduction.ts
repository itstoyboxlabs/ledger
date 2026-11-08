import type { DeductionKind } from '@/shared/enums/DeductionKind'
import type { DeductionUnit } from '@/shared/enums/DeductionUnit'

// One thing that comes out of a paycheck. `match` is the employer match on a 401k, as a percent of your own
// contribution (100 = dollar for dollar). It is not deducted from pay.
export interface Deduction {
  id: string
  kind: DeductionKind
  unit: DeductionUnit
  amount: number
  match?: number
}
