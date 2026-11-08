import { renderHook, act } from '@testing-library/react'
import { persistedStore } from '@/shared/state/persistedStore'
import { useBirthDate } from './useBirthDate'

beforeEach(() => {
  localStorage.clear()
  persistedStore.setState({ entries: {} })
})
const saved = (k: string) => JSON.parse(localStorage.getItem(`ledger:${k}`) ?? 'null')

describe('useBirthDate', () => {
  it('has nothing until a birth date is typed', () => {
    const { result } = renderHook(() => useBirthDate())
    expect(result.current).toMatchObject({ birthDate: null, savedAge: null })
  })

  it('saves the birth date as YYYY-MM-DD', () => {
    const { result } = renderHook(() => useBirthDate())
    act(() => result.current.setBirthDate('1990-04-15'))
    expect(result.current.birthDate).toBe('1990-04-15')
    expect(saved('birthDate')).toBe('1990-04-15')
  })

  it('reads an old typed age as a fixed age, with no yearly bump', () => {
    localStorage.setItem('ledger:age', JSON.stringify({ age: 30, asOf: 2020 }))
    expect(renderHook(() => useBirthDate()).result.current).toMatchObject({ birthDate: null, savedAge: 30 })
  })

  it('drops the old typed age once a birth date is saved', () => {
    localStorage.setItem('ledger:age', JSON.stringify({ age: 30, asOf: 2020 }))
    const { result } = renderHook(() => useBirthDate())
    act(() => result.current.setBirthDate('1990-04-15'))
    expect(result.current.savedAge).toBeNull()
    expect(saved('age')).toBeNull()
  })

  it('clears both', () => {
    localStorage.setItem('ledger:age', JSON.stringify({ age: 30, asOf: 2020 }))
    const { result } = renderHook(() => useBirthDate())
    act(() => result.current.clear())
    expect(result.current).toMatchObject({ birthDate: null, savedAge: null })
  })

  it('ignores broken saved values', () => {
    localStorage.setItem('ledger:birthDate', '"04-15-1990"')
    localStorage.setItem('ledger:age', '"thirty"')
    expect(renderHook(() => useBirthDate()).result.current).toMatchObject({ birthDate: null, savedAge: null })
  })
})
