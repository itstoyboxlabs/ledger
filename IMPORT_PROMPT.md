You are helping me import my bank and credit card statements into Ledger, a private financial planning app that runs on my computer. Read the statements I attach (PDF or CSV, from any bank) and produce one file named `ledger-data.json` in the exact format below.

Ledger keeps everything in this one file. If this is my first time, I will only give you statements, and you make a new file. After that, I will give you my last `ledger-data.json` (the one I exported from Ledger) together with my new statements. Then you add the new statements to that file and give the whole file back. Never start over when I give you a file. The section "Adding to my last file" below says exactly what to keep.

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
      "id": "cc-maple-2026-10-001",
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

A file I exported from Ledger also has `exportedAt` and a `settings` section after `transactions`. That is my budget, notes, plans and app settings. You never create it, read it or change it. See "Adding to my last file".

## Accounts

- One entry per account. The id is lowercase and stable, like `chk-harbor` or `cc-maple`. Never rename an id once it exists.
- `type` is `checking`, `savings` or `card`. `bank` is the bank's name. `last4` is only the last four digits. Never write a full account number anywhere.

## Merchants

- Ledger has logos for about 3,400 common merchants, listed one per line at https://raw.githubusercontent.com/itstoyboxlabs/ledger/main/app/scripts/icon-domains.txt. Each line reads `Brand name | domain | other spellings`, for example `Uber | uber.com | Uber Trip, Uber One`.
- If you can open that link, use the exact name from its Brand name column as the `merchant` for every merchant you find there, so "UBER *TRIP 8005" becomes "Uber" and "WHOLEFDS NYC 10021" becomes "Whole Foods". Then add that brand name and the domain from the same line to `merchants`. The third column lists spellings you may see on a statement, to help you find the right line.
- If you cannot open the link, use each merchant's common brand name, the one people would say out loud, and its website domain as described below. The app still matches most well-known merchants by name.
- `merchants` maps each merchant name you used to the merchant's main website domain, like `"Starbucks": "starbucks.com"`. The app uses it to show each company's logo. This map is optional: add a domain when you know it, and leave a merchant out when you do not. A merchant without a domain still gets a logo when the app recognizes its name, and otherwise shows its first letter.
- Use the brand's canonical primary domain: the one the company itself uses as its home page in the United States. Not a country site, a shop subdomain, a payment processor or a link from the statement. Some examples:
  - The subway, buses, OMNY and the LIRR are all "MTA", domain `mta.info`.
  - ChatGPT is billed by OpenAI, domain `openai.com`.
  - YouTube Premium is `youtube.com`, not `google.com`.
  - Uber rides are `uber.com`, and Uber Eats orders are `ubereats.com`.
  - DoorDash is `doordash.com`, even when the statement shows the restaurant's name after "DD *".
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
- `id` is `<account id>-<four digit year>-<two digit month>-<three digit number>`, using the year and month the statement closes, numbered in order within the statement. Older files may use ids without the year. Keep those as they are.
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

## Adding to my last file

When I give you my last `ledger-data.json` with new statements:

- Start from my file and add to it. Do not rebuild it from scratch.
- Keep every existing account, merchant, period, subscription and transaction exactly as it is. Never change or renumber an existing `id`, and never rename an account id.
- Skip any transaction already there, meaning the same account, date, amount and `desc`.
- Add the new transactions, periods, accounts and merchants. Update a subscription's `lastSeen` and amount as described above.
- Set `updated` to the newest statement end date.
- If my file has a `settings` section, copy it into the file you give back exactly as it is, byte for byte. Do not reformat it, sort it, shorten it or fix anything inside it. It holds my budget and plans, and Ledger loses them if it changes. Keep `version` and `exportedAt` as they are too.
- If my file has no `settings` section, do not add one. That is normal for a first file, and Ledger starts my budget and settings from its defaults.
- Give me back the whole file, not only the new parts. When I upload it, it replaces everything Ledger has stored, so anything left out is gone.

## Check your work

- For every statement, add up what you parsed and compare it to the totals the statement prints itself. For a card that is purchases, payments and credits. For a bank account use the deposits total, the withdrawals total and the running balance.
- Tell me the result for each statement. If anything does not match, find the missing or extra row and fix it before you hand the file over.
- Before you finish, ask me about anything you were unsure of: merchants you could not place, large one time charges, or transfers with no matching side.

When you are done, give me the whole finished `ledger-data.json` to download, with everything from my last file plus the new statements. If you cannot create files, say so and give it to me one statement at a time.
