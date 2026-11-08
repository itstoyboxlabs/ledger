import { afterEach, describe, expect, it, vi } from 'vitest'
import { prefetchChunks } from '@/shared/utils/prefetchChunks'

describe('prefetchChunks', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('loads every chunk one after another while idle', async () => {
    vi.stubGlobal('requestIdleCallback', (run: () => void) => setTimeout(run, 0))
    const order: string[] = []
    const make = (name: string) => () => {
      order.push(name)
      return Promise.resolve()
    }
    prefetchChunks([make('a'), make('b'), make('c')])
    await vi.waitFor(() => expect(order).toEqual(['a', 'b', 'c']))
  })

  it('keeps going when a chunk fails to download', async () => {
    vi.stubGlobal('requestIdleCallback', (run: () => void) => setTimeout(run, 0))
    const loaded: string[] = []
    prefetchChunks([() => Promise.reject(new Error('offline')), () => (loaded.push('second'), Promise.resolve())])
    await vi.waitFor(() => expect(loaded).toEqual(['second']))
  })

  it('falls back to a timer when idle callbacks are not available', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('requestIdleCallback', undefined)
    const load = vi.fn(() => Promise.resolve())
    prefetchChunks([load])
    expect(load).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1600)
    expect(load).toHaveBeenCalledTimes(1)
  })
})
