import { render, screen, fireEvent } from '@testing-library/react'
import { ChapterButton } from '@/screens/marketing/ui/ChapterButton'
import { TUTORIAL_CHAPTERS } from '@/screens/marketing/constants/TUTORIAL_CHAPTERS'

describe('ChapterButton', () => {
  it('shows the chapter and reports clicks', () => {
    const onSelect = vi.fn()
    render(<ChapterButton chapter={TUTORIAL_CHAPTERS[4]} number={5} active onSelect={onSelect} />)
    expect(screen.getByText('Chapter 5')).toBeInTheDocument()
    expect(screen.getByText('7:31')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveClass('on')
    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalled()
  })
})
