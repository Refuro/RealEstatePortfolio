# Plan: Monthly Portfolio Refresh & Retention Data System

**Date:** 2026-04-08
**Roadmap ref:** `docs/reference/roadmap.md` §2 Retention data hooks (all phases), §1a Portfolio insights
**Goal:** Make the portfolio dashboard dynamic over time without user action — values, equity, and market comparisons update monthly — and use those changes to pull users back via email. This is the foundational data system that every future retention and insight feature depends on.

---

## Problem statement

Veld's data model is point-in-time static. Every field on `Property` and `Mortgage` is a user-entered scalar that never changes unless the user manually edits it. The sole exception is `getEffectiveBalance()` in `app/lib/amortization.ts`, which projects mortgage balance forward via amortization math.

This means the dashboard on April 8 is identical to the dashboard on May 8 unless the user intervenes. There is no reason to return, no email worth sending, and no trend to show.

### What changes month-to-month today (zero user action, zero API calls)

| Metric | Source | Dynamic? |
|--------|--------|----------|
| Mortgage balance | `getEffectiveBalance()` — amortization projection | **Yes** — decreases monthly |
| Equity | `estimatedValue - mortgageBalance` | **Partially** — balance side advances, value side is frozen |
| LTV | `mortgageBalance / estimatedValue` | **Partially** — same as equity |
| Cash flow | `rent - expenses - payment` | **No** — all three are static |
| Cap rate | `NOI / estimatedValue` | **No** |
| Cash-on-cash | `annualCashFlow / cashInvested` | **No** |
| NOI | `(rent × vacancy_adj) - expenses` | **No** |
| Rent vs market | `userRent / marketRent` | **No** — unless user clicks refresh |
| Mortgage payoff | amortization projection | **Yes** — 1 month closer each month |

Only mortgage balance and its downstream metrics (equity, LTV) move. Everything else is frozen.

### What a "Phase 1 digest email" would say without this system

```
Your portfolio this month:
• Monthly cash flow: $1,240  (same as last month)
• Portfolio cap rate: 6.2%   (same as last month)
• Total equity: $187,400     (up $480 from paydown)
• Market rent data: stale
```

The $480 paydown is accurate but not a compelling retention hook. For a $300K property on a 6% 30-year at year 3, principal paydown is ~$450–500/month. That's a footnote, not a reason to log in.

---

## Competitor landscape

**Transaction-synced apps (Stessa, Baselane):** Connect to bank accounts via Plaid. Every rent deposit, mortgage payment, plumber invoice flows in automatically. Data changes daily-to-weekly. Stessa uses daily bank feeds and real-time dashboards. Baselane auto-categorizes transactions into 120+ property-specific categories. Their equity comes from AVM (refreshed periodically) minus actual mortgage balance (from bank feed).

**Analysis-focused apps (DealCheck):** Pull public records and MLS data for active listings. Once a property is off-market, data is largely static. DealCheck solved this by pivoting to deal analysis as the primary value prop and building RentCast as a separate data product.

**AVM refresh cadence in industry:** Redfin updates estimates daily for on-market, weekly for off-market. Zillow's Zestimate uses MLS + public records + market trends. RentCast processes 500K+ record updates daily.

**Veld's position:** Architecturally in the analysis camp (no bank sync, user-entered data) but needs the retention characteristics of the transaction-synced camp. This plan bridges that gap using automated AVM and market rent refreshes as the data refresh mechanism.

---

## Architecture: Option B — light snapshot table

### Decision rationale

Three options were evaluated:

- **Option A (refresh and diff in memory):** No new tables. Cron loads old values, calls RentCast, computes deltas in memory, overwrites, emails. Simplest but no historical data, no trend charts, lost deltas if email fails.
- **Option B (light snapshot table):** One new table stores monthly snapshots. Enables month-over-month diffs, "equity over time" charts, and reliable delta computation even if email delivery fails.
- **Option C (full event-sourced history):** Store every field change as events, materialized views. Massively overbuilt for monthly-cadence data.

**Option B selected.** One append-only table. ~1 row per property per month. At 1000 users × 5 properties × 12 months = 60K rows/year — trivial for Postgres.

---

## Schema changes

### New model: `PropertySnapshot`

```prisma
model PropertySnapshot {
  id                       String   @id @default(cuid())
  propertyId               String
  snapshotMonth            DateTime @db.Date    // first of month (2026-05-01)
  estimatedValue           Decimal  @db.Decimal(14, 2)
  effectiveMortgageBalance Decimal  @db.Decimal(14, 2)
  equity                   Decimal  @db.Decimal(14, 2)
  marketRent               Decimal? @db.Decimal(12, 2)
  monthlyRent              Decimal  @db.Decimal(12, 2)
  monthlyCashFlow          Decimal  @db.Decimal(12, 2)
  capRate                  Decimal? @db.Decimal(8, 6)
  ltv                      Decimal? @db.Decimal(8, 6)
  avmValueRaw              Decimal? @db.Decimal(14, 2)  // raw API response, even if not applied
  avmRentRaw               Decimal? @db.Decimal(12, 2)  // raw API response, even if not applied
  avmValueApplied          Boolean  @default(false)      // true if raw exceeded significance threshold
  avmRentApplied           Boolean  @default(false)
  createdAt                DateTime @default(now())

  property Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@unique([propertyId, snapshotMonth])
  @@index([propertyId])
}
```

