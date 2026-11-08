import { Button } from '@/shared/ui/primitives/button'
import { cn } from '@/shared/utils/cn'
import { Table, TableBody } from '@/shared/ui/primitives/table'
import { fmt } from '@/shared/utils/fmt'
import { Card } from '@/shared/ui/Card'
import { ToolField } from '@/shared/ui/ToolField'
import { ToolRow } from '@/screens/tools/ui/ToolRow'
import { useToolState } from '@/shared/hooks/useToolState'

// "Rent-to-Income Calculation" — the NYC 40× rule. Two directions, swappable:
// know the rent -> get the multiple; know the multiple -> get the max rent.
export function RentToIncomeCalc() {
  const [c, setC] = useToolState('rentIncomeCalc2', { income: 100000, rent: 2500, times: 40, mode: 0 })
  const byRent = c.mode === 0
  const times = c.rent > 0 ? c.income / c.rent : 0
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold">Rent-to-income</h2>
          <p className="mt-1 text-[12px] text-[var(--text-muted)]">
            {byRent
              ? 'Landlords often want your yearly income to be some multiple of the monthly rent, usually 40 times, sometimes less. Enter your income, a rent and what they ask for to see if you clear it.'
              : 'Landlords often want your yearly income to be some multiple of the monthly rent, usually 40 times, sometimes less. Enter your income and what they ask for to see the most rent you qualify for.'}
          </p>
        </div>
        <Button variant="outline" size="sm"
          onClick={() => setC({ ...c, mode: byRent ? 1 : 0 })}
          title="Swap direction"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3 4 7l4 4" />
            <path d="M4 7h16" />
            <path d="m16 21 4-4-4-4" />
            <path d="M20 17H4" />
          </svg>
          Swap
        </Button>
      </div>
      <div className={cn('mt-4 grid grid-cols-2 gap-3', byRent && 'lg:grid-cols-3')}>
        <ToolField label="Annual income" value={c.income} onChange={(v: number) => setC({ ...c, income: v })} step={5000} suffix="$" />
        {byRent && (
          <ToolField label="Monthly rent" value={c.rent} onChange={(v: number) => setC({ ...c, rent: v })} step={100} suffix="$" />
        )}
        <ToolField label="They ask for (× rent)" value={c.times} onChange={(v: number) => setC({ ...c, times: v })} step={5} suffix="×" />
      </div>
      <Table className="mt-5 w-full text-[13px]">
        <TableBody>
          {byRent ? (
            <>
              {c.rent > 0 ? (
                <ToolRow
                  label={`Your income is ${times.toFixed(1)}× the rent`}
                  value={times >= c.times ? `Clears the ${c.times}× they ask for` : `Short of the ${c.times}× they ask for`}
                  bold
                  tone={times >= c.times ? 'var(--good)' : 'var(--bad)'}
                />
              ) : (
                <ToolRow label="Enter a rent to compare" value="—" bold />
              )}
              <ToolRow label={`Max rent at ${c.times}×`} value={fmt(c.times > 0 ? c.income / c.times : 0)} />
            </>
          ) : (
            <>
              <ToolRow
                label={`Max monthly rent at ${c.times}×`}
                value={fmt(c.times > 0 ? c.income / c.times : 0)}
                bold
                tone="var(--good)"
              />
              <ToolRow label="Per year at that rent" value={fmt(c.times > 0 ? (c.income / c.times) * 12 : 0)} />
            </>
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
