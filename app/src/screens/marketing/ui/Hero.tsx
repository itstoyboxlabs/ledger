import { AppPreview } from '@/screens/marketing/ui/AppPreview'
import { HeroCopy } from '@/screens/marketing/ui/HeroCopy'

export function Hero() {
  return (
    <section className="hero">
      <HeroCopy />
      <AppPreview />
    </section>
  )
}
