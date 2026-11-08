import type { LtcgThresholds } from '@/shared/types/LtcgThresholds'
// Federal long-term capital gains, single filer, tax year 2026.
// Source: IRS Rev. Proc. 2025-32 (2026 inflation adjustments): the 0% rate applies up to
// $49,450 of taxable income, 15% up to $545,500 and 20% above. The 3.8% Net Investment
// Income Tax (IRC section 1411) applies to the lesser of the gain or the income over
// $200,000 (single, not indexed). Same breakpoints as gainsTaxPct in App.jsx.
// Not modeled: AMT on ISO exercises, itemized deductions, credits.
export const LTCG: LtcgThresholds = { zeroTo: 49450, fifteenTo: 545500, niitOver: 200000, niitRate: 0.038 }
