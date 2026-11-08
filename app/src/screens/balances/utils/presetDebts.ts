import type { Debt } from '@/shared/types/Debt'
import { isDebtList } from '@/shared/utils/isDebtList'
import { isLegacyDebts } from '@/shared/utils/isLegacyDebts'
import { normalizeDebts } from '@/shared/utils/normalizeDebts'

// The debts a saved Balances preset holds, or null when it has none. Old presets may also carry a
// `taxState`, which is ignored here.
export function presetDebts(data: unknown): Debt[] | null {
  const d = data as { debts?: unknown } | null | undefined
  if (isDebtList(d?.debts) || isLegacyDebts(d?.debts)) return normalizeDebts(d?.debts)
  return null
}
