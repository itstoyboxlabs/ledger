import { VIDEO_BASE_URL } from '@/screens/marketing/constants/VIDEO_BASE_URL'
import { videoUrl } from '@/screens/marketing/utils/videoUrl'

describe('videoUrl', () => {
  it('puts the file name under the video store address', () => {
    expect(videoUrl('chapter-1-intro.mp4')).toMatch(new RegExp(`^${VIDEO_BASE_URL}/chapter-1-intro\\.mp4(\\?v=\\d+)?$`))
  })
  it('points at an https address with no trailing slash', () => {
    expect(VIDEO_BASE_URL.startsWith('https://')).toBe(true)
    expect(VIDEO_BASE_URL.endsWith('/')).toBe(false)
  })
})
