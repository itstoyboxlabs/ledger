import type { TutorialChapter } from '@/screens/marketing/types/TutorialChapter'

type ChapterButtonProps = {
  chapter: TutorialChapter
  number: number
  active: boolean
  onSelect: () => void
}

// One row in the chapter list: thumbnail, number, title and a one line summary.
export function ChapterButton({ chapter, number, active, onSelect }: ChapterButtonProps) {
  return (
    <button type="button" className={active ? 'ch on' : 'ch'} aria-current={active ? 'true' : undefined} onClick={onSelect}>
      <div className="thumb">
        <img src={`/videos/${chapter.file}.jpg`} alt="" loading="lazy" />
        <span>{chapter.length}</span>
      </div>
      <div>
        <i>Chapter {number}</i>
        <b>{chapter.title}</b>
        <p>{chapter.summary}</p>
      </div>
    </button>
  )
}
