import { useEffect, useRef, useState } from 'react'
import { Button } from '@/shared/ui/primitives/button'
import { X } from 'lucide-react'
import { Textarea } from '@/shared/ui/primitives/textarea'
import type { Note } from '@/shared/types/Note'
import { noteDateLabel } from '@/screens/notes/utils/noteDateLabel'

type NoteCardProps = {
  note: Note
  onChange: (text: string) => void
  onDelete: () => void
  onTogglePin: () => void
}

// A single note: pin toggle, timestamp, editable text (autosaves via onCommit),
// delete (hover-reveal, no confirm — same as a manual budget row).
export function NoteCard({ note, onChange, onDelete, onTogglePin }: NoteCardProps) {
  const [draft, setDraft] = useState(note.text)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => setDraft(note.text), [note.id])

  const commit = (v: string) => {
    setDraft(v)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onChange(v), 400)
  }

  return (
    <div className="group rounded-lg bg-[var(--surface-1)] p-3 ring-1 ring-[var(--ring)]">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
          {note.pinned && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#e8c76a]">
              <path d="M12 17v5" />
              <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
            </svg>
          )}
          {noteDateLabel(note.createdAt)}
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon-xs"
            onClick={onTogglePin}
            title={note.pinned ? 'Unpin' : 'Pin to top'}
            className={note.pinned ? 'text-[#e8c76a] hover:text-[#e8c76a]' : 'text-[var(--text-muted)] hover:text-[#e8c76a]'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill={note.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 17v5" />
              <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon-xs"
            onClick={onDelete}
            title="Delete note"
            className="text-[var(--text-muted)] hover:text-[var(--bad)]"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>
      <Textarea
        value={draft}
        onChange={(e) => commit(e.target.value)}
        spellCheck={false}
        rows={Math.min(8, Math.max(2, draft.split('\n').length))}
        className="min-h-0 resize-y rounded-none border-transparent bg-transparent p-0 shadow-none focus-visible:border-transparent focus-visible:ring-0"
      />
    </div>
  )
}
