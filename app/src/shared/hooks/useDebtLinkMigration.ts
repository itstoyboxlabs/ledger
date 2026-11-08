import { useEffect } from 'react'
import { getBudget } from '@/shared/utils/getBudget'
import { useDebts } from '@/shared/hooks/useDebts'

export function useDebtLinkMigration(): void {
  const [debts, setDebts] = useDebts()
  useEffect(() => {
    if (!debts.some((d) => d.linkName)) return
    getBudget()
      .then((b) =>
        setDebts(
          debts.map(({ linkName, ...d }) => {
            if (!linkName) return { ...d }
            const row = b.rows.find((r) => r.name === linkName)
            return { ...d, budgetRow: row ? row.id : null }
          }),
        ),
      )
      .catch(() => {})
  }, [debts]) // eslint-disable-line react-hooks/exhaustive-deps
}
