import { useCallback } from 'react'
import { persistedStore } from '@/shared/state/persistedStore'
import { ensurePersisted } from '@/shared/utils/ensurePersisted'
import { writePersisted } from '@/shared/utils/writePersisted'
import { trackPersisted } from '@/shared/utils/trackPersisted'

// State saved in localStorage under "ledger:<key>" (filters, drill-down path, tool inputs). Every component that
// uses the same key shares one value, so a change in one place shows up everywhere at once.
export function usePersistedState<T>(
  key: string,
  fallback: T,
  validate?: (v: unknown) => boolean,
): [T, (next: T | ((prev: T) => T)) => void] {
  const first = ensurePersisted(key, fallback, validate)
  const value = persistedStore((s) => (s.entries[key] ?? first).value) as T
  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = persistedStore.getState().entries[key]?.value as T
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(prev) : next
      if (Object.is(resolved, prev)) return
      persistedStore.setState((s) => ({ entries: { ...s.entries, [key]: { value: resolved, raw: writePersisted(key, resolved) } } }))
      trackPersisted(key)
    },
    [key],
  )
  return [value, setValue]
}
