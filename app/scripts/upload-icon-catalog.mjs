// Uploads the merchant logo catalog in app/.icon-catalog/ (built by scripts/build-icon-catalog.mjs) to the public
// Vercel Blob store (`ledger-videos`): each logo to icons/<domain>.png and the index to icons/index.json.
// The hosted site reads them from there (ICON_BASE_URL). Run it with `npm run icons`, which reads the store token
// from the project's production environment through the Vercel CLI. The token is never printed.
// Logos already in the store are skipped; pass --force to upload every file again. The index always uploads.
import fs from 'node:fs'
import path from 'node:path'
import { put, list } from '@vercel/blob'

const src = path.resolve('.icon-catalog')
const indexFile = path.join(src, 'index.json')
if (!fs.existsSync(indexFile)) {
  console.log('no .icon-catalog/index.json, run node scripts/build-icon-catalog.mjs first')
  process.exit(1)
}
const { domains } = JSON.parse(fs.readFileSync(indexFile, 'utf8'))
const force = process.argv.includes('--force')

// The Blob API rate-limits bursts. Wait as long as it asks and try again, a few times.
async function putWithRetry(pathname, body, options) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await put(pathname, body, options)
    } catch (e) {
      const wait = e && typeof e === 'object' && 'retryAfter' in e ? Number(e.retryAfter) : 0
      if (!wait || attempt >= 5) throw e
      await new Promise((r) => setTimeout(r, wait * 1000))
    }
  }
}

const existing = new Set()
if (!force) {
  let cursor
  do {
    const page = await list({ prefix: 'icons/', cursor, limit: 1000 })
    for (const b of page.blobs) existing.add(b.pathname)
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)
}

const todo = domains.filter((d) => !existing.has(`icons/${d}.png`))
let next = 0
let uploaded = 0
let failed = 0
async function worker() {
  while (next < todo.length) {
    const d = todo[next++]
    try {
      await putWithRetry(`icons/${d}.png`, fs.readFileSync(path.join(src, `${d}.png`)), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'image/png',
        cacheControlMaxAge: 60 * 60 * 24 * 365,
      })
      if (++uploaded % 250 === 0) console.log(`${uploaded} / ${todo.length}`)
    } catch (e) {
      failed++
      console.log('failed', d, e instanceof Error ? e.name : '')
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker))

// a shorter cache on the index, so a rebuilt catalog shows up within a day
await putWithRetry('icons/index.json', fs.readFileSync(indexFile), {
  access: 'public',
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: 'application/json',
  cacheControlMaxAge: 60 * 60 * 24,
})
console.log(`uploaded ${uploaded} logos (${domains.length - todo.length} already there, ${failed} failed) and icons/index.json`)
