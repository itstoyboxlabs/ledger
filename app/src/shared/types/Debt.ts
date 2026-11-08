// What you owe. `payment` is typed in, unless `budgetRow` links a budget row whose amount is then the payment.
// `linkName` is a one-time hint from the old three-debt save (see useDebtLinkMigration).
export interface Debt {
  id: string
  name: string
  balance: number
  apr: number
  payment: number
  budgetRow: string | null
  linkName?: string
}
