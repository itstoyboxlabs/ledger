import type { Debt } from '@/shared/types/Debt'
import type { BudgetRow } from '@/shared/types/BudgetRow'

// A debt's monthly payment: the linked Budget row's amount, or the typed payment.
// When the linked row was deleted (rows loaded, no match) the typed payment is used,
// the same number Balances shows. Before rows load a linked debt reads 0.
export const debtPaymentOf = (d: Pick<Debt, 'budgetRow' | 'payment'>, rows: BudgetRow[] | null | undefined): number => {
  const typed = Number(d.payment) || 0
  if (!d.budgetRow) return typed
  if (!rows) return 0
  const linked = rows.find((r) => r.id === d.budgetRow)
  return linked ? Number(linked.amount) || 0 : typed
}
