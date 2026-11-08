You are helping me import my bank and credit card statements into Ledger, a private financial planning app that runs on my computer. Read the statements I attach (PDF or CSV, from any bank) and produce one file named `ledger-data.json` in the exact format below. If I also attach an existing `ledger-data.json`, add to it instead of starting over.

## The file

```json
{
  "version": 1,
  "updated": "2026-10-31",
  "accounts": {
    "chk-harbor": { "name": "Checking", "bank": "Harbor Bank", "type": "checking", "last4": "4821" },
    "cc-maple":   { "name": "Maple Card", "bank": "Maple", "type": "card", "last4": "9037" }
  },
  "merchants": {
    "Whole Foods": "wholefoodsmarket.com",
    "Netflix": "netflix.com"
  },
  "periods": {
    "cc-maple-2026-10": { "account": "cc-maple", "start": "2026-10-01", "end": "2026-10-31" }
  },
  "subscriptions": [
    {
      "name": "Netflix",
      "what": "Streaming",
      "account": "cc-maple",
      "cadence": "monthly",
      "amount": 15.49,
      "lastSeen": "2026-10-12",
      "billing": "12th"
    }
  ],
  "transactions": [
    {
      "id": "cc-maple-10-001",
      "date": "2026-10-04",
      "account": "cc-maple",
      "statement": "cc-maple-2026-10",
      "desc": "WHOLEFDS NYC 10021",
      "merchant": "Whole Foods",
      "amount": 78.47,
      "kind": "expense",
      "cat": "Food & Dining",
      "sub": "Groceries"
    }
  ]
}
```

## Accounts

- One entry per account. The id is lowercase and stable, like `chk-harbor` or `cc-maple`. Never rename an id once it exists.
- `type` is `checking`, `savings` or `card`. `bank` is the bank's name. `last4` is only the last four digits. Never write a full account number anywhere.

## Merchants

- `merchants` maps each merchant name you used to its website domain, like `"Starbucks": "starbucks.com"`. The app uses it to show each company's logo.
- Add one entry per merchant, not per transaction. Only add a domain when you are sure of it. Leave out anything you would be guessing at, like a person on Venmo or a local shop you do not recognize.
- Also add each bank from `accounts` (like "Chase") to `merchants` with its website domain, so the sidebar can show the bank's logo next to its name.
- When you add to an existing file, keep every entry that is already there.

## Statements

- Every statement gets one entry in `periods`, keyed `<account id>-<year>-<month>` using the month the statement closes. `start` and `end` are the statement's own opening and closing dates.
- Every transaction has a `statement` that points at its period.

## Transactions

- `amount` is always a positive number. `kind` says which way the money moved:
  - `expense`: money you spent at a merchant.
  - `income`: money that came in, like payroll, deposits, interest, rewards and Venmo cash outs.
  - `refund`: a credit from a merchant. It nets against the category it came from.
  - `transfer`: money moved between my own accounts, like a credit card payment from checking and the matching credit on the card, or a move to savings. Include both sides. Transfers are left out of spending and income so nothing is counted twice.
- `date` is `YYYY-MM-DD`, the date printed on the statement line.
- `desc` is the raw text from the statement, unchanged.
- `merchant` is a short human name that is spelled the same way every month. "WHOLEFDS NYC 10021" and "WHOLE FOODS MKT 123" are both "Whole Foods". Merchant names are how the app matches transactions to budget rows, so keep them stable.
- `id` is `<account id>-<two digit statement month>-<three digit number>`, numbered in order within the statement.
- Paychecks use `cat` "Income" and `sub` "Payroll". If a paycheck is a partial one, like a first or last check, add `"partial": true`.
- Add a short `note` only when something is unusual.

## Categories

Use only these. If nothing fits, use Other / Misc.

- Housing: Rent, Storage & Moving
- Food & Dining: Groceries, Restaurants & Takeout, Coffee & Juice, Uber Eats
- Shopping: Amazon, Retail & Home, Pharmacy & Convenience, PayPal Pay in 4, Affirm
- Transportation: Transit, Rideshare & Bikes, Car
- Subscriptions & Software: Software & AI, Streaming & Media, Dev & Infra
- Health & Insurance: Health Insurance, Health Care, Other Insurance
- Bills & Utilities: Electricity, Phone & Internet
- Entertainment: Events & Going Out
- Taxes & Fees: Taxes & Gov Fees, Interest & Fees
- Other: Personal Care, Services, Venmo & P2P, Misc
- Income: Payroll, Rewards, Selling & Refunds, Other Income
- Transfers: Card Payments, Account Transfers

Everything is personal spending. Do not split business from personal.

## Subscriptions

- Add a subscription when a merchant charges about the same amount on a regular schedule. `cadence` is `monthly`, `weekly` or `annual`.
- `lastSeen` is the date of its most recent charge. `billing` is the day it bills, like "12th", or "~12th" if you have only seen it once.
- A single large charge that looks like a yearly plan is not something to guess about. Ask me whether it is annual before you set `cadence`.
- If an existing file already lists a subscription, update its `lastSeen` and amount. Never delete one. Ones that stop charging hide themselves.

## Adding to an existing file

- Keep every existing account, period, subscription and transaction. Never change an existing `id`.
- Skip any transaction already there, meaning the same account, date, amount and `desc`.
- Set `updated` to the newest statement end date.

## Check your work

- For every statement, add up what you parsed and compare it to the totals the statement prints itself. For a card that is purchases, payments and credits. For a bank account use the deposits total, the withdrawals total and the running balance.
- Tell me the result for each statement. If anything does not match, find the missing or extra row and fix it before you hand the file over.
- Before you finish, ask me about anything you were unsure of: merchants you could not place, large one time charges, or transfers with no matching side.

When you are done, give me the finished `ledger-data.json` to download. If you cannot create files, say so and give it to me one statement at a time.
