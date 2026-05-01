# Ownership % resurfacing & display-mode collapse plan — 2026-04-29

**Source:** Audit conversation 2026-04-29. Two related gaps surfaced:
1. The display-mode lens (`proportional` / `full_liability`) is invisible on Dashboard, Properties list, Property detail header, and Insights — only the Projections tab shows a one-off, asymmetric caption.
2. `ownershipPercent` is set in the add-property wizard and **never surfaced or editable again** anywhere in the UI, despite the API supporting PATCH and the schema storing it.

**Direction (decided):** Collapse to a single canonical math basis — proportional everywhere — and surface joint-liability risk as progressive-disclosure data on the property detail mortgage card. Remove the `ownershipDisplayMode` toggle and column entirely (hard removal). Resurface `ownershipPercent` via an editable field in the property edit drawer and a small chip on relevant pages.

**Canonical references (read first):**
- [`ownership-metrics.md`](../policies/ownership-metrics.md) — formulas, modes, copy expectations (this plan rewrites it)
- [`ownership-vacancy-percent-schema.md`](../decisions/ownership-vacancy-percent-schema.md) — `Int` vs `Decimal` (defer)
- [`analytics-math-policy.md`](../policies/analytics-math-policy.md) — debt-service source rules, reconciliation expectations

---

## 1) Problem statement

The ownership-metrics policy already mandates clear UX copy (§4) wherever ownership mode affects values. Implementation does not honor it:

| Surface | Mode indicator | Ownership % visible |
|---|---|---|
| Settings (`ownership-display-toggle.tsx`) | ✅ Source of truth | n/a |
| Dashboard (`dashboard/page.tsx`) | ❌ | ❌ |
| Properties list (`properties/page.tsx`) | ❌ | ❌ |
| Property detail header (`property-detail-content.tsx`) | ❌ | ❌ |
| Property detail → Projections (`projections-tab-content.tsx:531`) | ⚠️ Asymmetric — full-liability only, one card | ❌ |
| Insights cards (`components/dashboard/insight-cards.tsx`) | ❌ — file has no `displayMode` reference | ❌ |
| Deals (`deals/page.tsx:71`) | ✅ Inline copy says mode does not apply | ❌ |
| Analyze (`deal-analyzer-form.tsx:1365`) | ✅ Inline copy says mode does not apply | n/a (entered per-deal) |
| Portfolio summary export (`export/portfolio-summary/page.tsx:180`) | ✅ Footnote | ❌ |
| Add-property wizard summary (`add-property-wizard.tsx:1075`) | n/a | ⚠️ Only when ≠100% |

**Net effect for partial-ownership users:** every KPI on every screen is silently scaled by an invisible value through an invisible lens. A wizard typo (50 instead of 100) is undetectable from anywhere in the app.

---

## 2) Why one mode instead of two

The `proportional` / `full_liability` toggle has weak ROI:
- It only changes 4 numbers (debt balance, debt service, DSCR, monthly cash flow).
- For 100% owners (the common case), both modes produce identical output — the toggle is dead UI.
- For joint owners, an "either/or" toggle is the wrong shape: they want both views — economic share AND worst-case exposure — visible at the same time, not flipped between.
- Saved deals are already proportional-only per current policy §5; the lens already doesn't apply to half the platform.
- Every chip, tooltip, footnote, and help entry that mentions the mode is added overhead.

**Decision:** drop the lens entirely. All metrics canonical to proportional. Surface joint-liability risk where it actually matters — the property detail mortgage card — as progressive-disclosure data, not a toggle-driven view.

This is internally consistent with my equity recommendation (`(V−D)*s` regardless of mode is now just "the formula," no carve-out).

---

## 3) Design principles

1. **One canonical math basis.** Everything proportional. The `OwnershipDisplayMode` type, `ownershipDisplayMode` column, settings toggle, and all `displayMode` parameters disappear.
2. **Page-level ownership chip, not per-datapoint.** When ownership ≠ 100%, render a small chip showing `"50% ownership"` on relevant page headers. Hidden for solo owners — they see no extra chrome anywhere.
3. **Joint-liability risk as progressive disclosure.** One collapsible section on the property detail mortgage card, closed by default, only renders when `ownershipPercent < 100`. Expanded, it shows full debt balance, full monthly debt service, worst-case (solo) DSCR, and a one-line caption.
4. **Editable post-create.** Ownership lives in the edit drawer's Property Facts section. API already supports PATCH at `app/api/properties/[id]/route.ts:109`.
5. **No portfolio-level chip.** Originally proposed `"Mixed ownership"` on dashboard / properties list page header, click → settings. With the lens gone, settings has nothing to set, so the chip would deep-link to nothing useful. Drop it. Per-card `"X%"` chips on the properties list already telegraph the partial-ownership signal where it's actionable.
6. **Modeling & Projections inherit the canonical basis.** Now always proportional. No joint-liability expander inside those tabs — the same property's mortgage card is one click away.

