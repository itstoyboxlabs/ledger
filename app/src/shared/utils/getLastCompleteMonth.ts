import { dataStore } from '@/shared/state/dataStore'

export function getLastCompleteMonth() {
  return dataStore.getState().lastCompleteMonth
}
