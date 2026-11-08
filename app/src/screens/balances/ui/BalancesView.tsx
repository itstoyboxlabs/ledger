import { STATES } from '@/shared/constants/STATES'
import { fmt } from '@/shared/utils/fmt'
import { Label } from '@/shared/ui/primitives/label'
import { Input } from '@/shared/ui/primitives/input'
import { Button } from '@/shared/ui/primitives/button'
import { X } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { DEFAULT_STATE } from '@/shared/constants/DEFAULT_STATE'
import { DraftNumberInput } from '@/shared/ui/DraftNumberInput'
import { Dropdown } from '@/shared/ui/Dropdown'
import { Icon } from '@/shared/ui/Icon'
import { PresetBar } from '@/shared/ui/PresetBar'
import { ToolField } from '@/shared/ui/ToolField'
import { assetKind } from '@/shared/utils/assetKind'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select'
import { ASSET_KIND_OPTIONS } from '@/screens/balances/constants/ASSET_KIND_OPTIONS'
import { isDebtList } from '@/shared/utils/isDebtList'
import { isLegacyDebts } from '@/shared/utils/isLegacyDebts'
import { newId } from '@/shared/utils/newId'
import { normalizeDebts } from '@/shared/utils/normalizeDebts'
import { sumBalances } from '@/shared/utils/sumBalances'
import { useAssets } from '@/shared/hooks/useAssets'
import { useBudgetRows } from '@/shared/hooks/useBudgetRows'
import { useDebts } from '@/shared/hooks/useDebts'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { usePresets } from '@/shared/hooks/usePresets'
import { AssetKind } from '@/shared/enums/AssetKind'
import { AssetPool } from '@/shared/enums/AssetPool'
import type { Asset } from '@/shared/types/Asset'
import type { Debt } from '@/shared/types/Debt'
import type { PlanningPreset } from '@/screens/balances/types/PlanningPreset'

