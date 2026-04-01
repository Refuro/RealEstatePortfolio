# Mobile Experience Audit — 2026-04-01

**Lane:** Mobile experience (narrow viewport, touch, `md:hidden` shells, safe-area, desktop parity).  
**Criteria:** [docs/qa/mobile-experience-audit.md](../../qa/mobile-experience-audit.md)  
**Process:** [docs/process/mobile-experience-audit-process.md](../../process/mobile-experience-audit-process.md)

This pass is **audit-only** (static code review + automated tests). **Viewport matrix (320-768px) and real-device checks** were not executed in a browser or on hardware during this run; criteria requiring runtime interaction are marked **Unverified**.

## Executive summary

- Overall mobile shell architecture is healthy: `MobileToolShell` coverage is present across analyzer/modeling/mortgage/public calculator surfaces, with CI-backed component tests.
- Safe-area handling improved versus prior baseline: app chrome and analyzer sticky bar now include bottom inset-aware padding.
- Main remaining risk is accessibility semantics on narrow viewports: Modeling and Mortgage pages still omit a true page-level `<h1>` on mobile when data exists.
- Mobile nav drawer behavior (open/focus/escape/close) is implemented for both app and landing navigation; touch-target consistency has one low-severity gap on landing hamburger sizing.

## Section 4 — Criteria checklist (systematic)

**Legend:** Pass | Fail | N/A | Unverified (needs browser/device)

### A. Responsive layout and breakpoints

| ID | Result | Notes / evidence |
|----|--------|------------------|
| A1 | Unverified | No runtime viewport pass performed at 320-430px for overflow checks. |
| A2 | Pass | Mobile shells are `md:hidden` and desktop containers remain `md:block`/`md:flex` (`mobile-tool-shell.tsx`, `app-layout-client.tsx`). |
| A3 | Unverified | `useIsMobile()` server snapshot is `false`; hydration behavior requires runtime verification (`use-is-mobile.ts`). |
| A4 | Pass (code) | App shell and analyzer sticky bar include `env(safe-area-inset-bottom)` handling (`globals.css`, `app-layout-client.tsx`, `deal-analyzer-form.tsx`). |

### B. Mobile shells and dense tools

| ID | Result | Notes / evidence |
|----|--------|------------------|
| B1 | Pass | `MobileToolShell` used on Deal Analyzer, Modeling (`ProjectionsTabContent`), Mortgage (`MortgageTabContent`), and public calculators. |
| B2 | Unverified | Context blocks appear structured for narrow width, but overlap/tap ergonomics need runtime validation. |
| B3 | Pass | `MobileCollapsible` toggles progressive disclosure in-flow; no internal overflow trap logic found (`mobile-collapsible.tsx`). |
| B4 | Unverified | Rail/body metric redundancy needs viewport/device scan. |

### C. Navigation and IA

| ID | Result | Notes / evidence |
|----|--------|------------------|
| C1 | Pass | App and landing drawers support open/close, Escape, initial focus, and modal semantics (`app-layout-client.tsx`, `landing-nav.tsx`). |
| C2 | Pass | Mobile drawer provides direct access to core app routes via `AppNav`. |
| C3 | Pass | Mobile workspace links and query synchronization are wired for deep-link behavior (`mortgage-workspace.tsx`, property tab links). |
| C4 | Unverified | Unsaved-state back behavior not runtime-tested in this pass. |

### D. Touch targets and gestures

| ID | Result | Notes / evidence |
|----|--------|------------------|
| D1 | Partial | App menu and `MobileCollapsible` meet ~44px (`size-11`/`min-h-11`), landing hamburger remains `size-10` (40px) (`landing-nav.tsx`). |
| D2 | Unverified | Adjacent target spacing needs runtime mis-tap check. |
| D3 | Unverified | Scroll/gesture behavior across chart + long form surfaces not runtime-tested. |

### E. Forms and inputs

| ID | Result | Notes / evidence |
|----|--------|------------------|
| E1 | Pass (code) | Numeric/currency fields use `inputMode` and typed inputs across audited surfaces (`deal-analyzer-form.tsx`, calculators). |
| E2 | Unverified | Autofill behavior requires real browser/device checks. |
| E3 | Unverified | Native select picker UX requires iOS/Android verification. |
| E4 | Unverified | Mobile validation visibility/association not runtime-tested. |

### F. Typography, copy, and density

| ID | Result | Notes / evidence |
|----|--------|------------------|
| F1 | Unverified | Readability at 320px requires visual run. |
| F2 | Unverified | Label consistency with policy needs cross-surface runtime/sample review. |
| F3 | Unverified | Abbreviation clarity needs live UI spot-check. |

### G. Visual design and consistency

| ID | Result | Notes / evidence |
|----|--------|------------------|
| G1 | Unverified | No full visual token conformance pass performed. |
| G2 | Unverified | Loading/empty/error states not exhaustively replayed on mobile widths. |
| G3 | Unverified | Icon/text wrapping needs runtime viewport checks. |

### H. Charts and data visualization

| ID | Result | Notes / evidence |
|----|--------|------------------|
| H1-H3 | Unverified | Chart legibility, tap tooltips, legend behavior not runtime-tested. |

### I. Performance and perceived performance

| ID | Result | Notes / evidence |
|----|--------|------------------|
| I1-I3 | Unverified | No Lighthouse mobile/profile pass in this audit. |

### J. Accessibility (mobile-relevant)

| ID | Result | Notes / evidence |
|----|--------|------------------|
| J1 | Partial / Fail | Modeling and Mortgage pages hide the `<h1>` in `md:block` desktop header; mobile shell title is `<h2>`, so no page-level heading on mobile data-present state. |
| J2 | Unverified | Contrast not measured in runtime tools. |
| J3 | Pass | Reduced-motion-respecting transition classes are present in app shell interactions. |

