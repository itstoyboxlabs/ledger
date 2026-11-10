export const FAQ_ITEMS = [
  {
    question: 'Is it safe to give my statements to an AI assistant?',
    answer: 'Your statements never go to Ledger. You download them from your bank and give them to your own AI assistant (ChatGPT or Claude) with the import prompt. The prompt tells it to keep only the date, merchant, amount and category, plus the last four digits of each account, and to scrub out your name, address and anything else that identifies you. That is just an extra precaution, because your statements are never uploaded to Ledger anyway. You upload only the file it makes, and it is kept in your browser. If you would rather keep everything on your own computer, run Ledger yourself with a coding assistant like Claude Code or Codex.',
  },
  {
    question: 'Which banks work?',
    answer: 'Any bank that lets you download statements as PDF or CSV. Mix as many banks and accounts as you like: checking, savings and credit cards.',
  },
  {
    question: 'Where is my data stored?',
    answer: 'In your browser, on your computer. Your statements and the numbers you enter are not uploaded anywhere. Use Export data any time to save a backup. It is one file, ledger-data.json, with your statements, budget and settings. If your browser is ever cleared, upload it again.',
  },
  {
    question: 'Is any data uploaded to a server?',
    answer: 'Only usage details. They are sent to track how the site is used for product design and analytics, and to make sure the app works well. It is just which page and tool is used plus a random session ID. No personal information and no actual values you enter are ever sent.',
  },
  {
    question: 'How do I add next month?',
    answer: 'Click Export data to save your latest ledger-data.json. Give that file to your assistant with the new statements and the import prompt. It adds the new month and keeps your budget and plans as they are. Then upload the file it gives back.',
  },
  {
    question: 'Does it cost anything?',
    answer: 'No. Ledger is free and open source. You only need an AI assistant like ChatGPT or Claude for the import.',
  },
  {
    question: 'Is this financial advice?',
    answer: "No. The tools and the retirement projection are estimates in today's dollars, meant as a guide. Talk to a professional for big decisions.",
  },
]
