import type { FeaturePanelContent } from '@/screens/marketing/types/FeaturePanelContent'
// The six feature tabs. A check can be plain text or { bold, rest }.
export const FEATURE_PANELS: FeaturePanelContent[] = [
  {
    id: 'spending',
    label: 'Spending',
    title: 'See what actually happened.',
    text: 'Analyze your spending by category, track trends over time and review every transaction from your statements.',
    checks: [
      'Category → subcategory → store',
      'Trends and cash flow views',
      { bold: 'Every subscription found for you', rest: ', with the day it bills and what it costs' },
      'Transaction and income tables',
      'One month, the last 3 or 6, or the year to date',
    ],
  },
  {
    id: 'budget',
    label: 'Budget',
    title: 'Plan what you can afford.',
    text: 'Your monthly plan, side by side with what really happened. Most of it fills itself in from your statements.',
    checks: [
      'Income from your paychecks, a tool or a number you type',
      'Simple rows, or stacks like a weekly grocery list',
      'Subscriptions that update themselves',
      "Split what's left between savings and goals",
    ],
  },
  {
    id: 'log',
    label: 'Log',
    title: 'Track it as it happens.',
    text: 'Statements lag by weeks. The Log is where you note what you spend during the month, so you never fall behind by accident.',
    checks: ['Amount, note, budget row and date', 'A meter for every row you track', 'Log by hand, or have your assistant do it'],
  },
  {
    id: 'tools',
    label: 'Tools',
    title: 'Answer the money questions.',
    text: 'Calculators for what comes up in real life. Show only the ones you want.',
    checks: [
      'Take-home pay after tax, 401k and insurance',
      'Debt payoff, rent scenarios and the 40x rule',
      'Equity payouts for RSUs, NSOs and ISOs',
      'Taxes for all 50 states, DC and New York City',
    ],
  },
  {
    id: 'balances',
    label: 'Balances',
    title: 'Know where you stand.',
    text: 'What you own and what you owe, in one place. Tools and Retirement build on these numbers.',
    checks: [
      'Debts with balance, rate and payment',
      'Payments linked to your budget rows',
      'Savings you can use and accounts that are locked',
      'The state you live in sets your taxes everywhere',
    ],
  },
  {
    id: 'retirement',
    label: 'Retirement',
    title: 'See the years ahead.',
    text: 'Project how your savings grow and find the earliest age you could retire without running out of money.',
    checks: [
      'Starts from your real balances and budget',
      'Social Security, a down payment, an options payout',
      'Separate investments for after you retire',
      'A year by year table of your whole plan',
    ],
  },
]
