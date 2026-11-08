import { httpGet } from '@/shared/utils/httpGet'
import { idbGet } from '@/shared/utils/idbGet'
import { isLocal } from '@/shared/utils/isLocal'
import type { RawTransactionsData } from '@/shared/types/RawTransactionsData'

/* ---------- transactions file { accounts, periods, subscriptions, transactions } ---------- */

// null when nothing is loaded yet (browser mode before the first import)
export async function getData(): Promise<RawTransactionsData | null> {
  if (isLocal()) return httpGet<RawTransactionsData>('/api/transactions')
  return (await idbGet<RawTransactionsData>('data')) ?? null
}
