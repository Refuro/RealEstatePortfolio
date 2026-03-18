# Agent tasks

Tasks you want the **builder** agent to do. The PM adds tasks here when you ask; you can say "have the builder complete the tasks in tasks.md" and the PM will run the builder with these tasks.

**Product mantra (all tasks):** Thoughtful, robust, modern, frictionless. See `docs/architecture-and-build-practices.md`.

**Future features / roadmap:** See `docs/roadmap.md`. PM promotes items from there to here when ready to build.

---

## Completed (verified — smoke test passed 2025-03-15)

Pricing update ($15/$29), Website performance, App layout performance, Settings defer Stripe, Code audit follow-ups, Landing page overhaul, Dashboard enhancements, and all Builder tasks. **Full history:** `docs/tasks-archived.md`.

**Mortgage estimate & polish (2025-03-13):** Balance advancement (projected/stored, 6‑month staleness), escrow amount for P&I, amortization steep dropoff fix, import loan type, amortization chart tooltip (month/year + balance). All tasks below marked complete.

---

## Roadmap priority (value vs effort — 2025-03-15)

| Order | Item | Effort | Value | Recommendation |
|-------|------|--------|-------|----------------|
| — | Mortgage balance advancement | ✓ Done | — | Balance advancement, escrow, amortization fix, loan type import, chart tooltip. |
| **1** | Admin membership override | Low | Medium | **Quick win.** Admins can set tier manually (demo accounts, partners). Small schema + admin UI. |
| **2** | Benchmarking | Medium | High | **Do early.** "Your rent vs market" differentiator; RentCast API already integrated. |
| **3** | Refinance / payoff insights | Medium–High | High | Actionable; builds on amortization logic. |
| **4** | Simulation page | High | High | Full modeling; extends scenario concept. |
| **5** | Report section (PDF) | Medium | Medium | Professional output; share with partners/lenders. |
| **6** | Automated testing | High | High | Quality foundation; plan per Module M. |

**Defer:** Rent gap email (cost scales), Referral system (validate first), Error tracking (post-MVP).

---

## Open tasks remaining

### Mortgage balance advancement (Phase 1)

**Priority:** High. Metrics (equity, LTV, debt) drift over time as principal is paid down. Without balance advancement, users see stale numbers.

**Scope:** Hybrid approach — amortization projection as default, optional manual override when user has a statement. No Plaid/bank connection in Phase 1.

**Context:** `lib/amortization.ts` has `generateAmortizationSchedule`. Mortgage model has `originalLoanAmount`, `currentBalance`, `interestRate`, `termYears`, `startDate`, `monthlyPayment`. All metrics consumers (dashboard, properties, property detail, export, portfolio summary, property metrics API) compute `totalMortgageBalance` as sum of `currentBalance`. We centralize balance logic and add projection + override.

---

**1. Schema**

- Add `balanceAsOfDate DateTime? @db.Date` to Mortgage model. Migration.
- When user updates `currentBalance` from a statement dated X, they set `balanceAsOfDate = X`. Null = no manual override; use projected.

---

**2. Lib — `lib/amortization.ts`**

- **`getProjectedBalanceAsOf(input: AmortizationInput, asOfDate: Date): number`**
  - Generate schedule; find the row whose date is ≤ asOfDate and is the latest.
  - Return that row's `balance`. If asOfDate is before `startDate`, return 0. If asOfDate is after schedule end (loan paid off), return 0.
  - If schedule is empty (invalid inputs), return 0.

- **`getEffectiveBalance(mortgage: MortgageRecord): number`**
  - Input: mortgage with `originalLoanAmount`, `currentBalance`, `interestRate`, `termYears`, `startDate`, `monthlyPayment`, `balanceAsOfDate`.
  - If `balanceAsOfDate` exists and is within 6 months of today (≥ today − 180 days) → return `currentBalance`.
  - Else → return `getProjectedBalanceAsOf(...)` with mortgage's amortization inputs. If projection returns 0 (empty schedule), fall back to `currentBalance`.

- **`getBalanceSource(mortgage: MortgageRecord): 'stored' | 'projected'`**
  - Returns `'stored'` when `balanceAsOfDate` exists and within 6 months; else `'projected'`.
  - Used for display copy.

---

**3. Metrics — all consumers**

Replace raw `currentBalance` sum with `getEffectiveBalance` sum in:

