import type { StockType } from '@/shared/enums/StockType'
import type { StockInputs } from '@/shared/types/StockInputs'
import { Label } from '@/shared/ui/primitives/label'
import { Checkbox } from '@/shared/ui/primitives/checkbox'
import { STATES } from '@/shared/constants/STATES'
import { Table, TableBody } from '@/shared/ui/primitives/table'
import { fmt } from '@/shared/utils/fmt'
import { Card } from '@/shared/ui/Card'
import { Dropdown } from '@/shared/ui/Dropdown'
import { STOCK_DEFAULTS } from '@/shared/constants/STOCK_DEFAULTS'
import { STOCK_TYPES } from '@/screens/tools/features/stock/constants/STOCK_TYPES'
import { ToolField } from '@/shared/ui/ToolField'
import { ToolRow } from '@/screens/tools/ui/ToolRow'
import { equityPayout } from '@/shared/utils/equityPayout'
import { useToolState } from '@/shared/hooks/useToolState'

export function StockCalc({ taxState }: { taxState: string }) {
  const [c, setC] = useToolState('stockCalc2', STOCK_DEFAULTS)
  const f = <K extends keyof StockInputs>(k: K) => (v: StockInputs[K]) => setC({ ...c, [k]: v })
  const rsu = c.type === 'rsu'
  const { delta, gross, years, tax: perYearTax, net } = equityPayout(c, taxState)
  return (
    <Card className="p-5">
      <h3 className="text-[15px] font-semibold">Equity payout</h3>
      <p className="mt-1 text-[12px] text-[var(--text-muted)]">
        If your company's stock pays out, see what you would actually keep after tax. Pick what you have
        and it handles the tax rules for you.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Label className="block">
          <span className="text-[12px] text-[var(--text-muted)]">What you have</span>
          <div className="mt-1">
            <Dropdown
              label="Type"
              hideLabel
              value={c.type}
              onChange={(v: string) => f('type')(v as StockType)}
              className="h-9 w-full justify-between rounded-lg bg-[var(--surface-1)] px-3 shadow-xs"
              options={STOCK_TYPES}
            />
          </div>
        </Label>
        <ToolField label="Exit price" value={c.exit} onChange={f('exit')} suffix="$" />
        {!rsu && <ToolField label="Your price (strike)" value={c.strike} onChange={f('strike')} suffix="$" />}
        <ToolField label={rsu ? 'Shares' : 'Options'} value={c.shares} onChange={f('shares')} step={1000} />
        <ToolField label="Salary (stacked under)" value={c.salary} onChange={f('salary')} step={1000} suffix="$" />
        <ToolField label="Payout years" value={c.years} onChange={f('years')} />
      </div>
      {c.type === 'iso' && (
        <Label className="mt-3 flex items-center gap-2 text-[13px] font-normal">
          <Checkbox checked={!!c.heldOver} onCheckedChange={(v) => setC({ ...c, heldOver: v === true })} />
          Held over a year after exercise
        </Label>
      )}
      <p className="mt-3 text-[12px] text-[var(--text-muted)]">
        {c.type === 'iso' && c.heldOver
          ? `The gain is taxed as a long-term capital gain: 0, 15 or 20 percent federal plus 3.8 percent on high income. ${STATES[taxState]?.label} taxes it as income. Each payout year is stacked on your salary.`
          : `Taxed per payout year as income on top of your salary, in ${STATES[taxState]?.label}.${c.type === 'iso' ? ' Turn on the toggle if you will hold the shares over a year after exercise.' : ''}`}
      </p>
      <Table className="mt-3 w-full text-[13px]">
        <TableBody>
          <ToolRow label={rsu ? 'Value per share' : 'Delta per share'} value={fmt(delta)} />
          <ToolRow label="Gross profit" value={fmt(gross)} />
          <ToolRow
            label={`Effective tax on the payout (${STATES[taxState]?.label})`}
            value={(perYearTax.effective * 100).toFixed(1) + '%'}
          />
          <ToolRow label="Net profit (after tax)" value={fmt(net)} bold tone="var(--good)" />
          <ToolRow label={`Net per year (over ${years})`} value={fmt(net / years)} bold tone="var(--good)" />
        </TableBody>
      </Table>
    </Card>
  )
}
