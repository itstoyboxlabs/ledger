import { render, screen } from '@testing-library/react'
import { TutorialPlayer } from '@/screens/marketing/ui/TutorialPlayer'
import { TUTORIAL_CHAPTERS } from '@/screens/marketing/constants/TUTORIAL_CHAPTERS'

describe('TutorialPlayer', () => {
  it('loads the chapter video and poster from /videos', () => {
    const { container } = render(<TutorialPlayer chapter={TUTORIAL_CHAPTERS[2]} number={3} count={9} videoRef={null} onEnded={() => {}} />)
    const video = container.querySelector('video')
    expect(video).toHaveAttribute('src', '/videos/chapter-3-overview.mp4')
    expect(video).toHaveAttribute('poster', '/videos/chapter-3-overview.jpg')
    expect(screen.getByText('Chapter 3 of 9')).toBeInTheDocument()
  })
})
