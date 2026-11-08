// Runs the typecheck, lint, unit tests and browser tests at the same time and prints one summary.
// Use `npm run test:all` while working; CI runs the same pieces as separate parallel jobs.
import { spawn } from 'node:child_process'

const steps = [
  { name: 'typecheck', cmd: 'npm', args: ['run', 'typecheck', '--silent'] },
  { name: 'lint', cmd: 'npm', args: ['run', 'lint', '--silent'] },
  { name: 'unit', cmd: 'npm', args: ['run', 'test:unit', '--silent'] },
  { name: 'e2e', cmd: 'npm', args: ['run', 'test:e2e', '--silent'] },
]

const run = ({ name, cmd, args }) =>
  new Promise((resolve) => {
    const started = Date.now()
    let out = ''
    const child = spawn(cmd, args, { env: process.env })
    child.stdout.on('data', (d) => (out += d))
    child.stderr.on('data', (d) => (out += d))
    child.on('close', (code) => resolve({ name, code, out, seconds: Math.round((Date.now() - started) / 1000) }))
  })

const results = await Promise.all(steps.map(run))
for (const r of results) {
  console.log(`${r.code === 0 ? 'pass' : 'FAIL'}  ${r.name}  ${r.seconds}s`)
  if (r.code !== 0) console.log(r.out.split('\n').slice(-40).join('\n'))
}
process.exit(results.some((r) => r.code !== 0) ? 1 : 0)
