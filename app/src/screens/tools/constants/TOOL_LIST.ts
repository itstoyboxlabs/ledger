import type { ToolCatalogEntry } from '@/screens/tools/types/ToolCatalogEntry'

// Tools page: [id, title, one-line description], alphabetical. Drives the
// "What to show" picker and the order the tools sit on screen. Lists the user makes
// are added after these (see useToolCatalog).
export const TOOL_LIST: ToolCatalogEntry[] = [
  ['cash', 'Cash between two days', 'What comes due between two days of the month and what is left after.'],
  ['debt', 'Debt payoff', 'How long your debts take to clear at a steady monthly payment.'],
  ['rentalcost', 'Effective rental cost', 'What a free-months deal really costs per month.'],
  ['stock', 'Equity payout', 'What your RSUs or options pay out after tax at an exit price.'],
  ['hourly', 'Hourly calculator', 'Turn an hourly rate into weekly and yearly pay after tax.'],
  ['rentscenarios', 'Rent scenarios', 'If rent were X, what is left over each month.'],
  ['renttoincome', 'Rent-to-income', 'Check a rent against the 40x income rule.'],
  ['takehome', 'Take-home pay', 'From gross salary to paycheck after tax, 401k and medical.'],
  ['vacation', 'Vacation planning', 'Total cost of a trip from hotel, flight, food and spending.'],
]