### Chip placement (final)

| Surface | Render when | Content | Click action |
|---|---|---|---|
| Property detail header | `ownershipPercent < 100` | `"50% ownership"` | Open edit drawer to Property Facts |
| Properties list per-card | `ownershipPercent < 100` | `"50%"` next to address | Whole card already links to detail |
| Add-property wizard summary | Always | `"100%"` (or whatever value) | n/a |

Joint-liability expander appears only on the property detail mortgage card when `ownershipPercent < 100`.

---

## 4) Phased plan

| Phase | Theme | Model | Est. effort | Dependency |
|-------|-------|-------|-------------|------------|
| **1** | Atomic ship — chip + edit drawer field + joint-liability expander + lens removal + schema drop | Sonnet | ~4–5 hrs | None |
| **2** | Copy + policy revision + cleanup | Fast | ~1–2 hrs | Phase 1 green |
| **3** | Owner verification gate | Owner | — | Phase 2 green |

Phases 1 and 2 ship in the same release. The chip and expander **must** ship in the same atomic PR as the lens removal — see §4.3 sequencing risk.

---

### Phase 1 — Atomic ship (chip + edit drawer + joint-liability expander + lens removal)

**Goal:** New affordances added and old toggle removed in one coherent change.

#### 1.1 — New: `OwnershipChip` component

**File:** `app/components/ownership/ownership-chip.tsx` (new)

- Props: `{ ownershipPercent: number | null; size?: "sm" | "xs"; onClick?: () => void }`
- Renders nothing when `ownershipPercent === 100` or `null`
- Content: `"50% ownership"` (or `"50%"` for `xs` size used on cards)
- Visual: small accent-bordered pill matching existing badge style (look at `PropertyTypeBadge` and `StatusBadge` in `properties/page.tsx` for reference)
- `role="button"` + keyboard handlers when `onClick` provided

#### 1.2 — New: `JointLiabilityDetail` component

**File:** `app/components/ownership/joint-liability-detail.tsx` (new)

- Props: `{ ownershipPercent: number; totalMortgageBalance: number; totalMonthlyPayment: number; noi: number }`
- Returns `null` when `ownershipPercent === 100`
- Renders a `<details>` element (native disclosure) with:
  - Summary: `"Joint liability exposure ▸"`
  - Body rows:
    - `Full debt balance: ${formatCurrency(totalMortgageBalance)}`
    - `Full monthly debt service: ${formatCurrency(totalMonthlyPayment)} / mo`
    - `Worst-case DSCR (solo): ${(noi / (totalMonthlyPayment * 12)).toFixed(2)}` — only when `totalMonthlyPayment > 0`
  - Caption: `"What you'd be carrying if your co-owner stopped contributing."`

#### 1.3 — Edit drawer: add ownership field

**File:** `app/app/(app)/properties/[id]/edit-drawer.tsx`

- Add to Property Facts section, integer 1–100
- Validation: integer, inclusive 1–100
- PATCH already wired at `app/api/properties/[id]/route.ts:109`
- Reuse the wizard's input copy/help text from `add-property-wizard.tsx:613` for consistency

#### 1.4 — Property detail: header chip + mortgage card expander

**Files:**
- `app/app/(app)/properties/[id]/property-detail-content.tsx` — render `<OwnershipChip onClick={openEditDrawer("property-facts")} />` near the address line
- `app/app/(app)/properties/[id]/property-detail-types.ts` — add `ownershipPercent: number` to props
- `app/app/(app)/properties/[id]/page.tsx` — pass `property.ownershipPercent` into `PropertyDetailContent`
- `app/components/properties/detail/mortgage-section.tsx`:
  - Add `ownershipPercent: number` and `noi: number` to `MortgageSectionProps`
  - Render `<JointLiabilityDetail ownershipPercent={ownershipPercent} totalMortgageBalance={mortgages.reduce((s, m) => s + m.effectiveBalance, 0)} totalMonthlyPayment={mortgages.reduce((s, m) => s + Number(m.monthlyPayment), 0)} noi={noi} />` after the existing mortgage rows
