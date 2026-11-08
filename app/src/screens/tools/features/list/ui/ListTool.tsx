import type { ToolList } from '@/screens/tools/types/ToolList'
import { Button } from '@/shared/ui/primitives/button'
import { X } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Icon } from '@/shared/ui/Icon'
import { ListRows } from '@/screens/tools/features/list/ui/ListRows'

interface ListToolProps {
  list: ToolList
  onChange: (next: ToolList) => void
  onEdit: () => void
  onDelete: () => void
}

export function ListTool({ list, onChange, onEdit, onDelete }: ListToolProps) {
  return (
    <Card className="show-spinners p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[15px] font-semibold">{list.title || 'Untitled list'}</h2>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon-xs" onClick={onEdit} title="Edit title and description"
            className="text-[var(--text-muted)] hover:text-white">
            <Icon name="pencil" size={13} />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onDelete} title="Delete list"
            className="text-[var(--text-muted)] hover:bg-transparent hover:text-[var(--bad)]">
            <X className="size-3.5" />
          </Button>
        </div>
      </div>
      {list.description && <p className="mt-1 text-[12px] text-[var(--text-muted)]">{list.description}</p>}
      <ListRows items={list.items} onChange={(items) => onChange({ ...list, items })} />
    </Card>
  )
}
