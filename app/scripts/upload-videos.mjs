// Uploads the tutorial chapter videos and posters from demo/video to the Vercel Blob store (`ledger-videos`).
// The live site plays them from there, so a deploy never has to carry the large files.
// Run it with `npm run videos` whenever a video changes. It reads the store token from the project's
// production environment through the Vercel CLI and never prints it.
import fs from 'node:fs'
import path from 'node:path'
import { put } from '@vercel/blob'

const src = path.resolve('../demo/video')
if (!fs.existsSync(src)) {
  console.log('no demo/video folder, nothing to upload')
  process.exit(0)
}
const files = fs.readdirSync(src).filter((f) => /^chapter-\d.*\.(mp4|jpg)$/.test(f))
for (const f of files) {
  const blob = await put(`videos/${f}`, fs.readFileSync(path.join(src, f)), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60 * 60 * 24 * 30,
  })
  console.log('uploaded', blob.pathname)
}
