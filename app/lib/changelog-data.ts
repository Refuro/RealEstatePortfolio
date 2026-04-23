/**
 * Public changelog entries. Shown on `/changelog`.
 *
 * Process: `docs/launch/changelog-process.md` — new **release day** = new object at the
 * **top**; **multiple deploys the same day** = add bullets to that day's entry (no duplicate dates).
 */
export type ChangelogEntry = {
  /** ISO date (YYYY-MM-DD) */
  date: string;
  title: string;
  items: string[];
};

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    date: "2026-04-22",
    title: "Landing page polish, cron fix, and analytics cleanup",
    items: [
      "Tightened testimonial copy on the social proof section for clarity without changing meaning.",
      "Fixed a gap in the estimate cron jobs where routes were running as continuous compute functions instead of serverless.",
      "Fixed Google Ads gtag initialization and wired up enhanced conversion data so signup events carry hashed user signals for better match rates.",
      "CSP violation reports no longer hit the database on every health status check causing 100% compute uptime, and rate limiting applied upstream before any DB write.",
    ],
  },
  {
    date: "2026-04-19",
    title: "Guides in the nav, search result breadcrumbs, and sitemap freshness",
    items: [
      "Added Guides to the top nav, linking to reference articles for DSCR, cap rate, cash-on-cash return, BRRRR, and rental property metrics under /resources.",
      "Mobile menu now includes Alternatives and Compare shortcuts alongside the main nav items.",
      "Pricing FAQ content now comes from a single source, keeping the visible questions and answers aligned with the structured data search engines read.",
      "Sitemap now uses the latest changelog date for active surfaces instead of a fixed site-wide timestamp, so search engines see real content activity per section.",
      "Added breadcrumb structured data to calculators, state-specific calculator pages, resources, alternatives, and comparison pages. Search results can show the page's place in the site hierarchy instead of the raw URL.",
      "Added an llms.txt index at the site root and DefinedTerm structured data on the DSCR, cap rate, cash-on-cash return, and rental property metrics guides, so AI search tools have a clean map of Veld's highest-quality content.",
    ],
  },
  {
    date: "2026-04-10",
    title: "Five new calculators, state pages, and rent vs buy chart",
    items: [
      "Added cap rate, cash-on-cash return, DSCR, wholesale / MAO, and rent vs buy calculators. All five are available on the public tools hub and in the sidebar under Calculators when signed in.",
      "Each new calculator has state-specific pages for all 50 states with pre-filled inputs from local market data and a state-aware FAQ.",
      "Rent vs buy includes a line chart showing cumulative renting vs owning cost over time, a break-even year marker, and a 5, 10, and 20-year cost comparison table.",
      "DSCR calculator back-solves for the maximum qualifying loan at both 1.0 and 1.25 thresholds, with an interest-only toggle.",
      "Wholesale / MAO uses an adjustable ARV multiplier so you can move off the 70% rule for your specific market.",
      "Cost comparison table on rent vs buy redesigned so the delta column no longer wraps on narrow screens.",
      "Calculator hub cards updated to equal height rows across all screen sizes.",
    ],
  },
  {
    date: "2026-04-09",
    title: "Portfolio table, list view, and instant filters",
    items: [
      "Dashboard now shows a sortable table when your portfolio reaches 6 or more properties, with month-over-month changes for value, equity, and cash flow alongside each property.",
      "Added a list view on the properties page for a compact, scannable layout. Toggle between grid and list while keeping your active filter and sort.",
      "Filter and sort chips respond the moment you click them. Results update in the background with a subtle fade so it's always clear something is happening.",
      "Filter, sort, and view controls reorganized into a lightweight toolbar with no surrounding card, keeping focus on your properties.",
    ],
  },
  {
    date: "2026-04-08",
    title: "Portfolio trend chart",
    items: [
      "Dashboard now shows a portfolio equity trend over time with month-over-month changes.",
      "Trend chart scales properly on larger screens with an area fill for readability.",
    ],
  },
  {
    date: "2026-04-07",
    title: "Onboarding, mobile, and a free trial",
    items: [
      "Adding your first property is now a guided step-by-step flow, address autocomplete, mortgage details, and a completeness score that shows what's left to fill in.",
      "Complete mobile redesign across deal analyzer, mortgage, modeling, projections, and refinance, tools are laid out for how you actually use them on a small screen.",
      "New account includes 14 days of full Investor access, no card required. Downgrade to Free or upgrade anytime.",
      "Lifecycle email reminders if you haven't finished setting up. Unsubscribe link in every email.",
    ],
  },
  {
    date: "2026-04-04",
    title: "Refinance workspace, property Details & Edit, and payoff what-ifs",
    items: [
      "Added Refinance under Tools. Model a new rate and term against a saved loan with balance curves and interest comparison.",
      "Mortgage workspace now includes a Refinance link for the selected property and loan.",
      "Property Details reorganized into card sections with Edit links. Mortgage rows show payoff or balloon projection with shortcuts to Refinance.",
      "Edit property includes a Mortgages section. Add, update, or remove loans without leaving the page.",
      "Overview focuses on performance metrics with Modeling and Refinance workspace buttons.",
      "Added a \"What if I refinanced?\" panel on Overview. Enter a new rate, term, and closing costs to see monthly savings, interest comparison, and break-even.",
    ],
  },
  {
    date: "2026-03-31",
    title: "Calculators, deal vs portfolio, and portfolio print view",
    items: [
      "Added a calculators hub with BRRRR, STR vs LTR, and fix-and-flip. Same tools available under Calculators in the sidebar when signed in.",
      "STR vs LTR: compare short-term and long-term rental cash flow on the same financing.",
      "Fix and flip: purchase + rehab + hold + sale → net profit, ROI, annualized return.",
      "Saved deal view now shows how the deal compares to your portfolio (cap rate, CoC, DSCR, cash flow).",
      "Print-friendly portfolio summary from the dashboard — use browser print / Save as PDF.",
      "Rent and value quota warnings only show when you're actually close to the limit.",
      "Vercel Web Analytics (visitor and page views in the Vercel dashboard) when you accept optional analytics — see privacy policy.",
    ],
  },
  {
    date: "2026-03-30",
    title: "Mobile spacing, unsaved-changes warning, plan truncation clarity",
    items: [
      "Fixed top/bottom safe-area spacing on mobile so content isn't jammed against screen edges.",
      "Deal analyzer warns before you navigate away with unsaved changes.",
      "Portfolio totals now show how many properties are included when your plan truncates the count.",
    ],
  },
  {
    date: "2026-03-28",
    title: "Vacant property handling",
    items: [
      "Added rented / not-rented toggle to add and edit property flows.",
      "Vacant properties use $0 rent and hide market-rent comparisons.",
    ],
  },
  {
    date: "2026-03-20",
    title: "Changelog, analytics, and status page",
    items: [
      "Shipped this changelog.",
      "Added product analytics (PostHog) for funnel visibility — see privacy policy for details.",
      "Uptime status: https://stats.uptimerobot.com/Z6ScA8Ip37.",
    ],
  },
  {
    date: "2026-03",
    title: "Initial launch",
    items: [
      "Property tracking, deal analyzer, mortgage modeling, scenario projections.",
      "Plans and billing (Free, Investor, Pro), CSV import/export, rent and value estimates.",
    ],
  },
];
