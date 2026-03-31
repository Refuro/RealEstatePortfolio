# Data Integrity & Reconciliation Audit — 2026-03-30 (Run 4)

## Executive summary

- **Plan-effective vs full inventory (unchanged):** `GET /api/portfolio/summary` and `GET /api/export/portfolio` still cap properties with `takeFirstNByUpdatedAt` after `getPropertyLimit`, while **`GET /api/properties` returns every property** and **`GET /api/deals` returns every saved deal**. First-party **deals** and **properties** list UIs cap with the same helper, so the main reconciliation gap remains **machine-readable REST lists vs portfolio rollups** (same theme as [Run 3](./2026-03-30-data-integrity-audit-3.md)).
- **Ownership lens:** Property metrics (`GET /api/properties/[id]/metrics`) and portfolio/export still respect `user.ownershipDisplayMode`; **saved deals** APIs still use `computePropertyMetrics(..., "proportional")` only — intentional sandbox lens, not storage drift.
- **Billing sync:** `User.subscriptionTier` is updated from Stripe in `syncSubscriptionToDb` (webhook). **`GET /api/billing/sync`** skips downgrade logic when `subscriptionTierOverride` is set; the webhook does **not** read that override. **Effective tier** for limits and UI uses `getEffectiveTier` (override wins when valid), so stored `subscriptionTier` can disagree with what the user experiences — a **reporting/ops reconciliation** nuance, not an app-limit bug.
- **Import contract:** Rent semantics remain centralized in `resolveImportRentForCreate` (aligned with create semantics). CSV `addressLine2` in `parseRow` is still defaulted to empty string when not modeled as a distinct column.
- **Overall recommendation:** Treat Run 3 priorities as still open: document or align REST list contracts; clarify deals vs ownership mode; for billing, use `getEffectiveTier` (or join override) in any analytics that must match in-app limits.

## Severity-ranked findings

### Critical

- None identified.

### High

- **REST property/deal lists vs plan-effective portfolio — reconciliation risk** — Unchanged from Run 3. **`GET /api/properties`** (`app/app/api/properties/route.ts`, lines 21–30) lists all properties for the user. **`GET /api/deals`** (`app/app/api/deals/route.ts`, lines 91–96) lists all deals. **`GET /api/portfolio/summary`** and **`GET /api/export/portfolio`** apply `takeFirstNByUpdatedAt` after `getPropertyLimit` (`app/app/api/portfolio/summary/route.ts` lines 16–22; `app/app/api/export/portfolio/route.ts` lines 48–54). Clients that sum uncapped list payloads as “the portfolio” will **over-count** relative to summary/export when the account exceeds the plan property cap. **Deals:** `app/app/(app)/deals/page.tsx` uses `takeFirstNByUpdatedAt` for the page list, but the deals API remains uncapped — same parity issue for **deal count** vs `getDealLimit` for integrations.

### Medium

- **Saved deals metrics ignore `ownershipDisplayMode`** — Unchanged. `serializeDeal` in `app/app/api/deals/route.ts` and `app/app/api/deals/[id]/route.ts` passes `"proportional"` to `computePropertyMetrics` (e.g. deals route lines 46–57). Property metrics use `(user.ownershipDisplayMode ?? "proportional")` (`app/app/api/properties/[id]/metrics/route.ts` lines 37–49). Users in **full liability** mode see **different** liability-style numbers on deals vs owned properties unless they apply the policy mentally.

- **Cross-surface contract discipline** — New `Property` / `SavedDeal` / `Mortgage` fields still require coordinated updates across Zod (`app/lib/validations/property.ts`, `deal.ts`, `mortgage.ts`), `serializePropertyForApi`, CSV import (`app/lib/import/csv-parser.ts`), and export headers (`app/app/api/export/portfolio/route.ts`). Schema reference: `app/prisma/schema.prisma`.

- **`subscriptionTier` vs `subscriptionTierOverride` vs Stripe** — `getEffectiveTier` (`app/lib/plans.ts` lines 34–44) applies override when valid. **`GET /api/billing/sync`** (`app/app/api/billing/sync/route.ts` lines 20–22) skips sync when override is set. **`syncSubscriptionToDb`** in `app/app/api/billing/webhook/route.ts` (lines 141–165) always sets `subscriptionTier` from the Stripe price. **Impact:** Raw `User.subscriptionTier` reflects Stripe; **effective** access and limits follow override. Reports or exports that read only `subscriptionTier` without `getEffectiveTier` can **mis-state** the user’s plan.

### Low

- **CSV import does not populate `addressLine2` from a dedicated column** — `parseRow` sets `addressLine2: ""` in the structured result (`app/lib/import/csv-parser.ts` line 331 area). Import route persists `r.addressLine2 || null` (`app/app/api/import/portfolio/route.ts` lines 139–140). Combined-address round-trip remains lossy for line 2 unless the template gains a column.

- **`serializePropertyForApi` spreads the full Prisma row** — Returns `{ ...p, ... }` before overrides (`app/lib/serialize/property-api.ts` lines 53–78). New Prisma fields can appear in JSON unless stripped; **forward-compat / payload growth** risk.

