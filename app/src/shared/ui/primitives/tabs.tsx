import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from '@/shared/utils/cn'
import { Tabs as TabsPrimitive } from "radix-ui"

// Which panels are mounted right now. Radix points every trigger's aria-controls at a
// panel id even when that panel is not in the DOM (inactive panels unmount, and some
// tab bars have no panels at all). A dangling aria-controls is invalid ARIA, so a
// trigger only keeps it while its panel exists.
type PanelRegistry = { mounted: ReadonlySet<string>; register: (value: string) => () => void }
const PanelRegistryContext = React.createContext<PanelRegistry>({ mounted: new Set(), register: () => () => {} })

function PanelRegistrar({ value }: { value: string }) {
  const { register } = React.useContext(PanelRegistryContext)
  React.useEffect(() => register(value), [register, value])
  return null
}

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const [mounted, setMounted] = React.useState<ReadonlySet<string>>(() => new Set())
  const register = React.useCallback((value: string) => {
    setMounted((prev) => new Set(prev).add(value))
    return () =>
      setMounted((prev) => {
        const next = new Set(prev)
        next.delete(value)
        return next
      })
  }, [])
  const registry = React.useMemo(() => ({ mounted, register }), [mounted, register])
  return (
    <PanelRegistryContext.Provider value={registry}>
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
    </PanelRegistryContext.Provider>
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center gap-1 rounded-lg text-muted-foreground group-data-[orientation=horizontal]/tabs:h-auto group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & { variant?: "default" | "line" }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { mounted } = React.useContext(PanelRegistryContext)
  const panelOverride = mounted.has(props.value) ? {} : { "aria-controls": undefined }
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      {...panelOverride}
      className={cn(
        "relative inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-transparent px-4 py-2 text-[14px] font-medium whitespace-nowrap text-[var(--text-secondary)] transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none hover:text-white [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
        "data-[state=active]:border-[var(--ring)] data-[state=active]:bg-[var(--accent-soft)] data-[state=active]:pill-active data-[state=active]:text-white",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
      {...props}
    >
      <PanelRegistrar value={props.value} />
      {children}
    </TabsPrimitive.Content>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
