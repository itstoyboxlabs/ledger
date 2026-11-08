import { applyData } from '@/shared/utils/applyData'
import { getAccounts } from '@/shared/utils/getAccounts'
import { getAllTxns } from '@/shared/utils/getAllTxns'
import { getMerchants } from '@/shared/utils/getMerchants'
import { getPeriods } from '@/shared/utils/getPeriods'
import { getSubscriptions } from '@/shared/utils/getSubscriptions'
import { normalizeAccounts } from '@/shared/utils/normalizeAccounts'
import { setData } from '@/shared/utils/setData'
import { LS_PREFIX } from '@/shared/constants/LS_PREFIX'
import type { RawTransactionsData } from '@/shared/types/RawTransactionsData'
import type { TransactionsData } from '@/shared/types/TransactionsData'

export async function mergeData(f: RawTransactionsData): Promise<void> {
  // a re-imported (corrected) statement replaces the old copy of that statement whole,
  // so rows whose ids changed between the two versions are not kept twice
  const incoming = new Set((f.transactions ?? []).map((t) => t.statement).filter((s): s is string => !!s))
  const txns = new Map(getAllTxns().filter((t) => !t.statement || !incoming.has(t.statement)).map((t) => [t.id, t]))
  for (const t of f.transactions ?? []) txns.set(t.id, t)
  const subs = new Map(getSubscriptions().map((s) => [s.name, s]))
  for (const s of f.subscriptions ?? []) subs.set(s.name, s)

  const merged: TransactionsData = {
    accounts: { ...getAccounts(), ...normalizeAccounts(f.accounts) },
    merchants: { ...getMerchants(), ...(f.merchants ?? {}) },
    periods: { ...getPeriods(), ...(f.periods ?? {}) },
    subscriptions: [...subs.values()],
    transactions: [...txns.values()].sort((a, b) => a.date.localeCompare(b.date)),
  }
  await setData(merged)
  // an account that is new to this browser starts switched on in Spending
  const fresh = Object.keys(merged.accounts).filter((id) => !(id in getAccounts()))
  if (fresh.length) {
    try {
      const raw = localStorage.getItem(LS_PREFIX + 'accounts')
      const saved = raw && JSON.parse(raw)
      if (Array.isArray(saved)) localStorage.setItem(LS_PREFIX + 'accounts', JSON.stringify([...saved, ...fresh]))
    } catch { /* storage unavailable */ }
  }
  applyData(merged)
}
