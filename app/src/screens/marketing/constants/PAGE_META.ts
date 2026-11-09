// The title, description and extra head tags for each marketing page. The build writes these into the page's HTML head.
const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">'

// Proves to Google Search Console that the site owner controls this domain. The token is public by design.
const GOOGLE_VERIFICATION = '<meta name="google-site-verification" content="6tQ2YuG1fogfTkPENVJTbyGgjZUijCJ3dd4ourfBYw0" />'

// The same for Bing Webmaster Tools.
const BING_VERIFICATION = '<meta name="msvalidate.01" content="7D90DF1789C009BE5ED808F7971A5757" />'

export const PAGE_META = {
  home: {
    title: "Ledger · Financial planning that doesn't oversimplify you",
    description: 'See where your money goes, plan your budget, track spending as the month goes and project when you could retire. No bank logins, no accounts. Free and open source.',
    head: `${FONTS}\n    ${GOOGLE_VERIFICATION}\n    ${BING_VERIFICATION}`,
  },
  tutorial: {
    title: 'Ledger tutorial · Learn Ledger in 48 minutes',
    description: 'Video tutorials for Ledger: getting started, then every tab from Spending to Retirement.',
    head: FONTS,
  },
}
