import { Modal } from '@/shared/ui/Modal'
import { videoUrl } from '@/shared/utils/videoUrl'
import { TOOL_VIDEOS } from '@/screens/tools/constants/TOOL_VIDEOS'

type ToolVideoModalProps = { id: string; title: string; onClose: () => void }

// A tool's walkthrough video in a window. Tools without a video yet say so.
export function ToolVideoModal({ id, title, onClose }: ToolVideoModalProps) {
  const has = TOOL_VIDEOS.includes(id)
  return (
    <Modal onClose={onClose} title={title} className="sm:max-w-3xl">
      {has ? (
        <video
          className="mt-2 aspect-video w-full rounded-lg bg-black"
          controls
          autoPlay
          playsInline
          poster={videoUrl(`tool-${id}.jpg`)}
          src={videoUrl(`tool-${id}.mp4`)}
        />
      ) : (
        <p className="mt-2 text-[13px] text-[var(--text-secondary)]">The video for this tool is coming soon.</p>
      )}
    </Modal>
  )
}
