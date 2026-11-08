import { persistedStore } from '@/shared/state/persistedStore'
import { readPersisted } from '@/shared/utils/readPersisted'
import { writePersisted } from '@/shared/utils/writePersisted'
import type { PersistedEntry } from '@/shared/types/PersistedEntry'

// Makes sure the store holds this key, loading it from localStorage the first time it is asked for (and again if
// something else changed localStorage since). It writes the entry straight into the store without notifying, so it
// is safe to call while rendering. Returns the entry { value, raw }.
export function ensurePersisted<T>(key: string, fallback: T, validate?: (v: unknown) => boolean): PersistedEntry<T> {
  const { raw, value } = readPersisted(key, fallback, validate)
  const entries = persistedStore.getState().entries
  const current = entries[key]
  if (current && current.raw === raw) return current as PersistedEntry<T>
  const entry: PersistedEntry<T> = { value, raw: writePersisted(key, value) ?? raw }
  entries[key] = entry
  return entry
}
