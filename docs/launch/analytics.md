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
- **Product events** (stable names in `app/lib/analytics-events.ts`):

| Event | When |
|-------|------|
| `user_signed_up` | Once per user (localStorage), within 7 days of Clerk `createdAt`, first session. |
| `property_created` | After successful `POST /api/properties` (add wizard + new property from `/edit` flow). |
| `deal_created` | After successful new deal save from Deal analyzer (`POST /api/deals`). |
| `checkout_started` | When Stripe Checkout URL is returned (upgrade from pricing/plans). |
| `subscription_activated` | Server: Stripe `checkout.session.completed` after subscription sync (metadata includes `plan`, `billing_cycle`). |

---

## Privacy

- Analytics is **optional** via env. Describe PostHog in your **Privacy Policy** if you enable it in production (third-party processor, approximate location, product analytics).
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
For each production deploy with user-visible changes: add a new entry at the **top** of `CHANGELOG_ENTRIES`.
