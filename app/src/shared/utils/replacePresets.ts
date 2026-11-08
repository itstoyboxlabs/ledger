import { idbSet } from '@/shared/utils/idbSet'
import type { Presets } from '@/shared/types/Presets'

// whole-object replace, used by import (browser mode only)
export async function replacePresets(all: Presets): Promise<void> {
  return idbSet('presets', all)
}
