# Mobile experience audit — 2026-03-30 (Run 4)

**Criteria:** [docs/qa/mobile-experience-audit.md](../../qa/mobile-experience-audit.md)  
**Template:** [docs/process/audit-report-template.md](../../process/audit-report-template.md)  
**ROOT reviewed:** `RealEstatePortfolio` (app under `app/`)

## Executive summary

- **Overall:** Mobile architecture is coherent: `useIsMobile()` aligns with Tailwind `md` (767px), `MobileToolShell` is `md:hidden` with shared chrome (`MobileSummaryRail`, optional `MobileModeSwitcher`), and all four inventory surfaces (Deal Analyzer, Modeling, Mortgage workspace, Public calculator) branch on `isMobile` or wrap mobile-only UI. Vitest is green and includes `mobile-tool-shell.test.tsx`.
- **Continuity vs prior:** There is **no** prior `docs/audits/feature/2026-03-30-mobile-experience-audit-*.md` in this folder. [Run 4 feature/UX audit](2026-03-30-feature-ux-audit-4.md) references `mobile-tool-shell.tsx` in evidence only; it does **not** replace a viewport/touch matrix. This run is **static code review + test run**, not a full manual matrix at 320–768px or a real-device pass (per criteria §2).
- **Top gaps:** (1) Mobile nav drawer has close paths (backdrop, Escape, swipe, route change) but **no focus trap / initial focus** into the drawer—risk for keyboard and screen-reader users (C1/J1). (2) **No navigation guard** for unsaved Deal Analyzer edits on back/close—unlike `/properties/new` draft `beforeunload` (`draft-context.tsx`). (3) **Safe-area insets** and **`prefers-reduced-motion`** are not used in reviewed app shell/components—needs device/simulator verification (A4, J3).
- **Recommendation:** Run the **manual viewport matrix** and **one real device** from [mobile-experience-audit.md §2](../../qa/mobile-experience-audit.md) before release; prioritize drawer focus management and (if product requires) unsaved-change warning on Analyze.

---

## Section 4 — Audit criteria (Pass / Fail / N/A)

**Legend:** **Pass** / **Fail** / **N/A** / **Unverified** (manual or device required this run). Severity only where failed or materially unverified.

### A. Responsive layout and breakpoints

| ID | Status | Notes |
|----|--------|--------|
| A1 | Unverified | Primary column overflow not exercised in devtools this run. `MobileToolShell` root uses `overflow-hidden` (`mobile-tool-shell.tsx`); consumers use responsive grids on desktop. |
| A2 | Pass | `useIsMobile` uses `(max-width: 767px)` (`lib/use-is-mobile.ts`); shell uses `md:hidden`. Public calculator uses `md:hidden` / `hidden lg:grid` (`public-calculator.tsx`). |
| A3 | Pass | `useIsMobile` server snapshot `false` + `useSyncExternalStore` matches [mobile-shell-verification.md](../../qa/mobile-shell-verification.md) SSR note; no code-level infinite-load pattern observed. |
| A4 | Unverified | No `env(safe-area-inset-*)` in `app/` grep; fixed header `pt-16` on main (`app-layout-client.tsx`)—notch/home indicator need on-device check. |

### B. Mobile shells and dense tools

| ID | Status | Notes |
|----|--------|--------|
| B1 | Pass | **Deal Analyzer:** `eyebrow`, `title`, `context`, `summaryItems`, `footer` (`deal-analyzer-form.tsx`). **Modeling / Mortgage:** eyebrow, title, context, summary rail; no footer (by layout). **Public calculator:** eyebrow, title, `description`, context, summary rail (`public-calculator.tsx`). |
| B2 | Unverified | Context blocks differ per surface; overlap/tap targets need manual pass. |
| B3 | Pass (code) | `MobileCollapsible` expands inline in page flow (`mobile-collapsible.tsx`); no fixed-height overflow trap in component. |
| B4 | Unverified | Possible KPI overlap between rail and body—spot-check per surface. |

### C. Navigation and IA

| ID | Status | Notes |
|----|--------|--------|
| C1 | Partial | Drawer: open button `size-11` (~44px), backdrop click, Escape, left-swipe on drawer, `pathname` closes drawer (`app-layout-client.tsx`). **Missing:** focus trap, `aria-modal`, move focus into drawer—**severity: Medium** (see findings). |
| C2 | Pass (code) | Dashboard exposes `WorkspaceNavMobile` links (`dashboard/page.tsx`); hamburger → `AppNav` for other routes. |
| C3 | Pass | `PropertyDetailTabs` reads `tab` from `searchParams`, redirects `mortgage`/`projections` to workspace routes (`property-detail-tabs.tsx`). |
| C4 | Partial | Draft flow uses `beforeunload` (`draft-context.tsx`). **Deal Analyzer** has no unsaved navigation guard—**severity: Medium** if users expect warn-before-leave. |

