// Copies the tutorial chapter videos and posters from demo/video into public/videos, so a deploy carries them.
// public/videos is ignored by git (the files are large) but uploaded by `vercel deploy`.
import fs from 'node:fs'
import path from 'node:path'

const src = path.resolve('../demo/video')
const out = path.resolve('public/videos')
if (!fs.existsSync(src)) {
  console.log('no demo/video folder, nothing to copy')
  process.exit(0)
}
fs.mkdirSync(out, { recursive: true })
const files = fs.readdirSync(src).filter((f) => /^chapter-\d.*\.(mp4|jpg)$/.test(f))
for (const f of files) fs.copyFileSync(path.join(src, f), path.join(out, f))
console.log(`copied ${files.length} files to public/videos`)
