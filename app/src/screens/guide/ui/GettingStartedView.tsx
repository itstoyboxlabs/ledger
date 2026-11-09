import { useMemo } from 'react'
import { GUIDE_SECTIONS } from '@/screens/guide/constants/GUIDE_SECTIONS'
import { buildToc } from '@/screens/guide/utils/buildToc'
import { tocIds } from '@/screens/guide/utils/tocIds'
import { scrollToHeading } from '@/screens/guide/utils/scrollToHeading'
import { useActiveSection } from '@/screens/guide/hooks/useActiveSection'
import { GuideBlockView } from '@/screens/guide/ui/GuideBlockView'
import { GuideHeading } from '@/screens/guide/ui/GuideHeading'
import { GuideMobileToc } from '@/screens/guide/ui/GuideMobileToc'
import { GuideToc } from '@/screens/guide/ui/GuideToc'

type GettingStartedViewProps = {
  // switches the app to another tab (a view id from NAV)
  goTo: (view: string) => void
}

// Getting started: a wiki-style guide to Ledger. The article and the "On this page" table of
// contents are both built from GUIDE_SECTIONS. On wide screens the contents sit in a sticky column
// on the right and follow the reader; on narrow ones they fold into a button above the article.
export function GettingStartedView({ goTo }: GettingStartedViewProps) {
  const toc = useMemo(() => buildToc(GUIDE_SECTIONS), [])
  const ids = useMemo(() => tocIds(toc), [toc])
  const [active, setActive] = useActiveSection(ids)
  const navigate = (id: string) => {
    if (scrollToHeading(id)) setActive(id)
  }
  const blockProps = { goTo, onAnchor: navigate }
  return (
    <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_220px] xl:grid-cols-[minmax(0,1fr)_250px]">
      <div className="min-w-0">
        <div className="lg:hidden">
          <GuideMobileToc toc={toc} active={active} onNavigate={navigate} />
        </div>
        <article className="max-w-[720px]">
          {GUIDE_SECTIONS.map((s) => (
            <section key={s.id} aria-labelledby={s.id} className="mt-16 first:mt-0">
              <GuideHeading level={2} id={s.id} title={s.title} onAnchor={navigate} />
              {s.blocks.map((b, i) => <GuideBlockView key={i} block={b} {...blockProps} />)}
              {s.subsections.map((sub) => (
                <div key={sub.id}>
                  <GuideHeading level={3} id={sub.id} title={sub.title} onAnchor={navigate} />
                  {sub.blocks.map((b, i) => <GuideBlockView key={i} block={b} {...blockProps} />)}
                </div>
              ))}
            </section>
          ))}
          {/* room to scroll the last headings up to the top, where the contents mark them as read */}
          <div aria-hidden className="h-[45vh]" />
        </article>
      </div>
      <div className="hidden lg:block">
        <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto overscroll-contain pb-4">
          <GuideToc toc={toc} active={active} onNavigate={navigate} />
        </div>
      </div>
    </div>
  )
}
