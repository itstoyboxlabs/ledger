import type { Transaction } from '@/shared/types/Transaction'

// Spending in a month that no budget row claims, shown read-only under the real rows.
export interface GhostRow {
  id: string
  name: string
  amount: number
  txns: Transaction[]
  __ghost: true
}
