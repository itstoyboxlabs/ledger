import { APP_VIEW_PATHS } from '@/shared/constants/APP_VIEW_PATHS'

// The address of an app screen, like '/app/spending'. An unknown screen falls back to '/app'.
export function pathForView(view: string): string {
  return APP_VIEW_PATHS[view] ?? '/app'
}
