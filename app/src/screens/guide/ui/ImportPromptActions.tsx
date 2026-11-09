import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, Copy, Download } from 'lucide-react'
import { Button } from '@/shared/ui/primitives/button'
import { IMPORT_PROMPT } from '@/shared/constants/IMPORT_PROMPT'
import { copyText } from '@/shared/utils/copyText'
import { downloadBlob } from '@/shared/utils/downloadBlob'
import { cn } from '@/shared/utils/cn'

// The import prompt, for people who already have data and so never see the empty screen again:
// copy it (the button says so for a moment), download it as IMPORT_PROMPT.md or read it in place.
export function ImportPromptActions() {
  const [copied, setCopied] = useState<'yes' | 'failed' | null>(null)
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  const copy = async () => {
    setCopied((await copyText(IMPORT_PROMPT)) ? 'yes' : 'failed')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(null), 2500)
  }
  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={copy}>
          {copied === 'yes' ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {copied === 'yes' ? 'Copied' : 'Copy the prompt'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => downloadBlob(IMPORT_PROMPT, 'IMPORT_PROMPT.md', 'text/markdown')}>
          <Download className="size-3.5" aria-hidden />
          Download the prompt
        </Button>
        <span role="status" className="text-[12px] text-[var(--text-muted)]">
          {copied === 'yes' && 'The prompt is on your clipboard.'}
          {copied === 'failed' && <span className="text-[var(--bad)]">Could not copy. Your browser blocked it, so use Download the prompt instead.</span>}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className="mt-3 -ml-2 text-[var(--text-secondary)]"
      >
        <ChevronDown className={cn('size-3.5 transition-transform motion-reduce:transition-none', open && 'rotate-180')} aria-hidden />
        {open ? 'Hide the prompt' : 'Show the prompt'}
      </Button>
      {open && (
        <pre
          id={panelId}
          tabIndex={0}
          aria-label="The import prompt"
          className="mt-2 max-h-[420px] overflow-auto overscroll-contain whitespace-pre-wrap break-words rounded-xl bg-[var(--surface-1)] p-4 font-mono text-[12px] leading-5 text-[var(--text-secondary)] ring-1 ring-[var(--ring)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          {IMPORT_PROMPT}
        </pre>
      )}
    </div>
  )
}
