# Mobile experience audit — criteria and process

**Purpose:** Provide a **repeatable, comprehensive** framework for evaluating the mobile experience across Veld Portfolio: responsive behavior, dedicated mobile shells, touch usability, readability, accessibility, and **parity with product policies**—without degrading desktop (`md` and above).

**Relationship to other docs**

| Doc | Role |
|-----|------|
| `mobile-experience-audit-process.md` (internal doc, not in public repo) | Formal **lane** process entry for full audits; points here for criteria and checklist. |
| [`mobile-shell-verification.md`](mobile-shell-verification.md) | Focused verification of `MobileToolShell` surfaces, math spot-checks, and Phase A unit tests. |
| [`test-infrastructure-review.md`](test-infrastructure-review.md) | What CI proves (including `MobileToolShell` unit tests). |
| `../policies/design-spec.md` (internal doc, not in public repo) | Visual and component standards. |
| `../process/feature-ux-audit-process.md` (internal doc, not in public repo) | Broader Feature/UX/IA audits; mobile audit **narrows** to narrow viewports and touch. |
| `../policies/ownership-metrics.md` (internal doc, not in public repo), `../policies/analytics-math-policy.md` (internal doc, not in public repo) | Canonical math and label semantics when auditing metrics. |

**When to run:** Before major releases, after large UI refactors, or when mobile-related regressions are suspected. **Audit only** (findings → `docs/tasks.md`); implementation follows PM/builder workflow.

---

## 1. Definitions

| Term | Meaning in this repo |
|------|----------------------|
| **Mobile viewport** | Width **&lt; 768px** (Tailwind `md` not applied). |
| **`useIsMobile()`** | [`app/lib/use-is-mobile.ts`](../../app/lib/use-is-mobile.ts) — `(max-width: 767px)`. |
| **Mobile shell** | [`MobileToolShell`](../../app/components/mobile-tool-shell.tsx) and related primitives (`MobileSectionCard`, `MobileSummaryRail`, `MobileCollapsible`, `MobileModeSwitcher`). Root uses **`md:hidden`** — shell is **mobile-only** in DOM at narrow widths. |
| **Desktop parity** | At **≥768px**, layout and behavior match **pre-mobile-overhaul** intent: no removal of desktop features; mobile-specific paths must not break SSR or hydration. |

---

## 2. Viewport matrix (required)

Test each **priority surface** at minimum:

| Width (px) | Rationale |
|------------|-----------|
| **320** | Smallest common phone (iPhone SE / small Android). |
| **375** | iPhone standard logical width. |
| **390** | Common modern iPhone. |
| **430** | Large phone / Pro Max class. |
| **768** | **Boundary:** just below and just above — mobile layout vs `md` desktop layout. |

Also verify **at least one real device** (iOS or Android) for keyboard, scroll momentum, and native `<select>` behavior.

---

## 3. Severity rubric

Use for every finding.

| Level | Meaning | Example |
|-------|---------|---------|
| **P0 — Blocker** | Breaks core task, data loss, wrong financial display, or security issue on mobile. | Save fails; cap rate shows incorrect value. |
| **P1 — Major** | Core journey severely degraded; many users blocked or confused. | Primary CTA off-screen; chart unreadable; horizontal scroll on main column. |
| **P2 — Moderate** | Friction, inconsistency, or secondary flow broken. | Cramped badge; tooltip overflows; obscure error copy. |
| **P3 — Minor** | Polish, edge case, or devtools-only quirk. | Subpixel alignment; emulator-only scrollbar. |

---

## 4. Audit criteria (comprehensive)

For each criterion: **Pass / Fail / N/A**, note route, viewport, evidence (screenshot optional), severity if failed.

### A. Responsive layout and breakpoints

