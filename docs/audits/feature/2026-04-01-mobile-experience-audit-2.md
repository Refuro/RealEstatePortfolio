# Mobile experience audit — 2026-04-01 (run 2)

**Lane:** Mobile experience (narrow viewport, touch, `md:hidden` shells).  
**Criteria:** [`docs/qa/mobile-experience-audit.md`](../../qa/mobile-experience-audit.md)  
**Process:** [`docs/process/mobile-experience-audit-process.md`](../../process/mobile-experience-audit-process.md)  
**Template:** [`docs/process/audit-report-template.md`](../../process/audit-report-template.md)

**Methodology (this pass):** Static review of `app/` sources (no edits), automated verification via `npm run test` in `RealEstatePortfolio/app`. **Did not** run DevTools viewport sweeps or a physical device in this pass; viewport-matrix claims below that require runtime are marked **unverified** or inferred from CSS/JS.

---

## Executive summary

- **Overall:** App-shell surfaces that branch on `useIsMobile()` (e.g. deal analyzer, projections/mortgage tab content) align the **767px / 768px** boundary with `MobileToolShell` docs. **`MobileToolShell` unit tests and full Vitest suite pass** (276 tests). Safe-area and reduced-motion hooks appear in layout and shell code.
- **Top risk:** **Marketing/public calculators** combine `md:hidden` (mobile shell) with **`hidden lg:grid`** (desktop two-column layout), leaving **no calculator UI between 768px and 1023px** inclusive—a **tablet-width blank** across multiple routes.
- **Secondary:** `MobileCollapsible` only wraps in collapsible UI when `useIsMobile()` is true; behavior is consistent with intent. **Hydration:** `useIsMobile` SSR snapshot is `false` per `use-is-mobile.ts`—expect desktop branch first, then client correction; documented in [`docs/qa/mobile-shell-verification.md`](../../qa/mobile-shell-verification.md).
- **Recommendation:** Treat the **768–1023px marketing calculator gap** as a **schedule** fix (show `md`–`lg` layout or align desktop grid to `md`); re-run manual viewport matrix after fix.

---

## Severity-ranked findings

### Critical

- *(None identified in this static pass.)*

### High

- **Tablet-width blank state on public/marketing calculators** — Between **768px and 1023px**, the mobile `MobileToolShell` block is hidden (`md:hidden`) while the desktop grid remains `hidden` until `lg` (`hidden … lg:grid`), so **inputs and results are not rendered** in that range. Affects primary conversion surfaces.  
  **Evidence:** `app/components/marketing/public-calculator.tsx` (mobile wrapper ~517–533, desktop `hidden gap-5 lg:grid` ~535–538); same structural pattern in `fix-and-flip-calculator.tsx` (~499–519), `brrr-calculator.tsx` (~617–637), `str-ltr-calculator.tsx` (~717–736).

### Medium

- **Focus management in app nav drawer** — On open, focus moves to the first focusable element in the panel (`app-layout-client.tsx`); Escape closes. **Full focus trap** (cycle Tab inside drawer) is **not** evident—possible tab escape to background; typical pattern but worth validating with keyboard on device.  
  **Evidence:** `app/app/(app)/app-layout-client.tsx` (drawer effects ~137–146, ~127–135).

- **Real-device / DevTools matrix not executed here** — Criteria **A4, E1–E3, I1–I2, J1** (safe-area on hardware, native keyboards/pickers, scroll feel, VoiceOver/TalkBack) require **manual** verification. This pass cannot mark them **Pass** with runtime evidence.

### Low

- **Portfolio comparison table horizontal scroll** — Deal analyzer wraps the comparison table in `overflow-x-auto` with `min-w-[280px]` (`deal-analyzer-form.tsx`), which is **intentional** secondary-axis scroll, not whole-page drift; acceptable if the outer column does not overflow (spot-check at 320px recommended).

---

## Evidence reviewed

| Area | Paths / notes |
|------|----------------|
| Shell contract | `app/components/mobile-tool-shell.tsx` — `md:hidden`, summary rail, optional footer with `env(safe-area-inset-bottom)` |
| Mobile detection | `app/lib/use-is-mobile.ts` — `(max-width: 767px)`, server snapshot `false` |
| App chrome | `app/app/(app)/app-layout-client.tsx` — mobile header `md:hidden`, sidebar `hidden md:flex`, drawer, safe-area padding on `main` |
| Deal analyzer | `app/app/(app)/analyze/deal-analyzer-form.tsx` — `if (isMobile)` → `MobileToolShell`; else desktop grid; sticky bottom bar `md:hidden` |
| Public calculators | `app/components/marketing/public-calculator.tsx`, `fix-and-flip-calculator.tsx`, `brrr-calculator.tsx`, `str-ltr-calculator.tsx` — breakpoint conflict (see High) |
| Modeling / mortgage | `app/app/(app)/properties/[id]/projections-tab-content.tsx`, `mortgage-tab-content.tsx` — import `MobileToolShell` / `useIsMobile` (spot-checked structure) |
| Property tabs | `app/app/(app)/properties/[id]/property-detail-tabs.tsx` — mobile horizontal tab scroll `md:hidden` |
| Pricing / plans | `app/components/pricing-cards.tsx` — `md:grid-cols-3`, `MobileCollapsible` for “What’s included” on small screens |
| Marketing nav | `app/components/landing-nav.tsx` — mobile menu, focus return, body scroll lock |
| Collapsible | `app/components/mobile-collapsible.tsx` — renders children unwrapped when not mobile |
| Automated tests | `npm run test` in `app/` — **42 files, 276 tests passed** (includes `mobile-tool-shell.test.tsx`) |

