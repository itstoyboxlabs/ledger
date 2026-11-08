import type { TransactionsData } from '@/shared/types/TransactionsData'

export interface DataStoreState extends TransactionsData {
  months: string[] // YYYY-MM, oldest first
  lastCompleteMonth: string | undefined
}
