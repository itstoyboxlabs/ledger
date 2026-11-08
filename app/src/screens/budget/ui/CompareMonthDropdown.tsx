import { CoverageDot } from '@/shared/ui/CoverageDot'
import { Dropdown } from '@/shared/ui/Dropdown'
import { getMonths } from '@/shared/utils/getMonths'
import { monthCompareLabel } from '@/shared/utils/monthCompareLabel'

type CompareMonthDropdownProps = {
  value: string
  onChange: (month: string) => void
}

// The month "Compare to actual" measures against, newest first, each with its coverage dot.
export function CompareMonthDropdown({ value, onChange }: CompareMonthDropdownProps) {
  return (
    <Dropdown
      label="Month"
      value={value}
      onChange={onChange}
      className="h-8 rounded-lg px-3 text-[13px]"
      options={[...getMonths()].reverse().map((m) => ({
        value: m,
        label: monthCompareLabel(m),
        badge: <CoverageDot month={m} />,
      }))}
    />
  )
}
