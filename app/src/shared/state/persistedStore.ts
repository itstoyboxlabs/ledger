import { create } from 'zustand'
import type { PersistedStoreState } from '@/shared/types/PersistedStoreState'

// Every value saved under a "ledger:<key>" localStorage key, shared by all components that use it.
// entries[key] is { value, raw }, where raw is the JSON string last seen in localStorage. Two components that ask
// for the same key get the same value and re-render together, which is how Take-home pay can feed Rent scenarios.
export const persistedStore = create<PersistedStoreState>()(() => ({ entries: {} }))
