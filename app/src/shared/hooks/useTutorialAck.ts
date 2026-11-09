import { usePersistedState } from '@/shared/hooks/usePersistedState'

// Whether the person has seen the "watch the tutorials" nudge (`ledger:tutorialAck`, true once they press Okay or
// open the tutorial). It is a plain `ledger:` key, so it travels in the exported file like the rest.
export function useTutorialAck() {
  const [acknowledged, setAcknowledged] = usePersistedState<boolean>('tutorialAck', false, (v) => typeof v === 'boolean')
  return { acknowledged, acknowledge: () => setAcknowledged(true) }
}
