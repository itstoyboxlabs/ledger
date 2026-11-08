import type { ToolList } from '@/screens/tools/types/ToolList'
import { useEffect, useState } from 'react'
import { Button } from '@/shared/ui/primitives/button'
import { Label } from '@/shared/ui/primitives/label'
import { Checkbox } from '@/shared/ui/primitives/checkbox'
import { Icon } from '@/shared/ui/Icon'
import { ListModal } from '@/screens/tools/ui/ListModal'
import { Modal } from '@/shared/ui/Modal'
import { useLists } from '@/screens/tools/hooks/useLists'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { useToolCatalog } from '@/screens/tools/hooks/useToolCatalog'
import { validToolIds } from '@/screens/tools/utils/validToolIds'

// "What to show" button for the Tools page header + its picker modal: one card per
// tool (title + what it does); click a card to put that tool on or off the page.
export function ToolPicker() {
  const catalog = useToolCatalog()
  const allIds = catalog.map((t) => t[0])
  const [, setLists] = useLists()
  const [shown, setShown] = usePersistedState('toolsShown', allIds, validToolIds)
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  useEffect(() => {
    if (!open || adding) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, adding])
  const toggle = (id: string) => setShown(shown.includes(id) ? shown.filter((x) => x !== id) : [...shown, id])
  const count = allIds.filter((id) => shown.includes(id)).length
  const allOn = count === allIds.length

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="h-10 gap-2.5 rounded-lg px-3.5">
        <Icon name="layers" size={16} className="text-[var(--text-secondary)]" />
        What to show
        <span className="tnum text-[var(--text-muted)]">{count}/{allIds.length}</span>
      </Button>
      {open && (
        <Modal
          onClose={() => setOpen(false)}
          title="What to show"
          description="Click a tool to put it on the page or take it off."
          action={
            <Button variant="outline"
              onClick={() => setShown(allOn ? [] : allIds)}
              className="shrink-0"
            >
              {allOn ? 'Clear all' : 'Show all'}
            </Button>
          }
          className="flex max-h-[88vh] max-w-[900px] flex-col"
        >
            <div className="mt-5 grid gap-3 overflow-y-auto overscroll-contain p-px sm:grid-cols-2 lg:grid-cols-3">
              {catalog.map(([id, title, desc]) => {
                const on = shown.includes(id)
                return (
                  <Label
                    key={id}
                    className={
                      'flex items-start gap-3 rounded-xl p-4 text-left ring-1 transition-colors cursor-pointer ' +
                      (on
                        ? 'bg-[var(--accent-soft)] ring-[var(--accent)]'
                        : 'bg-[var(--surface-1)] ring-[var(--ring)] hover:bg-[var(--surface-2)]')
                    }
                  >
                    <Checkbox checked={on} onCheckedChange={() => toggle(id)} className="mt-0.5" />
                    <span className="min-w-0">
                      <span className="block text-[14px] font-semibold">{title}</span>
                      <span className="mt-1 block text-[12px] leading-relaxed text-[var(--text-secondary)]">{desc}</span>
                    </span>
                  </Label>
                )
              })}
            </div>
            <div className="mt-5 flex items-center justify-between">
              <Button variant="outline" onClick={() => setAdding(true)}>
                <Icon name="plus" size={13} />
                Add a list
              </Button>
              <Button
                onClick={() => setOpen(false)}
                className=""
              >
                Done
              </Button>
            </div>
        </Modal>
      )}
      {adding && (
        <ListModal
          onClose={() => setAdding(false)}
          onSave={(list: ToolList) => {
            setLists((prev) => [...prev, list])
            setShown((prev) => (prev.includes(list.id) ? prev : [...prev, list.id]))
            setAdding(false)
          }}
        />
      )}
    </>
  )
}
