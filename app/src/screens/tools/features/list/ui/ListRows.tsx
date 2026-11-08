import type { ToolListItem } from '@/screens/tools/types/ToolListItem'
import { Input } from '@/shared/ui/primitives/input'
import { Button } from '@/shared/ui/primitives/button'
import { X } from 'lucide-react'
import { fmt } from '@/shared/utils/fmt'
import { DraftNumberInput } from '@/shared/ui/DraftNumberInput'
import { Icon } from '@/shared/ui/Icon'
import { newId } from '@/shared/utils/newId'

// item and amount rows with add, remove and a total (used in the card and in the modal)
export function ListRows({ items, onChange }: { items: ToolListItem[]; onChange: (items: ToolListItem[]) => void }) {
  const patch = (id: string, p: Partial<ToolListItem>) => onChange(items.map((it) => (it.id === id ? { ...it, ...p } : it)))
  const add = () => onChange([...items, { id: newId('i'), name: '', amount: 0 }])
  const total = items.reduce((t, it) => t + (Number(it.amount) || 0), 0)
  return (
    <>
      <div className="mt-4 flex items-center gap-2 text-[12px] text-[var(--text-muted)]">
        <span className="flex-1">Item</span>
        <span className="w-[120px]">Amount</span>
        <span className="w-6" />
      </div>
      <div className="mt-1.5 flex flex-col gap-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-2">
            <Input
              value={it.name}
              placeholder="item"
              spellCheck={false}
              onChange={(e) => patch(it.id, { name: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && add()}
              className="min-w-[90px] flex-1"
            />
            <div className="w-[120px]">
              <DraftNumberInput
                boxed
                value={it.amount}
                step={5}
                suffix="$"
                onChange={(v: number) => patch(it.id, { amount: Math.max(0, v) })}
                className="tnum"
              />
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onChange(items.filter((x) => x.id !== it.id))}
              title="Remove item"
              className="text-[var(--text-muted)] hover:bg-transparent hover:text-[var(--bad)]"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={add} className="mt-3">
        <Icon name="plus" size={13} />
        Add item
      </Button>
      <div className="mt-4 flex items-baseline justify-between border-t border-[var(--baseline)] pt-3">
        <span className="text-[13px] font-semibold">
          Total
          <span className="ml-2 font-normal text-[var(--text-muted)]">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </span>
        <span className="text-[20px] font-bold tracking-tight tnum" style={{ color: 'var(--good)' }}>
          {fmt(total)}
        </span>
      </div>
    </>
  )
}
