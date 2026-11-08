import { dataStore } from '@/shared/state/dataStore'

export function getSubscriptions() {
  return dataStore.getState().subscriptions
}
