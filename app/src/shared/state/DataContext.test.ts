import { renderHook } from '@testing-library/react'
import { useContext } from 'react'
import { DataContext } from '@/shared/state/DataContext'

describe('DataContext', () => {
  it('has no value until Root provides one', () => {
    expect(renderHook(() => useContext(DataContext)).result.current).toBeNull()
  })
})
