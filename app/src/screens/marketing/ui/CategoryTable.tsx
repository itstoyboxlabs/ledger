import { formatMoney } from '@/screens/marketing/utils/formatMoney'
import { percentOf } from '@/screens/marketing/utils/percentOf'
import type { DemoCategory } from '@/screens/marketing/types/DemoCategory'

type CategoryTableProps = { categories: DemoCategory[]; total: number }

export function CategoryTable({ categories, total }: CategoryTableProps) {
  return (
    <table className="cat">
      <thead>
        <tr>
          <th>Category</th>
          <th>Amount</th>
          <th>%</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((c) => (
          <tr key={c.name}>
            <td>
              <span className="sw" style={{ background: c.color }}></span>
              {c.name}
            </td>
            <td>{formatMoney(c.amount)}</td>
            <td>{percentOf(c.amount, total)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