Design notes:
- `snapshotMonth` is always the 1st of the month. The `@@unique` constraint makes the cron idempotent — if it runs twice in a month, the second attempt sees the snapshot exists and skips.
- `avmValueRaw` / `avmRentRaw` store the raw API response regardless of whether it was applied to the property record. This preserves the full data trail.
- `avmValueApplied` / `avmRentApplied` record whether the value was significant enough to update the property record (see §Significance thresholds).
- `equity`, `monthlyCashFlow`, `capRate`, `ltv` are snapshotted as computed values at the time of the snapshot, not recomputed later. This avoids formula drift if calculation logic changes.

### New field: `User.lastActiveAt`

```prisma
model User {
  // ... existing fields ...
  lastActiveAt                  DateTime?
  digestEmailsSentAt            Json?     // { "2026-05": ISOString, ... }
  digestEmailsOptedOutAt        DateTime?
  mortgageMilestonesSentAt      Json?     // { "prop_abc__ltv_50": ISOString, "prop_xyz__ltv_75": ISOString, ... }
  winbackEmailsSentAt           Json?     // { "6mo": ISOString, "12mo": ISOString }
}
```

- `lastActiveAt`: updated on authenticated page load. "If null or older than 24 hours, update" — keeps write volume to 1/day/user max.
- `digestEmailsSentAt`: keyed by "YYYY-MM" to prevent double-sends for a given month. Same sentinel pattern as `onboardingEmailsSentAt` and `trialEmailsSentAt`.
- `digestEmailsOptedOutAt`: separate from `onboardingEmailsOptedOutAt`. A user who unsubscribes from the digest should still receive trial/onboarding lifecycle emails and vice versa.
- `mortgageMilestonesSentAt`: keyed by `{propertyId}__{threshold}` for property-level milestones (e.g. `"clx123__ltv_50": "2026-04-01"`) and `{propertyId}__{mortgageId}__{threshold}` for per-mortgage milestones (e.g. `"clx123__mort456__payoff_5yr": "2026-04-01"`). LTV thresholds are property-level (total debt / total value). Payoff milestones are per-mortgage — a property with two mortgages can independently trigger "payoff within 5 years" at different times.
- `winbackEmailsSentAt`: sentinel for the 6-month and 12-month win-back emails. Separate from mortgage milestones — different purpose, different lifecycle.

### Property model addition

```prisma
model Property {
  // ... existing fields ...
  estimatedValueAsOf    DateTime? @db.Date   // date the AVM was last refreshed
  snapshots             PropertySnapshot[]
}
```

`estimatedValueAsOf` parallels `marketRentAsOf`. Lets the dashboard show "Value estimate as of Apr 2026" and lets the cron skip properties refreshed recently.

---

## Activity-based user gating

### Activity tiers

| State | Definition | Refresh | Email |
|-------|-----------|---------|-------|
| **Active** | `lastActiveAt` within 30 days | Monthly AVM + rent refresh | Monthly digest |
| **Cooling** | `lastActiveAt` 31–90 days ago | Monthly refresh (they may return) | Monthly digest |
| **Dormant** | `lastActiveAt` 91–180 days ago | No refresh | 6-month win-back email (once) |
| **Cold** | `lastActiveAt` 181–365 days ago | No refresh | 12-month win-back email (once) |
| **Gone** | `lastActiveAt` >365 days ago or null with account >365 days old | No refresh, no email | Nothing |

### Tier resolution (pure function)

```typescript
type ActivityTier = "active" | "cooling" | "dormant" | "cold" | "gone";

function getActivityTier(lastActiveAt: Date | null, accountCreatedAt: Date, now: Date): ActivityTier {
  const ref = lastActiveAt ?? accountCreatedAt;
  const daysSince = Math.floor((now.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSince <= 30)  return "active";
  if (daysSince <= 90)  return "cooling";
  if (daysSince <= 180) return "dormant";
  if (daysSince <= 365) return "cold";
  return "gone";
}
```

### Eligibility for refresh

Only users meeting all of these:
1. `deletedAt: null` — exclude soft-deleted users
2. Paid tier (investor or pro) **or** active trial — no refresh for expired-trial free users
3. At least 1 property
4. Activity tier is `active` or `cooling`

### Cost impact at scale

| Scale | Without gating | With gating (est. 65% active+cooling) | Savings |
|-------|---------------|---------------------------------------|---------|
| 100 users × 3.5 props | 700 calls/mo | 455 calls/mo | 35% |
| 1000 users × 3.5 props | 7,000 calls/mo | 4,550 calls/mo | 35% |

Savings compound as churn creates more dormant/cold users over time.

---

## AVM accuracy and significance thresholds

### The noise problem

AVM estimates have statistical confidence intervals, not appraisal-grade precision. Industry benchmarks:
- Zillow Zestimate: median error ~2.4% on-market, ~7.5% off-market
- RentCast (comparable methodology): likely similar to Zillow off-market range
- For a $350K property, ±7.5% = ±$26,250 uncertainty band

If RentCast says $350K in April and $356K in May, the $6K "increase" is within the noise band. Reporting it as equity growth manufactures a false signal.

### Significance threshold rules

**Property value:**
- Minimum change to update `currentEstimatedValue`: **3% of current value** or **$10,000**, whichever is greater
- Below threshold: store raw in `avmValueRaw` on the snapshot, set `avmValueApplied = false`, leave property record unchanged
- Above threshold: update `currentEstimatedValue` and `estimatedValueAsOf`, set `avmValueApplied = true`

