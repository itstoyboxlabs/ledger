import { getAllTxns } from '@/shared/utils/getAllTxns'
import { isLocal } from '@/shared/utils/isLocal'
import { applySettings } from '@/shared/utils/applySettings'
import { mergeData } from '@/shared/utils/mergeData'
import { validateDataFile } from '@/shared/utils/validateDataFile'
import type { ImportResult } from '@/shared/types/ImportResult'

// merge a validated file into what is loaded, persist it, and re-derive.
// A file with transactions is a data file, a file with settings is a settings file,
// and a file with both does both.
// transactions: union by id, file wins. accounts, merchants and periods: merge by key.
// Legacy string accounts are upgraded to { name, bank, type, last4 } first.
// subscriptions: merge by name. settings: only keys present in the file.
export async function importDataFile(f: unknown): Promise<ImportResult> {
  if (isLocal()) throw new Error('Importing is off in local mode. Your data lives in the data folder.')
  validateDataFile(f)

  if (Array.isArray(f.transactions)) await mergeData(f)
  await applySettings(f.settings)
  return { transactions: getAllTxns().length, data: Array.isArray(f.transactions), settings: !!f.settings }
}
