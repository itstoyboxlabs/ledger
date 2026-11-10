import fs from 'node:fs'
import path from 'node:path'
import { USAGE_EVENTS } from '@/shared/constants/USAGE_EVENTS'

vi.mock('@/shared/utils/usageEnabled', () => ({ usageEnabled: () => true }))

const sent = () => (navigator.sendBeacon as ReturnType<typeof vi.fn>).mock.calls
const bodyOf = async (i: number) => JSON.parse(await (sent()[i][1] as Blob).text())

describe('track', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
    navigator.sendBeacon = vi.fn(() => true)
    window.history.replaceState(null, '', '/app/spending')
  })
  afterEach(() => vi.useRealTimers())

  it('sends the event key and route with ids, and nothing else', async () => {
    const { track } = await import('@/shared/utils/track')
    track('budget_changed')
    vi.advanceTimersByTime(3000)
    expect(sent()).toHaveLength(1)
    const body = await bodyOf(0)
    expect(body.events).toEqual([{ event: 'budget_changed', route: '/app/spending' }])
    expect(Object.keys(body).sort()).toEqual(['events', 'session', 'user'])
  })

  it('sends one event per key and route in 30 seconds, then again after', async () => {
    const { track } = await import('@/shared/utils/track')
    track('budget_changed')
    track('budget_changed')
    vi.advanceTimersByTime(3000)
    track('budget_changed')
    vi.advanceTimersByTime(3000)
    expect(sent()).toHaveLength(1)
    vi.advanceTimersByTime(30_000)
    track('budget_changed')
    vi.advanceTimersByTime(3000)
    expect(sent()).toHaveLength(2)
  })

  it('batches several events into one request', async () => {
    const { track } = await import('@/shared/utils/track')
    track('screen_opened')
    track('age_updated')
    vi.advanceTimersByTime(3000)
    expect(sent()).toHaveLength(1)
    expect((await bodyOf(0)).events).toHaveLength(2)
  })

  it('scrubs a crash message', async () => {
    const { track } = await import('@/shared/utils/track')
    track('crash', 'cannot read 1234567 of x')
    vi.advanceTimersByTime(3000)
    expect((await bodyOf(0)).events[0].error).toBe('cannot read # of x')
  })

  it('keeps the same event keys as the server list in api/usage.js', () => {
    const file = fs.readFileSync(path.resolve(__dirname, '../../../api/usage.js'), 'utf8')
    const block = file.match(/new Set\(\[([\s\S]*?)\]\)/)![1]
    const server = [...block.matchAll(/'([a-z0-9_]+)'/g)].map((m) => m[1])
    expect([...server].sort()).toEqual([...USAGE_EVENTS].sort())
  })
})

describe('track when usage is off', () => {
  it('sends nothing', async () => {
    vi.resetModules()
    vi.doMock('@/shared/utils/usageEnabled', () => ({ usageEnabled: () => false }))
    vi.useFakeTimers()
    navigator.sendBeacon = vi.fn(() => true)
    const { track } = await import('@/shared/utils/track')
    track('screen_opened')
    vi.advanceTimersByTime(5000)
    expect(navigator.sendBeacon).not.toHaveBeenCalled()
    vi.useRealTimers()
    vi.doUnmock('@/shared/utils/usageEnabled')
  })
})
