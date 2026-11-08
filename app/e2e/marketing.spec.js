import { test, expect } from './fixtures'

// The public pages need no sample data.
test.describe('landing page', () => {
  test('shows the hero with links to the app and the repo', async ({ page }) => {
    const errors = []
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText("Financial planning that doesn't oversimplify you.")
    await expect(page.getByRole('link', { name: 'Try Ledger' }).first()).toHaveAttribute('href', '/app')
    await expect(page.getByRole('link', { name: 'View on GitHub' }).first()).toHaveAttribute('href', 'https://github.com/itstoyboxlabs/ledger')
    expect(errors.filter((e) => /hydrat|did not match/i.test(e))).toEqual([])
  })

  test('feature tabs switch the panel', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: 'Budget' }).click()
    await expect(page.getByText('Plan what you can afford.')).toBeVisible()
  })
})

test.describe('tutorial page', () => {
  test('lists all nine chapters', async ({ page }) => {
    await page.goto('/tutorial')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Learn Ledger in 24 minutes.')
    await expect(page.locator('button.ch')).toHaveCount(9)
    await expect(page.getByText('Chapter 1 of 9')).toBeVisible()
  })

  test('picking a chapter loads its video', async ({ page }) => {
    await page.goto('/tutorial')
    await page.locator('button.ch').nth(3).click()
    await expect(page.getByText('Chapter 4 of 9')).toBeVisible()
    await expect(page.locator('video')).toHaveAttribute('src', '/videos/chapter-4-spending.mp4')
  })
})

test.describe('app route', () => {
  test('/app still opens the empty state', async ({ page }) => {
    await page.goto('/app')
    await expect(page.getByText("There's nothing here yet.")).toBeVisible()
  })
})
