# Feature / UX / IA Audit — 2026-04-07

## Executive summary

- **Onboarding and completeness UX materially improved since 2026-04-05:** Welcome dismiss now pairs with a **7-day snooze** and a **re-engagement strip** (`onboarding-panel.tsx`); property completeness uses a **scored threshold** with explicit missing-field copy (`property-completeness.ts`, `overview-tab-content.tsx`); the overview **home profile** row shows **“Not set”** when bed/bath/sqft are absent. Empty dashboard now surfaces **Analyze** and **CSV import** paths, not only add-property.
- **Residual high-impact gaps:** `QuickActions` in `quick-actions.tsx` remains **unwired** to property detail, so the dedicated “edit / add mortgage / refresh benchmark” shortcut row still never appears. **Refinance** loads only properties that already have mortgages; users with one or more mortgage-free properties see an empty workspace whose **primary CTA still reads “Add your first property”**, which misroutes anyone who already has properties.
- **Information architecture is stable on desktop** (portfolio cluster, labeled Tools, Account, sticky “Getting started / Add property”) but **mobile bottom nav** elevates **Dashboard, Properties, Analyze** while **Modeling, Mortgage, Refinance, Deals, Calculators, Plans** require the **More → drawer** path—fine for power users who know the product, weaker for discovery of portfolio-adjacent tools.
- **Accessibility and copy consistency carry-forwards remain:** property detail **tab buttons** lack `tablist`/`tab`/`aria-selected` wiring; **Deals** sort `<select>` has **no accessible name**; **“CoC return”** on deal cards still diverges from **“Cash-on-cash return”** elsewhere. **`docs/policies/design-spec.md` §6** still describes a flat four-item nav that does not match production.

---

## Severity-ranked findings

### Critical

- **None identified this pass.** The 2026-04-05 **permanent silent dismiss** risk is **mitigated** by time-based re-engagement (`SNOOZE_DURATION_MS`, `showReEngagementNudge` in `app/app/(app)/onboarding-panel.tsx`). Continue monitoring activation metrics; a **7-day** gap may still feel long for some cohorts.

---

### High

- **`QuickActions` still not mounted on property detail** — `app/app/(app)/properties/[id]/quick-actions.tsx` exports `QuickActions` (Edit property, Add mortgage, Refresh benchmark), but **no import** appears in `property-detail-tabs.tsx`, `overview-tab-content.tsx`, or `properties/[id]/page.tsx` (confirmed via repository search). **Impact:** Post–quick-add and returning users lack a **single obvious action strip** aligned with those three tasks; they rely on scattered links and the completeness banner. **Evidence:** `quick-actions.tsx`; `property-detail-tabs.tsx` (renders only `OverviewTabContent` / `DetailsTabContent`).

- **Refinance empty state: wrong primary CTA when the user already has properties without mortgages** — `app/app/(app)/refinance/page.tsx` queries `properties` with `mortgages: { some: {} }`, so **zero rows** when every property is mortgage-free. `app/app/(app)/refinance/refinance-workspace.tsx` (lines 573–595) shows copy **“Add a property with a mortgage to model refi scenarios”** but the button is still **“Add your first property”** linking to `/properties/new`. **Impact:** A landlord with several properties and no loans is told to add a **first** property instead of **adding a mortgage** or opening **Properties**. **Route:** `/refinance`.

---

### Medium

- **Properties list: “Add property” vs “Quick add” still unexplained at the decision point** — `app/app/(app)/properties/page.tsx` (lines 284–296): accent **Add property** vs muted **Quick add** with **no** one-line comparison. Context appears only **after** route choice on `properties/new` (quick vs full banners). **Impact:** Same as prior audits—wrong path choice and abandonment risk. **Evidence:** `properties/page.tsx`; `properties/new/page.tsx` (lines 25–60).

- **Property detail section nav: missing ARIA tab semantics (carry-forward)** — `app/app/(app)/properties/[id]/property-detail-tabs.tsx` (lines 64–102): `<nav aria-label="Property sections">` contains plain `<button>`s without `role="tablist"` / `role="tab"` / `aria-selected` / `aria-controls`. **Impact:** Screen reader users get unnamed toggles, not a recognized tab interface (WCAG 2.1 §4.1.2). **Route:** `/properties/[id]`.