### K. Authentication, billing, and plan limits

| ID | Result | Notes / evidence |
|----|--------|------------------|
| K1-K3 | Unverified | Clerk and plan-limit flows not runtime-verified this pass. |

### L. Security and privacy (mobile context)

| ID | Result | Notes / evidence |
|----|--------|------------------|
| L1-L2 | Unverified | Keyboard/session privacy behavior requires device workflows. |

### M. Cross-surface consistency

| ID | Result | Notes / evidence |
|----|--------|------------------|
| M1-M3 | Unverified | Naming/currency/date parity not fully diffed across all mobile surfaces. |

### N. Desktop non-regression (constraint)

| ID | Result | Notes / evidence |
|----|--------|------------------|
| N1 | Pass | Desktop layouts remain present at `md`+; mobile shell is scoped to narrow widths via `md:hidden`. |
| N2 | Pass (code) | Mobile presentation layer does not remove desktop business logic paths. |

### O. Automated coverage (confidence)

| ID | Result | Notes / evidence |
|----|--------|------------------|
| O1 | Pass | `npm run test` green on 2026-04-01: 38 files, 237 tests passed; includes `mobile-tool-shell.test.tsx`. |
| O2 | Pass | No indication that mobile shell changes alter `lib/` math behavior; math remains policy/unit-test backed. |

### P. Marketing and public pages (mobile)

| ID | Result | Notes / evidence |
|----|--------|------------------|
| P1 | Unverified | Public pages not runtime-viewed across 320/375/390/430 in this pass. |
| P2 | Unverified | SEO-discovery interaction behavior not runtime tested in this lane run. |

## Severity-ranked findings

### Critical

- None identified in this audit pass.

### High

- Mobile page-level heading gap on workspace routes — On mobile widths with existing properties, Modeling and Mortgage headings are inside desktop-only wrappers (`hidden ... md:block`), while `MobileToolShell` contributes an `<h2>` title, leaving no true page-level `<h1>` for those routes — `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`, `app/components/mobile-tool-shell.tsx`.

### Medium

- None identified in this focused pass.

### Low

- Landing nav hamburger touch target is `size-10` (40x40), below the common 44x44 mobile target floor used elsewhere in app shell controls (`size-11`) — `app/components/landing-nav.tsx`, `app/app/(app)/app-layout-client.tsx`.

## Evidence reviewed

- Process and criteria docs:
  - `docs/process/mobile-experience-audit-process.md`
  - `docs/qa/mobile-experience-audit.md`
  - `docs/qa/mobile-shell-verification.md`
  - `docs/process/audit-report-template.md`
- Prior mobile audit baseline:
  - `docs/audits/feature/2026-03-31-mobile-experience-audit.md`
- Mobile shell + related implementation:
  - `app/components/mobile-tool-shell.tsx`
  - `app/components/mobile-tool-shell.test.tsx`
  - `app/components/mobile-collapsible.tsx`
  - `app/lib/use-is-mobile.ts`
  - `app/app/(app)/analyze/deal-analyzer-form.tsx`
  - `app/app/(app)/properties/[id]/projections-tab-content.tsx`
  - `app/app/(app)/properties/[id]/mortgage-tab-content.tsx`
  - `app/app/(app)/modeling/modeling-workspace.tsx`
  - `app/app/(app)/mortgage/mortgage-workspace.tsx`
  - `app/app/(app)/app-layout-client.tsx`
  - `app/components/landing-nav.tsx`
  - `app/app/globals.css`
  - `app/app/layout.tsx`
- Automated evidence:
  - `npm run test` (Vitest): 38 passed files, 237 passed tests.

**Assumptions/limits:** No real-device verification, no browser-based viewport matrix run, and no Lighthouse/mobile performance profiling in this audit pass.

## Risk & impact assessment

- The high-severity heading landmark gap affects assistive-tech navigation on two high-use mobile workspaces and increases accessibility compliance risk.
- The low-severity landing hamburger sizing issue is unlikely to block flows but can increase mis-taps and inconsistency across public vs app navigation experiences.
- Most remaining criteria are currently unverified due to absent runtime/mobile-device execution, so residual exposure is moderate until a device-backed pass is completed.

## Recommendations (prioritized)

1. Add a page-level heading on mobile for Modeling and Mortgage states with existing properties (e.g., mobile-visible or visually-hidden `<h1>` near workspace root).
2. Normalize landing nav mobile trigger to minimum 44x44 touch area (`size-11`) for parity with app shell.
3. Run a runtime/mobile-device matrix pass (320/375/390/430 and 767/768 boundary + one physical device) to resolve Unverified criteria and confirm no overflow/touch/scroll regressions.

## Task candidates (optional)

- [ ] Add mobile-accessible `<h1>` landmarks for Modeling and Mortgage workspaces when property data is present.
- [ ] Increase `LandingNav` menu trigger from `size-10` to `size-11`.
- [ ] Execute device-backed mobile viewport regression pass and log evidence for all Unverified criteria.

## Re-test checklist

- [ ] Verify mobile Modeling route exposes a page-level heading landmark and preserves desktop header behavior.
- [ ] Verify mobile Mortgage route exposes a page-level heading landmark and preserves desktop header behavior.
- [ ] Verify landing nav trigger touch target is >=44x44 and still matches visual design.
- [ ] Verify no regression in mobile drawer open/focus/escape/close behavior after any nav changes.
- [ ] Run `npm run test` after any implementation changes.

## Next trigger and cadence

- Trigger: Before next release involving app shell/navigation/workspace UI changes.
- Recommended next run date/window: 2026-05-01 or immediately after mobile layout/navigation refactors.
