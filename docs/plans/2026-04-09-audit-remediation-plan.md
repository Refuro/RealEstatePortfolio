# Audit Remediation Plan — 2026-04-09 batch

**Source tasks:** `docs/tasks.md` § "Full audit remediation — 2026-04-09 synthesis"  
**Model reference:** [`docs/process/AVAILABLE_AGENTS.md`](../process/AVAILABLE_AGENTS.md)  
**Architecture reference:** `docs/reference/complete-engineering-reference.md`  
**Skills:** `RealEstateProject/.cursor/skills/veld-ui/SKILL.md` (any UI phase), `RealEstateProject/.cursor/skills/veld-mobile/SKILL.md` (UX-0409-1)

All PM decisions are recorded in `docs/tasks.md`. No phase should start until the prior phase's `npm run check` is green and checked off.

---

## Phase overview

| Phase | Tasks | Theme | Model | Est. effort | Dependency |
|-------|-------|-------|-------|-------------|------------|
| **1** | CRIT-0409-1, RELI-0409-1, GRW-0409-1, UX-0409-1, UX-0409-2, SEO-0409-1 | Easy wins — surgical fixes | Fast | ~3 hrs total | None |
| **2** | CRIT-0409-2, RELI-0409-2, PERF-0409-2 | Docs + copy remediation | Fast | ~2 hrs total | None (parallel with Phase 1 or after) |
| **3A** | PERF-0409-1 | Calculator dynamic imports | Sonnet | ~2–3 hrs | Phase 1 green |
| **3B** | PERF-0409-3 | Stripe billing sync TTL | Sonnet | ~1–2 hrs | Phase 1 green |
| **4** | DI-0409-1 | Snapshot schema + display mode | Sonnet | ~3–4 hrs | Phase 3 green |
| **5** | — | Verification gate | Owner/PM | — | Phase 4 green |

Phases 1 and 2 can run in parallel (different files, no overlap). Phases 3A and 3B can also run in parallel. Phase 4 must follow Phase 3.

---

## Phase 1 — Easy wins (all surgical, no dependencies)

**Model:** Composer Fast  
**Run as:** One builder session — all six tasks are independent and can be completed in a single pass.  
**Est. effort:** ~3 hours

### Tasks

#### CRIT-0409-1 — Cron proxy allowlist
**Files:** `app/proxy.ts` (add 4 strings to array)  
**Pattern:** Match lines 25–27 (existing cron entries).  
Add:
```ts
"/api/cron/milestone-emails",
"/api/cron/monthly-refresh",
"/api/cron/monthly-digest",
"/api/cron/winback-emails",
```
Verify: existing routes still protected; `npm run check` passes.

---

#### RELI-0409-1 — Sentry DSN startup warning
**Files:** `app/instrumentation.ts`  
**Pattern:** Mirror `assertStripeWebhookSecretForVercelDeploy()` pattern — console.warn in production when `NEXT_PUBLIC_SENTRY_DSN` is not set. Not a hard throw; just a visible warning in Vercel logs.

---

#### GRW-0409-1 — Trial banner: suppress upgrade when portfolio empty
**Files:** `app/app/(app)/components/trial-banner.tsx`  
**Pattern:** Banner already receives or can derive `propertyCount`. Add condition: when trial is active AND `propertyCount === 0`, suppress or demote the primary upgrade CTA. When trial expired OR `propertyCount > 0`, show as normal.

---

#### UX-0409-1 — Mount `QuickActions` on property detail
**Files:** `app/app/(app)/properties/[id]/overview-tab-content.tsx` (primary) and/or `property-detail-tabs.tsx`  
**Read first:** `app/.cursor/skills/veld-ui/SKILL.md`, `app/.cursor/skills/veld-mobile/SKILL.md`  
**Pattern:** `quick-actions.tsx` is already built. Import and render it above or below the completeness banner. Touch targets ≥44px on mobile.

---

#### UX-0409-2 — Refinance empty state: two-state CTA
**Files:** `app/app/(app)/refinance/refinance-workspace.tsx`  
**Pattern:** Where `properties.length === 0` currently, also handle `properties.length > 0 && noMortgages`. State 1 (no properties): unchanged. State 2 (properties, no mortgages): copy → "Add a mortgage to an existing property"; CTA → `/properties`.

---

