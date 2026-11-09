import { persistedStore } from '@/shared/state/persistedStore'
import { readPersisted } from '@/shared/utils/readPersisted'
import { usePlanningAge } from '@/shared/hooks/usePlanningAge'

// Read a saved key without writing a default back, so a page that only looks at Retirement's
// settings never creates them.
function usePeek(key: string): unknown {
  const live = persistedStore((s) => s.entries[key]?.value)
  return live !== undefined ? live : readPersisted<unknown>(key, undefined).value
}

// The age Retirement plans from, for pages that show ages without being Retirement (Balances):
// the About you age while Retirement's Auto age is on (the default), otherwise the age typed on
// Retirement. Null when neither is known. Matches useRetireAge on the Retirement page.
export function usePlanStartAge(): number | null {
  const planning = usePlanningAge()
  const autoOn = usePeek('retireAgeAuto') !== false
  const plan = usePeek('retireCalc')
  const typed = plan && typeof plan === 'object' && Number.isFinite((plan as { age?: unknown }).age)
    ? (plan as { age: number }).age
    : null
  if (planning && (autoOn || typed === null)) return planning.age
  return typed
}
