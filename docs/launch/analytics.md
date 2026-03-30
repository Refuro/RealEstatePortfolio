# Product analytics (PostHog)

**Purpose:** Funnel and behavior metrics for Veld Portfolio without building internal analytics.  
**Stack:** [PostHog](https://posthog.com) Cloud + `posthog-js` (client) + `posthog-node` (Stripe webhook).

---

## Environment variables

Set in **Vercel** (production) and optionally in `app/.env` locally.

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_POSTHOG_KEY` | Yes, to enable | Project API key from PostHog (starts with `phc_`). |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | Default `https://us.i.posthog.com`. Use `https://eu.i.posthog.com` for EU data residency. |

If `NEXT_PUBLIC_POSTHOG_KEY` is **unset**, the app does not load PostHog (no console errors).

---

## What we collect

- **Page views** — `$pageview` on client-side route changes (pathname + full URL with query).
- **Identify** — Clerk `userId` + email when signed in; `reset()` on sign-out.
- **Person properties** (for segmentation; synced after sign-in and on navigation): `plan_tier`, `property_count`, `deal_count` from `GET /api/me` via `PostHogPersonProperties`.
- **Product events** (stable names in `app/lib/analytics-events.ts`):

| Event | When |
|-------|------|
| `user_signed_up` | Once per user (localStorage), within 7 days of Clerk `createdAt`, first session. |
| `property_created` | After successful `POST /api/properties` (add wizard + new property from `/edit` flow). |
| `deal_created` | After successful new deal save from Deal analyzer (`POST /api/deals`). |
| `checkout_started` | When Stripe Checkout URL is returned (upgrade from pricing/plans). |
| `subscription_activated` | Server: Stripe `checkout.session.completed` after subscription sync (metadata includes `plan`, `billing_cycle`). |
| `subscription_updated` | Server: Stripe `customer.subscription.updated` after DB sync (`status`, `plan_tier`, `cancel_at_period_end`). |
| `subscription_canceled` | Server: Stripe `customer.subscription.deleted` after tier reset to free. |
| `plan_limit_hit` | Client: API returns `PLAN_LIMIT_REACHED` when adding property, deal, or CSV import (`resource`: `property` \| `deal` \| `import`). |
| `import_completed` | Client: successful CSV import (`imported`, `error_count`). |
| `import_failed` | Client: failed import or network error (`stage`: `upload` \| `selection`, `reason`, optional `code`). |

---

## Privacy

- Analytics is **optional** via env. **Privacy Policy** (`/privacy`) includes PostHog when enabled: third-party processor, product analytics purpose, link to PostHog’s policy; **Sentry** called out for error monitoring. Keep this doc aligned if event names or data categories change materially.
- Add a **cookie banner** if required for your jurisdictions (PostHog may use cookies/localStorage).

---

## Saved insight (PM)

**Suggested funnel in PostHog UI:**

1. **Funnel:** `user_signed_up` → `property_created` (within 7 days)  
   - Or: `$pageview` on `/sign-up` → `property_created` if you rely on pageviews for top-of-funnel.

2. **Conversion:** `checkout_started` → `subscription_activated`

Re-create these as **Insights** in PostHog and pin to a project dashboard. Update this section when you change event names.

---

## Changelog process

Release notes for users live in **`app/lib/changelog-data.ts`** and render at **`/changelog`**.

**Full process** (same-day merges, dates, security): **[`docs/launch/changelog-process.md`](changelog-process.md)**.

Summary:

- **New release day** → new entry at the **top** of `CHANGELOG_ENTRIES`.
- **Multiple deploys the same calendar day** → **merge** into that day’s entry (add bullets); avoid duplicate dates.
- **Security:** public page — no secrets, internal URLs, undisclosed vuln details, or customer identifiers (see the doc).
