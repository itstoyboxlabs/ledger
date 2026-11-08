import type { SumTerm } from '@/shared/types/SumTerm'

export interface SumExpr {
  terms: SumTerm[]
  total: number
}