**Market rent:**
- Minimum change to update `marketRent`: **5% of current market rent** or **$50/month**, whichever is greater
- Same store-raw-but-don't-apply pattern below threshold

**Rationale:** Value has a tighter threshold because it drives equity (a headline metric). Rent has a looser threshold because it's a comparison indicator, not an action number.

### Accuracy contract in the UI

| Metric | Accuracy level | UI treatment |
|--------|---------------|-------------|
| Cash flow, NOI | Exact (given correct user inputs) | Show as-is |
| Mortgage balance | Near-exact for fixed-rate | Label as "projected" when not from statement |
| Equity (paydown component) | Near-exact | Can show dollar change confidently |
| Property value | Approximate (±5–10%) | Show with "estimated" qualifier |
| Equity (total) | Mixed — one side exact, one side approximate | Split the story: "$X from paydown, value ~unchanged" |
| Rent vs market | Approximate | Already shown as percentage band |

### Delta presentation in emails and UI

Never show month-over-month value change as a precise dollar amount. Instead:

- **Paydown delta:** "Your mortgages paid down $1,480 in principal this month" — precise, from amortization math, always show
- **Value change (significant):** "Estimated values updated — portfolio value ~$1.2M" — new total, not a delta
- **Value change (insignificant):** "Property values approximately unchanged" — don't pretend stale data is fresh
- **Equity total:** "Total equity: $187,400 (up from $185,920 last month)" — honest total, delta includes both paydown and any value adjustment
- **Long-horizon trends:** "Up ~$18K since you added this property" — longer windows smooth out noise, appropriate for dashboard sparklines

---

## Phased implementation

### Phase 0: Mortgage milestone notifications (standalone, no new infra)

**What:** Detect LTV thresholds (75%, 50%, 25%) and principal paydown milestones from `getEffectiveBalance()` vs `currentEstimatedValue`. Cron checks monthly, sends email if a threshold was crossed.

**Why first:** Zero API cost, zero new tables, uses existing amortization math, existing cron and email patterns. Genuinely compelling email: "You crossed 50% LTV on Pine Cottage" is a moment people care about.

**Schema:** Add `mortgageMilestonesSentAt Json?` to `User`. LTV milestones are property-level, keyed by `{propertyId}__{threshold}` (e.g. `"clx123__ltv_50": "2026-04-01"`). Payoff milestones are per-mortgage, keyed by `{propertyId}__{mortgageId}__{threshold}` (e.g. `"clx123__mort456__payoff_5yr": "2026-04-01"`). This granularity ensures independent tracking across properties and mortgages. No other schema changes.

**New files:**
- `app/lib/emails/mortgage-milestones.ts` — email templates
- `app/lib/mortgage-milestones.ts` — milestone detection logic (pure function: given effective balance, estimated value, and previously sent milestones, return list of newly crossed milestones)
- `app/app/api/cron/milestone-emails/route.ts` — cron handler
- Tests for each

**Cron schedule:** Monthly, 1st of month. Add to `vercel.json`:
```json
{ "path": "/api/cron/milestone-emails", "schedule": "0 15 1 * *" }
```

**Milestone thresholds:**
- LTV crosses below 75% (25% equity)
- LTV crosses below 50% (50% equity)
- LTV crosses below 25% (75% equity)
- Loan fully projected to pay off within 5 years

**Gating:** All users with at least 1 property and at least 1 mortgage, and `deletedAt: null` (exclude soft-deleted users). No tier restriction — free users get milestones too (goodwill, re-engagement). No activity tier restriction — milestones are infrequent and high-signal.

**Unsubscribe (CAN-SPAM):** All new email types must include `List-Unsubscribe` headers and a visible unsubscribe link, following the existing pattern in `onboarding-reengagement.ts` and `trial-lifecycle.ts`. Milestone emails use `?type=digest` — if a user doesn't want milestones, they likely don't want the digest either (milestones are folded into the digest in Phase 3). Extend the unsubscribe route to also check `digestEmailsOptedOutAt` before sending milestone emails.

---

### Phase 1: Schema + activity tracking + snapshot infrastructure

**What:** Add `PropertySnapshot` model, `User.lastActiveAt`, `User.digestEmailsSentAt`, `User.digestEmailsOptedOutAt`, `Property.estimatedValueAsOf`. Build the snapshot utility library and activity tier logic. No cron yet — just the data layer.

**New/modified files:**
- `app/prisma/schema.prisma` — add `PropertySnapshot` model, `User` fields, `Property.estimatedValueAsOf`
- Migration via `prisma migrate dev`
- `app/lib/snapshots.ts` — pure functions:
  - `buildSnapshotData(property, mortgages, avmResult, now)` → snapshot data object (post-refresh state including raw AVM values and applied flags)
  - `computeSnapshotDelta(current, previous)` → delta object with per-field changes (previous may be null for first month — returns absolute values only)
  - `shouldApplyAvmValue(currentValue, newValue)` → boolean (significance threshold)
  - `shouldApplyAvmRent(currentRent, newRent)` → boolean
- `app/lib/activity-tier.ts` — pure function: `getActivityTier(lastActiveAt, createdAt, now)` → tier enum
- `app/lib/snapshots.test.ts` — unit tests for snapshot creation, delta computation, significance thresholds
- `app/lib/activity-tier.test.ts` — unit tests for tier boundaries

