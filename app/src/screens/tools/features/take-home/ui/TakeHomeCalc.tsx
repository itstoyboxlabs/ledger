import type { DeductionKind } from '@/shared/enums/DeductionKind'
import type { DeductionUnit } from '@/shared/enums/DeductionUnit'
import type { Deduction } from '@/shared/types/Deduction'
import { STATES } from '@/shared/constants/STATES'
import { Label } from '@/shared/ui/primitives/label'
import { Button } from '@/shared/ui/primitives/button'
import { X } from 'lucide-react'
import { Table, TableBody } from '@/shared/ui/primitives/table'
import { fmt } from '@/shared/utils/fmt'
import { Card } from '@/shared/ui/Card'
import { DEDUCTION_KINDS } from '@/shared/constants/DEDUCTION_KINDS'
import { DEDUCTION_TIPS } from '@/screens/tools/features/take-home/constants/DEDUCTION_TIPS'
import { DEDUCTION_UNITS } from '@/screens/tools/features/take-home/constants/DEDUCTION_UNITS'
import { K401_CAPPED_TIP } from '@/screens/tools/features/take-home/constants/K401_CAPPED_TIP'
import { TAKE_HOME_PRESET_HINT } from '@/screens/tools/features/take-home/constants/TAKE_HOME_PRESET_HINT'
import { DEFAULT_STATE } from '@/shared/constants/DEFAULT_STATE'
import { DraftNumberInput } from '@/shared/ui/DraftNumberInput'
import { Dropdown } from '@/shared/ui/Dropdown'
import { Icon } from '@/shared/ui/Icon'
import { InfoTip } from '@/shared/ui/InfoTip'
import { TAKE_HOME_DEFAULTS } from '@/shared/constants/TAKE_HOME_DEFAULTS'
import { FilingNote } from '@/screens/tools/ui/FilingNote'
import { TaxedInCaption } from '@/screens/tools/ui/TaxedInCaption'
import { ToolField } from '@/shared/ui/ToolField'
import { ToolRow } from '@/screens/tools/ui/ToolRow'
import { deductionLabel } from '@/shared/utils/deductionLabel'
import { deductionTax } from '@/shared/utils/deductionTax'
import { is401kKind } from '@/shared/utils/is401kKind'
import { normalizeTakeHome } from '@/shared/utils/normalizeTakeHome'
import { takeHome401kMatchYearly } from '@/shared/utils/takeHome401kMatchYearly'
import { takeHomeBreakdown } from '@/shared/utils/takeHomeBreakdown'
import { useFilingStatus } from '@/shared/hooks/useFilingStatus'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { usePresets } from '@/shared/hooks/usePresets'
import { PresetBar } from '@/shared/ui/PresetBar'
import type { TakeHome } from '@/shared/types/TakeHome'
import { useToolState } from '@/shared/hooks/useToolState'

