import { renderHook } from '@testing-library/react'
import { DataContext } from '@/shared/state/DataContext'
import { useData } from '@/shared/hooks/useData'
import type { DataContextValue } from '@/shared/types/DataContextValue'
import type { ReactNode } from 'react'

describe('useData', () => {
  it('returns what Root provides', () => {
    const value: DataContextValue = { mode: 'browser', notify: () => {}, importFiles: async () => {}, importSample: async () => {} }
    const wrapper = ({ children }: { children: ReactNode }) => <DataContext.Provider value={value}>{children}</DataContext.Provider>
    expect(renderHook(() => useData(), { wrapper }).result.current).toBe(value)
  })

  it('returns null outside a provider', () => {
    expect(renderHook(() => useData()).result.current).toBeNull()
  })
})
