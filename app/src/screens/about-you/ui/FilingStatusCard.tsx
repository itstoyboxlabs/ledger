import { Card } from '@/shared/ui/Card'
import { Label } from '@/shared/ui/primitives/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select'
import { FED } from '@/shared/constants/FED'
import { FED_MFJ } from '@/shared/constants/FED_MFJ'
import { FILING_LABELS } from '@/shared/constants/FILING_LABELS'
import { fmt0 } from '@/shared/utils/fmt0'
import { FilingStatus } from '@/shared/enums/FilingStatus'
import { useFilingStatus } from '@/shared/hooks/useFilingStatus'
import { isFilingStatus } from '@/shared/utils/isFilingStatus'

// Single or married filing jointly. It picks the federal brackets and the standard deduction
// every tax number in the app uses.
export function FilingStatusCard() {
  const [filing, setFiling] = useFilingStatus()
  return (
    <Card className="p-5">
      <h2 className="text-[15px] font-semibold">Filing status</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">
        How you file your federal tax return. It changes the tax brackets and the standard deduction,
        so it changes every tax number in the app: Take-home pay, Rent scenarios, the Hourly
        calculator, Equity payout and the whole Retirement projection. Budget uses it too when its
        income comes from Take-home pay.
      </p>
      <div className="mt-4 w-full max-w-[280px]">
        <Label htmlFor="filing-status" className="text-[12px] font-normal text-[var(--text-muted)]">Filing status</Label>
        <Select value={filing} onValueChange={(v) => { if (isFilingStatus(v)) setFiling(v) }}>
          <SelectTrigger id="filing-status" aria-label="Filing status" className="mt-1 h-9 w-full rounded-lg bg-[var(--surface-1)] text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {Object.values(FilingStatus).map((v) => (
              <SelectItem key={v} value={v} className="text-[13px]">{FILING_LABELS[v]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-[var(--text-muted)]">
        {filing === FilingStatus.mfj
          ? `Married filing jointly doubles the standard deduction to ${fmt0(FED_MFJ.standardDeduction)} and roughly doubles the width of each federal bracket. The app still plans around your own income only, as if your partner earns nothing, so it shows the most your household could gain from filing together.`
          : `Single uses the ${fmt0(FED.standardDeduction)} standard deduction and the single federal brackets for 2026. Pick Married filing jointly if you file one return with a spouse.`}
      </p>
    </Card>
  )
}
