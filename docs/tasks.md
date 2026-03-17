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
| **1** | Mortgage balance advancement | Medium | High | **Do first.** Metrics drift without balance advancement; equity/LTV/debt become inaccurate. Amortization projection + manual override; no Plaid. |
| **2** | Admin membership override | Low | Medium | **Quick win.** Admins can set tier manually (demo accounts, partners). Small schema + admin UI. |
| **3** | Benchmarking | Medium | High | **Do early.** "Your rent vs market" differentiator; RentCast API already integrated. |
| **4** | Refinance / payoff insights | Medium–High | High | Actionable; builds on amortization logic. |
| **5** | Simulation page | High | High | Full modeling; extends scenario concept. |
| **6** | Report section (PDF) | Medium | Medium | Professional output; share with partners/lenders. |
| **7** | Automated testing | High | High | Quality foundation; plan per Module M. |

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

*When the builder completes a task, they check it off here and report back. Add new tasks below.*
