import { getAccounts } from '@/shared/utils/getAccounts'

// account display name from the data file; unknown ids fall back to the id
export const acctName = (id: string): string => getAccounts()[id]?.name ?? id
