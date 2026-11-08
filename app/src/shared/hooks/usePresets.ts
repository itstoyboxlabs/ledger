import { useEffect, useRef, useState } from 'react'
import { getPresets } from '@/shared/utils/getPresets'
import { savePresets } from '@/shared/utils/savePresets'
import type { Preset } from '@/shared/types/Preset'

// server-backed named presets per tool, stored in data/presets.json (not localStorage)
export function usePresets<T = unknown>(key: string) {
  const [presets, setPresets] = useState<Preset<T>[]>([])
  // the latest list, and the load it must wait for: a save made before getPresets
  // returns is applied on top of the stored list, never in place of it
  const listRef = useRef<Preset<T>[]>([])
  const ready = useRef(false)
  const loading = useRef<Promise<void>>(Promise.resolve())
  const post = (list: Preset<T>[]): void => {
    listRef.current = list
    setPresets(list)
    savePresets(key, list).catch(() => {})
  }
  const change = (fn: (list: Preset<T>[]) => Preset<T>[]): void => {
    if (ready.current) post(fn(listRef.current))
    else void loading.current.then(() => post(fn(listRef.current)))
  }
  useEffect(() => {
    ready.current = false
    loading.current = getPresets()
      .then((d) => {
        let list: Preset<T>[] = Array.isArray(d[key]) ? (d[key] as Preset<T>[]) : []
        // one-time migration of the old localStorage rent presets to the backend
        if (!list.length && key === 'rentScenario') {
          try {
            const legacy = JSON.parse(localStorage.getItem('ledger:rentScenarioPresets') || 'null')
            if (Array.isArray(legacy) && legacy.length) {
              list = legacy.map((p: { name: string; overrides: T }) => ({ name: p.name, data: p.overrides }))
              post(list)
              localStorage.removeItem('ledger:rentScenarioPresets')
            }
          } catch { /* ignore bad legacy data */ }
        }
        listRef.current = list
        setPresets(list)
      })
      .catch(() => {})
      .finally(() => {
        ready.current = true
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return {
    presets,
    // saving over an existing name replaces it in place so the list keeps its order
    save: (name: string, data: T): void =>
      change((list) =>
        list.some((p) => p.name === name)
          ? list.map((p) => (p.name === name ? { name, data } : p))
          : [...list, { name, data }],
      ),
    remove: (name: string): void => change((list) => list.filter((p) => p.name !== name)),
  }
}
