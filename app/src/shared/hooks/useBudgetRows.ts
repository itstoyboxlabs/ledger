import { useEffect, useState } from 'react'
import { getBudget } from '@/shared/utils/getBudget'
import type { BudgetRow } from '@/shared/types/BudgetRow'

// live Budget rows (null until they load)
export function useBudgetRows(): BudgetRow[] | null {
  const [rows, setRows] = useState<BudgetRow[] | null>(null)
  useEffect(() => {
    getBudget()
      .then((d) => setRows(d.rows))
      .catch(() => {})
  }, [])
  return rows
}