- [ ] **A1** No unintended **horizontal scroll** on primary content column at 320–430px (excluding intentional full-bleed media).
- [ ] **A2** At **767px vs 768px**, layout switches predictably: mobile-specific components hidden/shown per `md:hidden` / `md:block` (no permanent duplicate chrome).
- [ ] **A3** **Hydration:** No persistent React/console errors after load at mobile width; brief layout shift acceptable if documented, not infinite loading.
- [ ] **A4** **Safe areas** (notch / home indicator): Critical actions not obscured on notched devices when verified on real hardware or simulator.

### B. Mobile shells and dense tools

- [ ] **B1** All **`MobileToolShell`** surfaces (Deal Analyzer, Modeling, Mortgage, Public calculator) render **eyebrow, title, summary rail** where designed; **footer** where applicable (e.g. analyzer).
- [ ] **B2** **Context** blocks (property selectors, deal header, links) are usable: no overlapping text, tap targets not smaller than adjacent hit areas.
- [ ] **B3** **Progressive disclosure** (`MobileCollapsible`): Labels clear; expanded content scrolls inside page, not trapped in broken overflow.
- [ ] **B4** **Card / section rhythm:** Avoid redundant duplicate metrics (e.g. same KPI in rail and body) unless intentional for scanability.

### C. Navigation and IA

- [ ] **C1** **App chrome:** **`MobileBottomNav`** (Dashboard, Properties, Analyze) plus **More** (dispatches `open-mobile-menu` → full navigation drawer/sheet). Verify drawer opens, focuses, closes without trapping focus or leaving an invisible overlay.
- [ ] **C2** **Workspace navigation** (dashboard → modeling / mortgage / properties): Reachable in ≤2 taps from common entry points on mobile.
- [ ] **C3** **Deep links** (`?propertyId=`, `?edit=`, `#anchors`, wizard query) resolve to correct workspace or drawer section on mobile.
- [ ] **C4** **Back behavior:** Browser back from nested flows does not strand user or lose unsaved state without warning (where product promises persistence).

### D. Touch targets and gestures

- [ ] **D1** Primary buttons and list rows meet **~44×44px** minimum touch target (padding counts).
- [ ] **D2** **Spacing** between adjacent tappable controls avoids mis-taps (especially destructive actions).
- [ ] **D3** **Swipe / scroll:** Charts and scrollable regions do not steal all vertical scroll (nested scroll traps).

### E. Forms and inputs

- [ ] **E1** **`inputMode` / `type`:** Numeric and currency fields invoke appropriate **software keyboards** on real devices (not only desktop emulator).
- [ ] **E2** **`autocomplete`** on address and related fields where implemented; no blocked autofill for sign-in/sign-up fields beyond product intent.
- [ ] **E3** **Selects:** Native `<select>` uses OS picker on real mobile (differs from desktop emulator dropdown).
- [ ] **E4** **Validation errors** visible without zooming; error text associated with field (programmatically or visually adjacent).

### F. Typography, copy, and density

- [ ] **F1** **Body text** readable without zoom at 320px; line length not excessive in single-column layouts.
- [ ] **F2** **Labels** for metrics (cap rate, DSCR, etc.) consistent with `analytics-math-policy.md` (internal doc, not in public repo) where applicable.
- [ ] **F3** **Abbreviations** in mobile-only UI (e.g. summary chips) remain understandable or tooltipped where needed.

### G. Visual design and consistency

- [ ] **G1** Alignment with `design-spec.md` (internal doc, not in public repo): semantic tokens, spacing scale, no ad-hoc colors breaking dark/light intent.
- [ ] **G2** **States:** Loading, empty, and error states present on mobile for async views (properties list, dashboards).
- [ ] **G3** **Icon + text** pairs remain aligned when text wraps.

### H. Charts and data visualization

- [ ] **H1** Charts **visible** at mobile height; axes labels legible or abbreviated consistently.
- [ ] **H2** **Tooltips** on tap: do not overflow viewport; compact copy on mobile where implemented.
- [ ] **H3** **Legend** readable or intentionally hidden on mobile with alternative (e.g. tooltip) documented.

### I. Performance and perceived performance

