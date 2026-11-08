import { useAboutYouAge } from '@/shared/hooks/useAboutYouAge'
import { usePersistedState } from '@/shared/hooks/usePersistedState'

// Retirement's current age: the About you age while the Auto badge is on (the default once
// an age is saved there), otherwise the age typed on this page. With no About you age the
// typed age is used, exactly as before. The switch is `ledger:retireAgeAuto` and is not part
// of Retirement presets.
export function useRetireAge(typedAge: number) {
  const { age: aboutAge } = useAboutYouAge()
  const [autoOn, setAutoOn] = usePersistedState<boolean>('retireAgeAuto', true, (v) => typeof v === 'boolean')
  const auto = autoOn && aboutAge != null
  return {
    age: auto && aboutAge != null ? aboutAge : typedAge,
    auto,
    aboutAge,
    toggle: () => setAutoOn(!auto),
  }
}
