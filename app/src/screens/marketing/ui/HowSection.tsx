import { Fragment } from 'react'
import { HowStep } from '@/screens/marketing/ui/HowStep'
import { Icon } from '@/screens/marketing/ui/Icon'
import { HOW_STEPS } from '@/screens/marketing/constants/HOW_STEPS'
import { LINKS } from '@/screens/marketing/constants/LINKS'

export function HowSection() {
  return (
    <section className="how" id="how">
      <div className="reveal">
        <h2>How it works</h2>
        <p>Turn your bank statements into a complete financial plan in a few minutes.</p>
        <a href={LINKS.tutorial} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, color: 'var(--green)', fontWeight: 600, fontSize: '14.5px' }}>
          <Icon>
            <circle cx="12" cy="12" r="10" />
            <path d="m10 8 6 4-6 4z" />
          </Icon>
          Watch the tutorial
        </a>
      </div>
      <div className="steps reveal-kids">
        {HOW_STEPS.map((step, i) => (
          <Fragment key={step.title}>
            {i > 0 && (
              <div className="arrow">
                <Icon paths={['M5 12h14M13 6l6 6-6 6']} />
              </div>
            )}
            <HowStep number={i + 1} step={step} />
          </Fragment>
        ))}
      </div>
    </section>
  )
}