- **Saved deals: sort control has no accessible name (carry-forward)** — `app/app/(app)/deals/deals-list.tsx` (lines 92–102): `<select>` for sort order has **no** `<label>`, **`aria-label`**, or **`aria-labelledby`**. **Impact:** Unlabeled control for assistive tech (WCAG §1.3.1 / §4.1.2). **Route:** `/deals`.

- **Terminology: “CoC return” vs “Cash-on-cash return” (carry-forward)** — `deals-list.tsx` line 170 uses **“CoC return”**; `overview-tab-content.tsx` line 197 uses **“Cash-on-cash return”**. **Impact:** Inconsistent vocabulary across **Deals** and **Property** flows for the same metric.

- **Dashboard empty-state copy plateaus after day six (carry-forward, reduced severity)** — `app/app/(app)/dashboard/page.tsx` (lines 44–55): heading/body vary for days **≤1** and **≤6**, then a single generic line for **all later** users. **Mitigation:** Onboarding re-engagement strip and dashboard secondary cards (**Analyze**, **Import**) add parallel recovery. **Residual gap:** Long-idle users still see **static** empty copy in the hero with no time-based escalation beyond onboarding UI.

- **Mobile IA: high-value tools buried behind “More”** — `app/components/mobile-bottom-nav.tsx`: fixed slots are **Dashboard**, **Properties**, **Analyze**, **More** (dispatches `open-mobile-menu`). **Modeling**, **Mortgage**, **Refinance**, **Deals**, **Calculators**, **Plans** are only in `app-nav.tsx` inside the drawer. **Impact:** Asymmetric discoverability—**Analyze** is one tap, **Deals** is two; acceptable for the current funnel emphasis but worth tracking if refinance/modeling adoption targets rise.

- **Deals page header CTA may fall short of 44px touch height** — `app/app/(app)/deals/page.tsx` (lines 88–94): **“Analyze a deal”** uses `py-1.5` without `min-h-[44px]`. **Impact:** Primary action on a key page may violate internal touch-target guidance (`docs/policies/design-spec.md` §4.1 / design-spec-2026). **Route:** `/deals`.

---

### Low

- **`docs/policies/design-spec.md` §6 navigation list is stale (carry-forward)** — §6 still lists **Dashboard, Properties, Pricing, Settings** only. **Production:** `app/app/(app)/app-nav.tsx` uses **unlabeled portfolio pair**, **Tools** (six items), **Account** (Plans, Settings, optional Admin), plus footer **Getting started / Add property**. **Impact:** Misleading reference for audits and onboarding docs.

- **`border-border/70` still appears in calculator UI** — `app/components/calculators/calculator-metric.tsx` (line 21): `border-border/70`. **Impact:** Minor token inconsistency vs semantic `border-border` elsewhere; only relevant if design policy forbids opacity-suffixed borders globally.

- **Modeling / Mortgage mobile property `<select>` in context bar** — `modeling-workspace.tsx` / `mortgage-workspace.tsx`: property switcher in `MobileContextBar` **subtitle** is a bare `<select>` without an associated visible label (desktop uses a labeled “Property” field). **Impact:** Low—power users may infer; screen readers may get only the selected option text depending on browser.

- **Public `/pricing` vs in-app `/plans` (intentional but easy to confuse)** — Logged-in users on `app/app/pricing/page.tsx` are pointed to **Plans & billing**; both surfaces sell upgrades. **Impact:** Low if analytics show low confusion; note for support and copy audits.

---

## Evidence reviewed

