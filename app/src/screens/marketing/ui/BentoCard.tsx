import type { BentoCardContent } from '@/screens/marketing/types/BentoCardContent'
import type { ReactNode } from 'react'

type BentoCardProps = { content: BentoCardContent; className?: string; children?: ReactNode }

// A small card: a title and two lines on top, a piece of sample screen (the children) bleeding off the bottom.
export function BentoCard({ content, className, children }: BentoCardProps) {
  return (
    <div className={className ? `bento-card ${className}` : 'bento-card'}>
      <h3>{content.title}</h3>
      <p>{content.text}</p>
      <div className="bento-ui">{children}</div>
    </div>
  )
}
