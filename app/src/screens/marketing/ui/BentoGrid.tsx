import { BentoCard } from '@/screens/marketing/ui/BentoCard'
import { Icon } from '@/screens/marketing/ui/Icon'
import { ToolsCard } from '@/screens/marketing/ui/ToolsCard'
import { BENTO_FILE_TYPES } from '@/screens/marketing/constants/BENTO_FILE_TYPES'
import { LINKS } from '@/screens/marketing/constants/LINKS'

// The smaller things, in four cards.
export function BentoGrid() {
  return (
    <section className="bento-section">
      <div className="center reveal">
        <h2>And the small things.</h2>
        <p>Tools, backups and a short video to get you started.</p>
      </div>
      <div className="bento reveal-kids">
        <BentoCard className="wide" content={{ title: 'Tools', text: 'Calculators for what comes up in real life, from take-home pay to debt payoff. Show only the ones you want.' }}>
          <ToolsCard />
        </BentoCard>
        <BentoCard content={{ title: 'Any statement', text: 'Download them from any bank, for any account.' }}>
          <div className="chips">
            {BENTO_FILE_TYPES.map((type) => (
              <span key={type}>
                <Icon paths={['M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z', 'M14 3v5h5']} />
                {type}
              </span>
            ))}
          </div>
        </BentoCard>
        <BentoCard content={{ title: 'One file, any time', text: 'Export your data and settings as one file and upload it to pick up where you left off.' }}>
          <div className="chips">
            <span>
              <Icon paths={['M12 3v12', 'm7 10 5 5 5-5', 'M5 21h14']} />
              ledger-data.json
            </span>
          </div>
        </BentoCard>
        <BentoCard className="wide" content={{ title: 'Watch it first', text: 'A short tutorial shows every screen, step by step.' }}>
          <a className="btn btn-o" href={LINKS.tutorial}>
            <Icon>
              <circle cx="12" cy="12" r="10" />
              <path d="m10 8 6 4-6 4z" />
            </Icon>
            Watch the tutorial
          </a>
        </BentoCard>
      </div>
    </section>
  )
}
