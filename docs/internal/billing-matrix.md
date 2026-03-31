# Internal billing matrix — Veld Portfolio

**Purpose:** Single reference for plan tiers, limits, RentCast quotas, Stripe configuration, and display pricing env vars. **Not** user-facing legal copy.

**Code sources of truth:** `app/lib/plans.ts` (limits + `RENTCAST_HOURLY_LIMITS`), `app/lib/stripe-config.ts` (price IDs), `app/lib/pricing-display.ts` (display amounts).

---

## Matrix

| Tier | Properties | Saved deals | RentCast successful calls / hour (shared pool) | Stripe price ID env vars (recurring) | Display price env vars (USD, optional overrides) |
|------|------------|------------|-----------------------------------------------|--------------------------------------|-----------------------------------------------|
| **Free** | 1 | 5 | 5 | — (no paid checkout) | — |
| **Investor** | 5 | 20 | 10 | `STRIPE_PRICE_ID_INVESTOR_MONTHLY`, `STRIPE_PRICE_ID_INVESTOR_YEARLY` | `NEXT_PUBLIC_PRICE_INVESTOR_MONTHLY`, `NEXT_PUBLIC_PRICE_INVESTOR_YEARLY` |
| **Pro** | 20 | 50 | 20 | `STRIPE_PRICE_ID_PRO_MONTHLY`, `STRIPE_PRICE_ID_PRO_YEARLY` | `NEXT_PUBLIC_PRICE_PRO_MONTHLY`, `NEXT_PUBLIC_PRICE_PRO_YEARLY` |

**Notes:**

- **RentCast:** One shared hourly counter per user across rent estimate, value estimate, and benchmark refresh (`RentCastApiCall`). See `docs/reference/rentcast-quota.md`.
- **Stripe:** Free tier has no `STRIPE_PRICE_ID_*`; checkout is only for Investor and Pro (`app/app/api/billing/create-checkout-session`).
- **Display prices:** Defaults are defined in `app/lib/pricing-display.ts` if env vars are unset (Investor $15/mo, $150/yr; Pro $29/mo, $290/yr).

---

## Release verification checklist

Use before or immediately after promoting a build to production (Stripe live mode, Vercel production env).

- [ ] **Stripe Dashboard:** Investor + Pro products each have **monthly** and **yearly** recurring prices; IDs match the four `STRIPE_PRICE_ID_*` values in Vercel production.
- [ ] **Vercel env:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set for production; webhook endpoint `https://<domain>/api/billing/webhook` subscribed to subscription + `checkout.session.completed` events (see `docs/setup/manual-steps.md`).
- [ ] **Display:** Optional `NEXT_PUBLIC_PRICE_*` values match what marketing/pricing pages should show; spot-check `/pricing` and `/plans`.
- [ ] **Smoke checkout:** Test mode or small live charge — checkout completes, webhook updates `User.subscriptionTier`, app reflects paid tier and property/deal limits.
- [ ] **RentCast:** `RENTCAST_API_KEY` set if estimates are required in production; confirm hourly limits align with table (behavior in `app/lib/plans.ts`).

---

## Related docs

- `docs/setup/manual-steps.md` — Stripe setup steps
- `docs/reference/rentcast-quota.md` — Hourly pool semantics
- `app/.env.example` — Commented variable names
- `docs/internal/stripe-webhook-posthog-idempotency.md` — Webhook replay vs PostHog
- `docs/internal/effective-tier-analytics.md` — Override vs Stripe tier
- `docs/internal/api-list-contract.md` — Full `GET` lists vs plan UI caps
