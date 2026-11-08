import type { RawAccounts } from '@/shared/types/RawAccounts'
import type { Accounts } from '@/shared/types/Accounts'
import { AccountType } from '@/shared/enums/AccountType'
// Accounts are { id: { name, bank, type: 'checking'|'savings'|'card', last4 } }.
// The legacy shape { chk: "Checking ••1234" } is upgraded here: the label becomes
// the name, and the type is card for the id `cc` or a label with "Card" in it.
export function normalizeAccounts(accounts: RawAccounts | undefined): Accounts {
  const out: Accounts = {}
  for (const [id, a] of Object.entries(accounts ?? {})) {
    if (typeof a === 'string') {
      out[id] = {
        name: a,
        bank: '',
        type: id === 'cc' || /card/i.test(a) ? AccountType.card : AccountType.checking,
        last4: (a.match(/(\d{4})\s*$/) ?? [])[1] ?? '',
      }
    } else if (a && typeof a === 'object') {
      out[id] = {
        name: a.name ?? id,
        bank: a.bank ?? '',
        type: (Object.values(AccountType) as string[]).includes(a.type as string) ? (a.type as AccountType) : AccountType.checking,
        last4: a.last4 ?? '',
      }
    }
  }
  return out
}
