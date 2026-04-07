# Mobile Experience Audit — 2026-04-07

**Canonical criteria:** [`docs/qa/mobile-experience-audit.md`](../../qa/mobile-experience-audit.md)  
**Lane process:** [`docs/process/mobile-experience-audit-process.md`](../../process/mobile-experience-audit-process.md)  
**Prior run:** [`2026-04-05-mobile-experience-audit.md`](2026-04-05-mobile-experience-audit.md)

---

## Executive summary

- **Overall health:** Mobile infrastructure is coherent: `viewportFit: "cover"` in `app/app/layout.tsx`, safe-area padding on the authenticated shell (`AppLayoutClient` main + `MobileBottomNav`), `MobileToolShell` with `MobileStatStrip` summary and optional footer, and `useIsMobile` aligned to `(max-width: 767px)`. Automated tests (`npm run test`, Vitest) passed in this run, including `MobileToolShell` and `MobileBottomNav` unit tests.
- **Top risks:** (1) App nav drawer does not return focus to the hamburger after close — accessibility and keyboard/assistive-tech parity gap vs marketing `LandingNav`. (2) Several high-frequency tap targets on **Properties** card footers and **public calculator** CTAs use `py-1.5` / `py-2.5` without `min-h-[44px]`, likely under the ~44×44px guideline on narrow viewports. (3) `MobileCollapsible` still lacks `aria-expanded` / `aria-controls` for expand state.
- **Scope limits:** This pass is **static code review + CI tests** only. The viewport matrix (320–430–768px), real-device checks (keyboard, scroll momentum, native `<select>`, notch safe-area), Lighthouse mobile, and runtime horizontal-scroll verification were **not** executed here and remain human-only per [`docs/qa/mobile-experience-audit.md`](../../qa/mobile-experience-audit.md) §2.
- **Recommendation:** Promote the focus-return and touch-target fixes via PM triage to `docs/tasks.md`; schedule a short real-device smoke (one iOS or Android) before the next major release.

---

## Severity-ranked findings

### Critical

- None identified in static review.

### High

- None identified in static review (no P0/P1-class blockers found in code alone).

### Medium

- **App drawer focus on close** — After closing the mobile nav dialog, focus is not programmatically returned to the menu trigger. Opening focuses the first focusable item in the panel (`useEffect` on `drawerOpen`); `closeDrawer` only calls `setDrawerOpen(false)` with no `ref` on the hamburger — `app/(app)/app-layout-client.tsx` (e.g. `closeDrawer` ~line 80, header button ~183–190). Impacts WCAG 2.4.3 (Focus Order) / keyboard and screen-reader UX. **Severity mapping:** P2 in QA rubric.
- **Properties list card actions below touch target guideline** — Primary and secondary links on property cards use `px-3 py-1.5` or `px-2.5 py-1` without `min-h-[44px]` — `app/(app)/properties/page.tsx` (e.g. “Open property” ~519–524, ~617–622; sibling links ~525–544, ~623–642). **Severity mapping:** P2 (D1).
- **Refinance chart tooltip width** — Recharts `<Tooltip>` custom content is a `div` with padding but no `max-w-*` / truncation — `app/(app)/refinance/refinance-workspace.tsx` (~491–516). Long currency strings can overflow small viewports on tap. **Severity mapping:** P2 (H2).
- **`MobileModeSwitcher` segments** — Mode buttons use `py-2.5 text-sm` only — `components/mobile-mode-switcher.tsx` (~27–35). Vertical hit area may fall short of ~44px without `min-h-[44px]`. **Severity mapping:** P2 (D1).

### Low

- **`MobileCollapsible` missing expanded state semantics** — Toggle is a `<button>` with `min-h-[44px]` but no `aria-expanded` (or `aria-controls`) — `components/mobile-collapsible.tsx`. **Severity mapping:** P3 (J1).
- **Hydration layout swap on mobile** — `useIsMobile` uses `getServerSnapshot: () => false` — `lib/use-is-mobile.ts`. Server renders desktop branch first; client switches to mobile after hydration. Documented tradeoff; not a console-error regression but visible flash — **Severity mapping:** P3 (A3 observation).
- **QA doc vs implementation naming** — Criteria B1 in [`docs/qa/mobile-experience-audit.md`](../../qa/mobile-experience-audit.md) references `MobileSummaryRail`; the shell uses `MobileStatStrip` inside `components/mobile-tool-shell.tsx`. Traceability only; behavior matches intent.

---

## Evidence reviewed

