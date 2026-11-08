import { newItemId } from '@/shared/utils/newItemId'
import type { SubItem } from '@/shared/types/SubItem'

export const blankItem = (p: Partial<SubItem> = {}): SubItem => ({ id: newItemId(), name: '', mode: 'month', amount: 0, perWeek: 0, ...p })
