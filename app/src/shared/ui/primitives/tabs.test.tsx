import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs'

describe('Tabs', () => {
  it('drops aria-controls from triggers whose panel is not mounted', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
      </Tabs>,
    )
    const a = screen.getByRole('tab', { name: 'A' })
    const panel = screen.getByRole('tabpanel')
    expect(a.getAttribute('aria-controls')).toBe(panel.id)
    expect(screen.getByRole('tab', { name: 'B' }).hasAttribute('aria-controls')).toBe(false)
  })

  it('has no aria-controls when there are no panels at all', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>,
    )
    expect(screen.getByRole('tab', { name: 'A' }).hasAttribute('aria-controls')).toBe(false)
  })
})
