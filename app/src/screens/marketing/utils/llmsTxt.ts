import { FAQ_ITEMS } from '@/screens/marketing/constants/FAQ_ITEMS'
import { PUBLISHER } from '@/screens/marketing/constants/PUBLISHER'
import { TUTORIAL_CHAPTERS } from '@/screens/marketing/constants/TUTORIAL_CHAPTERS'
import { absoluteUrl } from '@/screens/marketing/utils/absoluteUrl'

// llms.txt (llmstxt.org): a plain-text summary of the product for agents that browse. Same facts as the page.
export function llmsTxt(): string {
  const faq = FAQ_ITEMS.map((f) => `- ${f.question} ${f.answer}`).join('\n')
  const chapters = TUTORIAL_CHAPTERS.map((c) => `- ${c.title} (${c.length}): ${c.summary}`).join('\n')
  return `# Ledger

> A free, open source financial planning app that reads your bank statements. It runs in your browser or on your own computer, needs no account and no bank login, and has no server. Your statements go only to the AI assistant you choose. By ${PUBLISHER.name}.

## Key facts

- Price: free. License: MIT. Source: ${PUBLISHER.github}
- Platform: any modern browser at ${absoluteUrl('/app')}, or run locally with Node.js (clone the repo, npm install, npm run dev).
- How data gets in: you download statements (PDF or CSV, any bank), give them to an AI assistant such as Claude, ChatGPT or Codex with Ledger's import prompt, and upload the ledger-data.json file it makes. Ledger never sees the statements themselves.
- Where data lives: in your browser (IndexedDB) or in a data folder on your computer. There is no server, no database and no analytics on your data.
- What it does: Getting started (a guide to how the tabs fit together, how your file is kept and how to set up a retirement plan step by step), About you (your birth date, filing status and tax state, which the planning pages read), Spending (real income and spending by month and category from your statements), Budget (a plan compared to actuals, subscriptions filled in automatically), Log (what you spend between statements, with meters per budget row), Tools (take-home pay with 401k and medical deductions, hourly pay, rent scenarios, rent to income, effective rental cost, vacation, debt payoff, equity payout), Balances (debts and assets) and Retirement (a year by year projection with events like a house down payment, Social Security at a claim age, a locked 401k and a liquid savings pool, and a button that finds the earliest safe retirement age).
- What makes it different: the pages feed each other. Statements feed Spending, Spending feeds the Budget, the Budget's income and leftover feed the Tools and the Retirement plan, and Balances feed both. Change your salary once and the budget, rent scenarios and retirement projection all move.

## Pages

- [Home](${absoluteUrl('/')}): what Ledger is and how it works
- [Tutorial](${absoluteUrl('/tutorial')}): ten short videos, one per page of the app
- [App](${absoluteUrl('/app')}): the app itself (empty until you upload your file)
- [Source and docs](${PUBLISHER.github}): README, DOCS.md, the import prompt and how to contribute

## Tutorial chapters

${chapters}

## Questions people ask

${faq}
`
}
