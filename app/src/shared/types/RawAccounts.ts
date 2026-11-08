import type { Account } from '@/shared/types/Account'

// Accounts as a file can carry them. Old files used a bare label string: { chk: "Checking ••1234" }.
export type RawAccounts = Record<string, Partial<Account> | string>
