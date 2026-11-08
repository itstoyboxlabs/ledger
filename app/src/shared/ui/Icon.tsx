import type { CSSProperties, ReactNode } from 'react'
import { ICON_PATHS } from '@/shared/constants/ICON_PATHS'

type IconProps = { name: string; size?: number; className?: string; style?: CSSProperties }

export function Icon({ name, size = 18, className = '', style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={'shrink-0 ' + className}
      style={style}
    >
      {(ICON_PATHS as Record<string, ReactNode>)[name]}
    </svg>
  )
}
