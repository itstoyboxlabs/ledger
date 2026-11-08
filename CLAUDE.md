# Ledger

A financial planning app that reads bank statements. Claude is the importer: you read the user's statements and write one data file, and the app shows it. Read README.md first, then IMPORT_PROMPT.md. The prompt in that file is the rulebook for turning statements into data.

## Two ways the app runs

- **Local mode** (`npm run dev` in `app/`): the dev server reads and writes the `data/` folder. This is the mode you work in.
- **Browser mode** (the hosted site, or `npm run dev -- --mode browser`): everything is stored in the browser and the user uploads a `ledger-data.json` file.

The app tells the modes apart by whether `/api/budget` answers.

## Importing statements (local mode)

When the user says they added statements:

1. Statements go in `statements/` (PDF or CSV, any bank), a folder you create yourself. Never commit this folder or `data/`.
2. Read IMPORT_PROMPT.md and follow it exactly. Write or extend `data/transactions.json` in that format (the same format as `ledger-data.json`). Keep every existing id, account, period and subscription. Add new ones.
3. Check every statement against the totals it prints, and fix any difference before you finish. Ask the user about anything you cannot place.
4. Add each new merchant's website to `merchants`, then run `bash scripts/fetch-icons.sh` to download its logo.
5. The app reloads on its own. Do not touch `data/budget.json`, `data/notes.json`, `data/presets.json` or `data/log.json`. Those are the user's settings, saved by the app.

## Working on the app

Read CODING_PATTERNS.md first: one thing per file under `app/src/screens/<page>` and `app/src/shared`, with a test beside every file. If the user keeps their data outside the project, `app/.env.local` sets `LEDGER_DATA_DIR`, and `data/` below means that folder.

- Use shadcn/ui for every button, input, dropdown, dialog and table (`app/src/shared/ui/primitives`). Do not build your own. Install new components with `pnpm dlx shadcn@latest add <name>` from `app/`, answer "n" to overwrite prompts, then check that the CLI did not install an unrelated `cn` package or write `from "cn"` imports (they should be `@/shared/utils/cn`).
- Every control uses the same corner radius, `rounded-lg`.
- UI copy is plain, short and friendly. No em dashes, no Oxford commas, no emojis. Use inline SVG icons.
- Keep localStorage keys (`ledger:<key>`) stable. If a saved shape changes, migrate it in place and read the old shape too.
- Tools are components registered in `TOOL_LIST`. See CONTRIBUTING.md.
- Look at the result in a browser before you call a change done.
