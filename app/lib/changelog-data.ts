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
