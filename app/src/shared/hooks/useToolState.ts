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
  const merged = {
    ...defaults,
    ...Object.fromEntries(
      Object.entries(raw).filter(([k, v]) => k in defaults && typeof v === typeof defaults[k as keyof T]),
    ),
  } as T
  return [merged, setRaw]
}
