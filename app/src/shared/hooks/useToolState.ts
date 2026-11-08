import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { isObj } from '@/shared/utils/isObj'

export function useToolState<T extends object>(key: string, defaults: T): [T, (next: T | ((prev: T) => T)) => void] {
  // stored values win, but new keys added in later versions fall back to their
  // defaults instead of invalidating the whole saved object
  const [raw, setRaw] = usePersistedState<T>(
    key,
    defaults,
    isObj,
  )
  const merge = (stored: T): T => ({
    ...defaults,
    ...Object.fromEntries(
      Object.entries(stored).filter(([k, v]) => k in defaults && typeof v === typeof defaults[k as keyof T]),
    ),
  }) as T
  // a functional update sees the same merged value the component renders, not the raw save
  const set = (next: T | ((prev: T) => T)) =>
    setRaw(typeof next === 'function' ? (prev: T) => next(merge(prev)) : next)
  return [merge(raw), set]
}
