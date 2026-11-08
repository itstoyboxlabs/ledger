const AppRoute = {
  home: 'home',
  tutorial: 'tutorial',
  app: 'app',
} as const

type AppRoute = (typeof AppRoute)[keyof typeof AppRoute]

export { AppRoute }
