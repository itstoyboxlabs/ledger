import { getBudget } from '@/shared/utils/getBudget'
import { getData } from '@/shared/utils/getData'
import { getLog } from '@/shared/utils/getLog'
import { getNotes } from '@/shared/utils/getNotes'
import { getPresets } from '@/shared/utils/getPresets'
import { readLocalKeys } from '@/shared/utils/readLocalKeys'
import { statementsPart } from '@/shared/utils/statementsPart'
import type { ExportFile } from '@/shared/types/ExportFile'

// One ledger-data.json with everything: the statements as the assistant wrote them and a `settings`
// block (budget, notes, presets, log and every "ledger:" key). Same shape as public/sample-data.json.
// In local mode the parts come from the data folder (transactions.json, budget.json and so on).
export async function buildExport(): Promise<ExportFile> {
  const [data, budget, notes, presets, log] = await Promise.all([
    getData().catch(() => null),
    getBudget().catch(() => null),
    getNotes().catch(() => null),
    getPresets().catch(() => null),
    getLog().catch(() => null),
  ])
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    ...(data ? statementsPart(data) : {}),
    settings: { budget, notes, presets, log, local: readLocalKeys() },
  }
}
