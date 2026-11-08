import type { LegacyDebts } from '@/shared/types/LegacyDebts'
/* ---------- balances: what you owe and what you have ---------- */

// Debts: [{ id, name, balance, apr, payment, budgetRow }]. `payment` is typed in, unless
// `budgetRow` links a Budget row, whose amount is then the payment. The key is still
// `debts`. Older saves were { loans, card, taxes }; those become three list entries on
// first read (same balances, same order). `linkName` is a one-time hint carried by those
// three: the Budget row name the old code matched by name. useDebtLinkMigration turns it
// into a row id if that row still exists, so nothing that worked before stops working.
export const LEGACY_DEBTS: readonly (readonly [id: keyof LegacyDebts, name: string, linkName: string])[] = [
  ['loans', 'Student loans', 'Student loans'],
  ['card', 'Credit card debt', 'Credit card minimum payment'],
  ['taxes', 'Taxes owed', 'Federal tax plan'],
]
