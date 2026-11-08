// The title, description and extra head tags for each marketing page. The build writes these into the page's HTML head.
const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">'

export const PAGE_META = {
  home: {
    title: 'Ledger · A private financial planning app',
    description: 'See where your money goes, plan your budget, track spending as the month goes and project when you could retire. No bank logins, no accounts. Free and open source.',
    head: FONTS,
  },
  tutorial: {
    title: 'Ledger tutorial · Learn Ledger in 24 minutes',
    description: 'Video tutorials for Ledger: getting started, then every tab from Spending to Retirement.',
    head: FONTS,
  },
}
