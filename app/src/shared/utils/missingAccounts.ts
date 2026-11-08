import { coverage } from '@/shared/utils/coverage'
import { getAccounts } from '@/shared/utils/getAccounts'

// ids of accounts whose statements do not fully cover a YYYY-MM month
export function missingAccounts(ym: string): string[] {
  return Object.keys(getAccounts()).filter((id) => !coverage(ym, id).full)
}
