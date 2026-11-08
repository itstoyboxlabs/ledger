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
    answer: 'In your browser, on your computer. Nothing is sent to a server. Use Export data to save a backup of your budget and settings, and upload it again if your browser is ever cleared.',
  },
  {
    question: 'How do I add next month?',
    answer: 'Download the new statements, ask your assistant to update the file it made, then upload it again. Uploading replaces what is stored, so use Export data first and upload that backup together with the new file to keep your budget and plans.',
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
