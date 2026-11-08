import { getBudget } from '@/shared/utils/getBudget'
import { getLog } from '@/shared/utils/getLog'
import { getNotes } from '@/shared/utils/getNotes'
import { getPresets } from '@/shared/utils/getPresets'
import { readLocalKeys } from '@/shared/utils/readLocalKeys'
import type { SettingsFile } from '@/shared/types/SettingsFile'

// build the file from whatever is loaded right now
export async function buildExport(): Promise<SettingsFile> {
  const [budget, notes, presets, log] = await Promise.all([
    getBudget().catch(() => null),
    getNotes().catch(() => null),
    getPresets().catch(() => null),
    getLog().catch(() => null),
  ])
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: { budget, notes, presets, log, local: readLocalKeys() },
  }
}
