import { ChapterButton } from '@/screens/marketing/ui/ChapterButton'
import { IconSprite } from '@/screens/marketing/ui/IconSprite'
import { MarketingFooter } from '@/screens/marketing/ui/MarketingFooter'
import { MarketingNav } from '@/screens/marketing/ui/MarketingNav'
import { SkipLink } from '@/screens/marketing/ui/SkipLink'
import { TutorialPlayer } from '@/screens/marketing/ui/TutorialPlayer'
import { TUTORIAL_CHAPTERS } from '@/screens/marketing/constants/TUTORIAL_CHAPTERS'
import { useTutorialPlayer } from '@/screens/marketing/hooks/useTutorialPlayer'

export function TutorialPage() {
  const { index, select, onEnded, videoRef } = useTutorialPlayer(TUTORIAL_CHAPTERS.length)
  return (
    <div className="tut">
      <SkipLink />
      <div className="glow-top"></div>
      <IconSprite />
      <div className="wrap">
        <MarketingNav active="tutorial" />
        <main id="main">
        <header>
          <span className="pill">Tutorial</span>
          <h1>Learn Ledger in 24 minutes.</h1>
          <p>Start with getting set up, then go tab by tab. Every chapter uses made-up demo data, so you can follow along with the sample data in the app.</p>
        </header>
        <div className="layout">
          <TutorialPlayer chapter={TUTORIAL_CHAPTERS[index]} number={index + 1} count={TUTORIAL_CHAPTERS.length} videoRef={videoRef} onEnded={onEnded} />
          <div>
            <div className="list">
              {TUTORIAL_CHAPTERS.map((c, i) => (
                <ChapterButton key={c.file} chapter={c} number={i + 1} active={i === index} onSelect={() => select(i)} />
              ))}
            </div>
            <div className="full">
              <span>
                Playing <b>all chapters</b> in order. Each one starts the next.
              </span>
            </div>
          </div>
        </div>
        </main>
      </div>
      <MarketingFooter />
    </div>
  )
}
