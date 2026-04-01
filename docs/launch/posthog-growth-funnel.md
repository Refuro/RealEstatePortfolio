# PostHog — Core growth funnel (named insight)

**Purpose:** Recreate the **signup → activation → plan interest → checkout → subscription** path in PostHog so PM and growth can answer conversion questions without ad-hoc queries.

**Related:** Event names and payloads — `app/lib/analytics-events.ts`, [`docs/launch/analytics.md`](analytics.md). Paid-ads funnels — [`docs/launch/posthog-views-setup.md`](posthog-views-setup.md).

---

## Funnel steps (product definition)

| Step | User action | PostHog representation | Notes |
|------|-------------|------------------------|-------|
| 1 — Signup | User completes registration | Event **`user_signed_up`** | Fires at most once per user (client dedup). Requires optional analytics consent for client capture. |
| 2 — First property | User creates their first property | Event **`property_created`** | Activation proxy; fires when a property is saved (wizard or form). |
| 3 — Plan view | User opens pricing/plans in product or marketing | **`$pageview`** where **`$current_url`** contains **`/plans`** OR **`/pricing`** | Logged-out users often hit `/pricing`; authenticated upgrade flow uses `/plans`. Use an **OR** group or two funnel variants if needed. |
| 4 — Checkout attempt | User starts Stripe Checkout from pricing | Event **`checkout_started`** | Emitted from pricing/checkout CTAs (`plan`, `billing_cycle`, `plan_intent` properties). |
| 5 — Subscribed | Paid subscription becomes active after checkout | Event **`subscription_activated`** | **Server-side** (Stripe `checkout.session.completed` webhook). Not gated on cookie consent. |

**Optional refinement:** Step 3 can be split into two saved insights — “Plan view (app)” (`/plans` only) vs “Plan view (marketing)” (`/pricing` only).

---

## How to build the funnel in PostHog UI

1. Open **Insights** → **+ New insight** → **Funnel**.
2. **Step 1:** Event `user_signed_up` (same user across steps — PostHog uses distinct id by default).
3. **Step 2:** Event `property_created`.
4. **Step 3:** Event `$pageview` → add filter: **`$current_url` contains** `/plans` **OR** add a second funnel for `/pricing` if you want strict paths.  
   - *Alternative:* Use **HogQL** or **Data warehouse** if your project uses autocapture differently; the app sends `$current_url` on each capture (`app/components/analytics/posthog-page-view.tsx`).
5. **Step 4:** Event `checkout_started`.
6. **Step 5:** Event `subscription_activated`.

**Conversion window:** Recommend **30 days** from step 1 to capture users who browse on day 1 and convert later (adjust down for stricter activation reporting).

**Save as:** `Growth funnel — signup to subscribed` (pin to a **Dashboard** e.g. `Product — Growth`).

---

## Caveats (read before interpreting)

- **Consent:** Client events (`user_signed_up`, `property_created`, `$pageview`, `checkout_started`) require the user to **accept optional analytics**; declined cookies mean no client events for that user. **`subscription_activated`** still fires from the server when checkout completes.
- **Ordering:** Users may visit `/pricing` *before* signup; step order above is the **canonical product funnel** for *sequential* analysis. For “ever viewed plans before subscribe,” use a **sequential** funnel with a long window or a **lifecycle** insight.
- **Duplicates:** Stripe webhook retries can duplicate **`subscription_activated`** in edge cases; see [`docs/internal/stripe-webhook-posthog-idempotency.md`](../internal/stripe-webhook-posthog-idempotency.md).

---

## Quick verification checklist

- [ ] `NEXT_PUBLIC_POSTHOG_KEY` set in production (see [`docs/launch/analytics.md`](analytics.md) § env).
- [ ] Complete a test signup → add property → open `/plans` → start checkout (test mode) → confirm events appear in **Activity** for your test user.
- [ ] Saved insight exists and is named so others can find it (`Growth funnel — signup to subscribed`).
