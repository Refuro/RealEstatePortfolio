# Feature / UX / IA Audit — 2026-05-01

## Executive summary

- **Overall:** Information architecture in the authenticated shell remains legible: **Portfolio** (Dashboard, Properties) → **Tools** (Modeling, Mortgage, Refinance, Calculators, Analyze deal, Deals) → **Account** (Plans, Settings). Core pages use consistent L1 headings (`text-2xl font-semibold`) per `docs/design/design-spec-2026.md`.
- **Top risks:** Mobile bottom navigation still maps the Deal Analyzer (`/analyze`) to a **calculator** icon and the shortened label **Analyze**, which conflicts with sidebar **Analyze deal** (`ClipboardList`) and the in-page **Analyze deal** `<h1>` — the same risk called out in prior audits remains in current code. **Add-property** URLs still split between **`/properties/new?mode=quick`** (onboarding, dashboard empty, re-engagement strip) and **`/properties/new`** (dashboard chrome, sidebar footer, Modeling/Mortgage empty states, single-property dashboard upsell).
- **CTA hierarchy:** On **Properties** with zero rows, the page shows **two** brand-accent primary buttons (toolbar **Add property** and dashed empty-state **Add your first property**). **Saved deals** with an empty list shows **two** accent **Analyze a deal** actions (page header and empty-state card), which strains **Pillar 5 — One loud action per screen** in the 2026 spec.
- **Recommendation:** Ship mobile nav parity for `/analyze` (icon + label) and document or centralize **quick vs full** add-property defaults; then dedupe accent CTAs on Properties (empty) and Deals (empty).

## Severity-ranked findings

### Critical

- None identified in this static review (no verified blocked journeys or destructive dead-ends without live-session testing).

### High

- **Mobile Deal Analyzer affordance vs product language** — The third bottom-nav item targets `/analyze` but uses `Calculator` and label **Analyze**. Sidebar and Analyze page use **Analyze deal** with `ClipboardList`. **Impact:** On phones, users may confuse Deal Analyzer with **Calculators** (sidebar also uses `Calculator` for `/calculators`). **Evidence:** `app/components/mobile-bottom-nav.tsx` (`NAV_ITEMS`); `app/app/(app)/app-nav.tsx` (`toolsNav`); `app/app/(app)/analyze/page.tsx` (`<h1>Analyze deal</h1>`).

### Medium

- **Inconsistent `mode=quick` for first property across surfaces** — Welcome modal primary and re-engagement strip push **`/properties/new?mode=quick`** (`app/app/(app)/onboarding-panel.tsx`). Dashboard empty primary uses the same (`app/app/(app)/dashboard/dashboard-empty-state-ctas.tsx`). Populated dashboard title bar **Add property**, compare upsell, and sidebar footer **Getting started** / **Add property** use **`/properties/new`** without `mode=quick` (`app/app/(app)/dashboard/page.tsx`; `app/app/(app)/app-nav.tsx`). Modeling and Mortgage empty states use **`/properties/new`** only (`app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`). **Impact:** Same persona hits different default flows depending on entry point; time-to-value and data completeness drift without on-screen explanation.

- **Properties (zero rows): competing indigo primaries** — Toolbar always renders **Add property** (`bg-accent`) and **Quick add** (muted text) above the main column (`app/app/(app)/properties/page.tsx`). The dashed empty state also uses a full **Add your first property** accent button. **Impact:** Two loud actions in one viewport conflicts with design **Pillar 5**; users must choose between visually equal primaries even though one is redundant.

- **Saved deals (zero rows): duplicate accent “Analyze a deal”** — Page header includes an accent link **Analyze a deal** (`app/app/(app)/deals/page.tsx`). The empty list in `DealsList` repeats the same label and accent treatment (`app/app/(app)/deals/deals-list.tsx`). **Impact:** Redundant CTAs and spec tension for “one loud action.”

- **High-value tools second-tier on mobile** — Bottom bar pins Dashboard, Properties, Analyze, and **More**; Modeling, Mortgage, Refinance, Calculators, and Deals require the drawer (`app/components/mobile-bottom-nav.tsx`; `app/app/(app)/app-nav.tsx`). **Impact:** Discovery friction for mortgage/refi and saved-deals workflows on small screens (carry-forward risk).

### Low

- **Deal Analyzer naming variance** — **Analyze deal** (Analyze `<h1>`, sidebar), **Analyze a deal** (dashboard empty secondary card, dashboard title bar secondary, Deals header/empty), **Analyze** (mobile tab). **Impact:** Minor documentation and wayfinding noise.

- **Dual pricing surfaces** — Public **`/pricing`** vs authenticated **`/plans`** (`app/app/pricing/page.tsx`; `app/app/(app)/plans/page.tsx`; Plans in `app/app/(app)/app-nav.tsx` **Account** group). **Impact:** Bookmarks and support language may diverge.

- **Billing success next steps** — Post-checkout page emphasizes dashboard + Settings (`app/app/(app)/billing/success/page.tsx`). **Plans** is the in-app upgrade hub; body copy says “Manage billing anytime in Settings” but does not point to `/plans` for tier changes. **Impact:** Low; power users may still find Plans via sidebar.

