import type { FederalTax } from '@/shared/types/FederalTax'
// Federal income tax, single filer, tax year 2026. Source: IRS Rev. Proc. 2025-32.
export const FED: FederalTax = {
  standardDeduction: 16100,
  brackets: [
    [12400, 0.10], [50400, 0.12], [105700, 0.22], [201775, 0.24],
    [256225, 0.32], [640600, 0.35], [Infinity, 0.37],
  ],
}
