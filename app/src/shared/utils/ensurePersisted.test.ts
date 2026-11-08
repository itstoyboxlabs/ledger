import { persistedStore } from '@/shared/state/persistedStore'
import { ensurePersisted } from '@/shared/utils/ensurePersisted'

beforeEach(() => {
  localStorage.clear()
  persistedStore.setState({ entries: {} })
})

describe('ensurePersisted', () => {
  it('loads the fallback the first time and saves it', () => {
    expect(ensurePersisted('k', 7).value).toBe(7)
    expect(localStorage.getItem('ledger:k')).toBe('7')
  })

  it('keeps the value it already holds', () => {
    const first = ensurePersisted('k', 1)
    expect(ensurePersisted('k', 999)).toBe(first)
  })

  it('reads again when localStorage changed underneath it', () => {
    ensurePersisted('k', 1)
    localStorage.setItem('ledger:k', '2')
    expect(ensurePersisted('k', 1).value).toBe(2)
    localStorage.clear()
    expect(ensurePersisted('k', 1).value).toBe(1)
  })

  it('does not notify store subscribers', () => {
    const seen = vi.fn()
    const off = persistedStore.subscribe(seen)
    ensurePersisted('k', 1)
    expect(seen).not.toHaveBeenCalled()
    off()
  })
})
