import type { PersistedEntry } from '@/shared/types/PersistedEntry'

export interface PersistedStoreState {
  entries: Record<string, PersistedEntry>
}
