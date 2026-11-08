import { storageModeStore } from '@/shared/state/storageModeStore'
import { getStorageMode } from '@/shared/utils/getStorageMode'

describe('getStorageMode', () => {
  it('returns the mode in the store', () => {
    storageModeStore.setState({ mode: 'local' })
    expect(getStorageMode()).toBe('local')
    storageModeStore.setState({ mode: 'browser' })
    expect(getStorageMode()).toBe('browser')
  })
})
