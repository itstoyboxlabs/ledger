import { videoUrl } from '@/screens/marketing/utils/videoUrl'
import type { TutorialChapter } from '@/screens/marketing/types/TutorialChapter'
import type { Ref } from 'react'
type TutorialPlayerProps = {
  chapter: TutorialChapter
  number: number
  count: number
  videoRef: Ref<HTMLVideoElement>
  onEnded: () => void
}

// The video and the title under it. The player is told which chapter to show and what to do when it ends.
export function TutorialPlayer({ chapter, number, count, videoRef, onEnded }: TutorialPlayerProps) {
  return (
    <div>
      <div className="player">
        <video ref={videoRef} controls playsInline preload="metadata" poster={videoUrl(`${chapter.file}.jpg`)} src={videoUrl(`${chapter.file}.mp4`)} onEnded={onEnded} />
      </div>
      <div className="now">
        <small>
          Chapter {number} of {count}
        </small>
        <h2>{chapter.title}</h2>
        <p>{chapter.summary}</p>
      </div>
    </div>
  )
}
