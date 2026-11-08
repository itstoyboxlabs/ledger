import { storageModeStore } from '@/shared/state/storageModeStore'

export function getStorageMode() {
  return storageModeStore.getState().mode
}
