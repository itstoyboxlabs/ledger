import type { ReactNode } from 'react'
type PageHeaderProps = { title: ReactNode; subtitle?: ReactNode; children?: ReactNode }

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[34px] font-bold leading-none tracking-tight">{title}</h1>
        <p className="mt-2.5 text-[14px] text-[var(--text-secondary)]">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}