#### SEO-0409-1 — Sitemap `lastModified`: real dates
**Files:** `app/app/sitemap.ts`  
**Pattern:** Replace `new Date()` global with static ISO date strings for stable routes (marketing pages, tool pages, calculators). Keep a computed date only for routes where content actually varies by crawl (none currently). Use the date the content was last meaningfully changed (at minimum today's date as a one-time static, not a runtime `new Date()`).

---

### Phase 1 completion gate
- [ ] All six task checkboxes checked off in `docs/tasks.md`.
- [ ] `npm run check` passes from `app/`.
- [ ] Spot-check: 4 cron routes return 200 with Bearer header; sitemap `<lastmod>` values are static; QuickActions visible on property detail.

---

## Phase 2 — Docs + copy remediation (parallel with Phase 1)

**Model:** Composer Fast  
**Run as:** One builder session — all three are doc/copy-only, no code changes.  
**Est. effort:** ~2 hours

### Tasks

#### CRIT-0409-2 — PostHog: update Privacy, cookie banner, and `analytics.md`
**Files (copy-only, no code changes):**
- `app/app/privacy/page.tsx` — PostHog bullet: rewrite to state PostHog initialises in anonymous memory mode immediately; pageviews captured without persistent ID; no cross-session tracking until consent accepted.
- `app/components/consent/cookie-consent-banner.tsx` — soften "only if you accept" to describe anonymous vs. identified distinction.
- `docs/launch/analytics.md` — § Cookie consent: rewrite to match `posthog-provider.tsx` / `posthog-page-view.tsx` actual behavior.

**Do not touch** `posthog-provider.tsx`, `posthog-page-view.tsx`, or any analytics logic.

---

#### RELI-0409-2 — Incident runbook expansion
**Files:** `docs/runbooks/incident-response.md`  
**Add sections:**
1. **Database migration rollback** — decision tree: when to roll back vs. hotfix forward; `prisma migrate resolve --rolled-back <migration_name>` command; coordination steps (feature flag, Vercel rollback pairing).
2. **PostHog degraded** — symptoms, fallback (Vercel logs), recovery steps.
3. **Resend outage** — symptoms, user impact (transactional emails queued/dropped), recovery.
4. **RentCast outage** — symptoms, user impact (stale benchmarks), recovery (cron will retry next month).
5. **Google Places outage** — symptoms (address autocomplete fails), user impact, recovery.

---

#### PERF-0409-2 — RentCast monthly-refresh: document cost gates
**Files:** `app/app/api/cron/monthly-refresh/route.ts` and/or `app/lib/refresh.ts`  
**Add:** Named constants and comment block documenting: max batch size, max properties per user per run, estimated RentCast API calls per run, Vercel function timeout headroom. If thresholds are already sufficient, state that explicitly. No logic changes.

---

### Phase 2 completion gate
- [ ] All three task checkboxes checked off in `docs/tasks.md`.
- [ ] `npm run check` passes from `app/`.
- [ ] Privacy page, cookie banner, and `analytics.md` reviewed by PM for accuracy.

---

## Phase 3A — Performance: Calculator dynamic imports

**Model:** Claude Sonnet  
**Prerequisite:** Phase 1 green.  
**Est. effort:** ~2–3 hours

### Task: PERF-0409-1

**Files (primary):**
- `app/components/marketing/calculator-location-page.tsx` — refactor all top-level calculator imports to `next/dynamic` with `ssr: false`.
- `app/app/tools/rent-vs-buy/page.tsx` — dynamic-import `RentVsBuyCalculator`.
- Other single-calculator tool pages that static-import their calculator (scan and fix in the same pass).

**Pattern to follow:** `app/app/(app)/modeling/modeling-workspace.tsx` — existing `next/dynamic` + `ssr: false` usage.

**Loading placeholder:** A simple `<div className="h-64 animate-pulse rounded-xl bg-subtle" />` skeleton or equivalent matches the design system. Read `app/.cursor/skills/veld-ui/SKILL.md` for surface/shadow tokens.

**Verification:** Run `next build` locally (or note bundle stats from Vercel build output) and document the JS size delta for one calculator location URL in the PR description.

**Do not** change calculator component internals. Only change the import site.

### Phase 3A completion gate
- [ ] PERF-0409-1 checked off in `docs/tasks.md`.
- [ ] All existing calculator Vitest tests pass.
- [ ] Bundle diff documented in PR.
- [ ] `npm run check` passes.

---

## Phase 3B — Performance: Stripe billing sync TTL

**Model:** Claude Sonnet  
**Prerequisite:** Phase 1 green.  
**Can run in parallel with Phase 3A.**  
**Est. effort:** ~1–2 hours

### Task: PERF-0409-3

**Files:**
- `app/app/api/billing/sync/route.ts` — add logic to derive TTL bucket from response; return TTL in JSON (e.g. `{ synced: true, ttlMs: 1800000 }`).
- `app/app/(app)/app-layout-client.tsx` — read `ttlMs` from sync response and store in sessionStorage instead of hardcoded 5-min value.

**TTL rules:**
- `active` plan + not trial + more than 7 days from `currentPeriodEnd` → **30 minutes**
- Trial active, `past_due`, or ≤7 days from period end → **5 minutes**
- Any error / no `stripeCustomerId` → **5 minutes** (safe default)

**Smoke test:** Manually trigger a subscription cancel in Stripe test dashboard; confirm app reflects change within ≤5 min.

### Phase 3B completion gate
- [ ] PERF-0409-3 checked off in `docs/tasks.md`.
- [ ] Existing billing sync tests pass.
- [ ] `npm run check` passes.

---

## Phase 4 — Data integrity: Snapshot display mode

**Model:** Claude Sonnet  
**Prerequisite:** Phases 3A and 3B both green.  
**Est. effort:** ~3–4 hours  
**⚠️ Schema change — migration required. Read `docs/policies/ownership-metrics.md` and `docs/policies/analytics-math-policy.md` before coding.**

### Task: DI-0409-1

**Design intent (from PM, 2026-04-09):** Snapshots are a complete, mode-agnostic record. The display layer re-derives mode-appropriate metrics at render time using the user's current `ownershipDisplayMode`. Old snapshots without `ownershipPct` degrade gracefully (null = 100%, i.e. proportional = full-liability).

**Steps for builder:**

1. **Schema** — Add `ownershipPct Float?` (and any other raw basis-driver fields identified from `computePropertyMetrics` signature) to `PropertySnapshot` in `app/prisma/schema.prisma`. Run `prisma migrate dev --name add_snapshot_ownership_pct`.

2. **`buildSnapshotData`** (`app/lib/snapshots.ts`) — Pass through raw `ownershipPct` from the property (or `partialOwnership` / `ownershipShare` — confirm field name against schema). Store it on the snapshot row. Continue computing and storing the existing metric fields (they become the proportional baseline / legacy fallback).

3. **Display layer** — Wherever snapshot metrics are read for charts or history views, apply `user.ownershipDisplayMode` to re-derive the correct basis from `ownershipPct`. Reference `computePropertyMetrics` and `scaleLiabilityAmount` for the scaling logic — do not duplicate formulas.

4. **Graceful degradation** — Where `snapshot.ownershipPct` is `null`, treat as `1.0` (100% = proportional and full-liability are identical).

5. **Tests** — Add Vitest cases: (a) snapshot with `ownershipPct = 0.5` rendered in full-liability mode shows doubled liability metrics vs. proportional; (b) `null` ownershipPct behaves identically in both modes.

### Phase 4 completion gate
- [ ] DI-0409-1 checked off in `docs/tasks.md`.
- [ ] Migration applied and `schema.prisma` committed.
- [ ] Vitest tests cover both display modes. Full test suite passes.
- [ ] `npm run check` passes.
- [ ] PM spot-check: toggle display mode on a partial-ownership property; history and live view agree.

---

## Phase 5 — Verification gate (owner/PM)

**No builder work.** Owner or PM runs these checks after all phases complete.

- [ ] Re-run impacted audit lanes: Reliability, Data Integrity, Growth, Performance (at minimum).
- [ ] Verify cron jobs in Vercel dashboard: milestone-emails, monthly-refresh, monthly-digest, winback-emails all show recent successful invocations.
- [ ] Read Privacy Policy and cookie banner copy; confirm the PostHog description is accurate.
- [ ] Spot-check Lighthouse on one calculator location URL; confirm JS payload is reduced vs. pre-Phase-3A baseline.
- [ ] Billing TTL smoke: stable paid user → check sessionStorage `billingLastSynced` is approximately 30 min; trial user → approximately 5 min.
- [ ] Property with partial ownership: toggle between proportional / full-liability; confirm history chart and live dashboard agree.
- [ ] `npm run check` passes clean on final branch.

---

## Sequencing diagram

```
Phase 1 (Fast) ─────────────────────────────────────────────────────────┐
Phase 2 (Fast) ──────────────────────────────────────────── (parallel) ─┤
                                                                         ↓
                               Phase 3A (Sonnet) ────────────────────── ┐
                               Phase 3B (Sonnet) ─── (parallel 3A) ─── ┤
                                                                         ↓
                                                    Phase 4 (Sonnet) ───┤
                                                                         ↓
                                                    Phase 5 (owner/PM) ─┘
```

---

## Quick reference

| Task ID | Phase | Model | Effort |
|---------|-------|-------|--------|
| CRIT-0409-1 | 1 | Fast | ~20 min |
| RELI-0409-1 | 1 | Fast | ~20 min |
| GRW-0409-1 | 1 | Fast | ~30 min |
| UX-0409-1 | 1 | Fast | ~45 min |
| UX-0409-2 | 1 | Fast | ~30 min |
| SEO-0409-1 | 1 | Fast | ~20 min |
| CRIT-0409-2 | 2 | Fast | ~45 min |
| RELI-0409-2 | 2 | Fast | ~45 min |
| PERF-0409-2 | 2 | Fast | ~20 min |
| PERF-0409-1 | 3A | Sonnet | ~2–3 hrs |
| PERF-0409-3 | 3B | Sonnet | ~1–2 hrs |
| DI-0409-1 | 4 | Sonnet | ~3–4 hrs |
| Verification | 5 | Owner/PM | ~1 hr |
