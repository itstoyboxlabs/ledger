import { storageModeStore } from '@/shared/state/storageModeStore'

describe('storageModeStore', () => {
  it('starts in browser mode and can switch to local', () => {
    expect(storageModeStore.getState().mode).toBe('browser')
    storageModeStore.setState({ mode: 'local' })
    expect(storageModeStore.getState().mode).toBe('local')
    storageModeStore.setState({ mode: 'browser' })
  })
})
