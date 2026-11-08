import { PAY_SOURCE_LABELS } from '@/screens/retirement/constants/PAY_SOURCE_LABELS'
import { SourceBadge } from '@/screens/retirement/ui/SourceBadge'
import { InfoTip } from '@/shared/ui/InfoTip'
import { ToolField } from '@/shared/ui/ToolField'
import { Label } from '@/shared/ui/primitives/label'
import { fmt0 } from '@/shared/utils/fmt0'

// The one period you have before planning any change, until you retire: the 401k from
// today's Take-home or typed dollars and savings from today's Budget or typed dollars
// (`auto401k` and `autoSavings` under the hood). Picking a preset turns it into a real
// pay period.
type TodayPayRowProps = {
  takeHomePresets: { id: string; name: string }[]
  budgetPresets: { id: string; name: string }[]
  // a Take-home preset id
  onPickPay: (value: string) => void
  k401: { auto: boolean; autoValue: number; autoTip: string; value: number; onToggleAuto: () => void; onChange: (v: number) => void }
  savings: { auto: boolean; autoValue: number; autoTip: string; value: number; onChange: (v: number) => void; onAuto: (auto: boolean) => void; onPickPreset: (id: string) => void }
}

export function TodayPayRow({ takeHomePresets, budgetPresets, onPickPay, k401, savings }: TodayPayRowProps) {
  return (
    <div className="rounded-xl bg-[var(--surface-2)] p-3 ring-1 ring-[var(--ring)]">
      <div className="mb-2 text-[12px] font-medium">Now, until you retire</div>
      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
        <div className="relative">
          {k401.auto ? (
            <Label className="block">
              <span className="inline-flex items-center gap-1 text-[12px] text-[var(--text-muted)]">
                Into 401k per year
                <InfoTip tip={k401.autoTip} size={12} />
              </span>
              <div className="mt-1 rounded-lg bg-[var(--surface-1)] px-3 py-2 text-[13px] tnum ring-1 ring-[var(--ring)]">{fmt0(k401.autoValue)}</div>
            </Label>
          ) : (
            <ToolField label="Into 401k per year" value={k401.value} onChange={k401.onChange} step={500} suffix="$"
              tip="What goes into your 401k a year, your employer's match included. Pick Today's Take-home on the badge to follow the tool again." />
          )}
          <SourceBadge
            title={PAY_SOURCE_LABELS.takeHome}
            owner="Now"
            value={k401.auto ? 'today' : 'typed'}
            short={k401.auto ? PAY_SOURCE_LABELS.payToday : PAY_SOURCE_LABELS.typed}
            options={[
              { value: 'today', label: PAY_SOURCE_LABELS.payToday },
              ...takeHomePresets.map((x) => ({ value: x.id, label: x.name })),
              { value: 'typed', label: PAY_SOURCE_LABELS.typeIt },
            ]}
            onPick={(v) => {
              if (v !== 'today' && v !== 'typed') onPickPay(v)
              else if ((v === 'today') !== k401.auto) k401.onToggleAuto()
            }}
          />
        </div>
        <div className="relative">
          {savings.auto ? (
            <Label className="block">
              <span className="inline-flex items-center gap-1 text-[12px] text-[var(--text-muted)]">
                Into savings per year
                <InfoTip tip={savings.autoTip} size={12} />
              </span>
              <div className="mt-1 rounded-lg bg-[var(--surface-1)] px-3 py-2 text-[13px] tnum ring-1 ring-[var(--ring)]">{fmt0(savings.autoValue)}</div>
            </Label>
          ) : (
            <ToolField label="Into savings per year" value={savings.value} onChange={savings.onChange} step={500} suffix="$"
              tip="What you save a year, on top of your 401k. Pick Today's Budget on the badge to follow the Budget again." />
          )}
          <SourceBadge
            title={PAY_SOURCE_LABELS.budget}
            owner="Now"
            value={savings.auto ? 'today' : 'typed'}
            short={savings.auto ? PAY_SOURCE_LABELS.saveToday : PAY_SOURCE_LABELS.typed}
            options={[
              { value: 'today', label: PAY_SOURCE_LABELS.saveToday },
              ...budgetPresets.map((x) => ({ value: x.id, label: x.name })),
              { value: 'typed', label: PAY_SOURCE_LABELS.typeIt },
            ]}
            onPick={(v) => (v === 'today' || v === 'typed' ? savings.onAuto(v === 'today') : savings.onPickPreset(v))}
          />
        </div>
      </div>
    </div>
  )
}
