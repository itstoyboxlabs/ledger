import { useEffect, useState } from 'react'
import { getPresets } from '@/shared/utils/getPresets'
import { savePresets } from '@/shared/utils/savePresets'
import type { Preset } from '@/shared/types/Preset'

// server-backed named presets per tool, stored in data/presets.json (not localStorage)
export function usePresets<T = unknown>(key: string) {
  const [presets, setPresets] = useState<Preset<T>[]>([])
  const post = (list: Preset<T>[]): void => {
    setPresets(list)
    savePresets(key, list).catch(() => {})
  }
  useEffect(() => {
    getPresets()
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
        setPresets(list)
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return {
    presets,
    // saving over an existing name replaces it in place so the list keeps its order
    save: (name: string, data: T): void =>
      post(
        presets.some((p) => p.name === name)
          ? presets.map((p) => (p.name === name ? { name, data } : p))
          : [...presets, { name, data }],
      ),
    remove: (name: string): void => post(presets.filter((p) => p.name !== name)),
  }
}
