import type { AppKpiData } from '@/screens/marketing/types/AppKpiData'

type AppKpiProps = { kpi: AppKpiData }

// One of the three numbers at the top of the app preview.
export function AppKpi({ kpi }: AppKpiProps) {
  return (
    <div className="kpi">
      <small>{kpi.label}</small>
      <div className="v" style={kpi.valueColor ? { color: kpi.valueColor } : undefined}>
        {kpi.value}
      </div>
      <div className="d">{kpi.detailClass ? <span className={kpi.detailClass}>{kpi.detail}</span> : kpi.detail}</div>
      <svg className="sp" viewBox="0 0 56 20" aria-hidden="true">
        <polyline fill="none" stroke={kpi.stroke} strokeWidth="1.6" points={kpi.points} />
      </svg>
    </div>
  )
}
