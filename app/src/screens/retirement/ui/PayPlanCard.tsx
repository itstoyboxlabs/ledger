import type { ReactNode } from 'react'
import { Plus, X } from 'lucide-react'
import type { PayIssue } from '@/screens/retirement/types/PayIssue'
import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'
import type { ResolvedPayPeriod } from '@/screens/retirement/types/ResolvedPayPeriod'
import { SourceBadge } from '@/screens/retirement/ui/SourceBadge'
import { PAY_SOURCE_LABELS } from '@/screens/retirement/constants/PAY_SOURCE_LABELS'
import { Card } from '@/shared/ui/Card'
import { Dropdown } from '@/shared/ui/Dropdown'
import { InfoTip } from '@/shared/ui/InfoTip'
import { ToolField } from '@/shared/ui/ToolField'
import { Button } from '@/shared/ui/primitives/button'
import { Input } from '@/shared/ui/primitives/input'
import { Label } from '@/shared/ui/primitives/label'
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent } from '@/shared/ui/primitives/tooltip'
import { fmt0 } from '@/shared/utils/fmt0'

// "Pay and saving over time": everything you put away each year, in one card. With no
// plan it shows today's 401k and savings from today's tools or typed (`today`). With a
// plan, one box per period. Each period points at a Take-home preset for its 401k and a
// Budget preset for its saving, or uses today's, or typed numbers. "Back to one period"
// in the header clears the plan once it has more than one period.
type PayPlanCardProps = {
  periods: PayPeriod[]
  // the same periods with their presets looked up, in the same order
  resolved: ResolvedPayPeriod[]
  issues: PayIssue[]
  todaySalary: number
  retireAge: number
  // each Take-home preset with what it puts into the 401k a year, match included
  takeHomePresets: { id: string; name: string; k401: number }[]
  budgetPresets: { id: string; name: string }[]
  onChange: (periods: PayPeriod[]) => void
  onAdd: () => void
  // today's row, shown while there is no plan
  today?: ReactNode
  // shown at the bottom, like the note on freed debt payments
  footer?: ReactNode
}

const UNTIL_OPTIONS = [
  { value: 'retire', label: 'When I retire' },
  { value: 'age', label: 'At an age' },
]

// a value from somewhere else, in the same box a ToolField uses
function ReadOnlyField({ label, value, tip }: { label: ReactNode; value: string; tip: string }) {
  return (
    <Label className="block">
      <span className="inline-flex items-center gap-1 text-[12px] text-[var(--text-muted)]">
        {label}
        <InfoTip tip={tip} size={12} />
      </span>
      <div className="mt-1 rounded-lg bg-[var(--surface-1)] px-3 py-2 text-[13px] tnum ring-1 ring-[var(--ring)]">{value}</div>
    </Label>
  )
}

