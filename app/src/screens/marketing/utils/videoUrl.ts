import { VIDEO_BASE_URL } from '@/screens/marketing/constants/VIDEO_BASE_URL'

// 'chapter-1-intro.mp4' -> the address that file is served from
export function videoUrl(file: string): string {
  return `${VIDEO_BASE_URL}/${file}`
}
