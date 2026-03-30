# Public changelog process (`/changelog`)

**Source of truth:** [`app/lib/changelog-data.ts`](../../app/lib/changelog-data.ts) — entries render on **`/changelog`** and may be indexed for SEO.

---

## When to update

Add or adjust entries when there are **user-visible** changes worth announcing: new features, meaningful UX fixes, pricing/plan changes, new integrations users see, etc.

Skip changelog lines for purely internal work (refactors, test-only changes, CI) unless it directly improves something users notice (e.g. “Faster load times” after a real perf win).

---

## Dates

- Use the **release or deploy date** you intend to show users — typically **today’s date** in your agreed timezone when you merge to production (or the date you tag the release).
- **Verify the calendar date** before committing (avoid copy-paste from another day).
- If you batch work across days but ship once, use the **ship date**, not the day coding started.

---

## Multiple deploys on the same day

If you push **more than once on the same calendar day** and both need changelog coverage:

- **Do not** add a second top-level entry with the same date (duplicate dates confuse readers and SEO).
- **Do** merge into the **existing entry for that date**:
  - Add bullet(s) under the same `items` array, **or**
  - Edit the `title` if the second ship materially changes the theme (optional).

Keep bullets short and scannable (one idea per bullet).

---

## Security and safety (what not to publish)

The changelog is **public**. Treat every line as readable by competitors and attackers.

**Do not include:**

- Secrets, API keys, tokens, or env var names/values.
- **Non-public URLs** (internal dashboards, staging hosts, admin paths, database hosts, webhook endpoints that aren’t meant to be discovered).
- **Undisclosed vulnerability details** or exact fix mechanics before you’re ready (coordinate with security disclosure policy).
- **Customer or tenant identifiers**, PII, or support tickets.
- Exact stack traces or internal service names if they aid reconnaissance.

**OK when already public and intentional:**

- Marketing site URL, public docs, **public** status/uptime pages (e.g. vendor-provided status URLs you already link from the app or footer).
- High-level product capabilities (“PostHog for product analytics”) without implementation secrets.

When in doubt, describe the **user benefit** in plain language and skip infrastructure specifics.

---

## How to edit the file

1. Open `app/lib/changelog-data.ts`.
2. New **release day** → new object at the **top** of `CHANGELOG_ENTRIES` with `date`, `title`, `items`.
3. **Same day** → append to the top entry’s `items` (see above).
4. Ship with the deploy that exposes the changes (or immediately after).

---

## Related docs

- Short pointer in [`analytics.md`](analytics.md) § Changelog process (analytics-adjacent releases often touch the same PR).
- Launch checklist: [`launch-plan.md`](launch-plan.md).
