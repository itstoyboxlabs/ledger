import { replacePresets } from '@/shared/utils/replacePresets'
import { saveBudget } from '@/shared/utils/saveBudget'
import { saveLog } from '@/shared/utils/saveLog'
import { saveNotes } from '@/shared/utils/saveNotes'
import { LS_PREFIX } from '@/shared/constants/LS_PREFIX'
import { isObj } from '@/shared/utils/isObj'
import type { ExportSettings } from '@/shared/types/ExportSettings'

export async function applySettings(s: ExportSettings | null | undefined): Promise<void> {
  if (!s) return

  if (isObj(s.budget) && Array.isArray(s.budget.rows)) await saveBudget(s.budget)
  const notes = Array.isArray(s.notes) ? s.notes : s.notes?.notes
  if (Array.isArray(notes)) await saveNotes(notes)
  if (isObj(s.presets)) await replacePresets(s.presets)
  const entries = Array.isArray(s.log) ? s.log : s.log?.entries
  if (Array.isArray(entries)) await saveLog(entries)
  if (isObj(s.local)) {
    try {
      for (const [k, v] of Object.entries(s.local)) {
        if (!k.startsWith(LS_PREFIX)) continue
        localStorage.setItem(k, JSON.stringify(v))
      }
    } catch { /* storage unavailable */ }
  }

}
