import type { NavEntry } from '@/shared/types/NavEntry'
// top nav bar — title, view tabs, plus the account/filter strip
// beneath it. Pinned to exactly 2 lines regardless of viewport width.
export const NAV: readonly NavEntry[] = [
  ['about', 'About you', 'user', 'Your birth date, filing status and tax state. The planning pages read them from here.'],
  ['actuals', 'Spending', 'dollar', 'Your real spending and income from your bank statements.'],
  ['budget', 'Budget', 'wallet', 'Your monthly plan and how the real numbers compare.'],
  ['log', 'Log', 'receipt', 'A running log of what you spend between statements.'],
  ['tools', 'Tools', 'calc', 'Calculators for the money questions that come up, like what an apartment really costs, what a salary takes home, or how much cash you need until the next paycheck.'],
  ['retirement', 'Retirement', 'leaf', 'See how your savings grow and find the age you can retire.'],
  ['balances', 'Balances', 'landmark', 'What you own and what you owe. Tools and Retirement use these.'],
]