- `app/app/(app)/properties/[id]/property-detail-content.tsx` — pass `ownershipPercent` and `metrics.noi` through to `<MortgageSection />`

#### 1.5 — Properties list: per-card chip

**File:** `app/app/(app)/properties/page.tsx`

- For each card with `ownershipPercent < 100`, render `<OwnershipChip size="xs" />` near the address (no `onClick` — card itself is the link)

#### 1.6 — Add-property wizard summary: always show ownership

**File:** `app/app/(app)/properties/add-property-wizard.tsx:1075`

- Remove the `&& Number(data.ownershipPercent) !== 100` condition. Show ownership row always so the value is auditable in the review step.

#### 1.7 — Lens removal: rip out `OwnershipDisplayMode` end-to-end

**Schema (Prisma):**
- New migration `drop_ownership_display_mode_from_user`: `ALTER TABLE "User" DROP COLUMN "ownershipDisplayMode";`
- Update `prisma/schema.prisma` — remove the column from `User`

**API:**
- `app/api/me/route.ts` — remove `ownershipDisplayMode` from PATCH validation and update payload
- `app/api/properties/[id]/metrics/route.ts` — remove `displayMode` parameter and call-site usage
- `app/api/export/portfolio/route.ts` — remove `displayMode` lookups
- `app/api/cron/monthly-digest/route.ts` — remove `displayMode` lookup

**Metric helpers:**
- `app/lib/metrics/property-metrics.ts`:
  - Remove `OwnershipDisplayMode` type export
  - Remove the `displayMode` parameter from `computePropertyMetrics` and `getAnnualDebtService`
  - Either delete `scaleLiabilityAmount` (only meaningful with mode) or simplify to `amount * (ownershipPercent / 100)` and remove the mode parameter
  - Add new helper `computePartnerDebtExposure(totalMortgageBalance, ownershipPercent): number` returning `D − D*s`
- `app/lib/metrics/portfolio-metrics.ts` — remove `displayMode` parameter from any aggregation function that accepts it
- `app/lib/server/portfolio-summary-payload.ts` — remove `displayMode` parameter

**Pages:**
- `app/app/(app)/dashboard/page.tsx` — strip `displayMode` lookup at line 105 and `fullLiability` derivation at line 191; rewrite all conditional `fullLiability ? X : Y` expressions to just the proportional branch
- `app/app/(app)/properties/page.tsx` — strip `displayMode` lookup at line 135
- `app/app/(app)/properties/[id]/page.tsx` — strip `displayMode` lookup at line 38
- `app/app/(app)/properties/[id]/projections-tab-content.tsx`:
  - Remove `displayMode` prop and parameter
  - Rewrite `scaleLiabilityAmount` calls (or replace with direct `* (ownershipPercent / 100)`)
  - Remove the `Full-liability lens applied` caption block at line 530–532
- `app/app/(app)/modeling/page.tsx` and `modeling-workspace.tsx` — strip `displayMode` plumbing
- `app/app/(app)/dashboard/build-insights-payload.ts` — strip `displayMode` parameter from `annualPaydownForProperty`, `toContextMetrics`, etc.; comments at lines 121–122 about full_liability mode become stale and get removed

**Settings:**
- `app/app/(app)/settings/page.tsx` — remove import + render of `OwnershipDisplayToggle` at line 121
- `app/app/(app)/settings/ownership-display-toggle.tsx` — **delete file**

**Tests (this is the chunky part):**
- `app/lib/metrics/property-metrics.test.ts` — drop full-liability test cases
- `app/lib/metrics/portfolio-metrics.test.ts` — drop full-liability cases
- `app/lib/metrics/metrics-golden.test.ts` and `app/lib/test/fixtures/metrics-golden.ts` — drop the `full_liability` fixture rows
- `app/lib/snapshots.test.ts` — drop `displayMode` parameter from any test calls
- `app/lib/snapshots.ts` — strip `displayMode` parameter (no user data exists per user; safe to hard-cut)
- `app/app/api/properties/[id]/metrics/route.test.ts` — drop full-liability mocks
- `app/app/api/deals/[id]/route.test.ts` — drop `ownershipDisplayMode` from any user fixtures
- `app/app/api/deals/route.test.ts` — same
- Add new test for `computePartnerDebtExposure`

