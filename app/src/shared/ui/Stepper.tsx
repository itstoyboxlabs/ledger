import { useEffect, useRef } from 'react'
import { Button } from '@/shared/ui/primitives/button'

/* ---------- tools ---------- */

// Drop-in <input type="number"> replacement that keeps a local draft string while
// focused, so clearing the field to type a new number doesn't get trapped at a
// forced "0" (see the long comment on ToolField below for why the naive
// `value={n}` + `parseFloat(e.target.value) || 0` pattern breaks this). A component
// (not a hook) specifically so it's safe to use inside .map() or conditional JSX —
// each usage gets its own independent draft state, no Rules-of-Hooks issue.
// Up/down chevrons that sit inside the right edge of a boxed number field, replacing
// the browser's native spinner (which is a white OS widget and looks out of place).
type StepperProps = { value: number; step?: number; onChange: (value: number) => void }

const HOLD_DELAY_MS = 400 // how long you hold before it starts repeating
const HOLD_INTERVAL_MS = 70 // time between repeats while you keep holding

export function Stepper({ value, step = 1, onChange }: StepperProps) {
  // the repeat timer must always read the newest value and onChange, not the ones from when it started
  const latest = useRef({ value, step, onChange })
  latest.current = { value, step, onChange }
  const timers = useRef<{ delay?: ReturnType<typeof setTimeout>; repeat?: ReturnType<typeof setInterval> }>({})
  const bump = (dir: number) => {
    const { value: v, step: st, onChange: change } = latest.current
    change(Math.round((Number(v) + dir * st) * 1e6) / 1e6)
  }
  const stop = () => {
    clearTimeout(timers.current.delay)
    clearInterval(timers.current.repeat)
  }
  useEffect(() => stop, [])
  // holding a chevron steps once right away, then keeps stepping until you let go
  const start = (dir: number) => {
    stop()
    bump(dir)
    timers.current.delay = setTimeout(() => {
      timers.current.repeat = setInterval(() => bump(dir), HOLD_INTERVAL_MS)
    }, HOLD_DELAY_MS)
  }
  const btn = (dir: number, d: string) => (
    <Button variant="ghost"
      type="button"
      tabIndex={-1}
      aria-label={dir > 0 ? 'Increase' : 'Decrease'}
      onMouseDown={(e) => e.preventDefault()} // keep focus (and the draft) where it is
      onPointerDown={(e) => {
        if (e.button === 0) start(dir)
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onClick={(e) => {
        if (e.detail === 0) bump(dir) // a keyboard or programmatic click: a mouse press already stepped on pointer down
      }}
      className="h-[13px] w-5 rounded-[4px] p-0 text-[var(--text-muted)] hover:text-white"
    >
      <svg width="9" height="9" viewBox="0 0 10 10">
        <path d={d} stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Button>
  )
  return (
    <span className="absolute right-1.5 top-1/2 flex -translate-y-1/2 flex-col opacity-0 transition-opacity group-focus-within/num:opacity-100 group-hover/num:opacity-100">
      {btn(1, 'M1.5 6.5 L5 3 L8.5 6.5')}
      {btn(-1, 'M1.5 3.5 L5 7 L8.5 3.5')}
    </span>
  )
}
