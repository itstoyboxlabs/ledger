import { useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/utils/cn'
import { Label } from '@/shared/ui/primitives/label'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs'
import { Input } from '@/shared/ui/primitives/input'
import { fmt0 } from '@/shared/utils/fmt0'
import { Button } from '@/shared/ui/primitives/button'
import { Modal } from '@/shared/ui/Modal'
import { SubItemsEditor } from '@/screens/budget/ui/SubItemsEditor'
import { blankItem } from '@/screens/budget/utils/blankItem'
import type { BudgetRow } from '@/shared/types/BudgetRow'
import type { SubItem } from '@/shared/types/SubItem'
import type { BudgetRowType } from '@/shared/enums/BudgetRowType'
import type { BudgetRowSource } from '@/shared/enums/BudgetRowSource'
import { itemsTotal } from '@/shared/utils/itemsTotal'

type AddRowModalProps = {
  onAdd: (row: Omit<BudgetRow, 'id'>) => void
  onClose: () => void
}

export function AddRowModal({ onAdd, onClose }: AddRowModalProps) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<BudgetRowType>('simple') // simple | breakdown
  const [items, setItems] = useState<SubItem[]>(() => [blankItem()])
  const [section, setSection] = useState<BudgetRowSource>('manual') // manual | subscription
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const stack = type === 'breakdown'
  const submit = () => {
    if (!name.trim()) return
    onAdd({
      name: name.trim(),
      amount: stack ? itemsTotal(items) : parseFloat(amount) || 0,
      source: stack ? 'manual' : section,
      type,
      ...(stack ? { items } : {}),
    })
    onClose()
  }

  return (
    <Modal onClose={() => onClose()} title="Add expense" className={cn('show-spinners max-h-[90vh] overflow-y-auto p-5', stack ? 'max-w-[540px]' : 'max-w-[380px]')}>
        <Label className="mt-4 block text-[12px] text-[var(--text-muted)]">
          Type
        </Label>
        <Tabs value={type} onValueChange={(v) => setType(v as BudgetRowType)} className="mt-1.5">
          <TabsList className="w-full">
            <TabsTrigger value="simple" className="py-1.5 text-[13px]">Simple</TabsTrigger>
            <TabsTrigger value="breakdown" className="py-1.5 text-[13px]">Stack with sub items</TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="mt-1.5 text-[12px] text-[var(--text-muted)]">
          {stack ? 'A row built from sub items, like each thing you buy. The amount is their sum.' : 'A name and a monthly amount.'}
        </p>

        {!stack && (
          <>
            <Label className="mt-4 block text-[12px] text-[var(--text-muted)]">
              Section
            </Label>
            <Tabs value={section} onValueChange={(v) => setSection(v as BudgetRowSource)} className="mt-1.5">
              <TabsList className="w-full">
                <TabsTrigger value="manual" className="py-1.5 text-[13px]">Expenses</TabsTrigger>
                <TabsTrigger value="subscription" className="py-1.5 text-[13px]">Subscriptions</TabsTrigger>
              </TabsList>
            </Tabs>
          </>
        )}

        <Label className="mt-4 block text-[12px] text-[var(--text-muted)]">
          Name
        </Label>
        <Input
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="e.g. Gym membership"
          className="mt-1.5"
        />

        {stack && (
          <div className="mt-4">
            <SubItemsEditor items={items} setItems={setItems} />
          </div>
        )}

        {!stack && (
          <>
            <Label className="mt-4 block text-[12px] text-[var(--text-muted)]">
              Amount / month
            </Label>
            <Input
              type="number"
              step="1"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="0.00"
              className="mt-1.5 tnum"
            />
          </>
        )}

        <div className="mt-5 flex items-end justify-between gap-2">
          {stack ? (
            <div>
              <div className="text-[12px] text-[var(--text-secondary)]">{items.length} sub {items.length === 1 ? 'item' : 'items'}</div>
              <div className="text-[22px] font-bold tracking-tight tnum">
                {fmt0(itemsTotal(items))}
                <span className="ml-1.5 text-[13px] font-medium text-[var(--text-secondary)]">a month</span>
              </div>
            </div>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={submit} disabled={!name.trim()}>Add</Button>
          </div>
        </div>
    </Modal>
  )
}
