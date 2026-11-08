import { normalizeAccounts } from '@/shared/utils/normalizeAccounts'
import type { RawTransactionsData } from '@/shared/types/RawTransactionsData'
import type { TransactionsData } from '@/shared/types/TransactionsData'

// Adds the statements part of one file to another. Used to combine several files uploaded at once.
// transactions: union by id, the later file wins, and a statement that appears again replaces the old copy
// whole (so rows whose ids changed between two versions are not kept twice). accounts, merchants and
// periods: merge by key. subscriptions: merge by name. Legacy string accounts are upgraded first.
export function mergeStatements(base: TransactionsData, f: RawTransactionsData): TransactionsData {
  const incoming = new Set((f.transactions ?? []).map((t) => t.statement).filter((s): s is string => !!s))
  const txns = new Map(base.transactions.filter((t) => !t.statement || !incoming.has(t.statement)).map((t) => [t.id, t]))
  for (const t of f.transactions ?? []) txns.set(t.id, t)
  const subs = new Map(base.subscriptions.map((s) => [s.name, s]))
  for (const s of f.subscriptions ?? []) subs.set(s.name, s)
  return {
    accounts: { ...base.accounts, ...normalizeAccounts(f.accounts) },
    merchants: { ...base.merchants, ...(f.merchants ?? {}) },
    periods: { ...base.periods, ...(f.periods ?? {}) },
    subscriptions: [...subs.values()],
    transactions: [...txns.values()].sort((a, b) => a.date.localeCompare(b.date)),
  }
}
