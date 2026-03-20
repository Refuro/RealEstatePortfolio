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
