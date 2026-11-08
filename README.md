# Ledger

A financial planning app that reads your bank statements. No bank connections, no accounts, and nothing leaves your computer.

You download your statements, give them to an AI assistant (Claude, ChatGPT, Codex or similar), and it turns them into one file. Ledger reads that file and shows you where your money goes.

## Why Ledger exists

Most money apps are too simple. They show a spending chart and a monthly budget, and that is where they stop. Real
finances have more going on: irregular bills, a paycheck with deductions, debts with their own payments, savings
goals, a job change, a move, and a future you want to plan for. Ledger is built to handle that complexity instead of
hiding from it, and to keep the app easy enough to use that the complexity does not get in your way.

It is one connected plan that follows your life in order:

- **Look back.** Your real statements show where the money actually went.
- **Stay on track.** A running log tells you, as the month goes, whether you are on pace.
- **Plan ahead.** A budget built from your real income, bills, debts and goals, with calculators for the big
  decisions like rent, take-home pay and debt payoff.
- **Retire with confidence.** The same data feeds a retirement projection, so the plan for later starts from what is
  true today.

The goal is ambitious: a financial planning tool that is as powerful as the situation needs and still approachable.

## What you get

- **Spending**: your real income and spending by month and category, with trends and cash flow.
- **Budget**: a plan for the month, compared against what you actually spent. Subscriptions fill in on their own.
- **Log**: a running count of what you spend between statements, so you know if you are on track.
- **Tools**: calculators for take-home pay, rent, debt payoff, vacations and more.
- **Retirement**: a projection of your savings that finds the age you can stop working.

## How it works

1. Download your statements from your bank. PDF or CSV, any bank.
2. Open your AI assistant (Claude, ChatGPT, Codex or similar), attach the statements and paste the import prompt (it is in [IMPORT_PROMPT.md](IMPORT_PROMPT.md) and behind a button in the app).
3. The assistant gives you `ledger-data.json`. Upload it to Ledger.

Next month, do it again with the new statements and the same file. The assistant adds to it.

## Two ways to run it

**In your browser.** Open the site and upload your file. Everything is stored in your browser and never sent anywhere. Clearing your browser data clears it. Your statements are safe in the `ledger-data.json` file your assistant made, so upload it again. Your budget and settings are not in that file, so use the Export data button now and then to save them to a second file and upload that too.

**On your computer.** Clone the repo and run it. A coding assistant such as Claude Code or Codex can read your statements folder and write the data files for you, and nothing is lost when you clear your browser.

```bash
git clone https://github.com/itstoyboxlabs/ledger.git
cd ledger/app
npm install
npm run dev
```

Then put your statements in a `statements/` folder and tell your coding assistant to import them. It follows the same rules as the import prompt.

By default your data files go in a `data/` folder next to `app/`. To keep them somewhere else, such as your Documents folder, create `app/.env.local` with the path:

```
LEDGER_DATA_DIR=~/Documents/Ledger/data
```

Git ignores `data/`, `statements/` and `.env.local`, so none of it is ever committed.

## Privacy

Your statements are only ever read by the assistant you choose, the same way any file you attach to a chat is. Ledger itself has no server, no database and no analytics on your data. You can read all of the code to check.

## Built with

React, TypeScript-ready Vite, Tailwind, shadcn/ui and Zustand. Charts use Recharts. The landing page and tutorial are part of the same React project and are prerendered at build time.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Adding a new calculator to the Tools page is a good first change.

Code is organized by feature with one thing per file. See [CODING_PATTERNS.md](CODING_PATTERNS.md) before adding code.

## License

MIT. See [LICENSE](LICENSE).
