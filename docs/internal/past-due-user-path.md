# `past_due` — user-facing path (billing)

**Purpose:** Document how a Stripe subscription in `past_due` surfaces in the app so support and audits can trace status → UI.

## Data → server layout

1. **`Subscription.status`** in Postgres (`prisma.subscription`, keyed by `userId`) is set from Stripe webhook handlers when subscription state changes.
2. **`app/(app)/layout.tsx`** loads banner data via `getLayoutBannerData()` (cached ~30s): `subscriptionStatus` = `subscription?.status ?? null`.
3. **`AppLayoutClient`** receives `subscriptionStatus` and passes it to **`PastDueBanner`** (`app/(app)/components/past-due-banner.tsx`).

## UI behavior

- When `subscriptionStatus === "past_due"`, **`PastDueBanner`** renders (unless dismissed for the browser session via `sessionStorage`, or until the user fixes payment).
- Primary action: **`POST /api/billing/portal`** to open the Stripe Customer Portal; failures show an inline error (banner).

## API surface (related)

- **`GET /api/billing/status`** — tier, property counts/limits, optional subscription summary for clients.
- **`GET /api/billing/sync`** — re-sync from Stripe for eligible users (see route comment).
- **`GET /api/billing/subscription-details`** — period end / cancel flags after Stripe sync (Settings refresh).

## Verification

- Staging/test mode: set subscription to a state that maps to `past_due` in your Stripe test data, confirm webhook updates `Subscription.status`, reload app → banner visible → portal opens.
