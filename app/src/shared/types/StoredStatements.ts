import type { DataFile } from '@/shared/types/DataFile'
import type { TransactionsData } from '@/shared/types/TransactionsData'

// The statements part of a file as the browser keeps it: every section the assistant writes,
// including `updated` and the top-level `notes`, so an export gives back exactly what was uploaded.
export type StoredStatements = TransactionsData & Pick<DataFile, 'updated' | 'notes'>
