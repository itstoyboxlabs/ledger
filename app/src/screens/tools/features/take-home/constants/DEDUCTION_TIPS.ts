// Take-home pay: gross salary -> net per year/month/paycheck after taxes and
// whatever the user says comes out of their check (401k, insurance, HSA, ...)
import type { DeductionTax } from '@/shared/enums/DeductionTax'

export const DEDUCTION_TIPS: Record<DeductionTax, string> = {
  income: 'Comes out before income tax, but Social Security and Medicare still apply. Still your money if it is a 401k.',
  all: 'Comes out before every tax, including Social Security and Medicare.',
  none: 'Comes out after taxes, so it only lowers the final number.',
}