**`lastActiveAt` tracking:** Update inside `getAppUser()` in `app/lib/auth.ts`. This function already runs on every authenticated page load and already performs conditional user updates (e.g. Clerk metadata sync). Add a check: if `lastActiveAt` is null or older than 24 hours, include `lastActiveAt: new Date()` in the existing `prisma.user.update()` call. This caps writes at 1/day/user with zero new middleware or layout changes. Note: `getAppUser()` currently has an early return when email/firstName/lastName haven't changed — the `lastActiveAt` check must be added to the early-return condition so that a stale `lastActiveAt` also triggers the update path.

**Migration backfill:** The migration SQL must backfill `lastActiveAt` for all existing users: `UPDATE "User" SET "lastActiveAt" = "updatedAt" WHERE "lastActiveAt" IS NULL`. Without this, all existing users start with `null` and fall back to `createdAt` for activity tier classification — a daily-active user with a 6-month-old account would be classified as "dormant" and skipped by the first refresh cycle. After backfill, `updatedAt` provides a reasonable approximation of last activity.

**No cron, no email in this phase.** This is pure infrastructure.

---

### Phase 2: Monthly refresh cron

**What:** A single cron route that, for eligible users, snapshots current state, calls RentCast for value + rent refresh, applies significance thresholds, updates property records, and creates post-refresh snapshots.

**New files:**
- `app/app/api/cron/monthly-refresh/route.ts` — cron handler
- `app/app/api/cron/monthly-refresh/route.test.ts`
- `app/lib/refresh.ts` — orchestration logic (separated from route for testability):
  - `getRefreshEligibleUsers(now)` → users with paid tier, ≥1 property, active/cooling activity
  - `refreshProperty(property, apiKey)` → { avmValue, avmRent, valueApplied, rentApplied }
  - `processUserRefresh(user, properties, apiKey, now)` → snapshots created, properties updated

**Cron design — chunked from day one:**

