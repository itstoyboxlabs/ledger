import { RetirementCalc } from '@/screens/retirement/ui/RetirementCalc'
import { useDebts } from '@/shared/hooks/useDebts'

type RetirementViewProps = {
  goToBalances?: () => void
}

export function RetirementView({ goToBalances }: RetirementViewProps) {
  // reads the same shared debts as the Tools page (edited on the Balances page)
  const [debts] = useDebts()
  return (
    <div className="show-spinners mt-6">
      <RetirementCalc debts={debts} goToBalances={goToBalances} />
    </div>
  )
}
