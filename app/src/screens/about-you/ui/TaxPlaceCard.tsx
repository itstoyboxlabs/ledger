import { Card } from '@/shared/ui/Card'
import { Dropdown } from '@/shared/ui/Dropdown'
import { useTaxState } from '@/shared/hooks/useTaxState'
import { InfoTip } from '@/shared/ui/InfoTip'
import { STATES } from '@/shared/constants/STATES'
import { FilingStatus } from '@/shared/enums/FilingStatus'
import { useFilingStatus } from '@/shared/hooks/useFilingStatus'

// Where you pay state (and New York City) income tax. Same `taxState` key the Balances page
// used, so a saved choice carries over unchanged.
export function TaxPlaceCard() {
  const [taxState, setTaxState] = useTaxState()
  const [filing] = useFilingStatus()
  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-1.5 text-[15px] font-semibold">
        Tax state and city
        <InfoTip tip="State tax tables in the app are for single filers. For married filing jointly, a state that uses the federal standard deduction gets the joint one, and every other state keeps its single brackets. So state tax for married filers is an estimate, usually a little high." />
      </h2>
      <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">
        Where you live, or where you plan to live. Every tool taxes your pay here: federal tax,
        Social Security and Medicare, plus this state's income tax. Pick New York (NYC) to add the city
        tax too. Take-home pay, Hourly, Equity payout, Rent scenarios, Budget and Retirement all read it.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <Dropdown
          label="State"
          value={taxState}
          onChange={setTaxState}
          options={Object.entries(STATES).map(([value, s]) => ({ value, label: s.label }))}
        />
        <span className="text-[12px] text-[var(--text-muted)]">
          Federal, FICA and state{taxState === 'ny-nyc' ? ' plus NYC' : ''}, {filing === FilingStatus.mfj ? 'married filing jointly' : 'single filer'}. These are estimates.
        </span>
      </div>
    </Card>
  )
}
