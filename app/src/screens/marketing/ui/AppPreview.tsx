import { AppPreviewMain } from '@/screens/marketing/ui/AppPreviewMain'
import { AppPreviewSidebar } from '@/screens/marketing/ui/AppPreviewSidebar'
import type { CSSProperties } from 'react'

// A drawing of Ledger's Spending page, built from sample numbers.
export function AppPreview() {
  return (
    <div className="app reveal zoom" style={{ '--d': '.25s' } as CSSProperties} role="img" aria-label="A drawing of Ledger's Spending page with totals, a category donut and a transactions table">
      <AppPreviewSidebar />
      <AppPreviewMain />
    </div>
  )
}
