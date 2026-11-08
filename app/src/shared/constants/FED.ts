import type { FederalTax } from '@/shared/types/FederalTax'
export const FED: FederalTax = {
  standardDeduction: 15750,
  brackets: [
    [12400, 0.10], [50400, 0.12], [105700, 0.22], [201775, 0.24],
    [256225, 0.32], [640600, 0.35], [Infinity, 0.37],
  ],
}
