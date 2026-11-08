import { STATES } from '@/shared/constants/STATES'
import { taxOn } from '@/shared/utils/taxOn'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/primitives/table'
import { cn } from '@/shared/utils/cn'
import { fmt0 } from '@/shared/utils/fmt0'
import { Card } from '@/shared/ui/Card'
import { DEFAULT_STATE } from '@/shared/constants/DEFAULT_STATE'
import { FilingNote } from '@/screens/tools/ui/FilingNote'
import { TaxedInCaption } from '@/screens/tools/ui/TaxedInCaption'
import { ToolField } from '@/shared/ui/ToolField'
import { useFilingStatus } from '@/shared/hooks/useFilingStatus'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { useToolState } from '@/shared/hooks/useToolState'

// Hourly calculator for a W-2 employee (employee-side FICA only), with tax math from the shared engine
export function HourlyCalc({ goToAboutYou }: { goToAboutYou: () => void }) {
  // `state` stays in the saved data but is no longer read: the shared taxState is used
  const [c, setC] = useToolState('hourlyCalc', { hoursPerWeek: 40, rate: 50, state: DEFAULT_STATE })
  const [taxState] = usePersistedState('taxState', DEFAULT_STATE, (v) => typeof v === 'string' && v in STATES)
  const [filing] = useFilingStatus()
  const f = (k: 'hoursPerWeek' | 'rate') => (v: number) => setC({ ...c, [k]: v })
  const perWeek = c.hoursPerWeek * c.rate
  // for now: always a full year at 52 weeks — no separate "months worked" input.
  // (Previously multiplied by a months field, but 52 ÷ 12 × months quietly implied
  // a 4-week month; simplest to just assume the full year until Josh needs partial
  // periods again.)
  const gross = perWeek * 52
  const tax = taxOn(gross, taxState, filing)
  const net = gross - tax.total
  return (
    <Card className="p-5">
      <h2 className="text-[15px] font-semibold">Hourly calculator</h2>
      <p className="mt-1 text-[12px] text-[var(--text-muted)]">
        See what an hourly rate adds up to per week and per year, and what you'd keep after tax.
        Assumes you are a W-2 employee and work all 52 weeks. Freelance or 1099 pay owes more,
        since you pay both halves of Social Security and Medicare.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <ToolField label="Hours / week" value={c.hoursPerWeek} onChange={f('hoursPerWeek')} />
        <ToolField label="Pay / hour" value={c.rate} onChange={f('rate')} step={1} suffix="$" />
        <TaxedInCaption state={taxState} onChange={goToAboutYou} />
      </div>
      <FilingNote onOpen={goToAboutYou} />
      <Table className="mt-5 w-full text-[13px]">
        <TableHeader>
          <TableRow className="text-[12px] text-[var(--text-muted)]">
            <TableHead className="pb-2 font-medium"><span className="sr-only">Item</span></TableHead>
            <TableHead className="pb-2 text-right font-medium">Before tax</TableHead>
            <TableHead className="pb-2 text-right font-medium">Tax</TableHead>
            <TableHead className="pb-2 text-right font-medium">After tax</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {([
            ['Per week', 1 / 52],
            ['Per month', 1 / 12],
            ['Per year', 1],
          ] as const).map(([label, k], i) => (
            <TableRow key={label} className="border-t border-[var(--grid)]">
              <TableCell className={cn('py-2', i === 2 && 'font-semibold')}>{label}</TableCell>
              <TableCell className="py-2 pl-4 text-right tnum">{fmt0(gross * k)}</TableCell>
              <TableCell className="py-2 pl-4 text-right tnum text-[var(--text-muted)]">−{fmt0(tax.total * k)}</TableCell>
              <TableCell className={cn('py-2 pl-4 text-right tnum', i === 2 && 'font-semibold text-[var(--good)]')}>{fmt0(net * k)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="mt-2 text-[12px] text-[var(--text-muted)]">
        Tax is about {(tax.effective * 100).toFixed(1)}% in {STATES[taxState]?.label}, federal, FICA and state combined, {filing === 'mfj' ? 'married filing jointly' : 'single filer'}, estimated.
      </p>
    </Card>
  )
}
