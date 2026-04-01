# Feature / UX / IA Audit — 2026-04-01

## Executive summary

- **Overall:** Core journeys (auth → add property → dashboard → properties/detail → modeling/mortgage → analyze/deals → plans) are coherent, share a consistent shell (`app-layout-client` + `app-nav`), and align with `docs/policies/design-spec.md` on typography tokens, spacing, and progressive disclosure patterns (e.g. `MobileCollapsible`, workspace jump controls).
- **Information architecture:** Power users get strong shortcuts (dashboard workspace strip, property filters, `/deals/[id]` redirecting into `analyze?deal=`). First-time users still face naming overlap between **Analyze deal** and **Deals** in the sidebar, and two calculator entry points (`/calculators` vs `/tools`) that need a clear mental model.
- **Top risks:** (1) Welcome onboarding overlay lacks standard dialog semantics for assistive technology. (2) Dense financial copy on the Deals list and long Deal Analyzer surface can overwhelm users who are not already fluent in ownership modes and ratio labels—policy alignment (`docs/policies/analytics-math-policy.md`) is strong technically but not always translated into plain language on every surface.
- **Recommendation:** Prioritize onboarding modal accessibility, then IA copy/navigation clarity for Analyze vs Deals and pricing entry points; sweep spec-token and visual-consistency items as a follow-up polish pass.

## Severity-ranked findings

### Critical

- *(None — no evidence of a completely blocked primary journey or broken navigation for core tasks in this static review.)*

### High

- **Welcome modal missing dialog semantics** — The first-run welcome UI is a full-screen overlay with primary actions but uses generic `div` wrappers without `role="dialog"`, `aria-modal="true"`, or `aria-labelledby` pointing at the visible title. Screen reader users may not get an expected “dialog” announcement or easy jump to the modal title. — `app/app/(app)/onboarding-panel.tsx` (overlay and inner card, approx. lines 94–138).

### Medium

- **“Analyze deal” vs “Deals” as adjacent nav items** — Both appear next to each other in `app-nav` with no in-nav hint that one starts a new analysis and the other lists saved work. New users may tap both to see “which is which,” increasing early cognitive load. — `app/app/(app)/app-nav.tsx` (nav array entries for `/analyze` and `/deals`).

- **Two pricing-related entry points** — Authenticated users can reach marketing `/pricing` (via landing/footer links) while subscription management lives at `/plans`. The pricing page mitigates this with copy pointing to Plans & billing (`app/app/pricing/page.tsx`), but bookmarks, emails, and SEO can still land users on the wrong surface first. — `app/app/pricing/page.tsx`; in-app hub `app/app/(app)/plans/page.tsx`.

- **Deals list subtitle is implementation-heavy** — The page explains proportional math vs portfolio “full liability” mode in the primary description. That is valuable for reconciliation but hard to parse without a help link or tooltip. — `app/app/(app)/deals/page.tsx` (intro paragraph).

- **Post–first-property dashboard nudge uses four parallel CTAs** — After `?onboarding=first-property`, the dashboard shows four same-weight secondary actions (analyze, modeling, mortgage, add property) with no suggested “best next step.” — `app/app/(app)/dashboard/page.tsx` (onboarding banner block).

- **Over-limit banner uses non-semantic color utilities** — Warning styling uses raw `amber-500` Tailwind classes instead of a design-token alias, which conflicts with the spec’s push toward semantic colors for theming consistency. — `app/app/(app)/components/over-limit-banner.tsx`.

- **Legacy property tab URLs redirect away from the page** — `?tab=mortgage` and `?tab=projections` on property detail trigger client redirects to `/mortgage` and `/modeling`. That is sensible consolidation but can surprise users who bookmarked tab URLs expecting in-page anchors. — `app/app/(app)/properties/[id]/property-detail-tabs.tsx` (`useTabState` effect).

### Low

- **Dual calculator hubs** — In-app hub at `/calculators` duplicates public `/tools`; copy explains sharing links via the public hub (`app/app/(app)/calculators/page.tsx`). IA remains “two front doors” for the same calculators; acceptable for logged-in vs public contexts but worth monitoring in support feedback.

- **Sidebar “Add property” uses `Lightbulb` icon** — Semantics skew toward “tips” rather than “create.” — `app/app/(app)/app-nav.tsx` (bottom link).

- **Onboarding modal decorative gradient blobs** — Background blur orbs conflict with design-spec guidance to avoid decorative gradients unless specified. — `app/app/(app)/onboarding-panel.tsx`.

- **Mixed card radii and caption sizes** — Surfaces mix `rounded-lg` / `rounded-xl` / `rounded-2xl`; settings mobile snapshot uses `text-[11px]` labels, slightly below the documented caption tier (`text-xs`). — e.g. `app/app/(app)/settings/page.tsx`; various workspace cards.

- **Single-property workspace selects** — Modeling/Mortgage workspaces still render a disabled `<select>` when only one property exists, consuming space for no choice. — `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`.

- **Billing success page is minimal** — Post-checkout page confirms subscription but does not restate new limits or next actions (contrast with rich “plan context” on `/plans`). — `app/app/(app)/billing/success/page.tsx` (referenced for tone; thin value-reinforcement moment).

