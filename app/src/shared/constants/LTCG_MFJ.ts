import type { LtcgThresholds } from '@/shared/types/LtcgThresholds'
// Federal long-term capital gains, married filing jointly, tax year 2026.
// Source: IRS Rev. Proc. 2025-32, section 4.03 (section 1(h)): the 0% rate applies up to
// $98,900 of taxable income and 15% up to $613,700, 20% above.
// https://www.irs.gov/pub/irs-drop/rp-25-32.pdf
// Net Investment Income Tax: 3.8% over $250,000 of income for joint filers (IRC section
// 1411(b), not indexed). Source: IRS Topic 559, https://www.irs.gov/taxtopics/tc559
export const LTCG_MFJ: LtcgThresholds = { zeroTo: 98900, fifteenTo: 613700, niitOver: 250000, niitRate: 0.038 }
