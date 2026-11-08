import { useEffect, useState, type ReactNode } from 'react'
import { useTaxState } from '@/shared/hooks/useTaxState'
import type { ToolList } from '@/screens/tools/types/ToolList'
import { Button } from '@/shared/ui/primitives/button'
import { Card } from '@/shared/ui/Card'
import { CashRangeCalc } from '@/screens/tools/features/cash-range/ui/CashRangeCalc'
import { useFilingStatus } from '@/shared/hooks/useFilingStatus'
import { DebtPayoffCalc } from '@/screens/tools/features/debt-payoff/ui/DebtPayoffCalc'
import { HourlyCalc } from '@/screens/tools/features/hourly/ui/HourlyCalc'
import { ListModal } from '@/screens/tools/ui/ListModal'
import { ListTool } from '@/screens/tools/features/list/ui/ListTool'
import { Modal } from '@/shared/ui/Modal'
import { RentScenarioCalc } from '@/screens/tools/features/rent-scenario/ui/RentScenarioCalc'
import { RentToIncomeCalc } from '@/screens/tools/features/rent-to-income/ui/RentToIncomeCalc'
import { RentalCostCalc } from '@/screens/tools/features/rental-cost/ui/RentalCostCalc'
import { StockCalc } from '@/screens/tools/features/stock/ui/StockCalc'
import { TOOLS_BEFORE_TRACKING } from '@/screens/tools/constants/TOOLS_BEFORE_TRACKING'
import { TOOL_WIDE } from '@/screens/tools/constants/TOOL_WIDE'
import { TakeHomeCalc } from '@/screens/tools/features/take-home/ui/TakeHomeCalc'
import { VacationCalc } from '@/screens/tools/features/vacation/ui/VacationCalc'
import { useDebts } from '@/shared/hooks/useDebts'
import { useLists } from '@/screens/tools/hooks/useLists'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { useToolCatalog } from '@/screens/tools/hooks/useToolCatalog'
import { validToolIds } from '@/screens/tools/utils/validToolIds'

type ToolsViewProps = {
  goToAboutYou: () => void
}

export function ToolsView({ goToAboutYou }: ToolsViewProps) {
  const [taxState] = useTaxState()
  const [filing] = useFilingStatus()
  const [debts] = useDebts()
  const [lists, setLists] = useLists()
  const catalog = useToolCatalog()
  const allIds = catalog.map((t) => t[0])
  const [editing, setEditing] = useState<ToolList | null>(null) // list being edited
  const [deleting, setDeleting] = useState<ToolList | null>(null) // list waiting on the delete confirm
  // which tools are on screen; edited from the header's "What to show" picker
  const [shown, setShown] = usePersistedState('toolsShown', allIds, validToolIds)
  // a tool added after the selection was saved has never been seen: switch it on once
  // (default = the ten tools that existed before this list was tracked, so anything
  // added later counts as new for browsers with an older saved selection)
  const [seen, setSeen] = usePersistedState('toolsSeen', TOOLS_BEFORE_TRACKING, validToolIds)
  const idKey = allIds.join('|')
  useEffect(() => {
    const fresh = allIds.filter((id) => !seen.includes(id))
    if (!fresh.length) return
    setSeen([...seen, ...fresh])
    setShown([...shown, ...fresh.filter((id) => !shown.includes(id))])
  }, [seen, idKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const tools: Record<string, ReactNode> = {
    takehome: <TakeHomeCalc goToAboutYou={goToAboutYou} />,
    cash: <CashRangeCalc />,
    rentscenarios: <RentScenarioCalc debts={debts} goToAboutYou={goToAboutYou} />,
    renttoincome: <RentToIncomeCalc />,
    rentalcost: <RentalCostCalc />,
    debt: <DebtPayoffCalc debts={debts} />,
    hourly: <HourlyCalc goToAboutYou={goToAboutYou} />,
    stock: <StockCalc taxState={taxState} filing={filing} goToAboutYou={goToAboutYou} />,
    vacation: <VacationCalc />,
  }
  for (const l of lists) {
    tools[l.id] = (
      <ListTool
        list={l}
        onChange={(next: ToolList) => setLists(lists.map((x) => (x.id === l.id ? next : x)))}
        onEdit={() => setEditing(l)}
        onDelete={() => setDeleting(l)}
      />
    )
  }
  const visible = catalog.filter(([id]) => shown.includes(id))

  return (
    <div className="show-spinners mt-7">
      {visible.length === 0 ? (
        <Card className="p-10 text-center text-[14px] text-[var(--text-secondary)]">
          Nothing selected. Use "What to show" at the top right to pick tools.
        </Card>
      ) : (
        <div className="grid grid-flow-dense items-start gap-5 lg:grid-cols-2">
          {visible.map(([id]) => (
            <div key={id} className={'min-w-0 ' + (TOOL_WIDE.has(id) || visible.length === 1 ? 'lg:col-span-2' : '')}>
              {tools[id]}
            </div>
          ))}
        </div>
      )}
      {editing && (
        <ListModal
          initial={lists.find((l) => l.id === editing.id) ?? editing}
          onClose={() => setEditing(null)}
          onSave={(next) => {
            setLists(lists.map((x) => (x.id === next.id ? next : x)))
            setEditing(null)
          }}
        />
      )}
      {deleting && (
        <Modal
          onClose={() => setDeleting(null)}
          title="Delete list?"
          description={`Are you sure you want to delete "${deleting.title}"? This can't be undone.`}
          className="max-w-[340px] p-5"
        >
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                setLists(lists.filter((x) => x.id !== deleting.id))
                setShown(shown.filter((id) => id !== deleting.id))
                setDeleting(null)
              }}
            >
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
