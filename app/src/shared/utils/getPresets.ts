import { httpGet } from '@/shared/utils/httpGet'
import { idbGet } from '@/shared/utils/idbGet'
import { isLocal } from '@/shared/utils/isLocal'
import type { Presets } from '@/shared/types/Presets'

/* ---------- presets { <toolKey>: [{name, data}] } ---------- */

export async function getPresets(): Promise<Presets> {
  if (isLocal()) return httpGet<Presets>('/api/presets')
  return (await idbGet<Presets>('presets')) ?? {}
}
