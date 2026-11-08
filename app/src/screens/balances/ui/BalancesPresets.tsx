import { PresetBar } from '@/shared/ui/PresetBar'
import { useDebts } from '@/shared/hooks/useDebts'
import { usePresets } from '@/shared/hooks/usePresets'
import { presetDebts } from '@/screens/balances/utils/presetDebts'
import type { PlanningPreset } from '@/screens/balances/types/PlanningPreset'

// The Presets menu in the Balances page header. Named snapshots of your debts, so they can be changed freely
// for what-if planning and restored in one click. Same backend key as before.
export function BalancesPresets() {
  const [debts, setDebts] = useDebts()
  const { presets, save, remove } = usePresets<PlanningPreset>('planningVariables')
  const presetData: PlanningPreset = { debts: debts.map(({ linkName, ...d }) => d) } // eslint-disable-line no-unused-vars
  const applyPreset = (data: unknown) => {
    const next = presetDebts(data)
    if (next) setDebts(next)
  }
  return (
    <PresetBar
      presets={presets}
      currentData={presetData}
      onApply={applyPreset}
      onSave={(name: string) => save(name, presetData)}
      onDelete={remove}
      scope="planningVariables"
    />
  )
}
