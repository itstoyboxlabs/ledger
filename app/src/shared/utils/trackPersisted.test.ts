import { trackPersisted } from '@/shared/utils/trackPersisted'
import { track } from '@/shared/utils/track'

vi.mock('@/shared/utils/track', () => ({ track: vi.fn() }))

describe('trackPersisted', () => {
  it('reports the event for a known key', () => {
    trackPersisted('takeHome')
    expect(track).toHaveBeenCalledWith('tool_takehome')
  })
  it('ignores filters and sort orders', () => {
    vi.mocked(track).mockClear()
    trackPersisted('budgetSort')
    expect(track).not.toHaveBeenCalled()
  })
})
