import { Input } from '@/shared/ui/primitives/input'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs'
import { Button } from '@/shared/ui/primitives/button'
import { X } from 'lucide-react'
import { fmt0 } from '@/shared/utils/fmt0'
import { Icon } from '@/shared/ui/Icon'
import { ToolField } from '@/shared/ui/ToolField'
import { blankItem } from '@/screens/budget/utils/blankItem'
import type { SubItem } from '@/shared/types/SubItem'
import type { SubItemMode } from '@/shared/enums/SubItemMode'
import { itemMonthly } from '@/shared/utils/itemMonthly'

// The sub items of a stack row: name, per month or per week, inputs, add and remove.
// Used when adding a row and when editing one.
type SubItemsEditorProps = {
  items: SubItem[]
  setItems: (items: SubItem[]) => void
}

export function SubItemsEditor({ items, setItems }: SubItemsEditorProps) {
  const patch = (id: string, p: Partial<SubItem>) => setItems(items.map((it) => (it.id === id ? { ...it, ...p } : it)))
  return (
      <div className="flex flex-col gap-2.5">
        {items.map((it) => (
          <div key={it.id} className="rounded-xl bg-[var(--surface-1)] p-3 ring-1 ring-[var(--ring)]">
            <div className="flex items-center gap-2">
              <Input
                value={it.name}
                placeholder="Sub item name"
                spellCheck={false}
                onChange={(e) => patch(it.id, { name: e.target.value })}
                className="min-w-0 flex-1"
              />
              <Tabs value={it.mode} onValueChange={(mode) => patch(it.id, { mode: mode as SubItemMode })}>
                <TabsList>
                  <TabsTrigger value="month" className="px-2.5 py-1 text-[12px]">Per month</TabsTrigger>
                  <TabsTrigger value="week" className="px-2.5 py-1 text-[12px]">Per week</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="ghost" size="icon-xs"
                onClick={() => setItems(items.filter((x) => x.id !== it.id))}
                aria-label="Remove sub item"
                className="text-[var(--text-muted)] hover:bg-transparent hover:text-[var(--bad)]"
              >
                <X className="size-3.5" />
              </Button>
            </div>
            {it.mode === 'week' ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <ToolField label="Average cost" value={it.amount} onChange={(v) => patch(it.id, { amount: Math.max(0, v) })} step={1} suffix="$" />
                <ToolField label="Times a week" value={it.perWeek} onChange={(v) => patch(it.id, { perWeek: Math.max(0, v) })} step={1} />
                <div className="col-span-2 tnum text-[12px] text-[var(--text-secondary)]">
                  ${it.amount} × {it.perWeek} × 4 = {fmt0(itemMonthly(it))} a month
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <ToolField label="Amount a month" value={it.amount} onChange={(v) => patch(it.id, { amount: Math.max(0, v) })} step={1} suffix="$" />
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="py-3 text-center text-[13px] text-[var(--text-secondary)]">No sub items yet.</div>
        )}
        <Button variant="outline" size="sm" onClick={() => setItems([...items, blankItem()])} className="self-start">
          <Icon name="plus" size={13} />
          Add sub item
        </Button>
      </div>
  )
}
