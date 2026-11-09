import fs from 'node:fs'
import { test, expect, openApp, ls } from './fixtures'

// The first-run "watch the tutorials" nudge: a bouncing arrow over the sidebar's Tutorial link and a callout.
// These tests start like a new user, with `ledger:tutorialAck` unset.
test.use({ tutorialAck: false })

const aside = (page) => page.getByRole('complementary')
const callout = (page) => page.getByRole('dialog', { name: 'Watch the tutorials first' })

// the external tutorial page is not needed: stop the popup from loading anything
test.beforeEach(async ({ page }) => {
  await page.context().route('https://ledgerfinancialplanning.com/**', (route) => route.fulfill({ body: 'tutorial' }))
})

test.describe('tutorial nudge', () => {
  test('a fresh start shows the pointer and the callout', async ({ page }) => {
    await openApp(page)
    await expect(callout(page)).toBeVisible()
    await expect(callout(page)).toContainText('We recommend watching the short tutorial videos before you use Ledger.')
    await expect(callout(page).getByRole('button', { name: 'Okay' })).toBeVisible()
    await expect(page.locator('.nudge-arrow')).toBeVisible()
    // the other sidebar buttons stay reachable under it
    await aside(page).getByRole('button', { name: 'Budget', exact: true }).click()
    await expect(page.locator('h1', { hasText: 'Budget' })).toBeVisible()
  })

  test('Okay hides it for good, across a reload', async ({ page }) => {
    await openApp(page)
    await callout(page).getByRole('button', { name: 'Okay' }).click()
    await expect(callout(page)).toHaveCount(0)
    await expect(page.locator('.nudge-arrow')).toHaveCount(0)
    expect(await ls(page, 'tutorialAck')).toBe(true)
    await page.reload()
    await expect(aside(page).getByRole('link', { name: 'Tutorial', exact: true })).toBeVisible()
    await expect(callout(page)).toHaveCount(0)
  })

  test('clicking the Tutorial link acknowledges it and still opens the tutorial', async ({ page }) => {
    await openApp(page)
    const [popup] = await Promise.all([
      page.context().waitForEvent('page'),
      aside(page).getByRole('link', { name: 'Tutorial', exact: true }).click(),
    ])
    expect(popup.url()).toContain('/tutorial')
    await popup.close()
    await expect(callout(page)).toHaveCount(0)
    expect(await ls(page, 'tutorialAck')).toBe(true)
  })

  test('"Open the tutorials" opens it and acknowledges', async ({ page }) => {
    await openApp(page)
    const [popup] = await Promise.all([
      page.context().waitForEvent('page'),
      callout(page).getByRole('link', { name: 'Open the tutorials' }).click(),
    ])
    expect(popup.url()).toContain('/tutorial')
    await popup.close()
    await expect(callout(page)).toHaveCount(0)
    expect(await ls(page, 'tutorialAck')).toBe(true)
  })

  test('keyboard: Okay is reachable and Enter confirms', async ({ page }) => {
    await openApp(page)
    const okay = callout(page).getByRole('button', { name: 'Okay' })
    await okay.focus()
    await expect(okay).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(callout(page)).toHaveCount(0)
    await expect(aside(page).getByRole('link', { name: 'Tutorial', exact: true })).toBeFocused()
    expect(await ls(page, 'tutorialAck')).toBe(true)
  })

  test('Escape hides it for now but does not save the flag', async ({ page }) => {
    await openApp(page)
    await callout(page).getByRole('button', { name: 'Okay' }).focus()
    await page.keyboard.press('Escape')
    await expect(callout(page)).toHaveCount(0)
    expect(await ls(page, 'tutorialAck')).not.toBe(true)
    await page.reload()
    await expect(callout(page)).toBeVisible()
  })

  test('the arrow stands still when reduced motion is preferred', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openApp(page)
    await expect(page.locator('.nudge-arrow')).toBeVisible()
    expect(await page.locator('.nudge-arrow').evaluate((el) => getComputedStyle(el).animationName)).toBe('none')
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    expect(await page.locator('.nudge-arrow').evaluate((el) => getComputedStyle(el).animationName)).toBe('nudge-bounce')
  })

  test('the flag is in the exported file', async ({ page }) => {
    await openApp(page)
    await callout(page).getByRole('button', { name: 'Okay' }).click()
    await aside(page).getByRole('button', { name: 'Export data' }).click()
    const [dl] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('dialog').getByRole('button', { name: 'Download' }).click(),
    ])
    const file = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'))
    expect(file.settings.local['ledger:tutorialAck']).toBe(true)
  })

  test('on a phone it opens above the link inside the menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 })
    await openApp(page)
    await page.getByRole('button', { name: 'Open menu' }).click()
    await expect(callout(page)).toBeVisible()
    // the drawer slides in, so wait for the callout to settle inside the window
    await expect.poll(async () => {
      const box = await callout(page).boundingBox()
      return box.x >= 0 && box.x + box.width <= 390
    }).toBe(true)
    await callout(page).getByRole('button', { name: 'Okay' }).click()
    await expect(callout(page)).toHaveCount(0)
  })
})
