import { useState, type ChangeEvent } from 'react'
import type { ToolList } from '@/screens/tools/types/ToolList'
import type { ToolListItem } from '@/screens/tools/types/ToolListItem'
import { Label } from '@/shared/ui/primitives/label'
import { Input } from '@/shared/ui/primitives/input'
import { Button } from '@/shared/ui/primitives/button'
import { ListRows } from '@/screens/tools/features/list/ui/ListRows'
import { Modal } from '@/shared/ui/Modal'
import { newId } from '@/shared/utils/newId'

// create a list, or edit one's title, description and rows
type ListModalProps = {
  initial?: ToolList | null
  onSave: (list: ToolList) => void
  onClose: () => void
}

export function ListModal({ initial, onSave, onClose }: ListModalProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [items, setItems] = useState<ToolListItem[]>(initial?.items ?? [{ id: newId('i'), name: '', amount: 0 }])
  return (
    <Modal
      onClose={onClose}
      title={initial ? 'Edit list' : 'Add a list'}
      description="Name it, then add what goes on it and what each is worth."
      className="show-spinners flex max-h-[88vh] max-w-[560px] flex-col"
    >
      <div className="mt-4 flex flex-col gap-3 overflow-y-auto overscroll-contain p-px">
        <Label className="block">
          <span className="text-[12px] text-[var(--text-muted)]">Title</span>
          <Input
            autoFocus
            className="mt-1"
            value={title}
            placeholder="Gift ideas"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          />
        </Label>
        <Label className="block">
          <span className="text-[12px] text-[var(--text-muted)]">One line about it (optional)</span>
          <Input
            className="mt-1"
            value={description}
            placeholder="A short note about this list"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
          />
        </Label>
        <ListRows items={items} onChange={setItems} />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          disabled={!title.trim()}
          onClick={() => onSave({ id: initial?.id ?? newId('list-'), title: title.trim(), description: description.trim(), items })}
        >
          {initial ? 'Save' : 'Add list'}
        </Button>
      </div>
    </Modal>
  )
}