**Assumptions / limits:** No Lighthouse mobile run, no Playwright (per [`docs/qa/mobile-shell-verification.md`](../../qa/mobile-shell-verification.md) Phase B optional). Clerk sign-in/sign-up modals not visually verified at 320px in this pass.

---

## Risk & impact assessment

- **768–1023px calculator gap:** High **user-facing** impact on landing and calculator routes (empty content); **likelihood** is high for tablet and small-laptop users resizing windows or using iPad landscape (~1024px may barely show desktop—still fragile).  
- **Unresolved tablet issue** does not corrupt data but **blocks** core marketing and tool discovery on a common width band.

---

## Recommendations (prioritized)

1. **Unify breakpoints for marketing calculators:** Either show the **two-column `lg` layout from `md`** (e.g. `md:grid` / `hidden md:grid`) or add an explicit **`md`–`lg` single-column** fallback so no width band is empty. Apply consistently across `public-calculator.tsx`, `fix-and-flip-calculator.tsx`, `brrr-calculator.tsx`, `str-ltr-calculator.tsx`.
2. **Manual follow-up:** Run the **viewport matrix** (320, 375, 390, 430, 767/768) plus **one real device** on `/`, `/pricing`, `/analyze`, `/investment-property-calculator` after any CSS change; confirm **A2** and marketing **P1**.
3. **Optional:** Keyboard-test app drawer Tab order and consider `focus-trap-react` or similar if tab escape is confirmed as an issue.

---

## Task candidates

- [ ] Fix marketing calculator layout for **768px ≤ width < 1024px** (align `md`/`lg` visibility across mobile shell vs desktop grid) — files: `app/components/marketing/public-calculator.tsx`, `fix-and-flip-calculator.tsx`, `brrr-calculator.tsx`, `str-ltr-calculator.tsx`.
- [ ] Manual QA: viewport matrix + one iOS/Android device for **E1–E3, A4, I1–I2** on priority routes listed in [`docs/qa/mobile-experience-audit.md`](../../qa/mobile-experience-audit.md) §5.

---

## Re-test checklist

- [ ] After calculator breakpoint fix: verify **768px and 1024px** show full calculator (inputs + results) on all four marketing components.
- [ ] Verify no regression on **&lt;768px** (`MobileToolShell` still visible) and **≥1024px** (desktop grid).
- [ ] `npm run check` (when code changes are made).

---

## Next trigger and cadence

- **Trigger:** After marketing layout fix ships; before release touching `components/marketing/*` or `MobileToolShell` consumers.  
- **Recommended next run:** Within **one sprint** of breakpoint fix, or **monthly** for mobile-heavy releases.

---

## Criteria checklist (Section 4 — summary)

| ID | Result | Notes |
|----|--------|--------|
| A1 | **Pass*** | Primary columns use `min-w-0`, `max-w-*`; portfolio table uses contained `overflow-x-auto`. *Spot-check 320px recommended. |
| A2 | **Fail** | Marketing calculators: mobile hidden at `md`, desktop not shown until `lg` → **gap 768–1023px**. App routes using `useIsMobile()` **Pass** (aligned to 767px). |
| A3 | **Pass** | SSR `useIsMobile` false documented; no code-level infinite loop detected. |
| A4 | **N/A** | Real notch/home-indicator check not run. |
| B1–B4 | **Pass*** | Shell structure matches docs; *full visual pass not run. |
| C1 | **Pass*** | Drawer: open/close, Escape, body lock; *full focus trap not verified. |
| C2 | **Pass*** | Hamburger → nav; *tap count not timed. |
| C3 | **Pass** | `property-detail-tabs.tsx` redirects `tab=mortgage` / `projections` to workspace routes. |
| C4 | **N/A** | Not exhaustively reviewed. |
| D1–D3 | **Pass*** | Header/menu buttons `size-11`; *measurement on device not done. |
| E1–E4 | **N/A** | Device keyboards/validation UX not exercised. |
| F1–F3 | **Pass*** | Typography tokens present; policy label spot-check not full. |
| G1–G3 | **Pass*** | Semantic classes; async states not all traced. |
| H1–H3 | **Pass*** | Recharts usage in projections; tooltip overflow not runtime-tested. |
| I1–I3 | **N/A** | No Lighthouse/profile this pass. |
| J1–J3 | **N/A** | Keyboard/VO/contrast not instrumented. |
| K1–K3 | **N/A** | Clerk/pricing not visually verified. |
| L1–L2 | **N/A** | Session policy review out of scope. |
| M1–M3 | **Pass*** | Shared `formatCurrency` / patterns assumed consistent. |
| N1–N2 | **Pass** | Desktop sidebar `hidden md:flex`; mobile shell `md:hidden` / conditional mobile branch. |
| O1 | **Pass** | `npm run test` — 276 passed. |
| O2 | **Pass** | Presentation vs `lib/` tests unchanged in intent. |
| P1 | **Fail** | 768–1023px calculator gap harms scannability/CTA at “mobile marketing” widths. |
| P2 | **Pass*** | FAQ sections visible without accordion on calculator pages (`calculator-faq.tsx`); JSON-LD separate. |

\* *Code review / partial; not a substitute for manual matrix.*

---

*Traceability: [`docs/qa/mobile-experience-audit.md`](../../qa/mobile-experience-audit.md) (2026-03-30 baseline).*