- `app/(app)/dashboard/page.tsx` — portfolioInput
- `app/(app)/properties/page.tsx` — portfolioInput and property cards
- `app/(app)/properties/[id]/page.tsx` — totalMortgageBalance for metrics; pass `effectiveBalance` and `balanceSource` per mortgage to MortgageSection
- `app/api/properties/[id]/metrics/route.ts`
- `app/api/portfolio/summary/route.ts`
- `app/api/export/portfolio/route.ts` — use effective balance for metrics; export stored `currentBalance` and `balanceAsOfDate` as columns

---

**4. Mortgage form**

- Add optional "Balance as of" date picker to `MortgageFormFields` and `MortgageFormData`.
- When user updates `currentBalance`, auto-set `balanceAsOfDate` to today if not provided (encourages accuracy).
- Validation: `balanceAsOfDate` optional; if present, must be valid date.
- API: extend `createMortgageSchema` and `updateMortgageSchema`; create/update mortgage routes accept and store `balanceAsOfDate`.

---

**5. Mortgage display**

- Show which source: **"Balance: $X (as of [date])"** when `balanceSource === 'stored'`.
- **"Estimated balance: $X (from amortization — update from your statement for accuracy)"** when `balanceSource === 'projected'`.
- When projected and `balanceAsOfDate` is null or >6 months old: add subtle nudge "Consider updating from your latest statement."
- MortgageSection receives `effectiveBalance` and `balanceSource` per mortgage from parent (property page).

---

**6. Import / export**

- **Export:** Add `balance as of` column (YYYY-MM-DD when present). Export stored `currentBalance`; metrics in export use effective balance.
- **Import:** Add optional `balance as of` / `balanceAsOfDate` column. When present, parse and store. When absent, null.
- **Import — original loan amount:** Add optional `original loan amount` column. When present, use for mortgage `originalLoanAmount`; else keep current behavior (`originalLoanAmount = mortgageBalance`). Enables accurate projection for imported mortgages.

---

**7. Amortization chart**

- Unchanged. Chart uses original loan for schedule (existing behavior). Effective balance for metrics may differ when user overrides.

---

**Acceptance criteria**

- [x] Schema has `balanceAsOfDate`; migration applied.
- [x] `getProjectedBalanceAsOf` and `getEffectiveBalance` in `lib/amortization.ts`; `getBalanceSource` for display.
- [x] All consumers use `getEffectiveBalance` for `totalMortgageBalance` in metrics.
- [x] Mortgage form has "Balance as of" date; auto-set to today when updating balance.
- [x] Mortgage display shows stored vs estimated with correct copy; nudge when projected and stale.
- [x] Export includes `balance as of`; import accepts optional `balance as of` and `original loan amount`.
- [x] Amortization chart unchanged.
- [x] `npm run check` passes. Manual smoke: add mortgage → verify projected balance; update balance + date → verify stored; wait or backdate → verify projected.

---

**Out of scope (Phase 1):** Plaid, bank connection, automatic balance refresh. See `docs/roadmap.md`.

---

### Escrow amount for accurate balance projection (Option A)

**Priority:** High. When users check "Escrow included in payment," the full monthly payment (P&I + escrow) is used for amortization. Escrow does not reduce principal, so projected balance is artificially low. This task adds an optional escrow amount so we use P&I only for balance projection.

