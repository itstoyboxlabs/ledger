import type { ToolListItem } from '@/screens/tools/types/ToolListItem'

// A simple list the user made as a tool: a title, a line about it, and rows with an amount each.
export interface ToolList {
  id: string
  title: string
  description?: string
  items: ToolListItem[]
}
