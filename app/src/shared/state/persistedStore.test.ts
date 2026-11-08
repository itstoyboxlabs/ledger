import { persistedStore } from '@/shared/state/persistedStore'

describe('persistedStore', () => {
  it('starts with no entries and notifies subscribers when one is set', () => {
    persistedStore.setState({ entries: {} })
    expect(persistedStore.getState().entries).toEqual({})
    const seen = vi.fn()
    const off = persistedStore.subscribe(seen)
    persistedStore.setState({ entries: { a: { value: 1, raw: '1' } } })
    expect(seen).toHaveBeenCalledTimes(1)
    off()
    persistedStore.setState({ entries: {} })
  })
})