- [ ] **I1** **Time to interactive** acceptable on mid-tier mobile network (subjective or Lighthouse mobile when run).
- [ ] **I2** **Scroll jank** not severe on long forms (modeling, analyzer, mortgage).
- [ ] **I3** **Large lists** (properties): virtualization or pagination acceptable; no browser hang on scroll.

### J. Accessibility (mobile-relevant)

- [ ] **J1** **Focus order** logical when tabbing (external keyboard) or VoiceOver/TalkBack spot-check on primary flow.
- [ ] **J2** **Contrast** of text vs background meets WCAG intent for primary copy and controls (design spec).
- [ ] **J3** **Motion:** No seizure-inducing flashing; respect `prefers-reduced-motion` where animations exist.

### K. Authentication, billing, and plan limits

- [ ] **K1** Clerk sign-in/sign-up usable on 320px; no clipped modal.
- [ ] **K2** **Plans / pricing** cards scannable; CTAs full-width on mobile where designed.
- [ ] **K3** **Plan limit** messaging (deals, properties) visible when relevant; upgrade paths reachable.

### L. Security and privacy (mobile context)

- [ ] **L1** Sensitive fields (if any) not obscured by keyboard in a way that encourages screenshotting secrets.
- [ ] **L2** **Session** behavior: switching apps and returning does not expose wrong account on shared device (Clerk/session as configured).

### M. Cross-surface consistency

- [ ] **M1** Same **metric names** mean the same thing across analyzer, property detail, and dashboards on mobile (per policies).
- [ ] **M2** **Currency formatting** consistent (`formatCurrency` patterns).
- [ ] **M3** **Date formatting** consistent (locale, short vs long).

### N. Desktop non-regression (constraint)

- [ ] **N1** At **≥768px**, previously expected **desktop** layouts present: no mobile-only shell replacing desktop content.
- [ ] **N2** **Feature parity:** No desktop-only removal of controls without product decision; mobile may hide via progressive disclosure, not delete logic.

### O. Automated coverage (confidence)

- [ ] **O1** `npm run test` green; includes **`MobileToolShell`** unit tests per [`mobile-shell-verification.md`](mobile-shell-verification.md).
- [ ] **O2** **`lib/`** math tests unchanged in intent; mobile UI is presentation-only.

### P. Marketing and public pages (mobile)

- [ ] **P1** Landing and calculator pages **scannable**; CTA hierarchy clear at 320px.
- [ ] **P2** **SEO-critical** content not hidden only behind interactions that hurt discovery (unless intentional).

---

## 5. Surface inventory (minimum coverage)

Auditors should cover **at least** these routes on mobile widths:

| Area | Routes / surfaces |
|------|-------------------|
| Public | `/`, `/pricing`, `/sign-in`, `/sign-up`, `/investment-property-calculator`, LP variants if live |
| App | `/dashboard`, `/properties`, `/properties/new`, `/properties/[id]` (scroll layout + edit drawer), `/modeling`, `/mortgage`, `/refinance`, `/analyze`, **`/tools`** (public calculators hub under marketing route group), `/plans`, `/settings` |

Add **property with mortgage** and **saved deal** fixtures for realistic tool testing.

---

## 6. Output artifact

When executing a formal audit run:

1. Copy the **criteria checklist** (Section 4) into a dated report, e.g. `docs/audits/feature/YYYY-MM-DD-mobile-experience-audit.md` (internal doc, not in public repo).
2. Fill Pass/Fail/N/A, severity, evidence, and **recommended tasks** for `docs/tasks.md`.
3. Link this criteria doc for traceability.

---

## 7. Sign-off

| Role | Action |
|------|--------|
| Auditor | Completes matrix, records findings, proposes task candidates. |
| PM | Triages findings, promotes tasks, assigns builder. |
| Builder | Implements fixes per `docs/tasks.md` and builder rules. |

---

*Last updated: 2026-04-30 — bottom nav + property detail IA aligned with `app/app/(app)/`.*
