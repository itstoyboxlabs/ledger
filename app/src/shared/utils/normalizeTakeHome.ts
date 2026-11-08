import { is401kKind } from '@/shared/utils/is401kKind'
import { takeHomeDeductionsRaw } from '@/shared/utils/takeHomeDeductionsRaw'
import type { RawTakeHome } from '@/shared/types/RawTakeHome'
import type { TakeHome } from '@/shared/types/TakeHome'

// `match` is the employer match on a 401k deduction, as a percent of your own
// contribution (100 = dollar for dollar). It is not deducted from pay.
export function normalizeTakeHome(th: RawTakeHome): TakeHome {
  return {
    salary: th.salary,
    deductions: takeHomeDeductionsRaw(th).map((d) => ({ ...d, match: is401kKind(d.kind) ? Number(d.match) || 0 : 0 })),
  }
}
