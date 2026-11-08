import type { ComponentProps } from 'react'
import { Card as UICard } from '@/shared/ui/primitives/card'
import { cn } from '@/shared/utils/cn'

export function Card({ children, className = '', ...rest }: ComponentProps<typeof UICard>) {
  return (
    <UICard className={cn('card block gap-0 rounded-2xl border-0 py-0 shadow-none', className)} {...rest}>
      {children}
    </UICard>
  )
}
