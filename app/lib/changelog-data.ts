/**
 * Public changelog entries. Shown on `/changelog`.
 *
 * Process: `docs/launch/changelog-process.md` — new **release day** = new object at the
 * **top**; **multiple deploys the same day** = add bullets to that day’s entry (no duplicate dates).
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
      "PostHog product analytics for funnel insights.",
      "Richer analytics: subscription lifecycle and plan-limit signals, CSV import outcomes, person properties for plan tier and portfolio counts.",
      "Docs: uptime monitoring for production health; public status: https://stats.uptimerobot.com/Z6ScA8Ip37.",
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
