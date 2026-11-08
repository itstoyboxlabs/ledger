import { itemMonthly } from '@/shared/utils/itemMonthly'
import type { SubItem } from '@/shared/types/SubItem'

export const itemsTotal = (items: Partial<SubItem>[]): number => items.reduce((s: number, it) => s + itemMonthly(it), 0)