// Balances: what you own and what you owe. Tools and Retirement read these.
export function BalancesView() {
  const [taxState, setTaxState] = usePersistedState('taxState', DEFAULT_STATE, (v) => typeof v === 'string' && v in STATES)
  const [debts, setDebts] = useDebts()
  const [assets, setAssets] = useAssets()
  const [asOf, setAsOf] = usePersistedState('assetsAsOf', '', (v) => typeof v === 'string')
  const rows = useBudgetRows()
  // Named snapshots of the state and debts, so they can be changed freely for what-if
  // planning and restored in one click. Same backend key and shape as before.
  const { presets, save, remove } = usePresets<PlanningPreset>('planningVariables')
  const presetData: PlanningPreset = { taxState, debts: debts.map(({ linkName, ...d }) => d) } // eslint-disable-line no-unused-vars
  const applyPreset = (data: unknown) => {
    const d = data as Partial<PlanningPreset> | null | undefined
    if (typeof d?.taxState === 'string' && d.taxState in STATES) setTaxState(d.taxState)
    if (isDebtList(d?.debts) || isLegacyDebts(d?.debts)) setDebts(normalizeDebts(d?.debts))
  }
  const owed = sumBalances(debts)
  const owned = assets.reduce((s, a) => s + a.balance, 0)
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const patchDebt = (id: string, p: Partial<Debt>) => setDebts(debts.map((d) => (d.id === id ? { ...d, ...p } : d)))
  const patchAsset = (id: string, p: Partial<Asset>) => setAssets(assets.map((a) => (a.id === id ? { ...a, ...p } : a)))
  const rowOptions = [
    { value: '', label: 'Type it in' },
    ...[...(rows ?? [])]
      .filter((r) => !r.hidden)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((r) => ({ value: r.id, label: r.name })),
  ]

  return (
    <div className="show-spinners mt-7 flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="p-5">
          <div className="text-[12px] text-[var(--text-muted)]">Total owed</div>
          <div className="mt-1 text-[26px] font-bold tracking-tight tnum" style={{ color: owed > 0 ? 'var(--bad)' : undefined }}>
            {fmt(owed)}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-[12px] text-[var(--text-muted)]">Total owned</div>
          <div className="mt-1 text-[26px] font-bold tracking-tight tnum" style={{ color: owned > 0 ? 'var(--good)' : undefined }}>
            {fmt(owned)}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[15px] font-semibold">Taxed in</h2>
          <PresetBar
            presets={presets}
            currentData={presetData}
            onApply={applyPreset}
            onSave={(name: string) => save(name, presetData)}
            onDelete={remove}
            scope="planningVariables"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div className="text-[13px] text-[var(--text-secondary)]">
            Where do you plan on living? Tools tax accordingly
            <span className="text-[var(--text-muted)]"> (federal + FICA + state{taxState === 'ny-nyc' ? ' + NYC local' : ''}, single filer, estimates)</span>
          </div>
          <Dropdown
            label="State"
            value={taxState}
            onChange={setTaxState}
            options={Object.entries(STATES).map(([value, s]) => ({ value, label: s.label }))}
          />
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="flex items-center gap-1.5 text-[15px] font-semibold">
          What you owe
        </h2>
        <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-secondary)]">
          The Debt payoff calculator on the Tools page uses the balance, APR and payment to show when
          you will be debt free. The Retirement page uses the payment: once a debt is paid off, its
          payment is split the way you set up on the Budget page, like half to savings and half
          spent. Link a payment to a Budget row to keep it in sync.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {debts.length === 0 && (
            <p className="text-[13px] text-[var(--text-secondary)]">No debts yet.</p>
          )}
          {debts.map((d) => {
            const linked = d.budgetRow && rows ? rows.find((r) => r.id === d.budgetRow) : null
            return (
              <div key={d.id} className="rounded-xl bg-[var(--surface-2)] p-3 ring-1 ring-[var(--ring)]">
                <div className="flex items-start gap-2">
                  <Label className="block min-w-0 flex-1">
                    <span className="text-[12px] text-[var(--text-muted)]">Name</span>
                    <Input
                      className="mt-1"
                      value={d.name}
                      placeholder="Student loans"
                      spellCheck={false}
                      onChange={(e) => patchDebt(d.id, { name: e.target.value })}
                    />
                  </Label>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setDebts(debts.filter((x) => x.id !== d.id))}
                    title="Remove debt"
                    className="mt-6 text-[var(--text-muted)] hover:bg-transparent hover:text-[var(--bad)]"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <ToolField label="Balance" value={d.balance} onChange={(v) => patchDebt(d.id, { balance: v })} step={500} suffix="$" />
                  <ToolField label="APR" value={d.apr} onChange={(v) => patchDebt(d.id, { apr: Math.max(0, v) })} step={0.25} suffix="%" />
                  <Label className="block">
                    <span className="text-[12px] text-[var(--text-muted)]">Payment comes from</span>
                    <div className="mt-1">
                      <Dropdown
                        label="Payment"
                        hideLabel
                        value={rows && !linked ? '' : d.budgetRow ?? ''}
                        onChange={(v) => patchDebt(d.id, { budgetRow: v || null })}
                        className="h-9 w-full justify-between rounded-lg bg-[var(--surface-1)] px-3 shadow-xs"
                        options={rowOptions}
                      />
                    </div>
                  </Label>
                  {linked ? (
                    <Label className="block">
                      <span className="text-[12px] text-[var(--text-muted)]">Payment per month</span>
                      <div className="mt-1 rounded-lg bg-[var(--surface-1)] px-3 py-2 text-[13px] tnum ring-1 ring-[var(--ring)]">
                        {fmt(Number(linked.amount) || 0)}
                      </div>
                    </Label>
                  ) : (
                    <ToolField label="Payment per month" value={d.payment} onChange={(v) => patchDebt(d.id, { payment: Math.max(0, v) })} step={50} suffix="$" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setDebts([...debts, { id: newId('d'), name: '', balance: 0, apr: 0, payment: 0, budgetRow: null }])}
        >
          <Icon name="plus" size={13} />
          Add a debt
        </Button>
      </Card>

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold">What you have</h2>
            <p className="mt-1 text-[12px] text-[var(--text-muted)]">
              Cash, savings and investments, typed in by hand.
            </p>
          </div>
          <Label className="flex items-center gap-2">
            <span className="text-[12px] text-[var(--text-muted)]">As of</span>
            <Input
              type="date"
              value={asOf || today}
              onChange={(e) => setAsOf(e.target.value)}
              className="w-[160px]"
            />
          </Label>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {assets.length === 0 && (
            <p className="text-[13px] text-[var(--text-secondary)]">Nothing added yet.</p>
          )}
          {assets.map((a) => (
            <div key={a.id} className="flex items-center gap-2">
              <Input
                value={a.name}
                placeholder="Savings account"
                spellCheck={false}
                onChange={(e) => patchAsset(a.id, { name: e.target.value })}
                className="min-w-0 flex-1"
              />
              <div className="w-[160px]">
                <DraftNumberInput
                  boxed
                  value={a.balance}
                  step={500}
                  suffix="$"
                  onChange={(v) => patchAsset(a.id, { balance: v })}
                  className="tnum"
                />
              </div>
              <div className="w-[230px]">
                {/* the account type decides how Retirement taxes it; `pool` is kept in step for older readers */}
                <Select
                  value={assetKind(a)}
                  onValueChange={(v) => patchAsset(a.id, { kind: v as AssetKind, pool: v === AssetKind.regular ? AssetPool.savings : AssetPool.k401 })}
                >
                  <SelectTrigger aria-label={`Account type for ${a.name || 'this asset'}`} className="h-9 w-full rounded-lg bg-[var(--surface-1)] text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {ASSET_KIND_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value} className="text-[13px]">{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setAssets(assets.filter((x) => x.id !== a.id))}
                title="Remove"
                className="text-[var(--text-muted)] hover:bg-transparent hover:text-[var(--bad)]"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setAssets([...assets, { id: newId('a'), name: '', balance: 0 }])}
        >
          <Icon name="plus" size={13} />
          Add something you have
        </Button>
      </Card>
    </div>
  )
}
