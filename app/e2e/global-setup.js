import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

// Safety net. The suite only talks to a browser-mode server, so it should never touch the
// real ../data folder. This hashes every file there before the run and fails the run if
// any of them changed (or appeared, or vanished) by the end.
const HERE = path.dirname(fileURLToPath(import.meta.url))
// the project's data/ folder, or wherever LEDGER_DATA_DIR (env or app/.env.local) points
function dataDir() {
  let dir = process.env.LEDGER_DATA_DIR
  try {
    const m = fs.readFileSync(path.resolve(HERE, '../.env.local'), 'utf8').match(/^LEDGER_DATA_DIR=(.*)$/m)
    dir ??= m?.[1].trim()
  } catch { /* no .env.local */ }
  return dir ? path.resolve(dir.replace(/^~(?=$|\/)/, process.env.HOME ?? '')) : path.resolve(HERE, '../../data')
}
const DATA = dataDir()

function snapshot() {
  const out = {}
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name)
      if (f.isDirectory()) walk(p)
      else out[path.relative(DATA, p)] = crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex')
    }
  }
  walk(DATA)
  return out
}

export default async function globalSetup() {
  const before = snapshot()
  return async () => {
    const after = snapshot()
    const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((k) => before[k] !== after[k])
    if (changed.length) throw new Error(`The test run changed real data files: ${changed.join(', ')}`)
  }
}