## Evidence reviewed

- **Process & policy:** `docs/process/feature-ux-audit-process.md`, `docs/process/audit-report-template.md`, `docs/policies/design-spec.md`, `docs/policies/analytics-math-policy.md` (label density / metric contracts); `docs/architecture-and-build-practices.md` (referenced at process level for component patterns).
- **App shell & IA:** `app/app/(app)/layout.tsx`, `app/app/(app)/app-layout-client.tsx`, `app/app/(app)/app-nav.tsx`, `app/components/footer.tsx`, `app/components/landing-nav.tsx`.
- **Core surfaces:** `app/app/(app)/dashboard/page.tsx` (+ `dashboard-charts.tsx`, `workspace-nav-mobile.tsx`, `metric-help-link.tsx`), `app/app/(app)/properties/page.tsx`, `app/app/(app)/properties/[id]/page.tsx`, `property-detail-tabs.tsx`.
- **Workspaces:** `app/app/(app)/modeling/page.tsx`, `modeling-workspace.tsx`, `app/app/(app)/mortgage/page.tsx`, `mortgage-workspace.tsx`.
- **Analyze & deals:** `app/app/(app)/analyze/page.tsx`, `deal-analyzer-form.tsx` (structure and compare block), `app/app/(app)/deals/page.tsx`, `app/app/(app)/deals/[id]/page.tsx` (redirect).
- **Conversion & settings:** `app/app/(app)/plans/page.tsx`, `app/app/pricing/page.tsx`, `app/components/pricing-cards.tsx`, `app/components/growth/paid-intent-checkout-banner.tsx`, `app/app/(app)/components/over-limit-banner.tsx`, `app/app/(app)/components/past-due-banner.tsx`, `app/app/(app)/settings/page.tsx`, `app/app/(app)/billing/success/page.tsx`.
- **Onboarding & tools:** `app/app/(app)/onboarding-panel.tsx`, `app/app/(app)/calculators/page.tsx`, `app/components/calculators/calculators-hub-cards.tsx`, `app/app/(app)/export/portfolio-summary/page.tsx`.

**Limits of this pass:** Static review of source and docs only—no device lab, no automated accessibility scan, no session recordings. Dynamic behaviors (Stripe redirects, Clerk flows) inferred from code paths.

## Risk & impact assessment

- **Unresolved High (a11y):** New users relying on screen readers may have a weaker first-run experience during the welcome step; this affects inclusivity and may surface in automated audits or enterprise procurement.
- **IA/copy (Medium):** Misrouting between `/pricing` and `/plans` or confusion between Analyze and Deals wastes time and can reduce trust; impact is moderate because mitigations already exist on `/pricing` and cross-links are present.
- **Spec drift (Low/Medium):** Token and rounding inconsistency mostly harms brand cohesion and maintenance cost, not day-one task success.

Exposure is **broad** for nav and onboarding (all signed-in users), **narrower** for deals subtitle and legacy tab URLs (segments who read fine print or use bookmarks).

## Recommendations (prioritized)

1. Add accessible dialog semantics to the welcome onboarding overlay (`role="dialog"`, focus trap if not already implied by modal pattern, labelled heading, optional focus return on close), matching patterns used elsewhere in the app shell.
2. Clarify **Analyze deal** vs **Deals** in navigation: e.g. rename to “New analysis” / “Saved deals,” add one-line descriptions in a tooltip or secondary label, or consolidate under a single “Deals” parent with children.
3. Add plain-language help for the Deals list subtitle (link to `MetricHelpModal`, ownership docs, or a short “What this means” line) so implementation-accurate copy stays available without front-loading jargon.
4. Tokenize warning styling on the over-limit banner to align with `design-spec` semantic colors.
5. Rebalance the post-first-property dashboard card: one primary recommended next action, others as links or a “More” disclosure.

## Task candidates (optional)

- [ ] Implement `role="dialog"` / `aria-modal` / `aria-labelledby` (and keyboard focus behavior) on `OnboardingPanel` welcome overlay.
- [ ] Adjust `app-nav` labels or grouping for Analyze vs Deals; add analytics on mis-clicks if available.
- [ ] Replace raw `amber-500` classes in `OverLimitBanner` with semantic warning tokens from `globals.css` / design spec.
- [ ] Add help link or tooltip on `deals/page.tsx` for the proportional vs full-liability sentence.
- [ ] Redesign first-property success strip on dashboard with a single primary CTA and secondary actions.

## Re-test checklist

- [ ] Verify welcome modal with VoiceOver/NVDA: dialog role, title announcement, focus order.
- [ ] Verify navigation labels and any new grouping on desktop and mobile drawer.
- [ ] Verify Deals page after copy/help change; check no regression to list metrics.
- [ ] `npm run check` (when code changes are made).

## Next trigger and cadence

- **Trigger:** Quarterly, or before a major navigation / onboarding redesign; after large Deal Analyzer or pricing changes.
- **Recommended next run:** 2026-07-01 ± 2 weeks (or next monthly product review).
