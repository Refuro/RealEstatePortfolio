# Feature / UX / IA Audit — 2026-04-01 (pass 2)

## Executive summary

- **Overall:** Core journeys remain coherent: authenticated shell (`app-layout-client`, `app-nav`), dashboard and property flows, modeling/mortgage workspaces, analyze/deals, and plans/pricing surfaces align broadly with `docs/policies/design-spec.md` on hierarchy, spacing, and mobile patterns (`MobileCollapsible`, workspace jump controls, filter strips).
- **Strong points:** Empty states for zero properties and zero saved deals use clear CTAs; the analyze page explicitly links to saved deals, partially bridging the **Analyze deal** vs **Deals** sidebar pairing; `/pricing` calls out **Plans & billing** for signed-in users.
- **Top risks:** First-run welcome overlay still lacks standard modal/dialog semantics for assistive technology; financial and mode-related copy (deals list, deal analyzer compare block) can still outpace plain-language support; warning styling on the over-limit banner remains non-tokenized compared with other alerts.
- **Recommendation:** Treat welcome-modal accessibility as the highest-impact follow-up, then IA/copy affordances (deals search empty state, nav disambiguation) and token alignment for limit warnings; keep spec-level typography sweeps as maintenance.

## Severity-ranked findings

### Critical

- *(None — no evidence in this static review of a fully blocked primary task or broken core navigation.)*

### High

- **Welcome overlay missing dialog semantics** — The first-run welcome UI is a blocking overlay with primary/secondary actions but uses plain `div` wrappers without `role="dialog"`, `aria-modal="true"`, or `aria-labelledby` tied to the visible heading. Screen reader users may not get an expected dialog announcement or a clear entry point to the title region. — `app/app/(app)/onboarding-panel.tsx` (overlay and card, approx. lines 94–137).

### Medium

- **“Analyze deal” and “Deals” as adjacent nav items** — Both sit next to each other in the sidebar with identical visual weight; nothing in-nav signals that one starts a new analysis and the other lists saved work. — `app/app/(app)/app-nav.tsx` (nav entries for `/analyze` and `/deals`, approx. lines 20–28).

- **Deals list: subtitle is implementation-heavy** — The page explains proportional math vs portfolio “full liability” in the primary description; accurate but dense without an inline “What this means” or help link. — `app/app/(app)/deals/page.tsx` (intro copy, approx. lines 68–71).

- **Deals list: weak empty-search state** — When the user has saved deals but the search matches none, the UI shows only a short muted line (`No deals match your search.`) with no clear search reset or link to start a new analysis (contrast with properties’ “Clear filters” pattern). — `app/app/(app)/deals/deals-list.tsx` (approx. lines 105–108).

- **Post–first-property dashboard uses four parallel CTAs** — After `?onboarding=first-property`, four same-weight links compete with no single recommended next step. — `app/app/(app)/dashboard/page.tsx` (onboarding banner, approx. lines 147–180).

- **Over-limit banner uses raw amber utilities** — Warning styling uses `border-amber-500/30`, `bg-amber-500/10` instead of semantic tokens, unlike e.g. negative-token usage on `PastDueBanner`; theming and consistency suffer. — `app/app/(app)/components/over-limit-banner.tsx` (approx. lines 55–57).

- **Legacy property tab URLs redirect off the page** — `?tab=mortgage` and `?tab=projections` trigger client redirects to `/mortgage` and `/modeling`, which can surprise users who bookmarked in-page tab URLs. — `app/app/(app)/properties/[id]/property-detail-tabs.tsx` (`useTabState` effect, approx. lines 24–31).

- **Dual calculator entry points** — In-app `/calculators` vs public `/tools` remains two doors to similar calculators; acceptable for logged-in vs marketing contexts but adds IA surface area. — `app/app/(app)/calculators/page.tsx`; `app/app/tools/page.tsx`.

### Low

- **“Add property” / “Getting started” uses `Lightbulb`** — Icon semantics read more like “tips” than “create.” — `app/app/(app)/app-nav.tsx` (bottom link, approx. lines 86–107).

- **Welcome modal decorative blur orbs** — Background blurs sit alongside design-spec guidance to limit decorative gradients. — `app/app/(app)/onboarding-panel.tsx` (approx. lines 97–98).

- **Deal analyzer compare table uses sub–caption text size** — Table header uses `text-[11px]`, slightly below the spec’s caption tier (`text-xs`). — `app/app/(app)/analyze/deal-analyzer-form.tsx` (table `thead`, approx. lines 78–80).

- **Settings mobile snapshot uses `text-[11px]` labels** — Same drift from documented caption scale. — `app/app/(app)/settings/page.tsx` (mobile snapshot grid, approx. lines 45–55).

