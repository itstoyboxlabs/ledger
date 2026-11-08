import { InfoTip } from '@/shared/ui/InfoTip'

type HeaderTipProps = {
  label: string
  tip: string
  right?: boolean
}

export function HeaderTip({ label, tip, right }: HeaderTipProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${right ? 'justify-end' : ''}`}>
      {label}
      <InfoTip tip={tip} side="bottom" size={12} />
    </span>
  )
}
