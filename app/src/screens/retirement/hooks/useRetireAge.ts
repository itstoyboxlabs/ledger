import { usePlanningAge } from '@/shared/hooks/usePlanningAge'
import { usePersistedState } from '@/shared/hooks/usePersistedState'

// Retirement's current age: the About you age while the Auto badge is on (the default once
// About you has a birth date or an old typed age), otherwise the age typed on this page. The
// About you age is measured on the day Balances was last updated (see usePlanningAge), so the
// plan starts from the same day as the balances it uses. With no About you age the typed age is
// used, exactly as before. The switch is `ledger:retireAgeAuto` and is not part of Retirement presets.
export function useRetireAge(typedAge: number) {
  const planning = usePlanningAge()
  const [autoOn, setAutoOn] = usePersistedState<boolean>('retireAgeAuto', true, (v) => typeof v === 'boolean')
  const auto = autoOn && planning != null
  return {
    age: auto && planning ? planning.age : typedAge,
    auto,
    aboutAge: planning?.age ?? null,
    planning,
    toggle: () => setAutoOn(!auto),
  }
}
