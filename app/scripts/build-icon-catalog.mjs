// Builds the shared merchant logo catalog for the hosted site from scripts/icon-domains.txt.
// Each line there is `Brand name | domain | alias, alias`. For every domain this downloads a 64px favicon from the
// same service scripts/fetch-icons.sh uses, keeps it only when it is a real, small PNG (not the service's default
// globe), converting other image types to PNG with macOS `sips` when it is there, and saves it to app/.icon-catalog/<domain>.png (gitignored). Then it writes app/.icon-catalog/index.json:
//   { domains: [every domain with a logo], names: { "<normalized brand name or alias>": "<domain>" } }
// Run it from app/ with `node scripts/build-icon-catalog.mjs`, then `npm run icons` to upload. It skips logos it
// already has, so running it again only fetches what is missing. Nothing here touches anyone's data.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import os from 'node:os'
import { execFileSync } from 'node:child_process'
import { normalizeMerchantName } from '../src/shared/utils/normalizeMerchantName.ts'

const LIST = path.resolve('scripts/icon-domains.txt')
const OUT = path.resolve('.icon-catalog')
const CONCURRENCY = 8
const MAX_BYTES = 6 * 1024
// many big brands only publish a 16px favicon; that still beats a letter at the app's 18px icon size
const MIN_SIDE = 16
// Name keys that are everyday words. A merchant called "Rent", "Budget" or "Acme Corp payroll" must not get a
// brand's logo, so these never go in the names map (the brand still matches by its domain or a longer alias).
// One-letter keys are dropped too.
const GENERIC = new Set(
  ('rent one current public common flex found branch self ring box max bread simply shop office prime kit close ' +
    'front square block home tidy level august sense root future express loft guess merit agency native on dig ' +
    'slice toast care compass better rate wise ramp bill wave stash republic river strike ledger clear and acme pay ' +
    'payment transfer check card interest fee deposit cash water wine time people city general standard golden big ' +
    'act active make name take sat sec round nation vote information insider owner hey you later kick render ' +
    'reflect extend related relay eleven password lot quest summit sunrise signal discovery budget build bet ' +
    'battle format segment monday medium linear circle factor factory ghost tower zip pitch tally century royal ' +
    'payroll transit metro parking storage market fresh grocery deli pizza coffee bakery gas taxi bank credit ' +
    'loan mortgage insurance health dental vision pharmacy gym fitness yoga salon spa hotel airline travel')
    .split(' '),
)
const faviconUrl = (d) => `https://www.google.com/s2/favicons?domain=${d}&sz=64`

// `Brand name | domain | alias, alias` -> { brand, domain, aliases }
const entries = fs
  .readFileSync(LIST, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const [brand = '', domain = '', aliases = ''] = l.split('|').map((s) => s.trim())
    return { brand, domain: domain.toLowerCase(), aliases: aliases.split(',').map((s) => s.trim()).filter(Boolean) }
  })
  .filter((e) => {
    const ok = e.brand && /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(e.domain)
    if (!ok) console.log('skipping bad line:', e.brand || '(no name)', e.domain)
    return ok
  })
const domains = [...new Set(entries.map((e) => e.domain))]
fs.mkdirSync(OUT, { recursive: true })

const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex')
const isPng = (buf) => buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47
const pngSize = (buf) => ({ w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) })

// Converts any image to PNG (and shrinks it to `side` px when bigger) with macOS `sips`. Null when that fails or
// `sips` is missing, in which case the logo is skipped.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ledger-icons-'))
function toPng(buf, name, side = 64) {
  try {
    const inFile = path.join(tmp, `${name}.in`)
    const outFile = path.join(tmp, `${name}.png`)
    fs.writeFileSync(inFile, buf)
    execFileSync('sips', ['-s', 'format', 'png', '-Z', String(side), inFile, '--out', outFile], { stdio: 'ignore' })
    return fs.readFileSync(outFile)
  } catch {
    return null
  }
}

async function get(url) {
  const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) })
  return { ok: res.ok, buf: Buffer.from(await res.arrayBuffer()) }
}

// The service answers an unknown site with its generic globe. Fetch that once and skip anything identical.
const placeholders = new Set()
for (const d of ['no-such-site-ledger-catalog.invalid', 'example.invalid']) {
  try {
    placeholders.add(sha((await get(faviconUrl(d))).buf))
  } catch {
    /* offline: the size and status checks still apply */
  }
}

const tally = { ok: 0, had: 0, missing: 0, placeholder: 0, tooSmall: 0, tooBig: 0, notPng: 0, error: 0 }
async function fetchOne(domain) {
  const file = path.join(OUT, `${domain}.png`)
  if (fs.existsSync(file) && fs.statSync(file).size > 0) return tally.had++
  try {
    const { ok, buf } = await get(faviconUrl(domain))
    if (!ok) return tally.missing++
    if (placeholders.has(sha(buf))) return tally.placeholder++
    let png = isPng(buf) ? buf : toPng(buf, domain)
    if (!png || !isPng(png)) return tally.notPng++
    for (const side of [64, 48, 32]) if (png.length > MAX_BYTES) png = toPng(png, domain, side) ?? png
    const { w, h } = pngSize(png)
    if (w < MIN_SIDE || h < MIN_SIDE) return tally.tooSmall++
    if (png.length > MAX_BYTES) return tally.tooBig++
    fs.writeFileSync(file, png)
    tally.ok++
  } catch {
    tally.error++
  }
}

let next = 0
let done = 0
async function worker() {
  while (next < domains.length) {
    await fetchOne(domains[next++])
    if (++done % 250 === 0) console.log(`${done} / ${domains.length}`)
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))
fs.rmSync(tmp, { recursive: true, force: true })

// The index lists only domains that have a logo, and only names that point at one. A brand name wins over an
// alias that normalizes to the same key, and an earlier line wins over a later one.
const have = new Set(fs.readdirSync(OUT).filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4)))
const listed = domains.filter((d) => have.has(d)).sort()
const names = {}
for (const pass of ['brand', 'aliases']) {
  for (const e of entries) {
    if (!have.has(e.domain)) continue
    for (const n of pass === 'brand' ? [e.brand] : e.aliases) {
      const key = normalizeMerchantName(n)
      if (key.length > 1 && !GENERIC.has(key) && !(key in names)) names[key] = e.domain
    }
  }
}
const sorted = Object.fromEntries(Object.entries(names).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({ domains: listed, names: sorted }))

const bytes = listed.reduce((s, d) => s + fs.statSync(path.join(OUT, `${d}.png`)).size, 0)
console.log(
  `\n${listed.length} of ${domains.length} domains have a logo (${(bytes / 1024 / 1024).toFixed(1)} MB), ` +
    `${Object.keys(sorted).length} names. This run: ${tally.ok} new, ${tally.had} already here, ` +
    `${tally.missing} not found, ${tally.placeholder} placeholder, ${tally.tooSmall} too small, ` +
    `${tally.tooBig} too big, ${tally.notPng} not PNG, ${tally.error} errors.`,
)
