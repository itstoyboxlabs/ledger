import { BirthDateCard } from '@/screens/about-you/ui/BirthDateCard'
import { FilingStatusCard } from '@/screens/about-you/ui/FilingStatusCard'
import { TaxPlaceCard } from '@/screens/about-you/ui/TaxPlaceCard'

// About you: the few facts about you that the planning pages share. Set them once here and
// every page that needs them reads them from here.
export function AboutYouView() {
  return (
    <div className="mt-7 flex flex-col gap-5">
      <p className="max-w-[760px] text-[14px] leading-relaxed text-[var(--text-secondary)]">
        This is the starting point for planning. Tell Ledger your birth date, how you file your taxes and
        where you live. Budget, Tools and Retirement read these answers, so you only set them once
        and every number stays in step. Everything stays on this device.
      </p>
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <BirthDateCard />
        <FilingStatusCard />
      </div>
      <TaxPlaceCard />
    </div>
  )
}
