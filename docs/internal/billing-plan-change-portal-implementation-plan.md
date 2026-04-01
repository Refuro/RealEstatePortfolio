# Implementation plan — Plan changes via Stripe Customer Billing Portal

**Status:** Implemented in app (2026-04-01): `PricingCards` branches paid vs free; portal route allowlists `returnPath`; checkout session rejects duplicate active subscriptions (409).

**Decision:** Use **Stripe Customer Billing Portal** for all **subscription changes** (tier switches, billing interval changes, cancellation). Keep **Stripe Checkout** only for **Free → first paid** purchase. This matches common SaaS practice and avoids multiple active subscriptions per customer.

**Related:** [`stripe-subscription-switch-behavior.md`](stripe-subscription-switch-behavior.md), [`billing-matrix.md`](billing-matrix.md), `app/components/pricing-cards.tsx`, `app/app/api/billing/create-checkout-session/route.ts`, `app/app/api/billing/portal/route.ts`.

---

## Problem statement

Signed-in users with an **existing paid subscription** who choose another paid tier on `/plans` or `/pricing` currently call **`POST /api/billing/create-checkout-session`**, which creates a **new** Stripe subscription. That **stacks** subscriptions on the same Customer instead of replacing the plan.

---

## Scope

| In scope | Out of scope (this phase) |
|----------|---------------------------|
| UX + routing: paid users changing plan → Billing Portal | Server-side `subscriptions.update` without Portal |
| Copy: replace “checkout” hints with “manage billing / change plan” where appropriate | Automatic cancellation of duplicate subs via webhook (optional follow-up) |
| Stripe Dashboard checklist for Portal products | Pricing page marketing redesign |
| Tests / docs / acceptance verification | Tax/VAT beyond what Stripe Portal already handles |

---

## Prerequisites (Stripe Dashboard)

Complete before or in parallel with app changes.

1. **Customer portal** ([Stripe Dashboard](https://dashboard.stripe.com) → **Settings** → **Billing** → **Customer portal**).
2. Enable **customers can switch plans** (wording may vary) and ensure **Investor** and **Pro** products/prices (monthly + yearly) appear as **switchable** options. Align price IDs with `STRIPE_PRICE_ID_*` in Vercel.
3. Confirm **subscription cancellation** and **payment method update** remain enabled as needed.
4. **Test mode:** Run through Portal: subscribe test customer → open portal → switch Investor ↔ Pro and monthly ↔ yearly → verify **one** subscription id on the customer.

**Acceptance (prereq):** In Stripe test mode, a customer with an active subscription can change plan **only through Portal** and Stripe shows **one** active subscription afterward.

---

## Application changes

### 1. `PricingCards` (`app/components/pricing-cards.tsx`)

**Behavior:**

- **`currentTier === "free"`** (signed-in): Keep current **Checkout** flow for **Choose Investor / Choose Pro** (`handleUpgrade` → `create-checkout-session`).
- **`currentTier === "investor"` or `"pro"`** (signed-in): For any card that is **not** the current plan (`canUpgrade`), **do not** call `create-checkout-session`. Instead:
  - Primary action: **“Change plan in billing”** (or **“Switch plan”**) that triggers the **same flow as** `BillingPortalButton` (`POST /api/billing/portal`, redirect to `data.url`).
- **`isCurrent`** on paid tier: keep **Current plan** badge; no button.
- Remove or replace footnote: *“Upgrades open checkout in a new Stripe session.”* — e.g. only when `currentTier === "free"`, or replace with Portal copy for paid users.

**Edge cases:**

- User is paid but **`stripeCustomerId`** is missing (data inconsistency): show error + link to Support; do not open Portal (Portal route requires customer id — verify [`app/app/api/billing/portal/route.ts`](../../app/app/api/billing/portal/route.ts)).
- **`past_due`:** Prefer existing banner + portal; do not send to new Checkout for plan change.

**Optional:** Extract a small **`openBillingPortal()`** helper shared with `BillingPortalButton` to avoid duplicating fetch/error handling.

### 2. Copy surfaces

- **`/plans`** and **public `/pricing`**: If `PricingCards` is the only CTA, no separate page change beyond component behavior. If there are extra “Upgrade” links elsewhere for **logged-in paid** users, align them to Portal or Settings.
- **Settings:** Already has **Manage billing** — ensure help text still accurate (“change plan, payment method, invoices”).

### 3. Analytics (optional, small)

- When redirecting to Portal for a **plan change intent**, consider `captureClientEvent` with a distinct name or properties (e.g. `placement: plans_change_via_portal`) so funnels distinguish **first checkout** vs **plan change**.

### 4. Documentation

- Update [`stripe-subscription-switch-behavior.md`](stripe-subscription-switch-behavior.md) with **Implemented:** Portal for changes; Checkout for free→paid.
- Short note in [`billing-matrix.md`](billing-matrix.md) or [`docs/setup/manual-steps.md`](../setup/manual-steps.md): Portal must list all sellable recurring prices.

---

## Testing (developer / staging)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Free user → Choose Investor | Checkout opens; completes; tier Investor; **one** sub in Stripe |
| 2 | Investor user → switch to Pro (same billing cycle UI) | Portal opens; after confirm, **one** sub; tier Pro in app |
| 3 | Pro user → switch to Investor | Portal; **one** sub; tier Investor |
| 4 | Paid user → switch monthly ↔ yearly | Portal allows (if configured); **one** sub |
| 5 | No `stripeCustomerId` (simulate) | Clear error; no crash |
| 6 | Webhook | Existing handlers still update `User.subscriptionTier` and `Subscription` row |

---

## Acceptance criteria (release gate)

### Product

- [ ] A **logged-in user on Free** who clicks a paid plan on `/plans` or in-app pricing still reaches **Stripe Checkout** (first subscription).
- [ ] A **logged-in user on Investor or Pro** who selects a **different** paid tier (or changes interval, if exposed) is sent to **Stripe Customer Billing Portal**, **not** a new Checkout session for a second subscription.
- [ ] After a successful Portal plan change, the app shows the **correct tier and limits** after refresh (webhook-driven), with no **second** active subscription for that customer in Stripe Dashboard.

### Stripe

- [ ] **Production** Portal configuration includes the correct products/prices for plan and interval switches.
- [ ] Spot-check: one test customer in production or staging has **at most one** active subscription after changing plans.

### Engineering

- [ ] No regression to **`POST /api/billing/create-checkout-session`** for the free→paid path (existing tests still pass; extend if needed).
- [ ] **`POST /api/billing/portal`** remains the only path used for Portal opens from pricing cards for paid tier changes.
- [ ] `npm run check` and `npm run test` pass from `app/`.

### Copy / UX

- [ ] No user-facing text promises **Checkout** for **changing** an existing paid plan; messaging points to **billing portal** / **manage billing** where appropriate.

---

## Rollout

1. Configure Stripe Portal (test → production).
2. Ship app changes behind normal deploy.
3. Monitor Stripe Dashboard for duplicate subscriptions (should stop for new plan changes).
4. Optional: support email for existing customers with **duplicate** subs from before the fix (manual cancel in Stripe).

---

## Success metrics

- Zero new **stacked** subscriptions from in-app plan changes after deploy.
- Support volume: no increase in “double charged” reports (track 2 weeks).

---

## Open follow-ups (not blocking)

- Webhook **safety net** to detect/cancel duplicate active subs (only if duplicates persist).
- E2E test: Playwright path for Free → Checkout → Investor → Portal → Pro (optional).
