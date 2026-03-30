/**
 * Public changelog entries. Add a new object at the **top** for each release.
 * Shown on `/changelog`.
 */
export type ChangelogEntry = {
  /** ISO date (YYYY-MM-DD) */
  date: string;
  title: string;
  items: string[];
};

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    date: "2026-03-28",
    title: "Vacant-rent workflow and benchmark clarity",
    items: [
      "New rented/not-rented toggle in add/edit property flows with clearer vacant-state messaging.",
      "When marked not rented, rent is treated as $0 and benchmark comparisons are hidden to avoid misleading rent-vs-market labels.",
      "Rent UX polish: required markers and estimate actions now match rented state, and review explicitly shows vacant rent semantics.",
    ],
  },
  {
    date: "2026-03-20",
    title: "Product updates & launch readiness",
    items: [
      "Public changelog (this page) for release notes and SEO.",
      "PostHog product analytics (optional via env) for funnel insights.",
      "Docs: uptime monitoring checklist for production health checks.",
    ],
  },
  {
    date: "2026-03",
    title: "Portfolio experience & quality",
    items: [
      "Unified add/edit property flows, property Overview & Details, deal analyzer and mortgage modeling.",
      "Stripe billing (Free, Investor, Pro), CSV import/export, rent/value benchmarks.",
      "Rate limits, health endpoint, Sentry error reporting, CI lint + tests.",
    ],
  },
];