| Area | Paths reviewed |
|------|----------------|
| Process & template | `docs/process/feature-ux-audit-process.md`, `docs/process/audit-report-template.md` |
| Policy / design | `docs/policies/design-spec.md` (§1, §4.1, §6, §8–9), `docs/policies/property-completeness.md` (intro + scope) |
| Prior audit (delta) | `docs/audits/feature/2026-04-05-feature-ux-audit.md` (structure + carry-forward list) |
| Shell & onboarding | `app/app/(app)/app-layout-client.tsx`, `app/app/(app)/layout.tsx`, `app/app/(app)/onboarding-panel.tsx` |
| Navigation | `app/app/(app)/app-nav.tsx`, `app/components/mobile-bottom-nav.tsx` |
| Dashboard | `app/app/(app)/dashboard/page.tsx` (empty + populated header/actions) |
| Properties | `app/app/(app)/properties/page.tsx`, `app/app/(app)/properties/new/page.tsx` |
| Property detail | `app/app/(app)/properties/[id]/page.tsx`, `property-detail-tabs.tsx`, `overview-tab-content.tsx`, `quick-actions.tsx` (existence / wiring) |
| Completeness | `app/lib/property-completeness.ts` |
| Workspaces | `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`, `app/app/(app)/modeling/page.tsx`, `app/app/(app)/mortgage/page.tsx`, `app/app/(app)/refinance/page.tsx`, `refinance-workspace.tsx` (empty branch) |
| Analyze / Deals | `app/app/(app)/analyze/page.tsx`, `app/app/(app)/deals/page.tsx`, `deals-list.tsx` |
| Conversion | `app/app/(app)/plans/page.tsx`, `app/app/pricing/page.tsx` (header + cards entry) |
| Calculators hub | `app/app/(app)/calculators/page.tsx` |

**Limits:** No live browser session or screen-reader verification this pass; mobile behavior inferred from component markup and breakpoints.

---

## Risk & impact assessment

- **Unwired QuickActions** and **Refinance empty-state CTA** affect **users who already engaged** (properties exist) but have not completed mortgage/refi workflows—exactly the segment moving from “toy portfolio” to **serious modeling**.
- **Tab and select accessibility** issues cap **compliance and professional buyer** readiness; severity is steady, not spiking.
- **Mobile tool discoverability** is a **growth and education** risk more than a functional one, assuming users eventually open the drawer.

---

## Recommendations (prioritized)

1. **Mount or delete `QuickActions`:** Either import and place `QuickActions` on property detail (overview or below hero), aligned with `property-completeness.md`, or remove the dead module to avoid drift.
2. **Fix Refinance zero-mortgage empty state:** Branch copy and CTAs on whether `propertyCount === 0` vs “properties exist but none have mortgages” (e.g. link to `/properties` or first property **edit** / mortgage flow); avoid **“first property”** when `propertyCount > 0`.
3. **Batch a11y fixes on high-traffic surfaces:** Add `aria-label="Sort deals"` (or a visible label) on `deals-list.tsx` `<select>`; add tab roles / `aria-selected` on `property-detail-tabs.tsx`; rename **CoC return** → **Cash-on-cash return** on deal cards.
4. **Properties hub microcopy:** One line under the dual CTAs explaining **Quick add** (minimal fields, finish later) vs **full add**—or a single primary CTA with secondary “Use quick add” inside `properties/new` only if IA stays unchanged.
5. **Update `docs/policies/design-spec.md` §6** to describe the real sidebar groups and mobile drawer/bottom nav, or add a pointer that **canonical nav truth** is `app-nav.tsx` + `mobile-bottom-nav.tsx`.

---

## Task candidates

- [ ] Wire `QuickActions` into property detail (placement + mobile stacking).
- [ ] Refinance: server-pass `totalPropertyCount` (or equivalent) and adjust empty-state messaging + CTAs.
- [ ] `deals-list.tsx`: accessible name on sort `<select>`; align **Cash-on-cash** label with property overview.
- [ ] `property-detail-tabs.tsx`: WAI-ARIA tabs pattern (roles, `aria-selected`, `id` + `aria-controls`).
- [ ] `properties/page.tsx`: one-line explainer for **Quick add** vs **Add property** (or tooltip pattern consistent with design spec).
- [ ] `deals/page.tsx`: `min-h-[44px]` on header **Analyze a deal** link-button.
- [ ] `docs/policies/design-spec.md` §6: refresh nav description to match `app-nav.tsx`.

---

## Re-test checklist

- [ ] Verify Refinance empty state for (a) 0 properties, (b) ≥1 property, 0 mortgages.
- [ ] Verify property detail: QuickActions visible and actions correct; no layout regression on mobile.
- [ ] Spot-check screen reader: deals sort control name; property tabs roles.
- [ ] `npm run check` (when code changes are made).

---

## Next trigger and cadence

- **Trigger:** After onboarding/refinance/property-detail shipped changes, or **monthly** while activation KPIs are under review.
- **Recommended next run:** **2026-05-07** (or next release that touches `onboarding-panel.tsx`, `refinance/*`, or `property-detail-tabs.tsx`).