#### 1.8 — Sequencing rule

The chip / expander / edit-drawer changes (1.1–1.6) and the lens removal (1.7) **must ship together**. If 1.1–1.6 land first, any user currently in `full_liability` mode would see double risk framing (KPIs at 100% AND a new joint-liability section). One PR. One deployment.

#### Done when

- `npm run check` green
- Manual walk-through of testing spots in §6 passes

---

### Phase 2 — Copy revision + policy doc rewrite + cleanup

**Goal:** Eliminate every reference to "display mode" and "full liability" outside of git history. Update the canonical doc.

#### 2.1 — Help modal copy

**File:** `app/components/metric-help-modal.tsx`

- Total debt entry (line 15): rewrite to "Sum of outstanding mortgage balances across all properties, scaled to your ownership share." Remove proportional/full-liability sentence.
- LTV entry (line 35): rewrite without the "in full liability mode" clause.
- DSCR entry (line 55): rewrite without the proportional/full-liability sentences. Mention worst-case DSCR is available on the property mortgage card.

#### 2.2 — Deals & Analyze inline copy

- `app/app/(app)/deals/page.tsx:71` — replace the "they do not follow portfolio 'full liability' display mode" sentence with: `"Deals you've analyzed and saved for comparison. Metrics use your ownership share."`
- `app/app/(app)/analyze/deal-analyzer-form.tsx:1365–1366` — replace the "Full liability mode does not apply in this workspace" sentence with: `"Analyze uses your ownership share for rent, expenses, and debt service."`
- `app/app/(app)/analyze/deal-analyzer-form.tsx:93` and `:148` — "Portfolio uses your ownership display mode and up to N included…" — drop "ownership display mode" reference; rephrase to just "Portfolio uses up to N included properties."

#### 2.3 — Portfolio summary export footnote

**File:** `app/app/(app)/export/portfolio-summary/page.tsx:180`

- Replace "(ownership display mode, vacancy on…)" with "(ownership share applied to rent, expenses, and debt; vacancy on…)"

#### 2.4 — Canonical policy doc rewrite

**File:** `docs/policies/ownership-metrics.md`

Material revision. Specifically:
- Title stays.
- §1 Canonical model: collapse to a single set of formulas (no "two classes / two modes").
- §2 Per-metric formulas: single column. Add new row for `partnerDebtExposure = D − D*s` with note that it is surfaced only on property detail mortgage card and only when ownership <100%.
- §3 Numeric examples: drop the "Full liability" example block. Add an "Interpretation" sentence explaining that NOI and equity reflect economic share at sale, while the partner-debt-exposure line tells you what extra debt would fall on you if your co-owner stopped contributing.
- §4 UX copy requirements: rewrite. Now governs the ownership chip and joint-liability expander copy. Remove "proportional/full liability" copy mandates.
- §5 Saved deals: simplify — saved deals and portfolio metrics now use the same proportional math.
- §6 Implementation guardrails: still applies; keep.

Add a **Changelog** section at the bottom: "2026-04-29 — collapsed display modes; removed `OwnershipDisplayMode` type and `ownershipDisplayMode` user setting; introduced `partnerDebtExposure`."

#### 2.5 — Architecture/build-practices reference cleanup

**File:** `docs/architecture-and-build-practices.md`

- Lines 76, 186, 198, 260, 274 reference ownership-metrics policy. Verify they still read correctly post-rewrite. No structural changes expected; just a sanity pass.

#### 2.6 — Decisions doc note

**File:** `docs/decisions/ownership-vacancy-percent-schema.md`

- Append note: "2026-04-29 — `ownershipPercent` is now editable post-create (previously wizard-only). Once syndication users at 33.33% / 16.67% appear, reopen the Decimal migration decision."

---

### Phase 3 — Owner verification gate

Manual walk-through of §6 testing spots. PM (you) signs off before close.

---

## 5) Out of scope / explicitly deferred

