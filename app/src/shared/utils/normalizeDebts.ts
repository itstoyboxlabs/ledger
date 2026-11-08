import { LEGACY_DEBTS } from '@/shared/constants/LEGACY_DEBTS'
import { isDebtList } from '@/shared/utils/isDebtList'
import { isLegacyDebts } from '@/shared/utils/isLegacyDebts'
import type { Debt } from '@/shared/types/Debt'

export function normalizeDebts(v: unknown): Debt[] {
  if (isDebtList(v)) {
    return v.map((d) => ({
      id: d.id,
      name: typeof d.name === 'string' ? d.name : '',
      balance: d.balance,
      apr: Number(d.apr) || 0,
      payment: Number(d.payment) || 0,
      budgetRow: typeof d.budgetRow === 'string' && d.budgetRow ? d.budgetRow : null,
      ...(typeof d.linkName === 'string' ? { linkName: d.linkName } : {}),
    }))
  }
  if (isLegacyDebts(v)) {
    return LEGACY_DEBTS.map(([id, name, linkName]) => ({
      id, name, balance: v[id], apr: 0, payment: 0, budgetRow: null, linkName,
    }))
  }
  return []
}
