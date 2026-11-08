import { idbSet } from '@/shared/utils/idbSet'

// Resets the fake IndexedDB to an empty ledger, then writes whatever the test passes in.
// Call it in beforeEach:  await seedStorage({ budget: { rows: [...] }, log: { entries: [...] } })
// Keys: budget, log, notes, presets, data, sample. Read results back with the real getBudget, getLog and so on.
export async function seedStorage(initial = {}) {
  const db = { budget: { rows: [] }, log: { entries: [] }, notes: { notes: [] }, presets: {}, data: null, sample: null, ...initial }
  for (const [key, value] of Object.entries(db)) await idbSet(key, structuredClone(value))
}
