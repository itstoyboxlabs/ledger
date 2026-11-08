import { AppKpi } from '@/screens/marketing/ui/AppKpi'
import { CategoryTable } from '@/screens/marketing/ui/CategoryTable'
import { DonutChart } from '@/screens/marketing/ui/DonutChart'
import { PreviewTabs } from '@/screens/marketing/ui/PreviewTabs'
import { APP_KPIS } from '@/screens/marketing/constants/APP_KPIS'
import { APP_PERIODS } from '@/screens/marketing/constants/APP_PERIODS'
import { DEMO_CATEGORIES } from '@/screens/marketing/constants/DEMO_CATEGORIES'
import { DEMO_TOTAL } from '@/screens/marketing/constants/DEMO_TOTAL'
import { SPENDING_VIEWS } from '@/screens/marketing/constants/SPENDING_VIEWS'

export function AppPreviewMain() {
  return (
    <div className="main">
      <div className="mh">
        <b>Spending</b>
        <span className="sel">
          Oct 2026{' '}
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
        <PreviewTabs items={APP_PERIODS} className="seg" />
      </div>
      <div className="kpis">
        {APP_KPIS.map((kpi) => (
          <AppKpi key={kpi.label} kpi={kpi} />
        ))}
      </div>
      <div className="chartc">
        <PreviewTabs items={SPENDING_VIEWS} className="tabs" />
        <div className="dn">
          <DonutChart categories={DEMO_CATEGORIES} total={DEMO_TOTAL} centerLabel="$6,405" />
          <CategoryTable categories={DEMO_CATEGORIES} total={DEMO_TOTAL} />
        </div>
      </div>
    </div>
  )
}
