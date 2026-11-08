export const FAQ_ITEMS = [
  {
    question: 'Is it safe to give my statements to an AI assistant?',
    answer: 'The assistant reads your statements. Ledger itself never sees them, only the file the assistant makes. The import prompt keeps just the last four digits of each account, and you can black out account numbers before you share anything. If you would rather keep everything on your own computer, run Ledger yourself with a coding assistant like Claude Code or Codex.',
  },
  {
    question: 'Which banks work?',
    answer: 'Any bank that lets you download statements as PDF or CSV. Mix as many banks and accounts as you like: checking, savings and credit cards.',
  },
  {
    question: 'Where is my data stored?',
    answer: 'In your browser, on your computer. Nothing is sent to a server. Use Export data any time to save a backup. It is one file, ledger-data.json, with your statements, budget and settings. If your browser is ever cleared, upload it again.',
  },
  {
    question: 'How do I add next month?',
    answer: 'Click Export data to save your latest ledger-data.json. Give that file to your assistant with the new statements and the import prompt. It adds the new month and keeps your budget and plans as they are. Then upload the file it gives back.',
  },
  {
    question: 'Does it cost anything?',
    answer: 'No. Ledger is free and open source. You only need an AI assistant like ChatGPT, Claude or Codex for the import.',
  },
  {
    question: 'Is this financial advice?',
    answer: "No. The tools and the retirement projection are estimates in today's dollars, meant as a guide. Talk to a professional for big decisions.",
  },
]
