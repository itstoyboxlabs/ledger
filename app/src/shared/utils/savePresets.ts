import { httpPost } from '@/shared/utils/httpPost'
import { idbGet } from '@/shared/utils/idbGet'
import { idbSet } from '@/shared/utils/idbSet'
import { isLocal } from '@/shared/utils/isLocal'
import type { Preset } from '@/shared/types/Preset'
import type { Presets } from '@/shared/types/Presets'

export async function savePresets(key: string, presets: Preset[]): Promise<void> {
  if (isLocal()) return httpPost('/api/presets', { key, presets })
  const all = (await idbGet<Presets>('presets')) ?? {}
  all[key] = presets
  return idbSet('presets', all)
}
