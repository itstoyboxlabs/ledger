import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { isAgeEntry } from '@/shared/utils/isAgeEntry'
import { isIsoDate } from '@/shared/utils/isIsoDate'
import type { AgeEntry } from '@/shared/types/AgeEntry'

// The birth date typed on the About you page (`ledger:birthDate`, YYYY-MM-DD or null). Older saves
// have a typed age instead (`ledger:age`, `{ age, asOf }`): until a birth date is entered it is read
// as a fixed age (`savedAge`). Saving a birth date removes that old age, so the birth date wins.
export function useBirthDate() {
  const [birthDate, setStored] = usePersistedState<string | null>('birthDate', null, (v) => v === null || isIsoDate(v))
  const [entry, setEntry] = usePersistedState<AgeEntry | null>('age', null, (v) => v === null || isAgeEntry(v))
  const setBirthDate = (iso: string) => {
    setStored(iso)
    setEntry(null)
  }
  const clear = () => {
    setStored(null)
    setEntry(null)
  }
  return { birthDate, savedAge: birthDate ? null : (entry?.age ?? null), setBirthDate, clear }
}
