import { VIDEO_BASE_URL } from '@/screens/marketing/constants/VIDEO_BASE_URL'

// Bump this when the videos are re-recorded so browsers and the CDN fetch the new files.
const VIDEO_VERSION = '2'

// 'chapter-1-intro.mp4' -> the address that file is served from
export function videoUrl(file: string): string {
  return `${VIDEO_BASE_URL}/${file}?v=${VIDEO_VERSION}`
}
