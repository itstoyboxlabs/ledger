import type { AccountType } from '@/shared/enums/AccountType'

export interface Account {
  name: string
  bank: string
  type: AccountType
  last4: string
}
