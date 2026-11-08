import { Icon } from '@/screens/marketing/ui/Icon'
import { STRIP_ITEMS } from '@/screens/marketing/constants/STRIP_ITEMS'

export function PrivacyStrip() {
  return (
    <section className="strip reveal-kids" id="open-source">
      {STRIP_ITEMS.map((item) => (
        <div key={item.title}>
          <Icon paths={item.paths} />
          <div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        </div>
      ))}
    </section>
  )
}
