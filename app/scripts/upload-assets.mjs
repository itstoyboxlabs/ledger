// Uploads the tutorial videos and the merchant logo catalog to the public `ledger-public` bucket in Supabase
// Storage. The site reads them from there (VIDEO_BASE_URL and ICON_BASE_URL), so a deploy never carries them.
//   node scripts/upload-assets.mjs videos   chapter videos and posters from ../demo/video  -> videos/
//   node scripts/upload-assets.mjs icons    logos and index.json from .icon-catalog         -> icons/
// Set SUPABASE_SERVICE_ROLE_KEY (kept outside the repo, never printed). SUPABASE_URL is optional.
// Files already uploaded are replaced. Run it only when a video or the catalog changes.
import fs from 'node:fs'
import path from 'node:path'

const URL_BASE = process.env.SUPABASE_URL || 'https://newimvknbatgjauygmwu.supabase.co'
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = 'ledger-public'
const what = process.argv[2]
if (!KEY || !['videos', 'icons'].includes(what)) {
  console.log('usage: SUPABASE_SERVICE_ROLE_KEY=... node scripts/upload-assets.mjs videos|icons')
  process.exit(1)
}

const types = { '.mp4': 'video/mp4', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' }
const source = what === 'videos' ? path.resolve('../demo/video') : path.resolve('.icon-catalog')
const keep = what === 'videos' ? /^chapter-\d.*\.(mp4|jpg)$/ : /\.(png|json)$/
if (!fs.existsSync(source)) {
  console.log(`no ${source}, nothing to upload`)
  process.exit(0)
}
const files = fs.readdirSync(source).filter((f) => keep.test(f))

async function upload(file) {
  const body = fs.readFileSync(path.join(source, file))
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}/${what}/${file}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KEY}`,
        apikey: KEY,
        'Content-Type': types[path.extname(file)] || 'application/octet-stream',
        'x-upsert': 'true',
        'Cache-Control': 'max-age=2592000',
      },
      body,
    })
    if (res.ok) return true
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
  }
  return false
}

let next = 0
let done = 0
let failed = 0
async function worker() {
  while (next < files.length) {
    const file = files[next++]
    if (await upload(file)) done++
    else {
      failed++
      console.log('failed', file)
    }
  }
}
await Promise.all(Array.from({ length: 10 }, worker))
console.log(`uploaded ${done} of ${files.length} to ${what}/${failed ? `, ${failed} failed` : ''}`)
process.exit(failed ? 1 : 0)
