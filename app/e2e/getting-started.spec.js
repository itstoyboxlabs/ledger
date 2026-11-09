import { test, expect, openApp, goTo } from './fixtures'

// The Getting started tab: a wiki-style guide with a sticky "On this page" table of contents that
// scrolls to each heading and follows the reader. On narrow screens the contents fold into a button.
const main = (page) => page.locator('main')
const toc = (page) => main(page).getByRole('navigation', { name: 'On this page' })
const topOf = (loc) => loc.evaluate((el) => Math.round(el.getBoundingClientRect().top))

const SECTIONS = [
  'What is Ledger',
  'How the tabs fit together',
  'Your data and your file',
  'Set up the Retirement tab, step by step',
  'Plan different phases of life with presets',
  'Good habits',
  'Open source and contributing',
]

test.beforeEach(async ({ page }) => {
  await openApp(page)
})

test('is the first tab in the sidebar, and Spending still opens by default', async ({ page }) => {
  const names = await page.getByRole('complementary').getByRole('navigation', { name: 'Pages' }).getByRole('button').allInnerTexts()
  expect(names.map((n) => n.trim())).toEqual(['Getting started', 'About you', 'Spending', 'Budget', 'Log', 'Tools', 'Retirement', 'Balances'])
  await expect(page.locator('h1')).toHaveText('Spending')
})

test('opens with one h1, every section as an h2 and a contents tree', async ({ page }) => {
  await goTo(page, 'Getting started')
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('h1')).toHaveText('Getting started')
  const h2s = main(page).locator('article').getByRole('heading', { level: 2 })
  await expect(h2s).toHaveText(SECTIONS)
  // sections with their subsections nested under them
  const step = toc(page).getByRole('link', { name: '1. About you' })
  await expect(toc(page).locator('li', { has: page.getByRole('link', { name: 'Set up the Retirement tab, step by step', exact: true }) })).toContainText('1. About you')
  await expect(step).toHaveAttribute('href', '#step-about-you')
  // every contents link has a heading to go to
  for (const href of await toc(page).getByRole('link').evaluateAll((as) => as.map((a) => a.getAttribute('href')))) {
    await expect(page.locator(href)).toHaveCount(1)
  }
  // it remembers the tab on reload
  await page.reload()
  await expect(page.locator('h1')).toHaveText('Getting started')
})

test('a contents link scrolls its section to the top and marks it', async ({ page }) => {
  await goTo(page, 'Getting started')
  const link = toc(page).getByRole('link', { name: 'Your data and your file' })
  await link.click()
  const heading = page.locator('#your-data')
  await expect.poll(() => topOf(heading)).toBeLessThan(80)
  await expect(heading).toBeFocused()
  await expect(link).toHaveAttribute('aria-current', 'location')
  // a subsection further down
  const sub = toc(page).getByRole('link', { name: '2. Balances' })
  await sub.click()
  await expect.poll(() => topOf(page.locator('#step-balances'))).toBeLessThan(80)
  await expect(sub).toHaveAttribute('aria-current', 'location')
  await expect(link).not.toHaveAttribute('aria-current', 'location')
  // the contents stay in view while the page scrolls
  await expect(toc(page)).toBeInViewport()
})

test('scrolling by hand moves the highlight', async ({ page }) => {
  await goTo(page, 'Getting started')
  await page.locator('#good-habits').evaluate((el) => el.scrollIntoView({ block: 'start' }))
  await expect(toc(page).getByRole('link', { name: 'Good habits' })).toHaveAttribute('aria-current', 'location')
  await page.evaluate(() => window.scrollTo({ top: 0 }))
  await expect(toc(page).getByRole('link', { name: 'What is Ledger' })).toHaveAttribute('aria-current', 'location')
})

test('works from the keyboard', async ({ page }) => {
  await goTo(page, 'Getting started')
  const first = toc(page).getByRole('link', { name: 'What is Ledger' })
  await first.focus()
  await page.keyboard.press('Tab')
  await expect(toc(page).getByRole('link', { name: 'Planning that does not oversimplify you' })).toBeFocused()
  const link = toc(page).getByRole('link', { name: '3. Take-home pay' })
  await link.focus()
  await page.keyboard.press('Enter')
  const heading = page.locator('#step-take-home')
  await expect(heading).toBeFocused()
  await expect.poll(() => topOf(heading)).toBeLessThan(80)
  // Tab carries on from the heading, starting with its own link
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Link to 3. Take-home pay' })).toBeFocused()
})

test('links in the text switch tabs and outside links open a new tab', async ({ page }) => {
  await goTo(page, 'Getting started')
  const github = main(page).locator('article').getByRole('link', { name: /github\.com\/itstoyboxlabs\/ledger/ })
  await expect(github).toHaveAttribute('target', '_blank')
  await expect(github).toHaveAttribute('rel', 'noreferrer')
  await main(page).locator('#step-balances').locator('xpath=../following-sibling::p[1]').getByRole('button', { name: 'Balances' }).click()
  await expect(page.locator('h1')).toHaveText('Balances')
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('jumps straight to the heading', async ({ page }) => {
    await goTo(page, 'Getting started')
    await toc(page).getByRole('link', { name: 'Good habits' }).click()
    expect(await topOf(page.locator('#good-habits'))).toBeLessThan(80)
  })
})

test('on a phone the contents fold into an On this page button', async ({ page }) => {
  await goTo(page, 'Getting started')
  await page.setViewportSize({ width: 390, height: 844 })
  const button = main(page).getByRole('button', { name: 'On this page' })
  await expect(button).toBeVisible()
  await expect(button).toHaveAttribute('aria-expanded', 'false')
  await expect(toc(page)).toBeHidden()
  await button.click()
  await expect(button).toHaveAttribute('aria-expanded', 'true')
  await toc(page).getByRole('link', { name: 'Good habits' }).click()
  await expect(button).toHaveAttribute('aria-expanded', 'false')
  await expect.poll(() => topOf(page.locator('#good-habits'))).toBeLessThan(80)
  // nothing scrolls sideways
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})
