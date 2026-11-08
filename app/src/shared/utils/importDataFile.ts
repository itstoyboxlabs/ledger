import { applyData } from '@/shared/utils/applyData'
import { applySettings } from '@/shared/utils/applySettings'
import { clearStoredData } from '@/shared/utils/clearStoredData'
import { getAllTxns } from '@/shared/utils/getAllTxns'
import { isLocal } from '@/shared/utils/isLocal'
import { mergeStatements } from '@/shared/utils/mergeStatements'
import { setData } from '@/shared/utils/setData'
import { validateDataFile } from '@/shared/utils/validateDataFile'
import type { ImportResult } from '@/shared/types/ImportResult'

// Replace what this browser stores with a validated file, persist it and re-derive.
// A file with transactions wipes everything first (statements, budget, log, notes, presets and every
// "ledger:" key), so nothing from earlier data such as the sample survives. A settings-only file wipes
// the settings and keeps the statements, so a backup can follow the data file it belongs to.
export async function importDataFile(f: unknown): Promise<ImportResult> {
  if (isLocal()) throw new Error('Importing is off in local mode. Your data lives in the data folder.')
  validateDataFile(f)

  const data = Array.isArray(f.transactions)
  await clearStoredData(data ? 'all' : 'settings')
  if (data) {
    const statements = mergeStatements({ accounts: {}, merchants: {}, periods: {}, subscriptions: [], transactions: [] }, f)
    await setData(statements)
    applyData(statements)
  }
  await applySettings(f.settings)
  return { transactions: getAllTxns().length, data, settings: !!f.settings }
}
