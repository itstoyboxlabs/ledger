import { useEffect, useRef, useState } from 'react'
import { getNotes } from '@/shared/utils/getNotes'
import { saveNotes } from '@/shared/utils/saveNotes'
import { Textarea } from '@/shared/ui/primitives/textarea'
import { Button } from '@/shared/ui/primitives/button'
import { Modal } from '@/shared/ui/Modal'
import type { Note } from '@/shared/types/Note'
import type { SaveState } from '@/screens/notes/types/SaveState'
import { NoteCard } from '@/screens/notes/ui/NoteCard'

type NotesModalProps = { onClose: () => void }

export function NotesModal({ onClose }: NotesModalProps) {
  const [notes, setNotes] = useState<Note[] | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [newText, setNewText] = useState('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    getNotes()
      .then((d) => setNotes(d.notes || []))
      .catch(() => setSaveState('error'))
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const persist = (next: Note[]) => {
    setNotes(next)
    setSaveState('saving')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveNotes(next)
        .then(() => setSaveState('saved'))
        .catch(() => setSaveState('error'))
    }, 400)
  }

  const addNote = () => {
    if (!newText.trim()) return
    persist([
      ...(notes || []),
      { id: `note${Date.now().toString(36)}`, text: newText.trim(), createdAt: Date.now(), pinned: false },
    ])
    setNewText('')
  }
  const updateNote = (id: string, text: string) => persist((notes ?? []).map((n) => (n.id === id ? { ...n, text } : n)))
  const deleteNote = (id: string) => persist((notes ?? []).filter((n) => n.id !== id))
  const togglePin = (id: string) => persist((notes ?? []).map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)))

  // pinned notes form their own section at the top; within each section
  // (pinned, then unpinned) newest sorts first
  const sorted = notes
    ? [...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.createdAt - a.createdAt)
    : []

  return (
    <Modal
      onClose={() => onClose()}
      title="Notes"
      action={saveState === 'error' ? <div className="text-[12px] text-[var(--bad)]">save failed</div> : undefined}
      className="flex max-w-[560px] max-h-[85vh] flex-col gap-3 p-5"
    >
        <div className="mb-3 flex items-start gap-2">
          <Textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addNote()
            }}
            placeholder="New note… (⌘/Ctrl + Enter to add)"
            rows={2}
            spellCheck={false}
            className="resize-y p-3"
          />
          <Button
            onClick={addNote}
            disabled={!newText.trim()}
            className="shrink-0"
          >
            Add
          </Button>
        </div>

        {notes === null ? (
          <div className="py-10 text-center text-[13px] text-[var(--text-muted)]">Loading…</div>
        ) : sorted.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-[var(--text-muted)]">No notes yet.</div>
        ) : (
          <div className="flex flex-col gap-2 overflow-y-auto overscroll-contain">
            {sorted.map((n) => (
              <NoteCard
                key={n.id}
                note={n}
                onChange={(text) => updateNote(n.id, text)}
                onDelete={() => deleteNote(n.id)}
                onTogglePin={() => togglePin(n.id)}
              />
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
    </Modal>
  )
}
