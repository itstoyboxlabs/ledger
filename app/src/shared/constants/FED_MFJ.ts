import type { FederalTax } from '@/shared/types/FederalTax'
// Federal income tax, married filing jointly, tax year 2026.
// Source: IRS Rev. Proc. 2025-32, section 4.01 Table 1 (section 1(j)(2)(A)) and section 4.15
// (standard deduction $32,200), https://www.irs.gov/pub/irs-drop/rp-25-32.pdf
// Checked against the IRS news release IR-2025-103 (Oct. 9, 2025).
export const FED_MFJ: FederalTax = {
  standardDeduction: 32200,
  brackets: [
    [24800, 0.10], [100800, 0.12], [211400, 0.22], [403550, 0.24],
    [512450, 0.32], [768700, 0.35], [Infinity, 0.37],
  ],
}
