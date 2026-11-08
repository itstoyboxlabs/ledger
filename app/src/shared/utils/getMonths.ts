import { dataStore } from '@/shared/state/dataStore'

export function getMonths() {
  return dataStore.getState().months
}
