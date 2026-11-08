import type { Transaction } from '@/shared/types/Transaction'

export interface RollupGroup {
  name: string
  total: number
  count: number
  txns: Transaction[]
}
