import { idbSet } from '@/shared/utils/idbSet'
import { isLocal } from '@/shared/utils/isLocal'
import type { TransactionsData } from '@/shared/types/TransactionsData'

// browser mode only. In local mode data/transactions.json is written by an assistant
// from the statements, never by the app.
export async function setData(data: TransactionsData): Promise<void> {
  if (isLocal()) return
  return idbSet('data', data)
}
