import { useEffect, useState } from 'react'
import { getBudget } from '@/shared/utils/getBudget'
import { budgetExpensesOf } from '@/shared/utils/budgetExpensesOf'
import { fmt } from '@/shared/utils/fmt'
import { fmt0 } from '@/shared/utils/fmt0'
import { Table, TableBody } from '@/shared/ui/primitives/table'
import { Card } from '@/shared/ui/Card'
import { ToolField } from '@/shared/ui/ToolField'
import { ToolRow } from '@/screens/tools/ui/ToolRow'
import { useBudgetIncome } from '@/shared/hooks/useBudgetIncome'
import { useToolState } from '@/shared/hooks/useToolState'

// "Vaction Planning" — trip cost with per-night and one-time pieces
export function VacationCalc() {
  const [c, setC] = useToolState('vacationCalc', {
    hotel: 200, flight: 300, food: 75, ubers: 50, spending: 100, nights: 4, buffer: 100, saveMo: 500,
  })
  const f = (k: keyof typeof c) => (v: number) => setC({ ...c, [k]: v })
  const total = c.hotel * c.nights + c.food * c.nights + c.flight + c.ubers + c.spending + c.buffer
  const months = c.saveMo > 0 ? total / c.saveMo : 0

  // real leftover from the Budget tab, for the months-to-save tooltip
  const [leftover, setLeftover] = useState<number | null>(null)
  const budgetIncome = useBudgetIncome()
  useEffect(() => {
    getBudget()
      .then((d) => {
        setLeftover(budgetIncome - budgetExpensesOf(d))
      })
      .catch(() => {})
  }, [budgetIncome])
  const tip =
    `Trip total (${fmt0(total)}) divided by what you can save per month (${fmt0(c.saveMo)}). ` +
    (leftover !== null
      ? `For reference, your Budget tab leaves about ${fmt0(leftover)} a month after everything else.`
      : '')
  return (
    <Card className="p-5">
      <h3 className="text-[15px] font-semibold">Vacation planning</h3>
      <p className="mt-1 text-[12px] text-[var(--text-muted)]">
        Add up what a trip will cost and how long it takes to save for it. Hotel and food are per
        night, everything else is for the whole trip.
      </p>
      <div className="mt-4 text-[12px] font-medium text-[var(--text-secondary)]">How long</div>
      <div className="mt-1.5 grid grid-cols-2 items-end gap-3 lg:grid-cols-4">
        <ToolField label="Nights" value={c.nights} onChange={f('nights')} />
      </div>
      <div className="mt-4 text-[12px] font-medium text-[var(--text-secondary)]">What it costs</div>
      <div className="mt-1.5 grid grid-cols-2 items-end gap-3 lg:grid-cols-4">
        <ToolField label="Hotel per night" value={c.hotel} onChange={f('hotel')} step={10} suffix="$" />
        <ToolField label="Food per night" value={c.food} onChange={f('food')} step={10} suffix="$" />
        <ToolField label="Flights, round trip" value={c.flight} onChange={f('flight')} step={10} suffix="$" />
        <ToolField label="Getting around" value={c.ubers} onChange={f('ubers')} step={10} suffix="$" />
        <ToolField label="Spending" value={c.spending} onChange={f('spending')} step={10} suffix="$" />
        <ToolField label="Just in case" value={c.buffer} onChange={f('buffer')} step={10} suffix="$" />
      </div>
      <div className="mt-4 text-[12px] font-medium text-[var(--text-secondary)]">Saving for it</div>
      <div className="mt-1.5 grid grid-cols-2 items-end gap-3 lg:grid-cols-4">
        <ToolField label="You can save per month" value={c.saveMo} onChange={f('saveMo')} step={50} suffix="$" />
      </div>
      <Table className="mt-5 w-full text-[13px]">
        <TableBody>
          <ToolRow label="Trip total" value={fmt(total)} bold tone="var(--good)" />
          <ToolRow label="Months to save" value={months.toFixed(1)} tip={tip} />
        </TableBody>
      </Table>
    </Card>
  )
}
