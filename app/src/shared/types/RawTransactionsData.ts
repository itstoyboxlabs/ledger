import type { DataFile } from '@/shared/types/DataFile'

// The statements part of a file as it arrives, before accounts are upgraded. Every section may be missing.
export type RawTransactionsData = Pick<DataFile, 'accounts' | 'merchants' | 'periods' | 'subscriptions' | 'transactions'>
