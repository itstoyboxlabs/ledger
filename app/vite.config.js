import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Where the budget, log, notes, presets and transactions files live. Default: the data/ folder next to app/.
// To keep them out of the project (for example in ~/Documents/Ledger/data), set LEDGER_DATA_DIR in the environment
// or in app/.env.local (not committed). A leading ~ means your home folder.
const here = path.dirname(fileURLToPath(import.meta.url))
const configured = process.env.LEDGER_DATA_DIR ?? loadEnv('development', here, '').LEDGER_DATA_DIR
const DATA_DIR = configured ? path.resolve(configured.replace(/^~(?=$|\/)/, process.env.HOME ?? '')) : path.resolve(here, '../data')

// the data folder doesn't exist on a fresh clone, so create it on the first save
function writeData(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, text)
}

const BUDGET_PATH = path.join(DATA_DIR, 'budget.json')

// tiny local persistence API so in-app budget edits and an assistant's monthly
// refresh both read/write the same data/budget.json file
function budgetApi() {
  return {
    name: 'budget-api',
    configureServer(server) {
      server.middlewares.use('/api/budget', (req, res) => {
        res.setHeader('content-type', 'application/json')
        if (req.method === 'GET') {
          res.end(fs.existsSync(BUDGET_PATH) ? fs.readFileSync(BUDGET_PATH, 'utf8') : '{"rows":[]}')
        } else if (req.method === 'POST') {
          let body = ''
          req.on('data', (c) => (body += c))
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body)
              if (!Array.isArray(parsed.rows)) throw new Error('rows must be an array')
              writeData(BUDGET_PATH, JSON.stringify(parsed, null, 2))
              res.end('{"ok":true}')
            } catch (e) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: e.message }))
            }
          })
        } else {
          res.statusCode = 405
          res.end('{"error":"method not allowed"}')
        }
      })
    },
  }
}

const NOTES_PATH = path.join(DATA_DIR, 'notes.json')

// personal notes (always-available header modal) — structured list of
// {id, text, createdAt, pinned}, same read/write-a-file pattern as budget
function notesApi() {
  return {
    name: 'notes-api',
    configureServer(server) {
      server.middlewares.use('/api/notes', (req, res) => {
        res.setHeader('content-type', 'application/json')
        if (req.method === 'GET') {
          res.end(fs.existsSync(NOTES_PATH) ? fs.readFileSync(NOTES_PATH, 'utf8') : '{"notes":[]}')
        } else if (req.method === 'POST') {
          let body = ''
          req.on('data', (c) => (body += c))
          req.on('end', () => {
            try {
              const { notes } = JSON.parse(body)
              if (!Array.isArray(notes)) throw new Error('notes must be an array')
              writeData(NOTES_PATH, JSON.stringify({ notes }, null, 2))
              res.end('{"ok":true}')
            } catch (e) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: e.message }))
            }
          })
        } else {
          res.statusCode = 405
          res.end('{"error":"method not allowed"}')
        }
      })
    },
  }
}

const PRESETS_PATH = path.join(DATA_DIR, 'presets.json')

// named tool presets (rent scenarios, retirement, …) — persisted to disk so they
// survive browser data clearing. Shape: { <toolKey>: [{name, data}, …] }
function presetsApi() {
  return {
    name: 'presets-api',
    configureServer(server) {
      server.middlewares.use('/api/presets', (req, res) => {
        res.setHeader('content-type', 'application/json')
        if (req.method === 'GET') {
          res.end(fs.existsSync(PRESETS_PATH) ? fs.readFileSync(PRESETS_PATH, 'utf8') : '{}')
        } else if (req.method === 'POST') {
          let body = ''
          req.on('data', (c) => (body += c))
          req.on('end', () => {
            try {
              const { key, presets } = JSON.parse(body)
              if (typeof key !== 'string' || !Array.isArray(presets)) throw new Error('need {key, presets[]}')
              const all = fs.existsSync(PRESETS_PATH) ? JSON.parse(fs.readFileSync(PRESETS_PATH, 'utf8')) : {}
              all[key] = presets
              writeData(PRESETS_PATH, JSON.stringify(all, null, 2))
              res.end('{"ok":true}')
            } catch (e) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: e.message }))
            }
          })
        } else {
          res.statusCode = 405
          res.end('{"error":"method not allowed"}')
        }
      })
    },
  }
}