| Category | Paths / artifacts |
|----------|-------------------|
| Breakpoint & hook | `app/lib/use-is-mobile.ts` |
| Viewport / safe-area prerequisite | `app/app/layout.tsx` (`viewportFit: "cover"`), `app/app/globals.css` (`.app-safe-area-top`, `.app-safe-area-bottom`) |
| App shell | `app/app/(app)/app-layout-client.tsx`, `app/components/mobile-bottom-nav.tsx` |
| Mobile tool shell | `app/components/mobile-tool-shell.tsx`, `app/components/mobile-stat-strip.tsx`, `app/components/mobile-mode-switcher.tsx`, `app/components/mobile-collapsible.tsx`, `app/components/mobile-context-bar.tsx` |
| `MobileToolShell` consumers | `deal-analyzer-form.tsx`, `projections-tab-content.tsx`, `mortgage-tab-content.tsx`, `refinance-workspace.tsx`, `add-property-wizard.tsx`, `components/marketing/public-calculator.tsx` (+ other marketing calculators) |
| Workspaces (context bars) | `modeling-workspace.tsx`, `mortgage-workspace.tsx` |
| Properties mobile density | `app/(app)/properties/page.tsx` |
| Tests | `app/components/mobile-tool-shell.test.tsx`, `app/components/mobile-bottom-nav.test.tsx`; full suite `npm run test -- --run` |
| Policies / process | `docs/qa/mobile-experience-audit.md`, `docs/process/mobile-experience-audit-process.md`, `docs/process/audit-report-template.md`, `docs/qa/mobile-shell-verification.md` |

---

## Risk & impact assessment

Unresolved **drawer focus** and **sub-44px targets** mainly hurt mobile users who rely on keyboard, switch control, or precise tapping on dense cards — a meaningful subset of landlords on phones. **Tooltip overflow** on refinance is secondary-path but undermines trust in chart readouts at the smallest widths. Likelihood is **medium** (common routes: Properties, drawer, refinance) with **moderate** user exposure on mobile share.

---

## Recommendations (prioritized)

1. Add a hamburger `ref` and restore focus in `closeDrawer` (and any path that dismisses the drawer) in `app-layout-client.tsx`, mirroring the marketing drawer pattern described in `.cursor/skills/veld-mobile/SKILL.md`.
2. Add `min-h-[44px]` (and `inline-flex items-center` where needed) to Properties card footer links and public calculator primary/secondary links; audit `py-1.5` / `py-2.5` link buttons under `md` for the same.
3. Constrain refinance chart tooltip content (`max-w-[min(100vw-2rem,…)]`, smaller type, or abbreviated currency) and retest at 320px in devtools or device.
4. Add `min-h-[44px]` to `MobileModeSwitcher` buttons; add `aria-expanded={open}` (and optional `id` + `aria-controls`) on `MobileCollapsible`.

---

## Task candidates (optional)

- [ ] Return focus to mobile hamburger when app nav drawer closes (`app-layout-client.tsx`).
- [ ] Raise Properties card CTA links to ≥44px hit height on mobile (`properties/page.tsx`).
- [ ] Add `aria-expanded` / optional `aria-controls` to `MobileCollapsible` (`mobile-collapsible.tsx`).
- [ ] Cap width / tighten copy for refinance line-chart tooltip (`refinance-workspace.tsx`).
- [ ] Add `min-h-[44px]` to `MobileModeSwitcher` segment buttons (`mobile-mode-switcher.tsx`).
- [ ] Real-device smoke: one phone, routes `/dashboard`, `/properties`, `/analyze`, `/refinance`, sign-in; confirm safe-area and native pickers.

---

## Re-test checklist

- [ ] Verify focus return after drawer open/close (keyboard + VoiceOver/TalkBack spot-check).
- [ ] Verify Properties card taps at 320px width (devtools or device).
- [ ] Verify refinance chart tooltip at 320px after any tooltip change.
- [ ] `npm run test` after code changes.
- [ ] `npm run check` when code changes are made (if used in this repo).

---

## Next trigger and cadence

- **Trigger:** Next major release, large responsive refactor, or suspected mobile regression.
- **Recommended next run:** Within **4–8 weeks** or before the next marketing/app shell change; pair with real-device pass from §2 of the QA doc.

---

## Appendix A — Viewport matrix (required by QA §2)

| Width (px) | This pass |
|------------|-----------|
| 320 / 375 / 390 / 430 | Not runtime-verified (static only) |
| 768 boundary | Verified in code via `md:hidden` / `hidden md:*` pairing on shell and layout |

**Real device:** Not verified this run.

---

## Appendix B — Criteria checklist (QA §4)

Legend: **Pass** = supported by code/tests; **Unverified** = needs device or devtools; **Gap** = known defect from review.

### A. Responsive layout and breakpoints

