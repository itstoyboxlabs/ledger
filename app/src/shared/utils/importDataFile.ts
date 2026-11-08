import { applyData } from '@/shared/utils/applyData'
import { applySettings } from '@/shared/utils/applySettings'
import { clearStoredData } from '@/shared/utils/clearStoredData'
import { getAllTxns } from '@/shared/utils/getAllTxns'
import { idbGet } from '@/shared/utils/idbGet'
import { idbSet } from '@/shared/utils/idbSet'
import { isLocal } from '@/shared/utils/isLocal'
import { isObj } from '@/shared/utils/isObj'
import { setData } from '@/shared/utils/setData'
import { statementsPart } from '@/shared/utils/statementsPart'
import { validateDataFile } from '@/shared/utils/validateDataFile'
import type { ImportResult } from '@/shared/types/ImportResult'

// Replace what this browser stores with a validated file, persist it and re-derive.
// The file replaces the parts it has and nothing is merged into what was stored before:
// - A full file (statements and `settings`, which is what Export data writes) wipes everything first
//   (statements, budget, log, notes, presets and every "ledger:" key), then writes the file.
// - A statements-only file (a first file from the assistant, or an older one) replaces the statements and
//   keeps the settings. A settings-only file (an old ledger-settings.json backup) replaces the settings
//   and keeps the statements. So an old-style file never destroys the other half.
// - Except over the sample: when the sample is loaded, any file wipes everything first, so nothing from
//   the sample survives. Pass { sample: true } when loading the sample itself.
export async function importDataFile(f: unknown, { sample = false }: { sample?: boolean } = {}): Promise<ImportResult> {
  if (isLocal()) throw new Error('Importing is off in local mode. Your data lives in the data folder.')
  validateDataFile(f)

  const data = Array.isArray(f.transactions)
  const settings = isObj(f.settings)
  const overSample = (await idbGet<boolean>('sample')) === true
  await clearStoredData(overSample || (data && settings) ? 'all' : data ? 'statements' : 'settings')
  if (data) {
    const statements = statementsPart(f)
    await setData(statements)
    applyData(statements)
  }
  await applySettings(f.settings)
  if (sample) await idbSet('sample', true)
  return { transactions: getAllTxns().length, data, settings }
}
