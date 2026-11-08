import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { currentAge } from '@/shared/utils/currentAge'
import { isAgeEntry } from '@/shared/utils/isAgeEntry'
import type { AgeEntry } from '@/shared/types/AgeEntry'

// The age typed on the About you page (`ledger:age`, `{ age, asOf }` or null). `age` is the
// age today: it goes up by one each January on its own. Null means no age was typed, and
// pages that need one (Retirement) keep their own typed number.
export function useAboutYouAge() {
  const [entry, setEntry] = usePersistedState<AgeEntry | null>('age', null, (v) => v === null || isAgeEntry(v))
  const age = currentAge(entry)
  const setAge = (next: number) => setEntry({ age: Math.max(0, Math.min(120, Math.round(next))), asOf: new Date().getFullYear() })
  const clear = () => setEntry(null)
  return { entry, age, setAge, clear }
}
