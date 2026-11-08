import { Table, TableBody } from '@/shared/ui/primitives/table'
import { fmt } from '@/shared/utils/fmt'
import { Card } from '@/shared/ui/Card'
import { ToolField } from '@/shared/ui/ToolField'
import { ToolRow } from '@/screens/tools/ui/ToolRow'
import { useToolState } from '@/shared/hooks/useToolState'

// "Effective Rental costs" — what a concession deal really costs per month
export function RentalCostCalc() {
  const [c, setC] = useToolState('rentalCalc', { rent: 2500, monthsFree: 1 })
  const effective = (c.rent * Math.max(0, 12 - c.monthsFree)) / 12
  return (
    <Card className="p-5">
      <h3 className="text-[15px] font-semibold">Effective rental cost</h3>
      <p className="mt-1 text-[12px] text-[var(--text-muted)]">
        Figure out what you'll really pay per month when a listing offers something like
        "2 months free", spread over a 12-month lease.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <ToolField label="Rental cost / mo" value={c.rent} onChange={(v: number) => setC({ ...c, rent: v })} step={50} suffix="$" />
        <ToolField label="Months free" value={c.monthsFree} onChange={(v: number) => setC({ ...c, monthsFree: v })} />
      </div>
      <Table className="mt-5 w-full text-[13px]">
        <TableBody>
          <ToolRow label="Effective cost / mo" value={fmt(effective)} bold tone="var(--good)" />
          <ToolRow label="Total for the year" value={fmt(effective * 12)} />
        </TableBody>
      </Table>
    </Card>
  )
}
