# Demo

Everything in this folder is made up. Jordan Rivera is not a real person, the banks' statements are fictional layouts and the numbers are invented. It is safe to show on screen.

## What is here

- `statements/` has 15 fake statement PDFs: five months (June to October 2026) for three accounts, a Chase checking account, a Chase rewards card and a Harbor Bank savings account.
- `ledger-data.json` is the file an AI assistant produces when you give it those statements and the import prompt. It has 330 transactions.
- `ledger-settings.json` is a budget, balances and plans for the same person: a $150,000 salary in New York City, student and car loans, stock options, a savings plan and a retirement projection.
- `generate.py` rebuilds all of it. Run `python3 demo/generate.py`.

## Showing it

1. Start the hosted-style app: `cd app && npm run dev -- --mode browser --port 5151`, then open http://localhost:5151/app. A fresh browser shows the empty state.
2. Open one of the statement PDFs and say that this is what you download from a bank.
3. Click "Copy import prompt" and say that you paste this into an AI assistant along with the statements. You do not have to run it live. It reads the PDFs and gives back `ledger-data.json`.
4. Click "Upload ledger-data.json" and pick `demo/ledger-data.json` and `demo/ledger-settings.json` together. The settings file is the backup you get from "Export data", and it brings the budget and plans.
5. Walk the pages: Spending, Budget (see the split of what is left), Log, Tools, Retirement and Balances.

To start over, clear the site data for localhost:5151 in your browser, or delete the site's IndexedDB in the developer tools.