- **Multi-mortgage support.** Property model technically allows it, but no UI to add a second mortgage exists. Joint-liability expander treats mortgages as the existing aggregate. Multi-mortgage UX is a separate focused feature.
- **Per-mortgage ownership splits** (property is 50/50 but mortgage is one partner's name). Defer until a real user asks.
- **Decimal migration for fractional ownership.** Phase 2 logs the revisit trigger; do not migrate now.
- **Ownership history audit log.** No paid users with snapshot data exist; no historical-correctness work needed for this rollout.
- **Per-metric ownership tooltips.** The chip + the rewritten help modal is enough.
- **Existing-user communication.** Per PM input: 1 paid user, not using full-liability. Silent removal is acceptable.

---

## 6) Testing spots — manual verification before close

After Phase 1 + 2 land, walk through each:

**Settings**
- [ ] Settings page renders without the display-mode toggle and without errors
- [ ] No "Display mode" copy or "proportional / full liability" terminology anywhere in settings

**Property edit drawer**
- [ ] Open edit drawer → Property Facts has an editable "Ownership %" field
- [ ] Field validates: rejects 0, rejects 101, rejects "50.5", accepts 1–100 integers
- [ ] Save persists; reopening drawer shows the saved value
- [ ] Saving an edit re-renders all property KPIs with new scale

**Property detail header**
- [ ] At 100% ownership: no chip rendered
- [ ] At 50% ownership: chip reads `"50% ownership"`, accent-bordered pill style
- [ ] Click chip → edit drawer opens with focus on Property Facts (or at least the ownership field)

**Property detail mortgage card**
- [ ] At 100% ownership: no "Joint liability exposure" section
- [ ] At 50% ownership: collapsed `"Joint liability exposure ▸"` summary visible
- [ ] Expanded shows: Full debt balance, Full monthly debt service, Worst-case DSCR (solo), caption sentence
- [ ] Numbers match: full balance = `effectiveBalance` summed across mortgages (no `* s`); full debt service = `monthlyPayment` summed (no `* s`); worst-case DSCR = `NOI / (sum of monthlyPayment * 12)`

**Properties list**
- [ ] At 100% on a card: no `"X%"` chip near address
- [ ] At 50% on a card: small `"50%"` chip near address

**Dashboard**
- [ ] Hero KPIs match values that would have shown in the **proportional** mode previously (no full-liability values appearing)
- [ ] No display-mode indicator anywhere
- [ ] Insights cards render unchanged (they were already lens-blind)

**Add-property wizard**
- [ ] Final review/summary step always shows ownership row, even when value is 100%

**Modeling & Projections tabs**
- [ ] Both compute and render without errors
- [ ] No "Full-liability lens applied" caption on Projections projected-debt card
- [ ] Numbers match what proportional mode would have produced previously

**Saved deals & Analyze**
- [ ] Deals page copy no longer mentions "full liability display mode"
- [ ] Analyze copy no longer mentions "Full liability mode does not apply"
- [ ] Numbers unchanged (deals were already proportional)

**Portfolio summary export**
- [ ] Footnote at the bottom no longer mentions "ownership display mode"

**Help modal**
- [ ] Total debt, LTV, DSCR entries no longer mention proportional/full-liability

**Schema / API**
- [ ] `npx prisma migrate status` clean
- [ ] `User.ownershipDisplayMode` column does not exist in DB (psql or Prisma Studio)
- [ ] PATCH `/api/me` with `{ "ownershipDisplayMode": "proportional" }` is either rejected by validation or silently ignored (verify the Zod schema doesn't accept it)
- [ ] GET `/api/properties/:id/metrics` no longer accepts or requires a `displayMode` query param

**Codebase smell-check**
- [ ] `grep -ri "OwnershipDisplayMode\|ownershipDisplayMode\|full_liability\|fullLiability" app/` returns only docs/git-history references — no live code
- [ ] No `displayMode` parameter remaining on any function in `lib/metrics/` or `lib/server/`

---

## 7) Rollback

Hard removal means rollback is "revert the PR." Schema migration drop is reversible by re-adding the column with a default of `"proportional"` — no data loss because we have no users relying on the field. Acceptable risk per PM.

---

## 8) Open recommendations from author (decided in conversation)

- **Equity formula:** stays `(V−D)*s`. Sale-proceeds concept, not balance-sheet concept. Worst-case framing now lives in `partnerDebtExposure`.
- **Joint-liability expander placement:** property detail mortgage card only. Not in projections, modeling, or dashboard. Avoids expander-on-expander complexity.
- **Portfolio-level chip:** dropped. With no toggle to deep-link to, it has no actionable target.
- **Schema removal style:** hard. Per PM, no users rely on the field.
- **Existing-user comms:** silent. Per PM, 1 paid user not using full-liability.
