// The address of each app screen, by screen id (the ids in NAV). /app alone opens the screen you were last on.
export const APP_VIEW_PATHS: Readonly<Record<string, string>> = {
  guide: '/app/getting-started',
  about: '/app/about-you',
  actuals: '/app/spending',
  budget: '/app/budget',
  log: '/app/log',
  tools: '/app/tools',
  retirement: '/app/retirement',
  balances: '/app/balances',
}
