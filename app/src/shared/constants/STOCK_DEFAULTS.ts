import type { StockInputs } from '@/shared/types/StockInputs'
/* ---------- equity payout ---------- */

// Saved state from before the type picker has no `type`: that is Options (NSO), which is
// what the tool always computed, so those saves give the same result to the cent.
export const STOCK_DEFAULTS: StockInputs = { type: 'nso', exit: 20, strike: 10, shares: 0, salary: 100000, years: 1, heldOver: false }