export function TakeHomeCalc({ goToAboutYou }: { goToAboutYou: () => void }) {
  // the shared tax state and filing status, set on the About you page; also used by the Budget income override
  const [taxState] = usePersistedState('taxState', DEFAULT_STATE, (v) => typeof v === 'string' && v in STATES)
  const [filing] = useFilingStatus()
  const [raw, setC] = useToolState('takeHome', TAKE_HOME_DEFAULTS)
  const c = normalizeTakeHome(raw)
  // named salaries and deductions, like "Now" or "Easier job". Ids let the Retirement pay
  // plan point at one through a rename.
  const { presets, save, remove, rename } = usePresets<TakeHome>('takeHome', { ids: true })
  const b = takeHomeBreakdown(c, taxState, filing)
  const setDeductions = (deductions: Deduction[]) => setC({ salary: c.salary, deductions })
  const patch = (id: string, p: Partial<Deduction>) => setDeductions(c.deductions.map((d) => (d.id === id ? { ...d, ...p } : d)))
  const add = () =>
    setDeductions([
      ...c.deductions,
      { id: `d${Date.now().toString(36)}`, kind: 'other-pre', unit: 'mo', amount: 0, match: 0 },
    ])
  const matchYearly = takeHome401kMatchYearly(c)
  const dropdownClass = 'h-9 w-full justify-between rounded-lg bg-[var(--surface-1)] px-3 shadow-xs'
  return (
    <Card id="take-home-pay" className="p-5 scroll-mt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[15px] font-semibold">Take-home pay</h2>
        <PresetBar
          presets={presets}
          currentData={c}
          onApply={(d) => setC(normalizeTakeHome(d))}
          onSave={(name) => save(name, c)}
          onDelete={remove}
          onRename={rename}
          scope="takeHome"
          hint={TAKE_HOME_PRESET_HINT}
        />
      </div>
      <p className="mt-1 text-[12px] text-[var(--text-muted)]">
        See what a salary actually turns into after taxes, 401k and health insurance come out,
        per year, per month and per paycheck. A $80,000 salary isn't $6,667 a month, and this
        shows where the rest goes.
      </p>
      <div className="mt-4 grid grid-cols-2 items-end gap-3">
        <ToolField label="Salary per year" value={c.salary} onChange={(v: number) => setC({ ...c, salary: v })} step={5000} suffix="$" />
        <TaxedInCaption state={taxState} onChange={goToAboutYou} />
      </div>
      <FilingNote onOpen={goToAboutYou} />

      <div className="mt-4 text-[12px] text-[var(--text-muted)]">What comes out of your pay</div>
      <div className="mt-1.5 flex flex-col gap-2">
        {c.deductions.map((d) => (
          <div key={d.id} className="flex flex-wrap items-center gap-2">
            <div className="min-w-[200px] flex-1">
              <Dropdown
                label="Kind"
                hideLabel
                value={d.kind}
                onChange={(kind: string) => patch(d.id, { kind: kind as DeductionKind })}
                className={dropdownClass}
                options={DEDUCTION_KINDS.map(([value, label]) => ({ value, label }))}
              />
            </div>
            <div className="w-[110px]">
              <DraftNumberInput
                boxed
                ariaLabel={`${deductionLabel(d.kind)} amount`}
                value={d.amount}
                step={d.unit === 'pct' ? 1 : 25}
                suffix={d.unit === 'pct' ? '%' : '$'}
                onChange={(v: number) => patch(d.id, { amount: Math.max(0, v) })}
                className="tnum"
              />
            </div>
            <div className="w-[130px]">
              <Dropdown
                label="Unit"
                hideLabel
                value={d.unit}
                onChange={(unit: string) => patch(d.id, { unit: unit as DeductionUnit })}
                className={dropdownClass}
                options={DEDUCTION_UNITS.map(([value, label]) => ({ value, label }))}
              />
            </div>
            {is401kKind(d.kind) && (
              <Label className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 whitespace-nowrap text-[12px] text-[var(--text-muted)]">
                  Employer match
                  <InfoTip tip="What your employer adds on top of what you put in, as a percent of your contribution. 100% means they match it dollar for dollar." size={12} />
                </span>
                <div className="w-[96px]">
                  <DraftNumberInput
                    boxed
                    ariaLabel={`${deductionLabel(d.kind)} employer match`}
                    value={d.match ?? 0}
                    step={10}
                    min={0}
                    suffix="%"
                    onChange={(v: number) => patch(d.id, { match: Math.max(0, v) })}
                    className="tnum"
                  />
                </div>
              </Label>
            )}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setDeductions(c.deductions.filter((x) => x.id !== d.id))}
              title="Remove"
              aria-label={`Remove ${deductionLabel(d.kind)}`}
              className="text-[var(--text-muted)] hover:bg-transparent hover:text-[var(--bad)]"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={add} className="mt-3">
        <Icon name="plus" size={13} />
        Add something that comes out
      </Button>

      <Table className="mt-5 w-full text-[13px]">
        <TableBody>
          <ToolRow label="Salary" value={fmt(b.salary)} />
          {b.lines.map((l) => (
            <ToolRow
              key={l.id}
              label={`${deductionLabel(l.kind)}${l.unit === 'pct' ? ` (${l.amount}%)` : ''}${l.capped ? ', capped' : ''}`}
              value={'−' + fmt(l.yearly)}
              tip={l.capped ? K401_CAPPED_TIP : DEDUCTION_TIPS[deductionTax(l.kind)]}
            />
          ))}
          <ToolRow label="Federal income tax" value={'−' + fmt(b.fed)} />
          <ToolRow label="Social Security and Medicare" value={'−' + fmt(b.fica)} />
          <ToolRow
            label={`State${b.local ? ' and city' : ''} tax`}
            value={'−' + fmt(b.state + b.local)}
          />
          <ToolRow label="Take-home per year" value={fmt(b.net)} bold tone="var(--good)" />
          <ToolRow label="Take-home per month" value={fmt(b.net / 12)} bold tone="var(--good)" />
          <ToolRow
            label="Per paycheck, paid twice a month"
            value={fmt(b.net / 24)}
            tip="24 checks a year. If you're paid every two weeks it's 26, so each check is a bit smaller."
          />
          <ToolRow
            label="Of every dollar you earn, you keep"
            value={(b.salary > 0 ? (b.net / b.salary) * 100 : 0).toFixed(1) + '%'}
          />
        </TableBody>
      </Table>
      {matchYearly > 0 && (
        <p className="mt-3 text-[12px] text-[var(--text-muted)]">
          Your employer adds <span className="tnum">{fmt(matchYearly)}</span> a year to your 401k.
        </p>
      )}
    </Card>
  )
}