| # | Result | Notes |
|---|--------|--------|
| A1 | Unverified | Wrapping grids and `overflow-x-auto` patterns present on heavy surfaces; no full scroll audit. |
| A2 | Pass | `MobileToolShell` `md:hidden`; app shell `md:hidden` / `hidden md:flex`; calculator `md:hidden` + `hidden md:grid`. |
| A3 | Gap (P3) | Hydration branch swap via `useIsMobile` server snapshot `false`; no evidence of persistent errors. |
| A4 | Unverified | `env(safe-area-inset-*)` used on main, bottom nav, tool shell footer; needs notch hardware. |

### B. Mobile shells and dense tools

| # | Result | Notes |
|---|--------|--------|
| B1 | Pass | Eyebrow/title/`MobileStatStrip`/footer patterns present on analyzer, projections, mortgage, refinance, wizard, public + marketing calculators. QA doc name `MobileSummaryRail` is outdated vs `MobileStatStrip`. |
| B2 | Pass | `MobileContextBar` `min-h-[44px]`; workspace selects in subtitle. |
| B3 | Pass + Gap | Collapsibles expand inline; **Gap:** no `aria-expanded` on toggle (J1). |
| B4 | Unverified | Possible duplicate KPIs (e.g. analyzer) — product judgment at 320px. |

### C. Navigation and IA

| # | Result | Notes |
|---|--------|--------|
| C1 | Gap | Drawer open + focus into panel + Escape; **missing focus return** on close. |
| C2 | Pass | Bottom nav + More → menu event pattern. |
| C3 | Pass (static) | Mortgage/refinance query sync patterns present in workspace code. |
| C4 | Pass (static) | Dirty-state / draft patterns referenced in prior audits; not re-traced line-by-line here. |

### D. Touch targets and gestures

| # | Result | Notes |
|---|--------|--------|
| D1 | Gap | Properties card links, some marketing CTAs, `MobileModeSwitcher` likely &lt; 44px tall. Many other controls use `min-h-[44px]`. |
| D2 | Unverified | Spacing between destructive vs primary actions not exhaustively reviewed. |
| D3 | Unverified | Nested scroll in long forms not exercised. |

### E. Forms and inputs

| # | Result | Notes |
|---|--------|--------|
| E1 | Pass (sample) | e.g. `public-calculator.tsx` `text-base md:text-sm`, `inputMode` on numeric fields. |
| E2–E4 | Unverified | Autocomplete, native select UX, error association need device/forms pass. |

### F. Typography, copy, and density

| # | Result | Notes |
|---|--------|--------|
| F1–F3 | Unverified | 320px readability and abbreviation clarity need visual pass. |

### G. Visual design and consistency

| # | Result | Notes |
|---|--------|--------|
| G1–G3 | Unverified | Token alignment per `design-spec` not re-audited this run. |

### H. Charts and data visualization

| # | Result | Notes |
|---|--------|--------|
| H1 | Unverified | Chart legibility at mobile height not measured. |
| H2 | Gap | Refinance tooltip without `max-w` constraint. |
| H3 | Unverified | Legend behavior varies by chart. |

### I. Performance and perceived performance

| # | Result | Notes |
|---|--------|--------|
| I1–I3 | Unverified | No Lighthouse or scroll profiling this run. |

### J. Accessibility (mobile-relevant)

| # | Result | Notes |
|---|--------|--------|
| J1 | Gap | Drawer focus return; `MobileCollapsible` state not exposed to AT. |
| J2–J3 | Unverified | Contrast and reduced-motion not re-tested. |

### K. Authentication, billing, and plan limits

| # | Result | Notes |
|---|--------|--------|
| K1–K3 | Unverified | Clerk modals and plans pages need narrow-width device check. |

### L. Security and privacy

| # | Result | Notes |
|---|--------|--------|
| L1–L2 | Unverified | Session behavior as configured (Clerk). |

### M. Cross-surface consistency

| # | Result | Notes |
|---|--------|--------|
| M1–M3 | Unverified | Policy alignment spot-check only via related components. |

### N. Desktop non-regression

| # | Result | Notes |
|---|--------|--------|
| N1 | Pass | Desktop sidebar and `hidden md:*` content paths present. |
| N2 | Unverified | Full parity review out of scope for this narrow lane pass. |

### O. Automated coverage

| # | Result | Notes |
|---|--------|--------|
| O1 | Pass | `npm run test -- --run`: 51 files, 384 tests passed (2026-04-07). |
| O2 | Pass | No `lib/` math changes in this audit. |

### P. Marketing and public pages

| # | Result | Notes |
|---|--------|--------|
| P1 | Partial | `MobileToolShell` + sections on calculator; some CTAs lack explicit 44px min height. |
| P2 | Unverified | SEO vs interaction hiding not reviewed. |

---

*Audit completed: 2026-04-07 — static review + automated tests; human viewport/device verification outstanding.*
