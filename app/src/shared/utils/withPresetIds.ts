import { presetIdFor } from '@/shared/utils/presetIdFor'
import type { Preset } from '@/shared/types/Preset'

// The list with an id on every preset. A preset without one gets an id made from its name
// (a repeated name gets a suffix so ids stay unique). Names and data never change.
// Returns the same list when nothing was missing.
export function withPresetIds<T>(list: Preset<T>[]): Preset<T>[] {
  if (list.every((p) => typeof p.id === 'string' && p.id)) return list
  const used = new Set(list.map((p) => p.id).filter(Boolean))
  return list.map((p) => {
    if (typeof p.id === 'string' && p.id) return p
    let id = presetIdFor(p.name)
    for (let n = 2; used.has(id); n++) id = `${presetIdFor(p.name)}_${n}`
    used.add(id)
    return { id, name: p.name, data: p.data }
  })
}