- **Single-property workspace selects** — Modeling still renders a disabled `<select>` when only one property exists. — `app/app/(app)/modeling/modeling-workspace.tsx` (e.g. `disabled={properties.length <= 1}`, approx. lines 86–90, 155–159).

- **Route-level error UI is generic** — `error.tsx` provides retry and dashboard links but does not use `role="alert"` (contrast with billing/limit banners that use alert roles). — `app/app/(app)/error.tsx` (approx. lines 17–38).

- **Billing success is thin on next actions** — The page restates tier, property limit, and deal limit and links to Dashboard and Settings, but does not suggest a concrete next step (e.g. add property, run analysis). — `app/app/(app)/billing/success/page.tsx` (approx. lines 26–51).

- **Mixed radii / card patterns** — Surfaces mix `rounded-lg`, `rounded-xl`, and `rounded-2xl` across dashboard, deals, and onboarding; minor visual inconsistency.

## Evidence reviewed

- **Process & policy:** `docs/process/feature-ux-audit-process.md`, `docs/process/audit-report-template.md`, `docs/policies/design-spec.md` (typography, spacing, mobile patterns); `docs/policies/analytics-math-policy.md` (referenced for metric/label expectations).
- **App shell & IA:** `app/app/(app)/layout.tsx`, `app/app/(app)/app-layout-client.tsx`, `app/app/(app)/app-nav.tsx`.
- **Core surfaces:** `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/properties/page.tsx`, `app/app/(app)/properties/[id]/property-detail-tabs.tsx`.
- **Workspaces:** `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx` (spot-check; mortgage mirrors property select pattern).
- **Analyze & deals:** `app/app/(app)/analyze/page.tsx`, `app/app/(app)/analyze/deal-analyzer-form.tsx`, `app/app/(app)/deals/page.tsx`, `app/app/(app)/deals/deals-list.tsx`.
- **Conversion & alerts:** `app/app/pricing/page.tsx`, `app/app/(app)/plans/page.tsx` (referenced for parity), `app/app/(app)/components/over-limit-banner.tsx`, `app/app/(app)/components/past-due-banner.tsx`, `app/app/(app)/billing/success/page.tsx`, `app/app/(app)/settings/page.tsx`.
- **Onboarding & errors:** `app/app/(app)/onboarding-panel.tsx`, `app/app/(app)/error.tsx`, `app/app/(app)/not-found.tsx`.

**Limits of this pass:** Static review of source and docs only—no device lab, no automated accessibility scan, no session recordings. Behaviors inferred from code paths.

## Risk & impact assessment

- **High (a11y):** Welcome overlay issues affect all new users who rely on assistive tech during first run; may also appear in procurement or automated audits.
- **Medium (IA/copy):** Nav and deals-copy friction wastes time for newcomers; empty-search state on deals is a narrower but recurring annoyance for power users with many deals.
- **Medium (consistency):** Raw amber on over-limit vs semantic tokens on other alerts increases maintenance cost and theme drift.

Exposure is **broad** for onboarding and navigation, **moderate** for deals and dashboard nudges, **narrow** for legacy tab URLs and single-property select UX.

## Recommendations (prioritized)

1. Add accessible dialog semantics (and expected keyboard behavior if not already implied) to the welcome onboarding overlay: `role="dialog"`, `aria-modal`, labelled heading, focus management consistent with other modals.
2. Clarify **Analyze deal** vs **Deals** in navigation (labels, grouping, or secondary descriptions) and improve the deals list empty-search state with a clear reset and/or CTA to `/analyze`.
3. Add plain-language help for the deals page subtitle (tooltip, short explainer, or link to existing metric help) so technical accuracy does not dominate the first read.
4. Replace raw `amber-500` classes in `OverLimitBanner` with semantic warning/surface tokens aligned to `design-spec` / `globals.css`.
5. Rebalance the post-first-property dashboard banner toward one primary recommended action, with secondary actions de-emphasized or behind disclosure.

## Task candidates (optional)

- [ ] Implement `role="dialog"` / `aria-modal` / `aria-labelledby` and focus behavior on `OnboardingPanel` welcome overlay.
- [ ] Add empty-search affordances on `DealsList` (e.g. clear search control, link to analyze).
- [ ] Tokenize warning styling in `OverLimitBanner` to match semantic alert patterns.
- [ ] Adjust `app-nav` labels or grouping for Analyze vs Deals.

## Re-test checklist

- [ ] Verify fix for welcome modal accessibility (screen reader + keyboard).
- [ ] Verify deals search empty state and nav changes do not regress analyze/deals flows.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** After onboarding or nav copy changes, or quarterly per `design-spec` review cadence.
- **Recommended next run window:** Next monthly UX review or before a major onboarding redesign.
