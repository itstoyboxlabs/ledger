import { useState } from 'react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/shared/ui/primitives/dropdown-menu'
import { Button } from '@/shared/ui/primitives/button'
import { X, Check, ChevronDown, Plus, Save, Pencil } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent } from '@/shared/ui/primitives/tooltip'
import { Input } from '@/shared/ui/primitives/input'
import { Modal } from '@/shared/ui/Modal'
import { sameData } from '@/shared/utils/sameData'
import type { Preset } from '@/shared/types/Preset'
import { usePersistedState } from '@/shared/hooks/usePersistedState'

type PresetBarProps<T> = {
  presets: Preset<T>[]
  currentData: T
  onApply: (data: T) => void
  onSave: (name: string) => void
  onDelete: (name: string) => void
  // shows a rename button on each preset when given
  onRename?: (from: string, to: string) => void
  canSave?: boolean
  scope?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideTrigger?: boolean
  // a short line at the top of the menu, like where else these presets are used
  hint?: string
}

export function PresetBar<T>({ presets, currentData, onApply, onSave, onDelete, onRename, canSave = true, scope = 'default', open: openProp, onOpenChange, hideTrigger = false, hint }: PresetBarProps<T>) {
  // open state can be driven from outside (the phone menu opens it), with no visible button
  const [openState, setOpenState] = useState(false)
  const open = openProp ?? openState
  const setOpen = onOpenChange ?? setOpenState
  const [showSave, setShowSave] = useState(false)
  const [name, setName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [renameTarget, setRenameTarget] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const renameTaken = !!newName.trim() && newName.trim() !== renameTarget && presets.some((p) => p.name === newName.trim())
  const commitRename = () => {
    const to = newName.trim()
    if (!renameTarget || !to || renameTaken) return
    onRename?.(renameTarget, to)
    if (lastName === renameTarget) setLastName(to)
    setRenameTarget(null)
  }
  const [lastName, setLastName] = usePersistedState<string | null>(`presetActive:${scope}`, null, (v) => v === null || typeof v === 'string')
  // a preset whose values equal the current ones is active; otherwise the one last
  // applied or saved stays active, and the dot says the values moved away from it
  const exact = presets.find((p) => sameData(p.data, currentData))
  const active = exact ?? presets.find((p) => p.name === lastName) ?? null
  const drifted = !!active && !exact
  const commit = () => {
    if (!name.trim()) return
    onSave(name.trim())
    setLastName(name.trim())
    setShowSave(false)
  }
  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          {hideTrigger ? (
            <span className="absolute right-0 top-full h-0 w-0" />
          ) : (
          <Button variant="outline" size="sm" className="group gap-2">
            {active?.name ?? 'Presets'}
            {drifted && <span className="size-1.5 rounded-full bg-[#e8c76a]" aria-label="Changed since this preset" />}
            <ChevronDown className="size-3 text-[var(--text-muted)] transition-transform group-data-[state=open]:rotate-180" />
          </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[240px] rounded-xl">
          {hint && (
            <>
              <p className="max-w-[260px] px-2 pt-1 pb-1.5 text-[11px] leading-snug text-[var(--text-muted)]">{hint}</p>
              <DropdownMenuSeparator />
            </>
          )}
          {presets.length === 0 && (
            <div className="px-2 py-1.5 text-[12px] text-[var(--text-muted)]">No presets yet</div>
          )}
          {presets.map((p) => {
            const isActive = active?.name === p.name
            const canOverwrite = isActive && drifted
            return (
              <div key={p.name} className="group/preset flex items-center gap-0.5">
                <DropdownMenuItem
                  onSelect={() => {
                    onApply(p.data)
                    setLastName(p.name)
                  }}
                  className="min-w-0 flex-1 gap-2 text-[13px]"
                >
                  <Check className={cn('size-3.5 shrink-0', isActive ? 'opacity-100' : 'opacity-0')} />
                  <span className="truncate">{p.name}</span>
                </DropdownMenuItem>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button variant="ghost" size="icon-xs"
                        disabled={!canOverwrite}
                        onClick={() => {
                          onSave(p.name)
                          setLastName(p.name)
                        }}
                        aria-label={`Overwrite "${p.name}" with the current values`}
                        className="text-[var(--text-muted)] opacity-0 hover:text-white focus-visible:opacity-100 group-hover/preset:opacity-100"
                      >
                        <Save className="size-3.5" />
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    {canOverwrite ? 'Overwrite with the current values' : 'Nothing changed'}
                  </TooltipContent>
                </UITooltip>
                {onRename && (
                  <Button variant="ghost" size="icon-xs"
                    onClick={() => {
                      setOpen(false)
                      setNewName(p.name)
                      setRenameTarget(p.name)
                    }}
                    aria-label={`Rename preset "${p.name}"`}
                    className="text-[var(--text-muted)] opacity-0 hover:text-white focus-visible:opacity-100 group-hover/preset:opacity-100"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon-xs"
                  onClick={() => {
                    setOpen(false)
                    setDeleteTarget(p.name)
                  }}
                  aria-label={`Delete preset "${p.name}"`}
                  className="mr-1 text-[var(--text-muted)] opacity-0 hover:text-[var(--bad)] focus-visible:opacity-100 group-hover/preset:opacity-100"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            )
          })}
          <DropdownMenuSeparator />
          <UITooltip>
            <TooltipTrigger asChild>
              <span className="block">
                <DropdownMenuItem
                  disabled={!canSave}
                  onSelect={() => {
                    setName('')
                    setShowSave(true)
                  }}
                  className="gap-2 text-[13px]"
                >
                  <Plus className="size-3.5 shrink-0" />
                  Save as new preset
                </DropdownMenuItem>
              </span>
            </TooltipTrigger>
            {!canSave && <TooltipContent side="left">Change something first</TooltipContent>}
          </UITooltip>
        </DropdownMenuContent>
      </DropdownMenu>

      {showSave && (
        <Modal
          onClose={() => setShowSave(false)}
          title="Save preset"
          description="Saves the current configuration under a name, saved with your settings."
          className="max-w-[340px] p-5"
        >
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setShowSave(false)
                if (e.key === 'Enter') commit()
              }}
              placeholder="Preset name"
              className="mt-3"
            />
            {presets.length > 0 && (
              <div className="mt-3">
                <div className="text-[11px] text-[var(--text-muted)]">
                  Or replace an existing one
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {presets.map((p) => (
                    <Button variant={name.trim() === p.name ? 'default' : 'outline'} size="sm"
                      key={p.name}
                      onClick={() => setName(p.name)}
                      title={`Fill in "${p.name}" so Save overwrites it`}
                    >
                      {p.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline"
                onClick={() => setShowSave(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={!name.trim()}
                onClick={commit}
                className=""
              >
                {presets.some((p) => p.name === name.trim()) ? 'Replace' : 'Save'}
              </Button>
            </div>
        </Modal>
      )}

      {renameTarget && (
        <Modal
          onClose={() => setRenameTarget(null)}
          title="Rename preset"
          description={`A new name for "${renameTarget}". Anything that uses it keeps using it.`}
          className="max-w-[340px] p-5"
        >
          <Input
            autoFocus
            aria-label="New preset name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setRenameTarget(null)
              if (e.key === 'Enter') commitRename()
            }}
            className="mt-3"
          />
          {renameTaken && <p className="mt-1.5 text-[11px] text-[var(--bad)]">Another preset has that name.</p>}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button disabled={!newName.trim() || renameTaken} onClick={commitRename}>Rename</Button>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          onClose={() => setDeleteTarget(null)}
          title="Delete preset?"
          description={`Are you sure you want to delete "${deleteTarget}"? This can't be undone.`}
          className="max-w-[340px] p-5"
        >
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button variant="destructive"
                onClick={() => {
                  onDelete(deleteTarget)
                  if (lastName === deleteTarget) setLastName(null)
                  setDeleteTarget(null)
                }}
              >
                Delete
              </Button>
            </div>
        </Modal>
      )}
    </>
  )
}
