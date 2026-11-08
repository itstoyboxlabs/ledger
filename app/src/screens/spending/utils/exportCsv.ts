import { acctName } from '@/shared/utils/acctName'
import { txnValue } from '@/screens/spending/utils/txnValue'
import type { Transaction } from '@/shared/types/Transaction'

// transfers are left out of spending and income, but the file keeps their real amount
const csvAmount = (t: Transaction): number => (t.kind === 'transfer' ? t.amount : txnValue(t))

export function exportCsv(txns: Transaction[], name: string): void {
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [
    ['date', 'merchant', 'description', 'category', 'subcategory', 'account', 'kind', 'amount'].join(','),
    ...txns.map((t) =>
      [t.date, t.merchant, t.desc, t.cat, t.sub, acctName(t.account), t.kind, csvAmount(t).toFixed(2)]
        .map(esc)
        .join(','),
    ),
  ]
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}
