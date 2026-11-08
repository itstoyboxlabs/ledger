import { Plus, X } from 'lucide-react'
import type { PayIssue } from '@/screens/retirement/types/PayIssue'
import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'
import { AutoToolField } from '@/screens/retirement/ui/AutoToolField'
import { Card } from '@/shared/ui/Card'
import { Dropdown } from '@/shared/ui/Dropdown'
import { InfoTip } from '@/shared/ui/InfoTip'
import { ToolField } from '@/shared/ui/ToolField'
import { Button } from '@/shared/ui/primitives/button'
import { Input } from '@/shared/ui/primitives/input'
import { Label } from '@/shared/ui/primitives/label'
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent } from '@/shared/ui/primitives/tooltip'
import { fmt0 } from '@/shared/utils/fmt0'

// "Your pay over time": the pay plan, one box per period. With no periods it is one line
// saying today's pay holds until you retire.
type PayPlanCardProps = {
  periods: PayPeriod[]
  issues: PayIssue[]
  todaySalary: number
  retireAge: number
  // the percent a period's 401k starts at when you turn its Auto off
  default401kPct: number
  // what Auto puts into the 401k and savings in a period's first year
  preview: (p: PayPeriod) => { k401: number; savings: number }
  onChange: (periods: PayPeriod[]) => void
  onAdd: () => void
}

const UNTIL_OPTIONS = [
  { value: 'retire', label: 'When I retire' },
  { value: 'age', label: 'At an age' },
]

export function PayPlanCard({ periods, issues, todaySalary, retireAge, default401kPct, preview, onChange, onAdd }: PayPlanCardProps) {
  const patch = (id: string, p: Partial<PayPeriod>) => onChange(periods.map((x) => (x.id === id ? { ...x, ...p } : x)))
  const remove = (id: string) => onChange(periods.filter((x) => x.id !== id))
  const planNotes = issues.filter((x) => x.id === null)
  return (
    <Card className="p-5 lg:col-span-2">
      <div className="mb-3 flex items-center gap-1.5">
        <h2 className="text-[14px] font-semibold">Your pay over time</h2>
        <InfoTip tip="Split your working life into periods, like a raise every year, an easier job at 45 or part time after you retire. Each period sets its pay, its 401k and what you save. Auto follows Take-home pay and the Budget like today. Pay is in today's dollars." />
        {periods.length > 0 && (
          <span className="ml-auto">
            <UITooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon-xs" aria-label="Add a pay period" onClick={onAdd}>
                  <Plus className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Add a pay period</TooltipContent>
            </UITooltip>
          </span>
        )}
      </div>
      {periods.length === 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-[var(--text-secondary)]">
            Same pay until you retire. {fmt0(todaySalary)} a year from Take-home pay.
          </p>
          <Button variant="outline" size="sm" className="rounded-lg" onClick={onAdd}>
            <Plus className="size-3.5" />
            Plan pay changes
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {periods.map((p, i) => {
            const name = p.label.trim() || `period ${i + 1}`
            const sr = <span className="sr-only"> for {name}</span>
            const auto = preview(p)
            const notes = issues.filter((x) => x.id === p.id)
            return (
              <div key={p.id} className="rounded-xl bg-[var(--surface-2)] p-3 ring-1 ring-[var(--ring)]">
                <div className="mb-2 flex items-center gap-2">
                  <Input variant="inline"
                    value={p.label}
                    aria-label={`Label for period ${i + 1}`}
                    placeholder="Label, like Easier job"
                    onChange={(e) => patch(p.id, { label: e.target.value })}
                    className="-ml-1.5 flex-1 text-[12px] font-medium"
                  />
                  <Button variant="ghost" size="icon-xs" aria-label={`Remove ${name}`}
                    onClick={() => remove(p.id)}
                    className="text-[var(--text-muted)] hover:text-[var(--bad)]"
                  ><X className="size-3.5" /></Button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  <ToolField label={<>From age{sr}</>} value={p.fromAge} onChange={(v) => patch(p.id, { fromAge: v })} />
                  <Label className="block">
                    <span className="text-[12px] text-[var(--text-muted)]">Ends{sr}</span>
                    <div className="mt-1">
                      <Dropdown
                        label="Ends"
                        hideLabel
                        value={p.toAge === 'retire' ? 'retire' : 'age'}
                        onChange={(v: string) => patch(p.id, { toAge: v === 'retire' ? 'retire' : p.fromAge + 10 })}
                        className="h-9 w-full justify-between rounded-lg bg-[var(--surface-1)] px-3 shadow-xs"
                        options={UNTIL_OPTIONS}
                      />
                    </div>
                  </Label>
                  {p.toAge !== 'retire' && (
                    <>
                      <ToolField label={<>Until age{sr}</>} value={p.toAge} onChange={(v) => patch(p.id, { toAge: v })}
                        tip="The period stops the year you turn this age. If that is past your retire age, you keep working after you retire." />
                      <ToolField label={<>For how many years{sr}</>} value={p.toAge - p.fromAge} min={1}
                        onChange={(v) => patch(p.id, { toAge: p.fromAge + Math.max(1, v) })} />
                    </>
                  )}
                  <ToolField label={<>Pay per year{sr}</>} value={p.salary} step={1000} suffix="$" min={0}
                    onChange={(v) => patch(p.id, { salary: Math.max(0, v) })}
                    tip="Your gross pay a year before tax. Use 0 for time off." />
                  <ToolField label={<>Raise a year{sr}</>} value={p.raisePct} step={0.5} suffix="%"
                    onChange={(v) => patch(p.id, { raisePct: v })}
                    tip="How much your pay grows each year inside this period. Pay is in today's dollars, so this is a raise above inflation." />
                  <AutoToolField
                    label={<>Into 401k{sr}</>}
                    auto={p.k401 === 'auto'}
                    onToggleAuto={() => patch(p.id, { k401: p.k401 === 'auto' ? default401kPct : 'auto' })}
                    autoValue={auto.k401}
                    autoTip="Your 401k and employer match from Take-home pay, at this period's pay. It is the first year here."
                    tip="A percent of this period's pay. Your employer match from Take-home pay follows it. Use 0 for no 401k."
                    value={p.k401 === 'auto' ? default401kPct : p.k401}
                    onChange={(v) => patch(p.id, { k401: Math.max(0, v) })}
                    step={1}
                    suffix="%"
                  />
                  {p.fromAge < retireAge && <AutoToolField
                    label={<>Into savings per year{sr}</>}
                    auto={p.savings === 'auto'}
                    onToggleAuto={() => patch(p.id, { savings: p.savings === 'auto' ? Math.round(auto.savings) : 'auto' })}
                    autoValue={auto.savings}
                    autoTip="What the Budget saves today, plus or minus the change in take-home pay. It is the first year here."
                    tip="What you save a year in this period, on top of your 401k."
                    value={p.savings === 'auto' ? 0 : p.savings}
                    onChange={(v) => patch(p.id, { savings: v })}
                    step={500}
                    suffix="$"
                  />}
                </div>
                {notes.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-0.5 text-[11px]">
                    {notes.map((n) => (
                      <li key={n.text} className={n.tone === 'warn' ? 'text-[var(--bad)]' : 'text-[var(--text-muted)]'}>{n.text}</li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
          {planNotes.map((n) => (
            <p key={n.text} className="text-[11px] text-[var(--bad)]">{n.text}</p>
          ))}
          <div>
            <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => onChange([])}>
              Go back to the same pay
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
