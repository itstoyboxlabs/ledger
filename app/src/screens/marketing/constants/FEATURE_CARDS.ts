import type { FeatureCardContent } from '@/screens/marketing/types/FeatureCardContent'

// The five stacked feature cards, in page order. Each tint is set in marketing.css as .fcard[data-card=<id>].
export const FEATURE_CARDS: FeatureCardContent[] = [
  {
    id: 'spending',
    eyebrow: 'Spending',
    title: 'See what actually happened.',
    text: 'Analyze your spending by category, track trends over time and review every transaction from your statements. Every subscription is found for you.',
  },
  {
    id: 'budget',
    eyebrow: 'Budget',
    title: 'Plan what you can afford.',
    text: 'Your monthly plan, side by side with what really happened. Most of it fills itself in from your statements.',
  },
  {
    id: 'log',
    eyebrow: 'Log',
    title: 'Track it as it happens.',
    text: 'Statements lag by weeks. The Log is where you note what you spend during the month, so you never fall behind by accident.',
  },
  {
    id: 'balances',
    eyebrow: 'Balances',
    title: 'Know where you stand.',
    text: 'What you own and what you owe, in one place. Tools and Retirement build on these numbers.',
  },
  {
    id: 'retirement',
    eyebrow: 'Retirement',
    title: 'See the years ahead.',
    text: 'Project how your savings grow and find the earliest age you could retire without running out of money.',
  },
]
