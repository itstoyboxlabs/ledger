import * as React from "react"
import { cn } from '@/shared/utils/cn'

// variant="inline": a table-cell editor. No box until hovered or focused, so a column
// of them reads as plain numbers; -mr/-ml at the call site keeps the text on the
// column edge.
function Input({
  className,
  type,
  variant,
  ...props
}: React.ComponentProps<"input"> & { variant?: string }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-input bg-[var(--surface-1)] px-3 py-1 text-[13px] shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        variant === "inline" &&
          "h-7 border-transparent bg-transparent px-1.5 shadow-none hover:border-input focus-visible:bg-[var(--surface-1)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
