import { Info } from 'lucide-react'
import { GuideText } from '@/screens/guide/ui/GuideText'
import { ImportPromptActions } from '@/screens/guide/ui/ImportPromptActions'
import type { GuideBlock } from '@/screens/guide/types/GuideBlock'

type GuideBlockViewProps = {
  block: GuideBlock
  goTo: (view: string) => void
  onAnchor: (id: string) => void
}

// One block of the guide: a paragraph, a boxed note, a bulleted list, numbered steps or the import
// prompt buttons.
export function GuideBlockView({ block, goTo, onAnchor }: GuideBlockViewProps) {
  const text = { goTo, onAnchor }
  if (block.kind === 'p') {
    return <p className="mt-4 text-[15px] leading-7 text-[var(--text-secondary)]"><GuideText parts={block.text} {...text} /></p>
  }
  if (block.kind === 'note') {
    return (
      <div className="mt-5 flex gap-3 rounded-xl bg-[var(--surface-2)] px-4 py-3.5 ring-1 ring-[var(--ring)]">
        <Info className="mt-1 size-4 shrink-0 text-[var(--accent)]" aria-hidden />
        <div className="text-[14px] leading-6 text-[var(--text-secondary)]">
          <p className="font-semibold text-[var(--text-primary)]">{block.title}</p>
          <p className="mt-1"><GuideText parts={block.text} {...text} /></p>
        </div>
      </div>
    )
  }
  if (block.kind === 'importPrompt') return <ImportPromptActions />
  const List = block.kind === 'steps' ? 'ol' : 'ul'
  return (
    <List className={`mt-4 flex flex-col gap-2.5 pl-6 text-[15px] leading-7 text-[var(--text-secondary)] marker:text-[var(--text-muted)] ${block.kind === 'steps' ? 'list-decimal' : 'list-disc'}`}>
      {block.items.map((item, i) => (
        <li key={i} className="pl-1"><GuideText parts={item} {...text} /></li>
      ))}
    </List>
  )
}
