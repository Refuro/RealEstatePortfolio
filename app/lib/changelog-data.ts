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
