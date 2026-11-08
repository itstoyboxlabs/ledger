import { isLocal } from './isLocal'
import { storageModeStore } from '@/shared/state/storageModeStore'

afterEach(() => storageModeStore.setState({ mode: 'browser' }))

describe('isLocal', () => {
  it('is false in browser mode', () => {
    expect(isLocal()).toBe(false)
  })
  it('is true in local mode', () => {
    storageModeStore.setState({ mode: 'local' })
    expect(isLocal()).toBe(true)
  })
})