### D. Touch targets and gestures

| ID | Status | Notes |
|----|--------|--------|
| D1 | Unverified | Menu button 44×44 class; `MobileModeSwitcher` buttons `py-2.5`; full matrix not measured. |
| D2 | Unverified | Adjacent destructive vs primary spacing—manual. |
| D3 | Unverified | Recharts in collapsibles—nested scroll feel needs device. |

### E. Forms and inputs

| ID | Status | Notes |
|----|--------|--------|
| E1 | Pass (pattern) | `CurrencyInput` uses `inputMode="decimal"` (`currency-input.tsx`). |
| E2 | Unverified | Address/autocomplete varies by field—spot-check sign-in vs property forms. |
| E3 | Unverified | Native `<select>` behavior—device. |
| E4 | Unverified | Validation visibility—manual. |

### F. Typography, copy, and density

| ID | Status | Notes |
|----|--------|--------|
| F1 | Unverified | 320px readability not measured. |
| F2 | N/A | Policy alignment not re-proven this run (see `analytics-math-policy.md` for math ownership). |
| F3 | Unverified | Summary chips abbreviations—manual. |

### G. Visual design and consistency

| ID | Status | Notes |
|----|--------|--------|
| G1 | Unverified | Tokens used in mobile components; full design-spec conformance not audited. |
| G2 | Unverified | Loading/empty/error on async views—spot-check. |
| G3 | Unverified | Icon+text wrap—manual. |

### H. Charts and data visualization

| ID | Status | Notes |
|----|--------|--------|
| H1–H3 | Unverified | Recharts `ResponsiveContainer`, `Tooltip`, `Legend` in modeling/mortgage/projections—viewport and tap tooltips need manual. |

### I. Performance and perceived performance

| ID | Status | Notes |
|----|--------|--------|
| I1–I3 | Unverified | No Lighthouse mobile run this pass. |

### J. Accessibility (mobile-relevant)

| ID | Status | Notes |
|----|--------|--------|
| J1 | Partial | Drawer focus order not implemented; property tabs use `aria-label` on nav (`property-detail-tabs.tsx`). |
| J2 | Unverified | Contrast—design review / tooling. |
| J3 | N/A (gap) | No `prefers-reduced-motion` usage in `app/` grep—**Low** if animations added without reduction. |

### K. Authentication, billing, and plan limits

| ID | Status | Notes |
|----|--------|--------|
| K1–K3 | Unverified | Clerk/pricing/plan surfaces not exercised this run (Clerk components responsive by default; verify 320px). |

### L. Security and privacy

| ID | Status | Notes |
|----|--------|--------|
| L1–L2 | Unverified | Keyboard obscuring fields; shared device session—Clerk behavior. |

### M. Cross-surface consistency

| ID | Status | Notes |
|----|--------|--------|
| M1–M3 | Pass (intent) | Shared `formatCurrency` and metric helpers in code paths; full cross-surface naming not re-audited. |

### N. Desktop non-regression

| ID | Status | Notes |
|----|--------|--------|
| N1 | Pass | Consumers return full desktop layouts when `!isMobile` (e.g. `deal-analyzer-form.tsx` grid); public calculator shows `lg:grid` desktop columns. |
| N2 | Pass | Mobile paths are additive branches; desktop sections retain controls (e.g. `projections-tab-content.tsx`, `mortgage-tab-content.tsx`). |

### O. Automated coverage

| ID | Status | Notes |
|----|--------|--------|
| O1 | Pass | `npm run test`: **21 files, 133 tests passed** (2026-03-30). Includes `components/mobile-tool-shell.test.tsx` (eyebrow/title/description, context, summary, footer, modes vs children, `md:hidden`). |
| O2 | N/A | Math remains in `lib/` tests per [test-infrastructure-review.md](../../qa/test-infrastructure-review.md); not re-run for semantics. |

### P. Marketing and public pages

| ID | Status | Notes |
|----|--------|--------|
| P1–P2 | Unverified | Landing/calculator scannability and SEO—manual narrow viewport. |

---

## Severity-ranked findings

### Critical

- None identified in this **code-review** pass.

### High

- None identified. (Horizontal overflow or broken paywall on device could elevate—needs manual matrix.)

### Medium

- **Mobile drawer focus and modality** — Backdrop and Escape close the drawer, but there is no focus trap, no `aria-modal`, and no documented move of focus to the first link inside the drawer when opened. Keyboard and assistive-tech users may tab behind the overlay or lose context. — Evidence: `app/app/(app)/app-layout-client.tsx` (drawer + backdrop).

