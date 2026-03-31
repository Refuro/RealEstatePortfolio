# Stripe webhook — PostHog server events & idempotency

**Purpose:** Document behavior for operators and audits; not user-facing.

## Subscription sync (DB)

Webhook handlers use **Prisma upserts** for subscription and user tier rows. Replaying the same Stripe event (same subscription state) is **idempotent** at the database layer.

## PostHog (`captureServerEvent`)

Server-side product events (e.g. `subscription_activated`, `subscription_updated`) are emitted from `app/app/api/billing/webhook/route.ts` via `captureServerEvent`.

Stripe may **retry** webhook deliveries with the same payload. We do **not** currently persist processed `event.id` values to skip duplicate PostHog sends. **Implication:** duplicate Stripe deliveries can produce **duplicate** analytics rows in PostHog for the same business event.

**Mitigations (future):** Store processed Stripe `event.id` in DB or cache with TTL; or accept duplicate analytics for low volume and filter in PostHog.

## Related

- `docs/internal/billing-matrix.md` — release verification
- `app/lib/posthog-server.ts` — server capture implementation
