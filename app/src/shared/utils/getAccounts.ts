import { dataStore } from '@/shared/state/dataStore'

export function getAccounts() {
  return dataStore.getState().accounts
}