- **Deal Analyzer: no unsaved-change warning** — Unlike the property draft flow (`beforeunload` in `draft-context.tsx`), `deal-analyzer-form.tsx` does not guard navigation/back with a warning while the user has edited fields. Risk of losing in-progress analysis on mobile back gesture or accidental navigation. — Evidence: `deal-analyzer-form.tsx`, `draft-context.tsx`.

### Low

- **Safe-area and motion preferences** — No `env(safe-area-inset-*)` usage found in `app/`; animations may not respect `prefers-reduced-motion`. Verify on notched devices and with OS reduce-motion on. — Evidence: repo grep (absence).

- **Manual matrix not executed** — Criteria [§2 viewport matrix](../../qa/mobile-experience-audit.md#2-viewport-matrix-required) (320, 375, 390, 430, 768 boundary) and **at least one real device** for keyboard, scroll, and `<select>` were not performed in this run.

---

## Evidence reviewed

- Criteria: `docs/qa/mobile-experience-audit.md`
- Related: `docs/qa/mobile-shell-verification.md`, `docs/qa/test-infrastructure-review.md`
- Prior UX audit (not mobile-specific): `docs/audits/feature/2026-03-30-feature-ux-audit-4.md`
- **Shell & hooks:** `app/components/mobile-tool-shell.tsx`, `mobile-tool-shell.test.tsx`, `mobile-summary-rail.tsx`, `mobile-mode-switcher.tsx`, `mobile-collapsible.tsx`, `mobile-section-card.tsx`, `app/lib/use-is-mobile.ts`
- **Consumers:** `app/app/(app)/analyze/deal-analyzer-form.tsx`, `app/app/(app)/properties/[id]/projections-tab-content.tsx`, `app/app/(app)/properties/[id]/mortgage-tab-content.tsx`, `app/components/marketing/public-calculator.tsx`
- **App shell / nav:** `app/app/(app)/app-layout-client.tsx`, `app/app/(app)/properties/[id]/property-detail-tabs.tsx`, `app/app/(app)/dashboard/workspace-nav-mobile.tsx`
- **Tests:** `npm run test` in `app/` (pass)

### Assumptions / limits

- **Static + automated only:** No DevTools viewport sweep, no Lighthouse mobile, no iOS/Android device session, no screen reader pass.
- Findings are **not** a substitute for Section 2 matrix or sign-off in §7 of the criteria doc.

---

## Risk & impact assessment

- **Medium** findings affect **WCAG-aligned navigation** and **data loss risk** on Analyze for users who navigate away without saving—higher on mobile where back gestures are common.
- **Low** findings are compliance/polish and process (manual QA gap).

---

## Recommendations (prioritized)

1. **Manual QA:** Run the §2 viewport matrix and one real device; record horizontal scroll, chart legibility, and native controls.
2. **Drawer a11y:** Add focus trap (or focus move + restore), `aria-modal`/`aria-hidden` on background, and verify Escape/backdrop behavior with VoiceOver/TalkBack spot-check.
3. **Analyze persistence UX:** Decide product policy; if “warn before leave” is required, align with draft pattern or autosave cues.

---

## Task candidates (optional)

- [ ] Mobile drawer: focus management and modal semantics (`app-layout-client.tsx`).
- [ ] Deal Analyzer: unsaved changes warning or autosave indicator (`deal-analyzer-form.tsx`).
- [ ] Safe-area padding for fixed chrome and `prefers-reduced-motion` audit for animated UI.
- [ ] Execute full §4 checklist with screenshots after next UI change touching `MobileToolShell` consumers.

---

## Re-test checklist

- [ ] 320 / 375 / 390 / 430 / 767–768px on Deal Analyzer, Modeling, Mortgage, Public calculator
- [ ] Real device: keyboard types, scroll, `<select>`
- [ ] Drawer: keyboard tab order, screen reader
- [ ] `npm run test` after any fix

---

## Next trigger and cadence

- **Trigger:** Before major release, large mobile UI refactor, or suspected mobile regression ([criteria §When to run](../../qa/mobile-experience-audit.md)).
- **Recommended next run:** After drawer/a11y or Analyze persistence work, or next monthly mobile sweep; follow with PM triage to `docs/tasks.md`.

---

## Sign-off (criteria §7)

| Role | Action |
|------|--------|
| Auditor | This report — criteria checklist filled; findings and limits recorded. |
| PM | Triage; promote tasks. |
| Builder | Implement per `docs/tasks.md` / builder rules. |

*Traceability: criteria doc [mobile-experience-audit.md](../../qa/mobile-experience-audit.md) (last updated 2026-03-30).*