**Scope:** Add `escrowAmount`; use (monthlyPayment − escrowAmount) for amortization when set. Cash flow continues to use full `monthlyPayment` (user's actual outflow).

**Current setup analysis:**
- **Amortization / balance projection:** `lib/amortization.ts` `getEffectiveBalance` → `getProjectedBalanceAsOf` → `generateAmortizationSchedule` uses `monthlyPayment` directly. **Change:** Use P&I only when escrowAmount present.
- **Amortization chart API:** `api/properties/[id]/amortization/route.ts` passes `monthlyPayment` to `generateAmortizationSchedule`. **Change:** Use P&I only.
- **Cash flow / metrics:** Dashboard, properties, property detail, export, portfolio summary, property metrics API use `totalMonthlyPayment` = sum of `monthlyPayment` for cash flow. **No change** — user pays full amount.
- **Mortgage form:** Has `monthlyPayment`, `escrowIncluded` (checkbox). **Add:** `escrowAmount` field, shown when `escrowIncluded` is checked.
- **Deals:** SavedDeal has flat `totalMonthlyPayment`; no amortization. **No change.**

---

**1. Schema**

- Add `escrowAmount Decimal? @db.Decimal(12, 2)` to Mortgage model. Migration.
- Optional; when `escrowIncluded` is true and `escrowAmount` is set, P&I = `monthlyPayment - escrowAmount` for amortization.

---

**2. Lib — `lib/amortization.ts`**

- Extend `MortgageRecord` with `escrowIncluded?: boolean`, `escrowAmount?: number | { toString(): string } | null`.
- Add **`getPiForAmortization(mortgage: MortgageRecord): number`**
  - When `escrowIncluded` and `escrowAmount` is set and > 0: return `monthlyPayment - escrowAmount`, clamped to > 0 (avoid zero/negative P&I).
  - Else: return `monthlyPayment`.
- Update **`getEffectiveBalance`:** Pass `getPiForAmortization(mortgage)` instead of `monthlyPayment` when building `AmortizationInput` for projection.

---

**3. Amortization chart API**

- `api/properties/[id]/amortization/route.ts`: Use `getPiForAmortization(mortgage)` (or equivalent) instead of raw `monthlyPayment` when calling `generateAmortizationSchedule`.

---

**4. Mortgage form**

- Add optional "Escrow amount" field to `MortgageFormFields` and `MortgageFormData`.
- Show only when "Escrow included in payment" is checked.
- Helper text: "Used for balance projection. Your total payment above is used for cash flow."
- Validation: when present, must be ≥ 0 and < monthlyPayment (escrow cannot exceed total payment).

---

**5. Validation and API**

- Extend `createMortgageSchema` and `updateMortgageSchema` with optional `escrowAmount` (decimal string, 0 to monthlyPayment when escrowIncluded).
- Create/update mortgage API routes accept and store `escrowAmount`.
- Mortgage list/detail API responses include `escrowAmount`.

---

**6. Import / export**

- **Export:** Add optional "escrow amount" column. When present, export value; else empty.
- **Import:** Add optional "escrow amount" / "escrowAmount" column. When present, parse and store. When absent, null.

---

**7. No changes**

- Cash flow, metrics, dashboard, properties, scenario section — continue using full `monthlyPayment` (total outflow).
- Deals — unchanged.

---

**Acceptance criteria**

- [x] Schema has `escrowAmount`; migration applied.
- [x] `getPiForAmortization` in `lib/amortization.ts`; `getEffectiveBalance` and amortization chart use P&I only when escrowAmount set.
- [x] Mortgage form has "Escrow amount" (shown when escrow included); validation escrowAmount < monthlyPayment.
- [x] Create/update mortgage routes accept and store `escrowAmount`.
- [x] Amortization chart uses P&I only when escrowAmount present.
- [x] Export includes "escrow amount"; import accepts optional "escrow amount".
- [x] Cash flow unchanged (still uses full monthlyPayment).
- [x] `npm run check` passes. Manual smoke: add mortgage with escrow included + escrow amount → projected balance higher (more accurate) than without escrow amount.

---

### Import template — add original loan amount

**Priority:** Low. Import parser already supports `original loan amount`; template is missing it.

**Scope:** Add `original loan amount` to the downloadable portfolio import template (`app/api/import/portfolio/template/route.ts`) so users know the column exists and can fill it when importing. Place after `mortgage balance` and before `balance as of` (or alongside other mortgage columns). Sample row: empty string.

**Acceptance criteria**

- [x] Template CSV includes `original loan amount` column.
- [x] Column order matches export/import expectations (mortgage block: balance, original loan amount, balance as of, rate, term, payment, escrow, lender).
- [x] `npm run check` passes.

---

### Monthly rent display — simplify for single-unit

**Priority:** Low. UX polish.

**Scope:** For properties with a single unit, show just the amount (e.g. `$2,195`) instead of `Unit 1: $2,195 (Total: $2,195)`.

**Current behavior:** When `unitRents` has any values, display shows `Unit 1: $X (Total: $Y)` for single-unit; redundant.

**Desired behavior:**
- **Single unit** (`unitRents.length === 1`): show `$2,195` only.
- **Multi-unit** (`unitRents.length > 1`): show `Unit 1: $X, Unit 2: $Y (Total: $Z)`.

**Locations:**
- `app/(app)/properties/[id]/page.tsx` — property detail "Monthly rent" in Property details section.
- `app/(app)/properties/add-property-wizard.tsx` — StepReview "Monthly rent" in Income & expenses.

**Acceptance criteria**

- [x] Property detail page: single-unit shows amount only; multi-unit shows breakdown + total.
- [x] Add-property wizard review step: same logic.
- [x] `npm run check` passes.

---

### Import — add loan type

**Priority:** Low. Mortgage form and schema support `loanType`; import does not.

**Scope:** Add optional `loan type` column to CSV parser, import route, and template. Values: conventional, fha, va, etc. Store in `mortgage.loanType`.

**Acceptance criteria**

- [x] Parser accepts optional "loan type" / "loanType".
- [x] Import route stores `loanType` when creating mortgage.
- [x] Template includes "loan type" column (empty in sample).
- [x] `npm run check` passes.

---

### Amortization chart — today marker and hover date

**Priority:** Low. UX polish.

**Scope:**
- ~~Add a vertical "today" marker~~ (removed per user — low value, layout hassle).
- In the tooltip, show the month/year of the hovered datapoint (in addition to balance info).

**Acceptance criteria**

- [x] Tooltip includes month/year for the hovered point.
- [x] `npm run check` passes.

---

### Amortization schedule — fix steep dropoff at end of term

**Priority:** High. Chart shows balance ~$230k at month 360, then artificially drops to $0.

**Root cause:** In `generateAmortizationSchedule`, when `monthIndex === totalMonths - 1`, we force `principal = balance` regardless of whether the payment is sufficient. With P&I of $2,000 (after escrow), the loan needs ~$2,217 to fully amortize in 30 years. The payment is too low, so ~$230k remains at month 360. Forcing payoff creates a fake "balloon" and a nonsensical drop on the chart.

**Fix:** Remove the `monthIndex === totalMonths - 1` condition. Only set `principal = balance` when `principal >= balance` (natural payoff). If the payment doesn't fully amortize in the term, the last row shows the remaining balance; no artificial drop to zero.

**Acceptance criteria**

- [x] Schedule ends at term with remaining balance when payment is insufficient (no fake payoff).
- [x] Chart curve ends naturally at remaining balance; no steep drop to $0.
- [x] When payment *does* fully amortize, schedule still pays off correctly.
- [x] `npm run check` passes.

---

### RentCast rate limits — plan-based per-hour

**Priority:** Low. Protects RentCast quota; aligns limits with plan value.

**Scope:** Replace the fixed 20-calls-per-hour limit with plan-based limits:
- **Free:** 5/hour
- **Investor:** 10/hour
- **Pro:** 20/hour

**Files:**
- `app/api/estimates/rent/route.ts` — use plan-based limit
- `app/api/estimates/value/route.ts` — use plan-based limit

**Implementation:**
- Add helper `getRentCastHourlyLimit(tier: string): number` in `lib/plans.ts` or new `lib/rentcast-limits.ts`. Return 5 for "free", 10 for "investor", 20 for "pro"; default 5 for unknown.
- Both estimate routes: get `user.subscriptionTier ?? "free"`, call helper, use result instead of hardcoded 20.
- Error message unchanged: "Rate limit exceeded. Try again later."

**Acceptance criteria**

- [x] Free users: 5 RentCast calls per hour (rent + value combined).
- [x] Investor users: 10 per hour.
- [x] Pro users: 20 per hour.
- [x] `npm run check` passes.

---

### RentCast rate limit — user-facing messaging

**Priority:** Low. Users who hit the limit should see clear, friendly messaging without flow interruption.

**Scope:** Improve the message shown when a user exceeds their RentCast estimate limit (rent or value). Keep it inline below the Estimate button; no modals or blocking UI.

**API:** 429 response message: "You've used your estimate limit for this hour. Try again later."

**Frontend:** When error contains "estimate limit", use `text-negative` (visible) instead of `text-muted`. Apply to rent and value estimate errors in add-property-wizard and property-form.

**Constraints:** No modals, toasts, or blocking. Inline message only. Form flow unchanged.

**Acceptance criteria**

- [x] API returns friendly message on 429.
- [x] Add-property wizard: rate limit error shown in text-negative below Estimate button(s).
- [x] Property form: rate limit error shown in text-negative below Estimate button(s).
- [x] No flow interruption; form remains fully usable.
- [x] `npm run check` passes.

---

### Benchmarking — rent vs market

**Priority:** Medium. Differentiator; see `docs/benchmarking-proposal.md`.

**Scope:** Show "Your rent is X% above/below market" per property. Reuse Estimate rent to populate benchmark; add Refresh benchmark for on-demand fetch. 60-day cache TTL.

**1. Schema**
- Add `marketRent Decimal? @db.Decimal(12, 2)` and `marketRentAsOf DateTime? @db.Date` to Property. Migration.

**2. Estimate rent API** (`app/api/estimates/rent/route.ts`)
- Accept optional `propertyId` query param.
- On success: if `propertyId` provided, update property with `marketRent` and `marketRentAsOf` (today).
- Return `{ rent, marketRent?, marketRentAsOf? }` so frontend can use for add flow.

**3. Property create**
- `app/api/properties/route.ts`: Accept optional `marketRent`, `marketRentAsOf` in POST body. Store when provided.
- Add-property wizard: when user clicks Estimate rent and gets result, store `marketRent` and `marketRentAsOf` in wizard state; include in create payload.

**4. Benchmark refresh endpoint**
- `POST /api/properties/[id]/benchmark/refresh` — fetch RentCast rent for property address, update `marketRent` and `marketRentAsOf`, return `{ marketRent, marketRentAsOf, pctAboveBelow }`. Same rate limit as estimate rent. Requires auth.

**5. Property API responses**
- Include `marketRent` and `marketRentAsOf` in property fetch (detail, list). Property detail page needs them.

**6. Property form (edit)**
- Pass `propertyId` when calling estimate rent API so we can update property with marketRent on success.

**7. Property detail UI**
- Near "Monthly rent": when `marketRent` exists and `marketRentAsOf` ≤ 60 days ago, show "Rent: $X · Market: $Y (+Z%)" or "(-Z% below market)".
- When no cache or stale: show "Refresh benchmark" button. On click, call refresh endpoint, update UI.
- Use `getPropertyTotalRent` for user rent; compare to `marketRent`.

**8. Cache TTL**
- Consider fresh if `marketRentAsOf` within 60 days. Stale: show last value + "Updated X days ago · Refresh".

**Acceptance criteria**

- [x] Schema has marketRent, marketRentAsOf; migration applied.
- [x] Estimate rent with propertyId updates property; add wizard passes marketRent on create.
- [x] POST /api/properties/[id]/benchmark/refresh fetches and stores market rent.
- [x] Property detail shows benchmark when cache fresh; "Refresh benchmark" when missing/stale.
- [x] % above/below computed correctly: (userRent - marketRent) / marketRent × 100.
- [x] Rate limit applies to refresh (same as estimate rent).
- [x] `npm run check` passes.

---

### Estimate buttons — disable when value matches last estimate

**Priority:** Low. Reduces accidental duplicate API calls.

**Scope:** Gray out "Estimate value" and "Estimate rent" when the input field already contains the result from a prior estimate. Re-enable when the user edits the field. Apply to add-property-wizard and property-form. Clear "from estimate" when address changes so user can re-estimate for new address.

**Acceptance criteria**

- [x] Estimate value: disabled when current value matches last estimate; enabled when user edits.
- [x] Estimate rent: same logic.
- [x] Address change clears the flag (or value) so re-estimate is available.
- [x] Rate limits still apply when button is enabled and clicked.
- [x] `npm run check` passes.

---

### Benchmarking surfacing — Option A: Benchmark line on property cards

**Priority:** Medium. Surfaces rent vs. market at a glance; see `docs/benchmarking-surfacing-proposal.md`.

**Scope:** Add a compact benchmark line below the metrics grid on each property card in the properties list (`/properties`).

**Requirements:**
- **When benchmark exists and fresh** (marketRentAsOf ≤ 60 days): One line — "Rent X% below market" or "Rent X% above market" or "Rent at market". Use `text-muted` and `text-sm`.
- **When benchmark stale** (>60 days): "Rent vs. market: updated X days ago" with link to property detail (where user can refresh).
- **When no benchmark:** "Refresh benchmark" link to property detail.
- Use `getPropertyTotalRent` for user rent; compare to `marketRent`. Formula: `(userRent - marketRent) / marketRent × 100`.
- Properties API already returns `marketRent` and `marketRentAsOf` for list.

**Acceptance criteria**

- [x] Property cards with fresh benchmark show "Rent X% below/above/at market" below metrics grid.
- [x] Property cards with stale benchmark show "Rent vs. market: updated X days ago" with link to property.
- [x] Property cards without benchmark show "Refresh benchmark" link to property.
- [x] Copy uses `text-muted` and `text-sm`; does not dominate the card.
- [x] % computed correctly; "at market" when within ±1%.
- [x] `npm run check` passes.

---

### Benchmarking surfacing — Option C: "Rent vs. market" section on dashboard

**Priority:** Medium. Dedicated dashboard section; see `docs/benchmarking-surfacing-proposal.md`.

**Scope:** Add a "Rent vs. market" section on the dashboard after metric cards (or before charts). Show up to 3–5 properties with benchmarks, sorted by most below market.

**Requirements:**
- Filter properties with `marketRent != null` and `marketRentAsOf` within 60 days.
- Sort by % below market (most below first).
- Show up to 3–5 properties: "123 Main St: 12% below market" (link to property).
- If none: "See how your rent compares to market" with link to properties.
- Compact layout; does not dominate dashboard.

**Acceptance criteria**

- [x] Dashboard has "Rent vs. market" section after metric cards.
- [x] Section shows up to 3–5 properties with fresh benchmarks, sorted by most below market.
- [x] Each property links to its property detail page.
- [x] When no properties have benchmarks: show "See how your rent compares to market" with link to properties.
- [x] Section is compact; styling consistent with dashboard.
- [x] `npm run check` passes.

---

### Dashboard — integrate Rent vs. market into Property at a glance (single property)

**Priority:** Medium. UX polish — the standalone "Rent vs. market" section feels odd with one property.

**Scope:** When the user has a single property, integrate the rent vs. market line into the "Property at a glance" card instead of showing it as a separate section. When multiple properties, keep the separate Rent vs. market section (optionally style as card for consistency).

**Requirements:**
- **Single property:** Add "Rent vs. market" as a fifth row in the "Property at a glance" card grid (Value, Debt, Equity, Monthly cash flow, Rent vs. market).
- When benchmark exists and fresh: show "1.6% below market" or "X% above market" or "At market".
- When benchmark stale or missing: show "Add benchmark" or "Refresh benchmark" as a link to the property detail page.
- **Single property:** Remove the standalone Rent vs. market section from the dashboard (it's now in the card).
- **Multiple properties:** Keep the Rent vs. market section as-is (or optionally give it card styling to match). Do not show "Property at a glance" for multi-property — that card is single-property only.

**Files:**
- `app/(app)/dashboard/page.tsx` — conditionally render RentVsMarketSection only when propertyCount > 1.
- `app/(app)/dashboard/dashboard-charts.tsx` — add Rent vs. market row to "Property at a glance" card; needs benchmark data passed in (marketRent, marketRentAsOf, propertyId for link).

**Acceptance criteria**

- [x] Single property: "Property at a glance" card includes Rent vs. market row (fresh/stale/missing handled).
- [x] Single property: Standalone Rent vs. market section is hidden.
- [x] Multiple properties: Rent vs. market section remains visible; Property at a glance card not shown (existing behavior).
- [x] Rent vs. market row links to property when stale/missing ("Refresh benchmark" / "Add benchmark").
- [x] `npm run check` passes.

---

### Benchmark refresh — inline "Refresh estimate" button

**Priority:** Medium. UX — action where you need it; no navigation required.

**Scope:** Replace links to property page with inline "Refresh estimate" buttons that call the benchmark refresh API directly. Use on dashboard (Property at a glance) and properties list.

**Requirements:**
- **Dashboard (Property at a glance):** When benchmark stale or missing, show "Refresh estimate" **button** (not link). Button calls `POST /api/properties/[id]/benchmark/refresh`, shows loading, handles errors, then `router.refresh()`.
- **Properties list:** Restructure property cards so the benchmark line is **outside** the card Link (valid HTML). When no benchmark or stale: show "Refresh estimate" **button** that does the same. When fresh: show label only (no button).
- **Label:** Use "Refresh estimate" for both add (first time) and refresh (stale).
- Reuse or extend `BenchmarkRefreshButton`; add optional `label` prop if needed.
- Properties list: benchmark area must be a sibling to the Link, not nested (button inside anchor is invalid).

**Acceptance criteria**

- [x] Dashboard: stale/missing benchmark shows "Refresh estimate" button; clicking refreshes inline (no navigation).
- [x] Properties list: benchmark line outside card Link; "Refresh estimate" button when no/stale benchmark.
- [x] Button shows loading state; error displayed inline on failure.
- [x] Property detail page: keep existing BenchmarkRefreshButton (optional: rename label to "Refresh estimate" for consistency).
- [x] `npm run check` passes.

---

### Admin membership override

**Priority:** Medium. Quick win — admins can set tier manually for demos, partners, goodwill. See `docs/admin-membership-override-proposal.md`.

**Scope:** Add `subscriptionTierOverride` to User; admins can set/clear via admin UI. Effective tier = override ?? subscriptionTier. Billing sync skips downgrade when override set.

**1. Schema**
- Add `subscriptionTierOverride String?` to User model. Migration.

**2. Lib — `lib/plans.ts`**
- Add `getEffectiveTier(user: { subscriptionTier, subscriptionTierOverride? }): string`. Returns override when valid (free|investor|pro); else subscriptionTier ?? "free".

**3. Consumers — use getEffectiveTier**
- Dashboard, properties, layout, settings, deals, analyze, plans pages.
- API: properties, deals, estimates/rent, estimates/value, benchmark/refresh, import, export, portfolio/summary, billing/status, me.
- App layout client (banner).

**4. Billing sync**
- If `subscriptionTierOverride` set, return early; do not downgrade.

**5. Admin API**
- `PATCH /api/admin/users/[id]/tier` — body `{ tier: "free" | "investor" | "pro" | null }`. Admin only. Set or clear override.

**6. Admin UI**
- Users table: add tier dropdown (Free, Investor, Pro, Clear override) per row. On change, call PATCH API. Show effective tier and override status.

**Acceptance criteria**

- [x] Schema has subscriptionTierOverride; migration applied.
- [x] getEffectiveTier in lib/plans.ts; all consumers use it.
- [x] Billing sync skips downgrade when override set.
- [x] PATCH /api/admin/users/[id]/tier works; admin only.
- [x] Admin users table has tier control; can set/clear override.
- [x] `npm run check` passes.

---

### Settings — show override status in Plan & billing

**Priority:** Low. UX clarity for users with admin override.

**Scope:** On the Settings page, when the user has `subscriptionTierOverride` set, show that their plan is overridden and display their underlying plan (subscriptionTier from Stripe).

**Requirements:**
- When `subscriptionTierOverride` is set: show "Current plan: Pro (admin override)" (or Investor/Free as applicable).
- Add a row "Underlying plan: Free" (or whatever subscriptionTier is) so they know what their Stripe/billing status is.
- When no override: keep current display (just "Current plan: Pro" etc.); no underlying row.

**File:** `app/(app)/settings/page.tsx`

**Acceptance criteria**

- [x] Override users: "Current plan: X (admin override)" and "Underlying plan: Y".
- [x] Non-override users: unchanged (just "Current plan: X").
- [x] `npm run check` passes.

---

### Sentry error tracking

**Priority:** Medium. Production visibility; catch errors before users report them.

**Scope:** Integrate Sentry for error monitoring. Free tier (5K errors/month) is sufficient for launch. Use `@sentry/nextjs` with Next.js wizard or manual setup.

**Requirements:**
- Install `@sentry/nextjs`.
- Wrap `next.config.ts` (or `next.config.js`) with `withSentryConfig`.
- Create SDK init files: `instrumentation.ts` (or `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` per Next.js/Sentry docs).
- Env: `SENTRY_DSN` (required); `SENTRY_AUTH_TOKEN` (optional, for source maps).
- Only enable in production (`NODE_ENV === "production"`) or when `SENTRY_DSN` is set.
- Add `SENTRY_DSN` and `SENTRY_AUTH_TOKEN` to `.env.example` with placeholder comments.

**References:**
- [Sentry for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- `npx @sentry/wizard@latest -i nextjs` for automated setup

**Acceptance criteria**

- [x] Sentry SDK installed and configured for Next.js.
- [x] Errors in production are captured and visible in Sentry dashboard.
- [x] Env vars documented in .env.example.
- [x] `npm run check` passes.

---

*When the builder completes a task, they check it off here and report back. Add new tasks below.*
