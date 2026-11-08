import { getStorageMode } from '@/shared/utils/getStorageMode'

export const isLocal = () => getStorageMode() === 'local'