The cron runs daily (not monthly). Each run:
1. Query users eligible for refresh this month who haven't been refreshed yet (no `PropertySnapshot` row for current month for any of their properties)
2. Process up to N users per invocation (batch size tuned to stay under Vercel's 300s Pro limit — start with 10 users)
3. For each user, for each property:
   a. Call RentCast AVM for value estimate
   b. Call RentCast AVM for rent estimate
   c. Apply significance thresholds — update property record if thresholds exceeded
   d. Create **one** snapshot for this month capturing the post-refresh state (final computed metrics + raw AVM values + applied flags)
4. Return `{ processed: N, remaining: M }`

**One snapshot per property per month.** The `@@unique([propertyId, snapshotMonth])` constraint enforces this and makes the cron idempotent. To compute deltas, the digest cron compares this month's snapshot against **last month's** snapshot. For a property's first-ever month (no previous snapshot), the digest reports absolute values only — no deltas. The daily cadence means all users are processed within a few days of the 1st of the month.

**Cron schedule:**
```json
{ "path": "/api/cron/monthly-refresh", "schedule": "30 6 1-6 * *" }
```
Runs daily at 06:30 UTC on the **1st through 6th of each month only**. Processes a batch each day. All eligible users are completed by day 6 at the latest. The cron is a no-op for the rest of the month (no eligible users remain). This bounds the refresh window and makes it clear when the digest cron can safely fire.

**RentCast quota:** Cron-initiated RentCast calls do **not** create `RentCastApiCall` rows. The `RentCastApiCall` table exists solely for tracking the user's interactive hourly quota (shared pool across rent, value, and benchmark refresh routes). Writing cron rows into that table would contaminate the interactive quota — a user logging in at 06:30 UTC would see reduced estimate availability. Cron call volume is monitored through PostHog events (`monthly_refresh_completed`, `avm_value_updated`) and the cron's own `{ processed, remaining }` response, not through `RentCastApiCall`. No schema changes to `RentCastApiCall` are needed.

**Error handling:**
- If RentCast is down or rate-limited for a property, **still create a snapshot** of the property's current values (effective mortgage balance, equity from paydown, cash flow, etc.). AVM fields (`avmValueRaw`, `avmRentRaw`) are null, applied flags are false. This ensures the digest can still report paydown deltas for that property even without fresh AVM data. Log the RentCast failure to Sentry with `{ area: "cron_monthly_refresh" }`.
- If RentCast is down for the entire batch, the cron still creates paydown-only snapshots for all processed properties, then returns. Next day's run retries the AVM calls for any remaining users, but already-snapshotted properties are skipped (idempotent via `@@unique`).
- If a property has no address data sufficient for an AVM call, create a paydown-only snapshot (same pattern — no raw AVM fields).

---

### Phase 3: Monthly digest email

**What:** A **separate cron** fires on a fixed date each month — after the refresh window closes — and sends every eligible user their digest on the same day.

**Why a separate cron (not inline with refresh):**
- If the digest fires inline during the refresh cron, different users receive their email on different days (day 1 vs day 5) depending on batch ordering. That's messy.
- A dedicated digest cron on a fixed date creates a consistent cadence: "the 7th of each month, my Veld update arrives." Users learn to expect it.
- It cleanly separates the data job (refresh, days 1–6) from the communication job (email, day 7).

**New files:**
- `app/lib/emails/monthly-digest.ts` — email template builder
- `app/lib/digest.ts` — digest content assembly:
  - `buildDigestContent(user, properties, currentSnapshots, previousSnapshots)` → structured content object
  - `isDigestWorthSending(content)` → boolean (suppress if nothing material changed)
- `app/app/api/cron/monthly-digest/route.ts` — cron handler
- `app/app/api/cron/monthly-digest/route.test.ts`

**Modified files:**
- `app/app/api/unsubscribe/route.ts` — extend the existing unsubscribe route to support a `type` query parameter. Currently the route only handles onboarding emails (sets `onboardingEmailsOptedOutAt`). Add support for: `?type=digest` sets `digestEmailsOptedOutAt`; `?type=winback` marks both win-back sentinel keys as `"unsubscribed"`. Default behavior (no type param) remains unchanged for backward compatibility with existing onboarding/trial unsubscribe links.

**Cron schedule:**
```json
{ "path": "/api/cron/monthly-digest", "schedule": "0 15 7-8 * *" }
```
Runs on the **7th and 8th of each month** at 15:00 UTC — chunked from day one, same philosophy as the refresh cron. Each invocation processes N users (same batch size pattern), and the `digestEmailsSentAt` sentinel prevents double-sends. Two days provides headroom at scale without requiring architectural changes later.

**Timing guarantee:** The refresh cron runs days 1–6. The digest cron starts day 7. Even if a refresh batch spills to day 6, there's a full day buffer. If RentCast was down during the refresh window, the snapshots still exist (paydown-only) and the digest reports paydown deltas with no AVM section — still honest and useful.

**Digest email content (structured by what's precise vs approximate):**

```
Subject: "Your April portfolio update"

Precise section (from math):
• Total mortgage paydown this month: $1,480
• [If milestone crossed] Pine Cottage crossed 50% LTV
• Monthly cash flow: $2,340 (unchanged)

Estimated section (from AVM, when refreshed):
• Portfolio estimated value: ~$1.18M [if updated: "(updated)"]
• Total equity: $312,400
• Oak Street rent is 6% below market

CTA: "View your dashboard →"
```

**Eligibility:** Same base criteria as the refresh cron — `deletedAt: null`, paid tier or active trial, at least 1 property, activity tier is `active` or `cooling`. The query should filter by activity tier upfront to avoid processing dormant/cold/gone users unnecessarily.

**Suppression rules — do not send even if eligible:**
- No current-month snapshots exist for any of the user's properties (should be rare — the refresh cron creates paydown-only snapshots even when RentCast fails; this would only happen if the user wasn't processed at all, e.g. they became eligible mid-window)
- Delta paydown < $50 total AND no value update applied AND no market rent update applied AND no milestone crossed
- User has `digestEmailsOptedOutAt` set
- Monthly sentinel `digestEmailsSentAt["2026-05"]` already exists

**Chunking:** Same pattern as the refresh cron — process N users per invocation to stay within Vercel's execution limit. The cron runs on days 7–8 and the `digestEmailsSentAt` sentinel prevents double-sends, so each invocation picks up where the last left off.

**Email deliverability:** Because digest emails only go to active/cooling users (logged in within 90 days), open rates stay healthy. Dormant/cold users never receive digests. All users receive their digest on the same day, which looks professional and builds cadence.

---

### Phase 4: Win-back milestone emails (dormant + cold users)

**What:** For users who stopped logging in, send two final touchpoints — a 6-month and a 12-month win-back email — then stop all outbound.

**These are re-engagement emails, not data reports.** No RentCast calls are made. The copy drives the user back to the app, where logging in resets them to Active and they re-enter the refresh pool.

**6-month email (dormant tier, ~180 days since last active):**
> Subject: "A lot has changed since [month they were last active]"
> Body: "Your mortgages have been paying down and property values may have shifted. Log in to get a fresh valuation and see where your portfolio stands."
> CTA: "Check your portfolio →"

**12-month email (cold tier, ~365 days since last active):**
> Subject: "Your year in real estate"
> Body: "It's been a year. Property values shift, mortgages pay down, and market rents move. See where your portfolio stands today."
> CTA: "See your portfolio →"

**After 12-month email with no login:** Stop all outbound permanently. User re-enters the system only on organic return.

**Implementation:** Requires its own daily cron — cannot share with Phase 2's refresh cron because the refresh cron only runs days 1–6 of the month. A user who crosses the 180-day mark on day 15 would be missed until next month, outside the ±7 day window. A lightweight daily cron is inexpensive (query dormant/cold users, check sentinels, send at most a handful of emails).

**New files:**
- `app/lib/emails/winback.ts` — 6-month and 12-month email templates
- `app/app/api/cron/winback-emails/route.ts` — cron handler

**Cron schedule:**
```json
{ "path": "/api/cron/winback-emails", "schedule": "0 15 * * *" }
```
Runs daily at 15:00 UTC. Queries users where `deletedAt: null`, activity tier is `dormant` or `cold`, and the relevant `winbackEmailsSentAt` sentinel key is not set. Use ±7 day windows around the 180/365 day marks (same pattern as onboarding email windows). Check `winbackEmailsSentAt` sentinel (separate from `mortgageMilestonesSentAt` — different purpose).

**Unsubscribe (CAN-SPAM):** Win-back emails include unsubscribe links with `?type=winback`. The unsubscribe route, when `type=winback`, marks both sentinel keys (`"6mo"` and `"12mo"`) as `"unsubscribed"` in `winbackEmailsSentAt`. This prevents both emails and requires no new schema field — the existing sentinel JSON doubles as the opt-out mechanism.

---

### Phase 5 (future, not in initial scope): Dashboard trend indicators

Once snapshots accumulate (3+ months), the dashboard can show:
- "Equity over time" sparkline per property
- "Portfolio value trend" on the main dashboard
- Trend arrows (up/down/flat) next to key metrics
- "Since you joined" delta on the portfolio summary

This phase is purely frontend — all data comes from querying `PropertySnapshot` rows. No new cron, API calls, or schema changes.

---

## Cron schedule (full system)

```json
{
  "crons": [
    { "path": "/api/cron/onboarding-emails",  "schedule": "0 14 * * *" },
    { "path": "/api/cron/trial-emails",        "schedule": "10 14 * * *" },
    { "path": "/api/cron/rate-limit-cleanup",  "schedule": "20 * * * *" },
    { "path": "/api/cron/milestone-emails",    "schedule": "0 15 1 * *" },
    { "path": "/api/cron/monthly-refresh",     "schedule": "30 6 1-6 * *" },
    { "path": "/api/cron/monthly-digest",      "schedule": "0 15 7-8 * *" },
    { "path": "/api/cron/winback-emails",      "schedule": "0 15 * * *" }
  ]
}
```

**Monthly timeline:**

| Day | What happens |
|-----|-------------|
| 1st | Milestone email cron fires (LTV thresholds, payoff milestones). Refresh cron starts processing batches. |
| 2nd–6th | Refresh cron continues daily batches until all eligible users are processed. |
| 7th–8th | Digest email cron fires in batches — all eligible users receive their portfolio update. |
| 9th–end | No monthly retention crons. Daily crons (onboarding, trial, rate-limit cleanup, win-back) continue as normal. |

---

## Analytics events

Add to `app/lib/analytics-events.ts`:

```typescript
MONTHLY_REFRESH_COMPLETED: "monthly_refresh_completed",    // per-user, after all properties refreshed
MONTHLY_DIGEST_SENT: "monthly_digest_sent",
MILESTONE_EMAIL_SENT: "milestone_email_sent",              // { milestone: "ltv_50", propertyId }
WINBACK_EMAIL_SENT: "winback_email_sent",                  // { variant: "6mo" | "12mo" }
AVM_VALUE_UPDATED: "avm_value_updated",                    // { propertyId, oldValue, newValue, delta }
AVM_VALUE_BELOW_THRESHOLD: "avm_value_below_threshold",    // { propertyId, rawValue, currentValue, pctChange }
```

---

## RentCast API cost projections

| Scale | Props | Calls/mo (with gating) | Best plan | Est. cost |
|-------|-------|----------------------|-----------|-----------|
| 50 users | ~150 | ~195 | Developer ($35/mo) | ~$35 (within free + small overage) |
| 100 users | ~350 | ~455 | Foundation ($49/mo) | ~$49 (within 1000 included) |
| 500 users | ~1,750 | ~2,275 | Growth ($149/mo) | ~$149 (within 5000 included) |
| 1000 users | ~3,500 | ~4,550 | Growth ($149/mo) | ~$149 + minor overage |

All well below corresponding MRR at each scale. API cost stays <5% of revenue.

---

## Scalability design decisions

### Database

`PropertySnapshot` at one row per property per month:
- 1000 users × 5 props × 12 months = 60K rows/year
- 10K users × 5 props × 5 years = 3M rows — trivial for indexed Postgres
- Queries are always scoped to `propertyId` + recent `snapshotMonth` range — index scan, milliseconds

### Cron execution

Chunked from day one. The daily cron processes N users per run:
- At 50 users: all processed in 1 run (well under 300s)
- At 500 users: ~50 users/day × 10 days = full cycle by mid-month
- At 5000 users: increase batch size or run cron twice daily — still no architectural change

### Email deliverability

Activity gating ensures digest emails only go to engaged users (active + cooling = logged in within 90 days). This naturally maintains high open rates and protects sender reputation. Dormant/cold users receive at most 2 emails total (6mo + 12mo), then nothing.

---

## File inventory (new files)

| Phase | File | Purpose |
|-------|------|---------|
| 0 | `app/lib/mortgage-milestones.ts` | Milestone detection logic |
| 0 | `app/lib/mortgage-milestones.test.ts` | Tests |
| 0 | `app/lib/emails/mortgage-milestones.ts` | Milestone email templates |
| 0 | `app/app/api/cron/milestone-emails/route.ts` | Cron handler |
| 0 | `app/app/api/cron/milestone-emails/route.test.ts` | Cron tests |
| 1 | `app/lib/snapshots.ts` | Snapshot creation, delta computation, significance thresholds |
| 1 | `app/lib/snapshots.test.ts` | Tests |
| 1 | `app/lib/activity-tier.ts` | Activity tier resolution |
| 1 | `app/lib/activity-tier.test.ts` | Tests |
| 2 | `app/lib/refresh.ts` | Refresh orchestration logic |
| 2 | `app/app/api/cron/monthly-refresh/route.ts` | Cron handler |
| 2 | `app/app/api/cron/monthly-refresh/route.test.ts` | Cron tests |
| 3 | `app/lib/emails/monthly-digest.ts` | Digest email template |
| 3 | `app/lib/digest.ts` | Digest content assembly + suppression logic |
| 3 | `app/app/api/cron/monthly-digest/route.ts` | Digest cron handler (fires day 7) |
| 3 | `app/app/api/cron/monthly-digest/route.test.ts` | Digest cron tests |
| 4 | `app/lib/emails/winback.ts` | 6mo + 12mo re-engagement email templates |
| 4 | `app/app/api/cron/winback-emails/route.ts` | Daily win-back cron handler |
| 4 | `app/app/api/cron/winback-emails/route.test.ts` | Win-back cron tests |

**Modified files:**
- `app/prisma/schema.prisma` — new model + field additions (Phases 0, 1)
- `vercel.json` — new cron entries (Phases 0, 2, 3, 4)
- `app/lib/analytics-events.ts` — new event names (Phases 0–4)
- `app/lib/auth.ts` — add `lastActiveAt` conditional update inside `getAppUser()` (Phase 1)
- `app/app/api/unsubscribe/route.ts` — extend to support `?type=digest` and `?type=winback` (Phase 3, 4)
- `app/app/(app)/admin/page.tsx` — wire `AdminRefreshTools` into the existing Test Tools tab (Phase 1+)

---

## Scope boundaries

- Do **NOT** build Plaid/bank sync. This system operates on AVM estimates and amortization math, not transaction data. Bank sync is a separate initiative (`docs/reference/roadmap.md` §6 Deferred).
- Do **NOT** auto-modify user-entered fields (rent, expenses, cash invested). The refresh only touches `currentEstimatedValue`, `estimatedValueAsOf`, `marketRent`, and `marketRentAsOf`.
- Do **NOT** refresh properties for free-tier users with expired trials. AVM calls are a paid-tier benefit.
- Do **NOT** present AVM-driven changes as precise dollar amounts. Always qualify with "estimated" or "approximate."
- Do **NOT** send digest emails to users who have `digestEmailsOptedOutAt` set.
- Do **NOT** combine digest unsubscribe with onboarding/trial email unsubscribe. They are independent opt-outs.
- Do **NOT** store personally identifiable financial data (bank accounts, SSN, tax IDs) anywhere in this system.

---

## Admin test tools

Extend the existing admin dashboard (`/admin`, Test Tools tab) with interactive tools for verifying the refresh system end-to-end in production. Follows the existing pattern: admin API routes at `/api/admin/` gated by `isAdmin()`, client component in the Test Tools tab. Build alongside each phase — the tools are as important as the features for catching issues before they reach users.

### Admin API routes

| Route | Method | Phase | Purpose |
|-------|--------|-------|---------|
| `/api/admin/refresh/user-status` | GET | 1 | For a given `?userId=` (or self), returns: activity tier, `lastActiveAt`, refresh eligibility (with reason if ineligible), current-month snapshot status per property, and all sentinel states (`digestEmailsSentAt`, `mortgageMilestonesSentAt`, `winbackEmailsSentAt`). The single most useful debugging endpoint. |
| `/api/admin/refresh/set-activity` | POST | 1 | Set `lastActiveAt` for a user to a specific date. Lets you simulate activity tiers (e.g. set to 100 days ago → dormant) without waiting months. Body: `{ userId, lastActiveAt }`. |
| `/api/admin/refresh/trigger` | POST | 2 | Force-trigger the monthly refresh for a single user, bypassing activity tier and schedule constraints. Calls RentCast, applies thresholds, creates snapshot — the full pipeline. Returns: per-property results (AVM raw values, applied flags, snapshot created). Body: `{ userId }`. **Does** make real RentCast calls (test in production with your own account). |
| `/api/admin/refresh/reset-sentinels` | POST | 2 | Reset all new sentinel fields for the admin's own account: clears `digestEmailsSentAt`, `mortgageMilestonesSentAt`, `winbackEmailsSentAt`, and deletes current-month `PropertySnapshot` rows for the admin's properties. Lets the full cron pipeline re-run from scratch on your account. Same pattern as existing `resubscribe-self` route. |
| `/api/admin/refresh/digest-preview` | POST | 3 | Build and send a digest email for a specific user to `SUPPORT_EMAIL`. Uses real snapshot data from the DB. If no snapshots exist, returns an error explaining why. Body: `{ userId }`. |
| `/api/admin/refresh/milestone-preview` | POST | 0 | Run milestone detection for a specific user and send any detected milestones to `SUPPORT_EMAIL`. Body: `{ userId }`. Does not update sentinels (preview only). |
| `/api/admin/refresh/winback-preview` | POST | 4 | Send a win-back email (6mo or 12mo variant) for a specific user to `SUPPORT_EMAIL`. Body: `{ userId, variant: "6mo" | "12mo" }`. |

### Admin UI (Test Tools tab additions)

**Refresh Status panel** (Phase 1) — Shows for your own account: activity tier badge, `lastActiveAt` timestamp, refresh eligibility (green/red with reason), and current-month snapshot count vs property count. Auto-fetches from `/api/admin/refresh/user-status`.

**Activity Tier Simulator** (Phase 1) — Dropdown to set your `lastActiveAt` to preset offsets: "Now" (active), "45 days ago" (cooling), "120 days ago" (dormant), "200 days ago" (cold), "400 days ago" (gone). Calls `set-activity`, then refreshes the status panel. Essential for verifying gating logic without waiting.

**Force Refresh** (Phase 2) — Button to trigger refresh on your own account. Shows inline results: per-property AVM values, which thresholds were exceeded, snapshots created. Includes a "Reset & Re-run" button that clears sentinels + deletes current-month snapshots, then triggers a fresh refresh.

**Email Previews** (Phases 0, 3, 4) — Buttons to send each email type to `SUPPORT_EMAIL`:
- "Send milestone preview" — runs detection on your properties, sends any milestones found (or reports "no milestones detected")
- "Send digest preview" — builds real digest from your snapshot data, sends to `SUPPORT_EMAIL`
- "Send 6-month win-back preview" / "Send 12-month win-back preview"

**Snapshot Inspector** (Phase 2) — Table of your current-month snapshots: property nickname, `estimatedValue`, `effectiveMortgageBalance`, `equity`, `avmValueRaw`, `avmValueApplied`, `avmRentRaw`, `avmRentApplied`. If previous-month snapshots exist, shows delta columns. Lets you verify the snapshot data matches expectations before the digest cron sends emails based on it.

**Sentinel Viewer & Reset** (Phase 2) — Displays current values of all sentinel JSON fields on your account. "Reset all sentinels" button clears them so cron paths can be re-tested from scratch.

### New files (admin tools)

| Phase | File | Purpose |
|-------|------|---------|
| 1 | `app/app/api/admin/refresh/user-status/route.ts` | User refresh status endpoint |
| 1 | `app/app/api/admin/refresh/set-activity/route.ts` | Activity tier simulator endpoint |
| 2 | `app/app/api/admin/refresh/trigger/route.ts` | Force-refresh endpoint |
| 2 | `app/app/api/admin/refresh/reset-sentinels/route.ts` | Sentinel reset endpoint |
| 0 | `app/app/api/admin/refresh/milestone-preview/route.ts` | Milestone email preview |
| 3 | `app/app/api/admin/refresh/digest-preview/route.ts` | Digest email preview |
| 4 | `app/app/api/admin/refresh/winback-preview/route.ts` | Win-back email preview |
| 2 | `app/app/(app)/admin/admin-refresh-tools.tsx` | Client component for the Test Tools tab |

---

## Testing strategy

Each phase has pure functions separated from route handlers, following the existing pattern (`amortization.ts` / `amortization.test.ts`, `property-metrics.ts` / `property-metrics.test.ts`).

**Phase 0 tests:**
- Milestone detection: various LTV scenarios, edge cases (no mortgage, already below all thresholds, multiple mortgages)
- Sentinel field: don't re-send already-sent milestones

**Phase 1 tests:**
- Snapshot creation from property + mortgage data
- Delta computation (value up, value down, no change, first snapshot)
- Significance threshold (at boundary, below, above, zero current value edge case)
- Activity tier (exactly on boundaries: day 30, 31, 90, 91, 180, 181, 365, 366, null lastActiveAt)

**Phase 2 tests:**
- Cron auth (missing/wrong secret → 401)
- Eligible user filtering (free user excluded, dormant user excluded, no-property user excluded)
- RentCast failure handling (API down → skip property, continue)
- Idempotency (snapshot already exists for month → skip)
- Batch size limiting

**Phase 3 tests:**
- Digest content assembly from snapshot pairs
- Suppression logic (nothing changed → don't send)
- Sentinel check (already sent for month → skip)

---

## Risks and mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| RentCast AVM noise creates false equity signals | High | Significance thresholds (3% / $10K); split paydown vs value in copy |
| Cron exceeds Vercel execution limit as user base grows | Medium at ~$1K MRR | Chunked processing from day one; batch size tunable |
| User expects bank-grade accuracy from AVM | Medium | UI and email copy always says "estimated"; never show precise deltas for value |
| RentCast API outage during refresh window | Low-Medium | Skip and retry next day; snapshot current values regardless; Sentry alert |
| Email deliverability degrades from digest volume | Low (gated to active users) | Activity gating; separate opt-out; monitor open rates in PostHog |
| Stale `lastActiveAt` if tracking breaks | Low | Fallback: treat null as `createdAt`; cron still works, just gates on account age |

---

## Success metrics (PostHog)

- **Monthly refresh coverage:** % of eligible users whose properties were refreshed in a given month (target: 100% by 5th of month)
- **Digest open rate:** target >40% (industry avg for transactional email)
- **Return visit within 7 days of digest:** target >15% of digest recipients
- **Win-back conversion:** % of dormant/cold users who log in within 14 days of 6mo/12mo email (target: >5%)
- **AVM value applied rate:** % of refreshes where the value exceeded the significance threshold (monitoring metric — if >80%, threshold may be too loose; if <10%, too tight)

---

## Roadmap alignment

This plan consolidates and supersedes all 5 phases from `docs/reference/roadmap.md` §2 Retention data hooks:

| Roadmap phase | Covered by |
|---|---|
| Phase 1: Monthly portfolio digest email | Plan Phase 3 |
| Phase 2: Monthly property value re-fetch | Plan Phase 2 |
| Phase 3: Value/equity change notification | Plan Phase 3 (integrated into digest) |
| Phase 4: Rent vs market alert | Plan Phase 3 (integrated into digest) |
| Phase 5: Mortgage milestone notifications | Plan Phase 0 |

Additionally provides the snapshot foundation for future roadmap items:
- §1a Portfolio insights & prioritized alerts (Phase 5 trend data)
- §3 Cashflow / profitability timeline (portfolio-aggregated, from snapshots)
- §3 Mortgage payment history / snapshots (superseded by this broader system)