export function PayPlanCard({ periods, resolved, issues, todaySalary, retireAge, takeHomePresets, budgetPresets, onChange, onAdd, today, footer }: PayPlanCardProps) {
  const patch = (id: string, p: Partial<PayPeriod>) => onChange(periods.map((x) => (x.id === id ? { ...x, ...p } : x)))
  const remove = (id: string) => onChange(periods.filter((x) => x.id !== id))
  const planNotes = issues.filter((x) => x.id === null)
  const payOptions = [
    { value: 'today', label: PAY_SOURCE_LABELS.payToday },
    ...takeHomePresets.map((x) => ({ value: x.id, label: x.name })),
    { value: 'typed', label: PAY_SOURCE_LABELS.typeIt },
  ]
  const saveOptions = [
    { value: 'today', label: PAY_SOURCE_LABELS.saveToday },
    ...budgetPresets.map((x) => ({ value: x.id, label: x.name })),
    { value: 'typed', label: PAY_SOURCE_LABELS.typeIt },
  ]
  return (
    <Card className="p-5 lg:col-span-2">
      <div className="mb-3 flex items-center gap-1.5">
        <h2 className="text-[14px] font-semibold">Pay and saving over time</h2>
        <InfoTip tip="How much you put away each year while you work. The 401k comes from the Take-home pay tool (your 401k plus your employer's match) and savings from the Budget (your savings share of what is left), today's or a saved preset, so they stay in sync. Plan pay changes to split your working life into periods, like an easier job at 45 or part time after you retire, each with its own Take-home and Budget preset or typed numbers. Everything is in today's dollars." />
        {periods.length > 0 && (
          <span className="ml-auto flex items-center gap-1.5">
            {periods.length > 1 && (
              <Button variant="ghost" size="xs" className="rounded-lg text-[12px] font-normal text-[var(--text-muted)]" onClick={() => onChange([])}>
                Back to one period
              </Button>
            )}
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
        <div className="flex flex-col gap-3">
          {today}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-[620px]">
              <p className="text-[13px] text-[var(--text-secondary)]">
                Same pay until you retire. {fmt0(todaySalary)} a year from Take-home pay.
              </p>
              <p className="mt-1 text-[12px] text-[var(--text-muted)]">
                If your pay might change, like a raise or a lower paying job at a certain age, add another period.
                Set that life up first on the Budget page and in the Take-home pay tool. Save each as a preset, then
                pick those presets here.
              </p>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg" onClick={onAdd}>
              <Plus className="size-3.5" />
              Plan pay changes
            </Button>
          </div>
          {footer}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {periods.map((p, i) => {
            const r = resolved[i]
            const name = p.label.trim() || `period ${i + 1}`
            const sr = <span className="sr-only"> for {name}</span>
            const notes = issues.filter((x) => x.id === p.id)
            // a period starts where the one before it ends, or later
            const prev = periods[i - 1]
            const minFrom = prev ? (prev.toAge === 'retire' ? Math.max(retireAge, prev.fromAge) : prev.toAge) : undefined
            const payTyped = p.takeHomeFrom === 'typed' || r.missingPay
            const saveTyped = p.saveFrom === 'typed' || r.missingSave
            const k401 = r.sim.own + r.sim.match
            const payValue = p.takeHomeFrom === 'preset' && !r.missingPay ? p.takeHomePreset : p.takeHomeFrom === 'preset' ? 'typed' : p.takeHomeFrom
            const saveValue = p.saveFrom === 'preset' && !r.missingSave ? p.savePreset : p.saveFrom === 'preset' ? 'typed' : p.saveFrom
            const short = (v: string, list: { id: string; name: string }[], today: string) =>
              v === 'today' ? today : v === 'typed' ? PAY_SOURCE_LABELS.typed : list.find((x) => x.id === v)?.name ?? PAY_SOURCE_LABELS.typed
            // the typed values start at what the period showed, and stay as the fallback
            // if a chosen preset is ever deleted
            const pickPay = (v: string) => {
              const th = takeHomePresets.find((x) => x.id === v)
              if (v === 'today' || v === 'typed') patch(p.id, { takeHomeFrom: v, k401: Math.round(k401) })
              else if (th) patch(p.id, { takeHomeFrom: 'preset', takeHomePreset: th.id, k401: Math.round(th.k401) })
            }
            const pickSave = (v: string) =>
              v === 'today' || v === 'typed'
                ? patch(p.id, { saveFrom: v, savings: Math.round(r.sim.saving) })
                : patch(p.id, { saveFrom: 'preset', savePreset: v, savings: Math.round(r.sim.saving) })
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
                  <ToolField label={<>From age{sr}</>} value={p.fromAge} min={minFrom} onChange={(v) => patch(p.id, { fromAge: v })}
                    tip={prev ? `Starts at ${minFrom} or later, the age ${prev.label.trim() || `period ${i}`} ends.` : undefined} />
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
                    <ToolField label={<>Until age{sr}</>} value={p.toAge} min={p.fromAge + 1} onChange={(v) => patch(p.id, { toAge: v })}
                      tip={`Done at this age. Until ${p.toAge} means the last year here is ${p.toAge - 1}, and the next period starts at ${p.toAge}. If that is past your retire age, you keep working after you retire.`} />
                  )}
                  <div className="relative">
                    {payTyped ? (
                      <ToolField label={<>Into 401k per year{sr}</>} value={p.k401} step={500} suffix="$" min={0}
                        onChange={(v) => patch(p.id, { k401: Math.max(0, v) })}
                        tip="What goes into your 401k a year, your employer's match included. Use 0 for no 401k. Pick a Take-home preset on the badge to use one instead." />
                    ) : (
                      <ReadOnlyField label={<>Into 401k per year{sr}</>} value={fmt0(k401)}
                        tip={`The 401k line and employer match from ${p.takeHomeFrom === 'today' ? 'the Take-home pay tool today' : 'this Take-home preset'}. No 401k line there means nothing goes in.`} />
                    )}
                    <SourceBadge title={PAY_SOURCE_LABELS.takeHome} owner={name} value={payValue} short={r.missingPay ? PAY_SOURCE_LABELS.typed : short(payValue, takeHomePresets, PAY_SOURCE_LABELS.payToday)} options={payOptions} onPick={pickPay} />
                  </div>
                  <div className="relative">
                    {saveTyped ? (
                      <ToolField label={<>Into savings per year{sr}</>} value={p.savings} step={500} suffix="$"
                        onChange={(v) => patch(p.id, { savings: v })}
                        tip="What you save a year in this period, on top of your 401k. Pick a Budget preset on the badge to use one instead." />
                    ) : (
                      <ReadOnlyField label={<>Into savings per year{sr}</>} value={fmt0(r.sim.saving)}
                        tip={`What ${p.saveFrom === 'today' ? "today's Budget" : 'this Budget preset'} leaves over each month, by your Budget's split of what is left, times 12.`} />
                    )}
                    <SourceBadge title={PAY_SOURCE_LABELS.budget} owner={name} value={saveValue} short={r.missingSave ? PAY_SOURCE_LABELS.typed : short(saveValue, budgetPresets, PAY_SOURCE_LABELS.saveToday)} options={saveOptions} onPick={pickSave} />
                  </div>
                  <ToolField label={<>Contributions grow a year{sr}</>} value={p.raisePct} step={0.5} suffix="%"
                    onChange={(v) => patch(p.id, { raisePct: v })}
                    tip="Your 401k and savings both grow by this percent each year. Use it for a raise. Savings can grow faster than a raise if your spending stays flat." />
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
          {footer}
        </div>
      )}
    </Card>
  )
}
