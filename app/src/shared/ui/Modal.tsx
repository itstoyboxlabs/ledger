import type { ReactNode } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/primitives/dialog'
import { cn } from '@/shared/utils/cn'
import { DialogHeader, DialogDescription } from '@/shared/ui/primitives/dialog'

// Every modal in the app: a shadcn Dialog (focus trap, Esc, click-outside, fade/zoom)
// with its DialogHeader. `light` keeps the page readable behind the planners that
// update it live. `action` sits at the right of the header (a status, a button).
type ModalProps = {
  onClose: () => void
  className?: string
  light?: boolean
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  children?: ReactNode
}

export function Modal({ onClose, className, light, title, description, action, children }: ModalProps) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={description ? undefined : undefined}
        overlayClassName={light ? 'bg-black/25' : 'bg-black/60'}
        className={cn(className, 'max-sm:max-w-[calc(100%-1.5rem)]')}
      >
        <div className="flex items-start justify-between gap-4">
          <DialogHeader className="gap-1 text-left">
            <DialogTitle className="text-[18px] font-bold tracking-tight">{title}</DialogTitle>
            {description && (
              <DialogDescription className="text-[13px] text-[var(--text-secondary)]">{description}</DialogDescription>
            )}
          </DialogHeader>
          {action}
        </div>
        {children}
      </DialogContent>
    </Dialog>
  )
}
