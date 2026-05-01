# Feature / UX / IA Audit — 2026-04-30

## Executive summary

- **Overall:** Sidebar IA remains clear (Portfolio → Tools → Account), with Analyze page copy aligned to **Analyze deal**. Properties list exposes both full add and **Quick add** once data exists; several **Add property** entry points omit `mode=quick` while onboarding and dashboard empty-state still anchor on quick add.
- **Top risks:** Mobile bottom nav keeps a **Calculator** icon and **Analyze** label for `/analyze`, diverging from the sidebar’s **Analyze deal** + **ClipboardList** metaphor and from the Analyze page `<h1>`. Users with zero properties hit **different primary CTAs** on Dashboard empty (**quick**) vs Properties empty (**full wizard**) vs global header/tool CTAs (**full** by default).
- **Consistency:** Naming for the Deal Analyzer oscillates (**Analyze deal** / **Analyze a deal** / **Analyze**) across chrome and CTAs—manageable but adds scan friction for passive landlords juggling multiple tabs.
- **Recommendation:** Normalize mobile Analyze affordances with sidebar/page language and one icon strategy; decide a single rule for when `mode=quick` is the primary “get value” path and propagate it across dashboard chrome, Properties zero-state, and sidebar footer—as a documented constant/workflow—before deeper IA reshuffles.

## Severity-ranked findings

### Critical

- None identified in this static review (no verified blocked journeys or catastrophic dead-ends without live-session testing).

### High

- **Mobile `/analyze`: calculator icon + “Analyze” label vs product language** — Bottom nav routes to the Deal Analyzer but uses `Calculator` and the truncated label **Analyze**. Sidebar lists **Analyze deal** with `ClipboardList`; the Analyze route uses `<h1>Analyze deal</h1>`. **Impact:** Users may conflate Deal Analyzer with the **Calculators** hub (sidebar also uses `Calculator` there), reducing trust in nav semantics on small screens. **Evidence:** `app/components/mobile-bottom-nav.tsx` (`NAV_ITEMS`); `app/app/(app)/app-nav.tsx` (`toolsNav`); `app/app/(app)/analyze/page.tsx` (heading).

### Medium

- **Contradiction: Dashboard empty state vs Dashboard chrome property CTAs** — Empty-state primary pushes **`/properties/new?mode=quick`** (`dashboard-empty-state-ctas.tsx`), aligned with signup redirect and onboarding patterns. Once the dashboard renders the standard title bar, **Add property** targets **`/properties/new`** without `mode=quick` (`dashboard/page.tsx` title bar); the single-property “Compare properties side by side” upsell also links **`/properties/new`**. **Impact:** The same persona gets “fast capture” onboarding in one mood and full wizard defaults in another without on-screen explanation—same issue class as Modeling/Mortgage empty states cited in earlier audits, extended to **persisted-dashboard** surfaces.

- **Properties list: Quick add invisible on zero-state** — With one or more properties, the header offers **Add property** (`/properties/new`) plus a **Quick add** text link (`/properties/new?mode=quick`). With **zero** properties, the dashed empty-state primary is **Add your first property** → `/properties/new` only—no mirrored quick entry even though Dashboard empty favors quick (`properties/page.tsx` header vs zero-state block). **Impact:** New users navigating Properties first see a heavier default than users who landed on Dashboard or completed onboarding panels.

### Low

- **Deal Analyzer naming variance across chrome** — **Analyze deal** (sidebar, Analyze page heading), **Analyze a deal** (Dashboard title-bar secondary button), **Analyze** (mobile tab). **Impact:** Minor wayfinding/search cost; support and docs pick up mixed strings.

- **Dual pricing URLs remain** — Public **`/pricing`** vs authenticated **`/plans`** (Plans in sidebar); naming and bookmarks can diverge. **Evidence:** `app/app/pricing/page.tsx`; `app/app/(app)/plans/page.tsx`; `app/app/(app)/app-nav.tsx` account nav.

### High-value tools buried on mobile (carry-forward)

