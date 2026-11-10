import { installCrashTracking } from '@/shared/utils/installCrashTracking'
import { track } from '@/shared/utils/track'

vi.mock('@/shared/utils/track', () => ({ track: vi.fn() }))

describe('installCrashTracking', () => {
  it('reports window errors and unhandled rejections', () => {
    installCrashTracking()
    window.dispatchEvent(new ErrorEvent('error', { message: 'boom' }))
    expect(track).toHaveBeenCalledWith('crash', 'boom')
    const ev = new Event('unhandledrejection') as Event & { reason: unknown }
    ev.reason = new Error('nope')
    window.dispatchEvent(ev)
    expect(track).toHaveBeenCalledWith('crash', 'Error: nope')
  })
})
