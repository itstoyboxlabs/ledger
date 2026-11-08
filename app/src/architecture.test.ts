import fs from 'node:fs'
import path from 'node:path'

// Enforces the layout in CODING_PATTERNS.md so it does not depend on code review.
//
//   src/screens/<screen>/{constants,enums,hooks,state,types,utils,ui}
//   src/screens/<screen>/features/<feature>/{constants,enums,hooks,state,types,utils,ui}
//   src/shared/{constants,enums,hooks,state,types,utils,ui}
const SRC = path.resolve(__dirname)
const CODE = /\.(ts|tsx)$/
const isTest = (f: string) => /\.test\.(ts|tsx|js|jsx)$/.test(f)

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? walk(p) : [p]
  })
}
const rel = (f: string) => path.relative(SRC, f)
const code = (dir: string) => walk(path.join(SRC, dir)).filter((f) => CODE.test(f))
const imports = (file: string) => [...fs.readFileSync(file, 'utf8').matchAll(/(?:from|import\()\s*['"]([^'"]+)['"]/g)].map((m) => m[1])

// '@/screens/tools/features/hourly/ui/HourlyCalc' -> { screen: 'tools', feature: 'hourly' }
function owner(spec: string) {
  const m = spec.match(/^@\/screens\/([^/]+)(?:\/features\/([^/]+))?/)
  return m ? { screen: m[1], feature: m[2] } : null
}
// where a file lives, from its path
function home(file: string) {
  const m = rel(file).match(/^screens\/([^/]+)(?:\/features\/([^/]+))?/)
  return m ? { screen: m[1], feature: m[2] } : null
}

describe('architecture', () => {
  it('a screen never imports from another screen', () => {
    const bad: string[] = []
    for (const file of code('screens')) {
      const me = home(file)!
      for (const spec of imports(file)) {
        const o = owner(spec)
        if (o && o.screen !== me.screen) bad.push(`${rel(file)} imports ${spec}`)
      }
    }
    expect(bad, 'move what is shared into src/shared').toEqual([])
  })

  it('a feature never imports a sibling feature', () => {
    const bad: string[] = []
    for (const file of code('screens')) {
      const me = home(file)!
      for (const spec of imports(file)) {
        const o = owner(spec)
        if (me.feature && o && o.screen === me.screen && o.feature && o.feature !== me.feature) bad.push(`${rel(file)} imports ${spec}`)
      }
    }
    expect(bad, 'move what two features share up to the screen (or src/shared)').toEqual([])
  })

  it('shared never imports a screen', () => {
    const bad: string[] = []
    for (const file of code('shared')) for (const spec of imports(file)) if (/^@\/screens\//.test(spec)) bad.push(`${rel(file)} imports ${spec}`)
    expect(bad).toEqual([])
  })

  it('every util, hook, store and ui file has a test file beside it', () => {
    const folders = ['utils', 'hooks', 'state', 'ui']
    const missing = [...code('screens'), ...code('shared')]
      .filter((f) => !isTest(f))
      .filter((f) => {
        const parts = rel(f).split(path.sep)
        return parts.some((p) => folders.includes(p)) && !parts.includes('primitives') // shadcn components are vendored
      })
      .filter((f) => !['.ts', '.tsx'].some((e) => fs.existsSync(f.replace(CODE, `.test${e}`))))
    expect(missing.map(rel), 'add a .test file next to each one').toEqual([])
  })

  it('every test file sits beside the file it tests', () => {
    const orphans = [...code('screens'), ...code('shared')]
      .filter(isTest)
      .filter((f) => !['.ts', '.tsx'].some((e) => fs.existsSync(f.replace(/\.test\.(ts|tsx)$/, e))))
    expect(orphans.map(rel), 'delete the test or move it next to its file').toEqual([])
  })

  it('constants, enums and types folders hold one export per file', () => {
    const bad: string[] = []
    for (const file of [...code('screens'), ...code('shared')].filter((f) => !isTest(f))) {
      const parts = rel(file).split(path.sep)
      if (!parts.some((p) => ['constants', 'enums', 'types'].includes(p))) continue
      const exports = fs.readFileSync(file, 'utf8').match(/^export\s+(?!default)/gm) ?? []
      if (exports.length > 1) bad.push(`${rel(file)} has ${exports.length} exports`)
    }
    expect(bad).toEqual([])
  })

  it('only the known folders exist inside a screen, a feature and shared', () => {
    const allowed = new Set(['constants', 'enums', 'hooks', 'state', 'types', 'utils', 'ui'])
    const bad: string[] = []
    const check = (dir: string, extra: string[] = []) => {
      if (!fs.existsSync(dir)) return
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.isDirectory() && !allowed.has(e.name) && !extra.includes(e.name)) bad.push(rel(path.join(dir, e.name)))
      }
    }
    check(path.join(SRC, 'shared'))
    for (const s of fs.readdirSync(path.join(SRC, 'screens'), { withFileTypes: true }).filter((e) => e.isDirectory())) {
      const dir = path.join(SRC, 'screens', s.name)
      check(dir, ['features'])
      const feats = path.join(dir, 'features')
      if (fs.existsSync(feats)) for (const f of fs.readdirSync(feats, { withFileTypes: true }).filter((e) => e.isDirectory())) check(path.join(feats, f.name))
    }
    expect(bad, 'put files in constants, enums, hooks, state, types, utils or ui').toEqual([])
  })
})
