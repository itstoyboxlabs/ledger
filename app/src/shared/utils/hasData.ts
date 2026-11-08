import { getAllTxns } from '@/shared/utils/getAllTxns'

export function hasData() {
  return getAllTxns().length > 0
}
