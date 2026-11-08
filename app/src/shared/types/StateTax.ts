import type { TaxBracket } from '@/shared/types/TaxBracket'

export interface StateTax {
  label: string
  deduction: number
  brackets: readonly TaxBracket[]
  local?: readonly TaxBracket[]
}
