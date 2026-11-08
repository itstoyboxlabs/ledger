import { dataStore } from '@/shared/state/dataStore'

export function getAllTxns() {
  return dataStore.getState().transactions
}