const LOG_PATH = path.join(DATA_DIR, 'log.json')

// real-time spending log ("This month" tab) — hand-entered purchases between
// statements, each tagged with the budget row it counts against. Shape:
// { entries: [{id, date: 'YYYY-MM-DD', amount, note, rowId, createdAt}] }
function logApi() {
  return {
    name: 'log-api',
    configureServer(server) {
      server.middlewares.use('/api/log', (req, res) => {
        res.setHeader('content-type', 'application/json')
        if (req.method === 'GET') {
          res.end(fs.existsSync(LOG_PATH) ? fs.readFileSync(LOG_PATH, 'utf8') : '{"entries":[]}')
        } else if (req.method === 'POST') {
          let body = ''
          req.on('data', (c) => (body += c))
          req.on('end', () => {
            try {
              const { entries } = JSON.parse(body)
              if (!Array.isArray(entries)) throw new Error('entries must be an array')
              writeData(LOG_PATH, JSON.stringify({ entries }, null, 2))
              res.end('{"ok":true}')
            } catch (e) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: e.message }))
            }
          })
        } else {
          res.statusCode = 405
          res.end('{"error":"method not allowed"}')
        }
      })
    },
  }
}

const TXNS_PATH = path.join(DATA_DIR, 'transactions.json')

// read-only: statements data is written by an assistant from the PDFs, never by the app.
// Served over HTTP (not imported) so personal data never ends up in the build.
function transactionsApi() {
  return {
    name: 'transactions-api',
    configureServer(server) {
      server.middlewares.use('/api/transactions', (req, res) => {
        res.setHeader('content-type', 'application/json')
        if (req.method === 'GET') {
          res.setHeader('cache-control', 'no-store')
          res.end(
            fs.existsSync(TXNS_PATH)
              ? fs.readFileSync(TXNS_PATH, 'utf8')
              : '{"version":1,"accounts":{},"periods":{},"subscriptions":[],"merchants":{},"transactions":[]}',
          )
        } else {
          res.statusCode = 405
          res.end('{"error":"method not allowed"}')
        }
      })
    },
  }
}

// Ledger dashboard — pinned to :5150 (see ~/Dev/projects/CONVENTIONS.md port map)
// vercel.json sends every /app/* address to the app shell. `vite preview` has no such rule and would serve the
// landing page there, so this does the same rewrite for local previews of the build.
function appShellRewrite() {
  return {
    name: 'app-shell-rewrite',
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url && /^\/app\/[^.?]*(\?|$)/.test(req.url)) req.url = '/app/index.html'
        next()
      })
    },
  }
}

// `vite --mode browser` skips the file API plugins so the app runs in browser mode
// (IndexedDB), same as the static hosted build.
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    appShellRewrite(),
    ...(mode === 'browser'
      ? []
      : [budgetApi(), notesApi(), presetsApi(), logApi(), transactionsApi()]),
  ],
  resolve: {
    // "@/…" -> src/…, the alias shadcn/ui components import through
    alias: { '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), './src') },
  },
  // unit tests: src/**/*.test.ts(x), one file next to each util, hook and component.
  // The browser tests in e2e/ are Playwright's and run separately (npm run test:e2e).
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test-setup.ts'],
    passWithNoTests: true,
  },
  server: {
    port: 5150,
    strictPort: true,
    fs: {
      // the project root, and the data folder when it lives elsewhere
      allow: ['..', DATA_DIR],
    },
  },
}))
