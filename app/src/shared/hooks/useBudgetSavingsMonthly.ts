import { useEffect, useState } from 'react'
import { useBudgetIncome } from '@/shared/hooks/useBudgetIncome'
import { budgetSavingsYearly } from '@/shared/utils/budgetSavingsYearly'
import { getBudget } from '@/shared/utils/getBudget'
import type { BudgetFile } from '@/shared/types/BudgetFile'

// What the Budget puts into savings each month: the savings share of the leftover, or all
// of it when the leftover is not split. Retirement saves the same money. 0 until the Budget loads.
export function useBudgetSavingsMonthly(): number {
  const income = useBudgetIncome()
  const [file, setFile] = useState<BudgetFile | null>(null)
  useEffect(() => {
    getBudget()
      .then(setFile)
      .catch(() => {})
  }, [])
  return file ? budgetSavingsYearly(file, file.rows, income) / 12 : 0
}
