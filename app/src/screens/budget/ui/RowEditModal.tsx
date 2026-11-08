import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs'
import { fmt0 } from '@/shared/utils/fmt0'
import { Button } from '@/shared/ui/primitives/button'
import { Modal } from '@/shared/ui/Modal'
import { SubItemsEditor } from '@/screens/budget/ui/SubItemsEditor'
import { blankItem } from '@/screens/budget/utils/blankItem'
import type { BudgetRow } from '@/shared/types/BudgetRow'
import type { SubItem } from '@/shared/types/SubItem'
import { itemsTotal } from '@/shared/utils/itemsTotal'

// One modal for any row's pencil. A breakdown row is a list of sub items (name, per
// month or per week, inputs) with a live total; a simple row can become one from here.
// Every edit writes to the row straight away so the budget behind the modal moves as
// you type, and Cancel puts the row back to what it was when the modal opened.
type RowEditModalProps = {
  row: BudgetRow
  onChange: (patch: Partial<BudgetRow>) => void
  onCancel: () => void
  onClose: () => void
}

export function RowEditModal({ row, onChange, onCancel, onClose }: RowEditModalProps) {
  const isSub = row.source === 'subscription'
  const isStack = row.type === 'breakdown'
  const items = row.items ?? []
  const setItems = (next: SubItem[]) => onChange({ items: next, amount: itemsTotal(next) })
  const patch = (id: string, p: Partial<SubItem>) => setItems(items.map((it) => (it.id === id ? { ...it, ...p } : it)))
  const setType = (type: string) => {
    if (type === row.type) return
    if (type === 'breakdown') {
      const first = Number(row.amount) > 0 ? blankItem({ name: 'Existing amount', amount: row.amount }) : blankItem()
      onChange({ type: 'breakdown', items: [first], amount: itemsTotal([first]) })
    } else {
      onChange({ type: 'simple', items: undefined, amount: itemsTotal(items) })
    }
  }
  return (
    <Modal
      onClose={() => onClose()}
      light
      title={row.name || 'Edit row'}
      description={
        isStack
          ? 'Add what makes up this row. The budget updates as you type.'
          : 'Change how this row is built.'
      }
      className="show-spinners flex max-h-[88vh] max-w-[540px] flex-col"
    >
      <div className="mt-4 flex min-h-0 flex-col gap-5 overflow-y-auto overscroll-contain p-0.5">
        {!isSub && (
          <Tabs value={row.type} onValueChange={setType}>
            <TabsList className="w-full">
              <TabsTrigger value="simple" className="py-1.5 text-[13px]">Simple</TabsTrigger>
              <TabsTrigger value="breakdown" className="py-1.5 text-[13px]">Stack with sub items</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        {isStack && <SubItemsEditor items={items} setItems={setItems} />}
      </div>
      <div className="mt-5 flex items-end justify-between gap-4 border-t border-[var(--grid)] pt-4">
        {isSub ? <span /> : <div>
          {isStack && <div className="text-[12px] text-[var(--text-secondary)]">{items.length} sub {items.length === 1 ? 'item' : 'items'}</div>}
          <div className="text-[26px] font-bold tracking-tight tnum">
            {fmt0(isStack ? itemsTotal(items) : Number(row.amount) || 0)}
            <span className="ml-1.5 text-[13px] font-medium text-[var(--text-secondary)]">a month</span>
          </div>
        </div>}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  )
}
