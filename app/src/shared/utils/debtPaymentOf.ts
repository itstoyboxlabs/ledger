import type { Debt } from '@/shared/types/Debt'
import type { BudgetRow } from '@/shared/types/BudgetRow'
export const debtPaymentOf = (d: Pick<Debt, 'budgetRow' | 'payment'>, rows: BudgetRow[] | null | undefined): number =>
  d.budgetRow ? Number(rows?.find((r) => r.id === d.budgetRow)?.amount) || 0 : Number(d.payment) || 0
