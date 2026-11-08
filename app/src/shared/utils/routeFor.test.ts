import { routeFor } from '@/shared/utils/routeFor'

describe('routeFor', () => {
  it('shows the landing page at the root', () => {
    expect(routeFor('/')).toBe('home')
    expect(routeFor('/index.html')).toBe('home')
    expect(routeFor('/anything-else')).toBe('home')
  })

  it('shows the app under /app', () => {
    expect(routeFor('/app')).toBe('app')
    expect(routeFor('/app/')).toBe('app')
    expect(routeFor('/app/budget')).toBe('app')
  })

  it('does not treat /apple as the app', () => {
    expect(routeFor('/apple')).toBe('home')
  })

  it('shows the tutorial at /tutorial with or without .html', () => {
    expect(routeFor('/tutorial')).toBe('tutorial')
    expect(routeFor('/tutorial/')).toBe('tutorial')
    expect(routeFor('/tutorial.html')).toBe('tutorial')
  })
})
