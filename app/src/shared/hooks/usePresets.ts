import { useEffect, useRef, useState } from 'react'
import { getPresets } from '@/shared/utils/getPresets'
import { savePresets } from '@/shared/utils/savePresets'
import { newId } from '@/shared/utils/newId'
import { withPresetIds } from '@/shared/utils/withPresetIds'
import { track } from '@/shared/utils/track'
import type { Preset } from '@/shared/types/Preset'

// server-backed named presets per tool, stored in data/presets.json (not localStorage).
// With `ids`, every preset carries a stable id so other pages can point at it through a
// rename. Presets saved before that get one on first load, and the list is saved back.
export function usePresets<T = unknown>(key: string, opts: { ids?: boolean } = {}) {
  const ids = !!opts.ids
  const [presets, setPresets] = useState<Preset<T>[]>([])
  // false until the stored list has loaded, so a page can tell "none yet" from "none"
  const [loaded, setLoaded] = useState(false)
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
        if (ids) {
          const withIds = withPresetIds(list)
          if (withIds !== list) post(withIds)
          list = withIds
        }
        listRef.current = list
        setPresets(list)
      })
      .catch(() => {})
      .finally(() => {
        ready.current = true
        setLoaded(true)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ids])
  return {
    presets,
    loaded,
    // saving over an existing name replaces it in place so the list keeps its order
    save: (name: string, data: T): void => {
      track('preset_saved')
      change((list) =>
        list.some((p) => p.name === name)
          ? list.map((p) => (p.name === name ? { ...p, data } : p))
          : [...list, ids ? { id: newId('pr'), name, data } : { name, data }],
      )
    },
    remove: (name: string): void => {
      track('preset_removed')
      change((list) => list.filter((p) => p.name !== name))
    },
    // keeps the id and data; a name already in use is left alone
    rename: (from: string, to: string): void =>
      change((list) => {
        const name = to.trim()
        if (!name || name === from || list.some((p) => p.name === name)) return list
        return list.map((p) => (p.name === from ? { ...p, name } : p))
      }),
  }
}
