import { HowStep } from '@/screens/marketing/ui/HowStep'
import { Icon } from '@/screens/marketing/ui/Icon'
import { HOW_STEPS } from '@/screens/marketing/constants/HOW_STEPS'
import { LINKS } from '@/screens/marketing/constants/LINKS'

export function HowSection() {
  return (
    <section className="how" id="how">
      <div className="split reveal">
        <h2>How it works</h2>
        <div>
          <p>Turn your bank statements into a complete financial plan in a few minutes.</p>
          <a className="textlink" href={LINKS.tutorial}>
            <Icon>
              <circle cx="12" cy="12" r="10" />
              <path d="m10 8 6 4-6 4z" />
            </Icon>
            Watch the tutorial
          </a>
        </div>
      </div>
      <div className="steps reveal-kids">
        {HOW_STEPS.map((step, i) => (
          <HowStep key={step.title} number={i + 1} step={step} />
        ))}
      </div>
    </section>
  )
}
