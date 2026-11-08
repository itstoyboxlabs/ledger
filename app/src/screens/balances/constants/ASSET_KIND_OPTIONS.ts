import type { AssetKind } from '@/shared/enums/AssetKind'

// The account type picker on Balances. Pre-tax and Roth are locked until the 401k access age.
export const ASSET_KIND_OPTIONS: { value: AssetKind; label: string }[] = [
  { value: 'regular', label: 'Savings (use anytime)' },
  { value: 'pretax', label: 'Pre-tax 401k or IRA (locked)' },
  { value: 'roth', label: 'Roth 401k or IRA (locked)' },
]
