# Contributing

Thanks for helping with Ledger. Small fixes and big features are both welcome.

## The short version

1. [Fork](https://github.com/itstoyboxlabs/ledger/fork) the repo and clone your fork.
2. Make a branch: `git switch -c fix-rounding`.
3. Make your change and add tests.
4. Run the checks below until they pass.
5. Push to your fork and open a pull request against `main`. Fill in the template.

A maintainer reviews every pull request. Nothing reaches `main` without a pull request and passing checks.
For anything big, open an issue first so we can agree on the idea before you spend time on it.

## Checks

Every pull request runs these in GitHub Actions. Run them yourself first:

```bash
cd app
npm ci
npm run typecheck     # TypeScript
npm run lint          # oxlint
npm run test:unit     # Vitest, one test file beside each source file
npx playwright install chromium   # once
npm run test:e2e      # Playwright, clicks through every page
```

`npm test` runs the unit tests and the browser tests together. The browser tests use fake data in a throwaway
browser, never your own files. See [app/e2e/README.md](app/e2e/README.md).

If you change what a page does, add or change its tests.

## Never post your own data

Do not put real statements, account numbers, names or screenshots of your own finances in an issue, a pull request, a
test or a commit. Use `app/public/sample-data.json`, which is fake. `data/` and `statements/` are ignored by git on
purpose. Do not remove those lines from `.gitignore`.

## Running it

```bash
cd app
npm install
npm run dev                      # local mode: reads and writes the data/ folder
npm run dev -- --mode browser    # browser mode: no file API, tests the upload flow
npm run build && npm run preview # the production build, same as the hosted site
```

The app decides its mode on load. If `/api/budget` answers, it is in local mode. If not, it is in browser mode. There is no flag for normal users.

## Where things live

Read [CODING_PATTERNS.md](CODING_PATTERNS.md) first. In short, `app/src/screens/<page>/` holds each page and
`app/src/shared/` holds what several pages use, with one thing per file and a test beside it.

- `app/src/App.jsx` is the shell: the sidebar, the page header and which page shows.
- `app/src/screens/` has one folder per page: spending, budget, log, tools, retirement, balances, notes and marketing. The Tools calculators are in `screens/tools/features/`.
- `app/src/shared/utils/` has the money, month and tax helpers (`fmt`, `monthOf`, `taxOn` and so on) and
  `shared/state/dataStore.js` holds the loaded statements.
- `app/src/shared/ui/primitives/` is shadcn/ui. Use these for every button, input, dropdown, dialog and table. Do not build your own primitives. `CLAUDE.md` has the install steps and the gotchas.
- `app/src/shared/utils/getBudget.js`, `saveBudget.js` and the other `get*` and `save*` files are the storage layer for both modes (files in local mode, IndexedDB in browser mode).
- `IMPORT_PROMPT.md` is the prompt people give an AI assistant to turn statements into `ledger-data.json`. If you change the data format, change the prompt.

## Adding a tool

Tools are code, not a form builder. Each one is a component on the Tools page.

1. Add a folder under `app/src/screens/tools/features/` with a component in its `ui/` folder like the existing ones. Use `ToolField` for number inputs, `ToolRow` for result rows and `useToolState('yourKey', defaults)` to remember what the user typed.
2. Add it to `TOOL_LIST` (`screens/tools/constants/TOOL_LIST.js`) with an id, a title and a one line description. The picker and the page layout read from there.
3. Write the description in plain language, like you are explaining it to a friend. Put units inside the inputs.

## Style

- Every control (button, input, dropdown, select, toggle) uses the same corner radius, `rounded-lg`. Do not give one a different radius. Surfaces like cards and menus are rounder and that is fine.
- Plain, short sentences in the UI. No em dashes, no Oxford commas, no emojis. Use inline SVG icons.
- Money is shown with `fmt` or `fmt0`. Negative numbers and over budget amounts are red, good ones are green, and prefer words ("$300 over budget") to signs.
- Keep existing localStorage keys. If you change the shape of saved data, migrate it in place so nobody's numbers reset.

Code is organized by feature with one thing per file. See [CODING_PATTERNS.md](CODING_PATTERNS.md) before adding code.

## Reviews, forks and security

- Pull requests from forks run the checks only after a maintainer approves the run. Workflows have read-only access
  and no secrets.
- Keep a pull request to one thing. Smaller changes get reviewed faster.
- Found a security problem? Do not open an issue. See [SECURITY.md](SECURITY.md).
- Be kind. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