- **Minor token drift vs design spec** — Sidebar group labels use `tracking-wider` (`app/app/(app)/app-nav.tsx`); canonical L4 in `docs/design/design-spec-2026.md` specifies `tracking-wide`. Mobile shell uses `size-6` for the mark next to the wordmark where the spec’s table cites `size-5` for the app mobile top bar (`app/app/(app)/app-layout-client.tsx`). **Impact:** Cosmetic consistency only.

## Evidence reviewed

- **Process:** `docs/process/feature-ux-audit-process.md`
- **Template:** `docs/process/audit-report-template.md`
- **Primary UI reference:** `docs/design/design-spec-2026.md` (pillars, typography, empty states, “one loud action”)
- **Supporting policy:** `docs/policies/design-spec.md` (audit alignment note; defers to 2026 spec for conflicts)

**Surfaces (read-only code review):**

- Shell / nav: `app/app/(app)/layout.tsx`, `app/app/(app)/app-layout-client.tsx`, `app/app/(app)/app-nav.tsx`, `app/components/mobile-bottom-nav.tsx`
- Onboarding / first value: `app/app/(app)/onboarding-panel.tsx`, `app/app/(app)/dashboard/dashboard-empty-state-ctas.tsx`, `app/app/(app)/dashboard/page.tsx`
- Properties CRUD entry: `app/app/(app)/properties/page.tsx`
- Deal flows: `app/app/(app)/analyze/page.tsx`, `app/app/(app)/deals/page.tsx`, `app/app/(app)/deals/deals-list.tsx`
- Workspaces: `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`, `app/app/(app)/refinance/refinance-workspace.tsx`
- Calculators hub: `app/app/(app)/calculators/page.tsx`
- Settings & billing touchpoints: `app/app/(app)/settings/page.tsx`, `app/app/(app)/plans/page.tsx`, `app/app/(app)/billing/success/page.tsx`

**Assumptions / limits:** Static inspection only — no device screenshots, session replay, or moderated usability tests. Prior audit markdown was not treated as evidence; findings were re-derived from the paths above.

## Risk & impact assessment

- **High:** Mobile `/analyze` semantics affect a large share of mobile sessions; collision with **Calculators** is plausible given shared calculator iconography.
- **Medium:** Split quick/full defaults and duplicate primaries affect earliest funnel moments (zero properties, zero deals) and tool workspaces that assume existing properties.
- **Low:** Naming and URL duality create support/docs overhead more than hard blocks.
- **Likelihood:** Navigation friction is continuous on mobile; empty-state duplication appears only at count zero but at high-intent moments.

## Recommendations (prioritized)

1. **Mobile Deal Analyzer parity** — Replace bottom-nav icon (e.g. `ClipboardList` or another non-calculator glyph) and extend the label toward **Deal** or **Analyze deal** within fit constraints so `/analyze` matches sidebar and page semantics; re-check active styling for `/analyze?deal=…`.
2. **`mode=quick` policy** — Decide product rules for when quick add is default, then align sidebar footer, dashboard chrome, Modeling/Mortgage empties, and upsells (optionally via a single href helper) with onboarding and dashboard empty behavior.
3. **Dedupe accent CTAs on empty Properties and empty Deals** — Keep one indigo primary per viewport (e.g. hide toolbar add cluster when `properties.length === 0` and rely on the dashed state, or demote one control to outline/ghost); on Deals empty, drop duplicate header CTA or make the empty-state action secondary.

## Task candidates

- [ ] Update `MobileBottomNav` `/analyze` entry: icon and label aligned with **Analyze deal** (`app/components/mobile-bottom-nav.tsx`).
- [ ] Define and implement a single **add property** URL strategy (quick vs full) for `app-nav.tsx` footer, `dashboard/page.tsx` title bar + compare upsell, and workspace empty states (`modeling-workspace.tsx`, `mortgage-workspace.tsx`); match onboarding and dashboard empty CTAs.
- [ ] **Properties** zero-properties layout: remove redundant accent **Add property** in the header row or merge empty-state + header into one clear primary (`app/app/(app)/properties/page.tsx`).
- [ ] **Deals** zero-deals layout: single primary path to `/analyze` — remove duplicate accent from page header or empty-state card (`app/app/(app)/deals/page.tsx`, `deals-list.tsx`).

## Re-test checklist

- [ ] Mobile: `/analyze`, `/analyze?deal=*`, `/calculators` — icons, labels, and active states are distinct and correct.
- [ ] Add-property flows from onboarding, dashboard (empty vs populated), Properties, sidebar footer, Modeling/Mortgage empty states land on the intended wizard vs quick mode.
- [ ] Properties and Deals pages at zero items show at most one dominant indigo CTA per scroll “hero” region.
- [ ] `npm run check` when code changes are made.

## Next trigger and cadence

- **Trigger:** After shipping mobile nav or add-property URL consolidation, or quarterly.
- **Recommended next run window:** After mobile `/analyze` and empty-state CTA cleanup ship; otherwise calendar **2026-08-01** (quarterly).
