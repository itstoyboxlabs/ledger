import { BUDGET_ROWS } from '@/screens/marketing/constants/BUDGET_ROWS'

export function BudgetCard() {
  return (
    <div className="card">
      <div className="grid2" style={{ marginBottom: 12 }}>
        <div className="mk">
          <small>Monthly income</small>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--good)' }}>$7,774</div>
          <small>From your statements</small>
        </div>
        <div className="mk">
          <small>Left over / month</small>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--good)' }}>$1,363</div>
          <small>Actual, Oct: $1,369 · $6 ahead</small>
        </div>
      </div>
      <div className="rows">
        {BUDGET_ROWS.map((row) => (
          <div className="r" key={row.name}>
            <span className="n">
              <span className="chip">{row.chip}</span>
              {row.name}
              {row.note && (
                <>
                  {' '}
                  <span style={{ color: 'var(--dim)', fontSize: 12 }}>{row.note}</span>
                </>
              )}
            </span>
            <b>{row.amount}</b>
          </div>
        ))}
        <div className="r" style={{ background: 'rgba(110,128,255,.07)', borderColor: 'rgba(110,128,255,.2)' }}>
          <span className="n">What&apos;s left: 60% savings · 40% unexpected</span>
          <b className="pos">$818 · $545</b>
        </div>
      </div>
    </div>
  )
}
