# Stripe webhook — PostHog server events & idempotency

**Purpose:** Document behavior for operators and audits; not user-facing.

## Subscription sync (DB)

Webhook handlers use **Prisma upserts** for subscription and user tier rows. Replaying the same Stripe event (same subscription state) is **idempotent** at the database layer.

## PostHog (`captureServerEvent`)

Server-side product events (e.g. `subscription_activated`, `subscription_updated`) are emitted from `app/app/api/billing/webhook/route.ts` via `captureServerEvent`.

Stripe may **retry** webhook deliveries with the same payload. **Implemented:** `StripePosthogDedup` stores each Stripe `event.id` before a successful `captureServerEvent` (`lib/stripe-webhook-posthog.ts`). A retry for the same `event.id` skips PostHog capture; subscription DB sync still runs (upserts remain idempotent).

## Related

- `docs/internal/billing-matrix.md` — release verification
- `app/lib/posthog-server.ts` — server capture implementation
