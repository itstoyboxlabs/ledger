import { dataStore } from '@/shared/state/dataStore'

export function getPeriods() {
  return dataStore.getState().periods
}