- Sidebar **Tools** lists six destinations; mobile pins Dashboard, Properties, Analyze, plus **More** for the drawer. Modeling, Mortgage, Refinance, Calculators, Deals require an extra gesture. **Evidence:** `app/app/(app)/app-nav.tsx`; `app/components/mobile-bottom-nav.tsx`.

## Evidence reviewed

- **Process:** `docs/process/feature-ux-audit-process.md`
- **Template:** `docs/process/audit-report-template.md`
- **Policies / specs:** `docs/policies/design-spec.md` (journeys, hierarchy intent); `docs/policies/analytics-math-policy.md` ("Clarity over density," labeling expectations)
- **Surfaces (read-only):**
  - Shell / nav: `app/app/(app)/layout.tsx`, `app/app/(app)/app-nav.tsx`, `app/components/mobile-bottom-nav.tsx`
  - Dashboard: `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/dashboard/dashboard-empty-state-ctas.tsx`
  - Properties: `app/app/(app)/properties/page.tsx`
  - Analyze: `app/app/(app)/analyze/page.tsx`
  - Modeling (sample workspace pattern): `app/app/(app)/modeling/modeling-workspace.tsx` (empty-state `href` pattern unchanged on spot-check)
  - Pricing / conversion: `app/app/pricing/page.tsx`, `app/app/(app)/plans/page.tsx` (referenced for dual-surface note)
  - Marketing home (public calculator links naming): `app/app/page.tsx` (`CALCULATOR_LINKS`)

**Assumptions / limits:** Static code and copy review only—no moderated usability tests, session replay, or viewport screenshots in this pass. Prior audit files were not treated as authoritative evidence; overlapping items were re-verified against current paths.

## Risk & impact assessment

- **High:** Misleading mobile Analyze affordance persists for every phone session; accidental alignment with **Calculators** is plausible given duplicated calculator iconography in the IA.
- **Medium:** Split “quick vs full” defaults may lengthen time-to-first-portfolio-view and create uneven data completeness depending on landing page and muscle memory around **Quick add**.
- **Low:** Naming drift affects documentation and heuristic clarity more than blocking tasks.
- **Likelihood:** Mobile nav friction is ubiquitous; Properties zero-state mismatch triggers only at portfolio size zero but affects the earliest funnel moment.

## Recommendations (prioritized)

1. **Mobile Deal Analyzer parity** — Change bottom-nav icon (e.g., match `ClipboardList` or another non-calculator metaphor) and label (e.g., **Deal** or **Analyze deal** within fit constraints) so `/analyze` reads consistently with sidebar and Analyze page semantics; verify active states sub-routes (`/analyze?deal=…`).
2. **`mode=quick` policy** — Document when quick add is primary vs full wizard (empty portfolio, trials, sidebar footer, dashboard upsells), then converge implementation via a shared href helper once product signs off—starting with Dashboard title bar / upsell CTAs and Properties zero-state consistency with Dashboard empty/onboarding.
3. **Mobile Tools exposure check** — If analytics show Modeling/Mortgage/Deals drop-off on viewport &lt;768px, test promoting one additional pinned slot or renaming **More** to signal “Mortgage & tools.”

## Task candidates

- [ ] Update `MobileBottomNav` `/analyze` item: icon + label aligned with Analyze deal semantics (`mobile-bottom-nav.tsx`).
- [ ] Decide default `href` for “Add property” across dashboard populated header, single-property upsell, Properties empty state, and `AppNav` footer; implement via shared constant per policy.
- [ ] Add **Quick add** (or make quick primary) on Properties zero-state consistent with Dashboard empty/onboarding expectations (`properties/page.tsx`).

## Re-test checklist

- [ ] Mobile: `/analyze`, `/analyze?deal=*`, calculators hub—icons and active states behave as expected.
- [ ] Add-property flows from Dashboard (empty vs populated), Properties (empty vs list header), onboarding, sidebar footer land on intentional wizard vs quick mode.
- [ ] `npm run check` when code changes are made.

## Next trigger and cadence

- **Trigger:** After shipped navigation/onboarding tweaks, major Properties or Analyze changes, or quarterly.
- **Recommended next run window:** After any mobile-nav or `mode=quick` consolidation ships; otherwise calendar **2026-07-30** (quarterly).
