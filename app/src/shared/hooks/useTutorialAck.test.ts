import { renderHook, act } from '@testing-library/react'
import { persistedStore } from '@/shared/state/persistedStore'
import { useTutorialAck } from './useTutorialAck'

beforeEach(() => {
  localStorage.clear()
  persistedStore.setState({ entries: {} })
})

describe('useTutorialAck', () => {
  it('starts not acknowledged', () => {
    expect(renderHook(() => useTutorialAck()).result.current.acknowledged).toBe(false)
  })

  it('saves the flag under ledger:tutorialAck', () => {
    const { result } = renderHook(() => useTutorialAck())
    act(() => result.current.acknowledge())
    expect(result.current.acknowledged).toBe(true)
    expect(localStorage.getItem('ledger:tutorialAck')).toBe('true')
  })

  it('reads a saved flag', () => {
    localStorage.setItem('ledger:tutorialAck', 'true')
    expect(renderHook(() => useTutorialAck()).result.current.acknowledged).toBe(true)
  })

  it('ignores a broken saved value', () => {
    localStorage.setItem('ledger:tutorialAck', '"yes"')
    expect(renderHook(() => useTutorialAck()).result.current.acknowledged).toBe(false)
  })
})
