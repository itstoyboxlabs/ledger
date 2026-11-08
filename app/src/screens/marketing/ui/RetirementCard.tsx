import { RETIREMENT_ROWS } from '@/screens/marketing/constants/RETIREMENT_ROWS'

export function RetirementCard() {
  return (
    <div className="card">
      <table className="yr">
        <thead>
          <tr>
            <th>Age</th>
            <th style={{ textAlign: 'left' }}>Phase</th>
            <th>401k</th>
            <th>Withdrawals</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {RETIREMENT_ROWS.map((r) => (
            <tr key={r.age} className={r.highlight ? 'hl' : undefined}>
              <td>{r.age}</td>
              <td style={{ textAlign: 'left' }}>
                <span className="ph">
                  <i style={r.dot ? { background: r.dot } : undefined}></i>
                  {r.phase}
                </span>
              </td>
              <td>{r.k401}</td>
              <td className={r.withdrawals.startsWith('−') ? 'neg' : undefined}>{r.withdrawals}</td>
              <td>{r.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