- **PATCH property uses `where: { id }`** — After `getPropertyForUser` ownership check (`app/app/api/properties/[id]/route.ts` lines 125–128). Same defense-in-depth note as Run 3.

- **Stripe webhook idempotency (side effects)** — Handler uses **upsert** for `Subscription` and updates `User.subscriptionTier` (`app/app/api/billing/webhook/route.ts` lines 143–166), so **DB state** is largely **replay-safe** for duplicate subscription events. There is **no persisted Stripe `event.id`** store; **duplicate deliveries** could still **duplicate** server-side analytics (`captureServerEvent` on `customer.subscription.updated` / checkout completion) — **telemetry** idempotency, not financial double-charging.

## Evidence reviewed

- **Process:** `docs/process/data-integrity-audit-process.md`, `docs/process/audit-report-template.md`.
- **Prior run:** `docs/audits/data-integrity/2026-03-30-data-integrity-audit-3.md`.
- **Policies:** `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md` (cross-surface reconciliation principles).
- **Schema:** `app/prisma/schema.prisma` (`User`, `Property`, `Mortgage`, `SavedDeal`, `Subscription`, `ApiRateLimitEntry`, `RentCastApiCall`).
- **API routes:** `app/app/api/properties/route.ts`, `app/app/api/properties/[id]/route.ts`, `app/app/api/properties/[id]/metrics/route.ts`; `app/app/api/deals/route.ts`, `app/app/api/deals/[id]/route.ts`; `app/app/api/portfolio/summary/route.ts`; `app/app/api/export/portfolio/route.ts`; `app/app/api/import/portfolio/route.ts`; `app/app/api/billing/webhook/route.ts`, `app/app/api/billing/sync/route.ts`.
- **Validation & serialization:** `app/lib/validations/property.ts` (referenced), `app/lib/serialize/property-api.ts`, `app/lib/import/csv-parser.ts`, `app/lib/import/rent-resolve.ts`.
- **Plans & limits:** `app/lib/plans.ts`, `app/lib/limit-utils.ts`.

**Limits of this pass:** No live database inspection; admin-only routes not fully exercised. Amortization edge cases assumed consistent with `getEffectiveBalance` usage in export/summary.

## Risk & impact assessment

- **High finding:** Affects users **over property/deal limits** and **API integrators** who treat list endpoints as the full “plan portfolio.” First-party UI already caps lists where noted; **silent over-count** in API-only workflows remains the main risk.
- **Medium (deals lens):** Affects **full_liability** users comparing deals to properties; data at rest is consistent — mismatch is **metric lens**.
- **Medium (tier columns):** Affects **internal analytics, support, and any SQL** that reads `subscriptionTier` without override; **in-app** behavior is governed by `getEffectiveTier`.
- **Webhook analytics:** Duplicate Stripe retries are **low** likelihood and **low** business impact on revenue; relevant for **telemetry hygiene**.

## Recommendations (prioritized)

1. **Align contract documentation or implementation** for REST lists vs portfolio/export (same as Run 3): either document “full inventory” vs “plan-effective,” or add caps/metadata (`totalCount`, `includedCount`) on list endpoints.
2. **Deals:** Document proportional-only deal metrics or thread `user.ownershipDisplayMode` into deal serialization if product requires parity with property metrics.
3. **Billing reporting:** For any report or dashboard that must match **effective** limits, **always** resolve tier via `getEffectiveTier` (or equivalent SQL) including `subscriptionTierOverride`.
4. **Stripe telemetry:** If duplicate subscription events become noisy, consider idempotent analytics keyed by `event.id` (optional hardening).

## Task candidates (optional)

- [ ] Decide and implement API parity for plan limits on `GET /api/properties` and `GET /api/deals`, or publish a non-code contract for integrators.
- [ ] Clarify saved-deals vs `ownershipDisplayMode` in product copy or align deal metrics with user display mode.
- [ ] Optional: extend CSV import to support a distinct `address line 2` column when present.
- [ ] Document or query **effective tier** consistently for ops/analytics (override + Stripe).

## Re-test checklist

- [ ] Plan over-limit user: portfolio summary and CSV row set match; contrast with `GET /api/properties` length if lists stay uncapped.
- [ ] Plan over-limit deals: **deals** page count vs `GET /api/deals` length vs `getDealLimit`.
- [ ] Full-liability user: property metrics vs export; compare to a saved deal with same inputs (proportional-only deal behavior).
- [ ] User with `subscriptionTierOverride`: confirm UI limits match override; confirm `subscriptionTier` in DB may still follow Stripe after webhook.
- [ ] CSV import/export round-trip after any contract change.
- [ ] `npm run check` (when code changes are made).

## Next trigger and cadence

- **Trigger:** Schema, import/export, portfolio or deals API contract changes; plan/limit logic; billing or Stripe integration changes; pre-release hardening.
- **Recommended next run:** Within one month or before the next major release touching financial fields or billing.
