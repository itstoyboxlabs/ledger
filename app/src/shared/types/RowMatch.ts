import type { MatchCat } from '@/shared/types/MatchCat'

// Which transactions count toward a budget row's Actual.
export interface RowMatch {
  merchant?: string
  merchants?: string[]
  cat?: string
  sub?: string
  cats?: MatchCat[]
}
