import { dataStore } from '@/shared/state/dataStore'

export function getMerchants() {
  return dataStore.getState().merchants
}
