import type { TaxBracket } from '@/shared/types/TaxBracket'

export interface FederalTax {
  standardDeduction: number
  brackets: readonly TaxBracket[]
}
