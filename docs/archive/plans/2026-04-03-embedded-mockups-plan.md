# Embedded Mockup Components — Replace All Product Screenshots

**Date:** 2026-04-03  
**Status:** Draft  
**Scope:** Replace `/ScreenDashboard.png`, `/ScreenMortgage.png`, `/ScreenDeal.png` with React components that render at native resolution on every device.

---

## Problem

Product screenshots are served as PNG files (500KB+) and scaled by the browser from ~2455px down to ~445–640px CSS width. Browser bilinear interpolation makes text blurry at this downscale ratio. The fix is to stop using images entirely — render real HTML/CSS with hardcoded data instead.

## Approach

Build three "mockup" components — `DashboardMockup`, `MortgageMockup`, `DealAnalyzerMockup` — that use the same Tailwind tokens and visual structure as the real app views, but with hardcoded data and no interactivity. Each component:

- Renders **real DOM** at the device's native resolution (always pixel-perfect)
- Uses the existing design system tokens (`bg-card`, `border-border`, `text-foreground`, etc.)
- Shows a **curated slice** of the view (not the entire page — only the most impactful sections)
- Is non-interactive (`pointer-events-none`, `select-none`, `aria-hidden`)
- Scales down gracefully for its container (uses `transform: scale()` via a wrapper)
- Has zero runtime data dependencies (pure presentational)

---

## Inventory — Screenshots to Replace

### 1. `/ScreenDashboard.png` — 3 placements

| Location | File | Display context |
|---|---|---|
| Hero (desktop) | `app/page.tsx` line 322 | Right column of `3fr/2fr` grid, ~445px wide, wrapped in browser-chrome frame |
| Hero (mobile) | `app/page.tsx` line 269 | Full width below CTA, `md:hidden` |
| Pricing "See it in action" | `app/pricing/page.tsx` line 242 | Full width (`md:col-span-2`), signed-out only |

### 2. `/ScreenMortgage.png` — 1 placement

| Location | File | Display context |
|---|---|---|
| Pricing "See it in action" | `app/pricing/page.tsx` line 253 | Half width in 2-col grid, signed-out only |

### 3. `/ScreenDeal.png` — 1 placement

| Location | File | Display context |
|---|---|---|
| Pricing "See it in action" | `app/pricing/page.tsx` line 262 | Half width in 2-col grid, signed-out only |

---

## Component Designs

### `DashboardMockup`

**What to show** (matches current screenshot crop — no sidebar):

1. **Header row:** "Dashboard" title + "Add property" accent button + "Analyze a deal" outline button
2. **Workspace tabs:** Properties | Modeling | Mortgage | Print summary (pills, "Properties" active)
3. **Metric row 1** (5 cards): Total property value $819,700 | Total debt $462,800 | Total equity $356,900 | Monthly cash flow $1,930 (green) | Portfolio cap rate 6.75%
4. **Metric row 2** (5 cards): Portfolio LTV 56.5% | NOI $55,290 | Cash-on-cash return 20.22% | Annual rent $55,290 | DSCR 1.72 (green)
5. **"What do these mean?" link**
6. **Rent vs. market section:** Header with "Above: 2 | Below: 1 | Aligned: 0" pills, 3 property rows (Oak Street Duplex — red "4.0% below market", Pine Cottage — green "2.6% above market", Westport Property — green "5.7% above market")

**Omit:** Charts (too complex to replicate statically without Recharts, and they appear below the fold in the real app). The metric cards + rent-vs-market already answer "what does this product do?"

**Responsive:** Metric cards → 2-col on mobile, 5-col on desktop (matches real app). Rent rows stack naturally.

### `MortgageMockup`

**What to show** (content area only — no sidebar):

1. **Header:** "Mortgage" title + description + "1 mortgage" pill + property selector showing "Westport Property"
2. **Summary cards** (4-col grid): Baseline payoff July 2053 | With extra payment July 2043 | Time saved 10 years (green) | Interest saved $129,773
3. **Two-panel layout:**
   - **Left — Simulation controls:** Mortgage summary chip "$288,084 at 6.25%", extra principal input "443", base P&I "$1,835/mo", "Pay off earlier" presets (5y/10y/15y, 10y selected with accent border)
   - **Right — Chart area:** Title "Balance projection (baseline vs extra principal)" + a **static SVG** of two declining curves (baseline in teal, scenario in blue), with Y axis ($0–$300k) and X axis (dates). This is a simple hand-drawn SVG, not Recharts.

**Responsive:** Summary cards → 2-col mobile, 4-col desktop. Two-panel → stacked mobile, side-by-side desktop.

### `DealAnalyzerMockup`

**What to show** (content area only — no sidebar):

1. **Header:** "Analyze deal" title + description
2. **Two-column layout:**
   - **Left — Deal assumptions form** (non-interactive inputs with hardcoded values):
     - Basics: "456 Oak Street", "Apt 4", Austin/TX/78071, purchase $450,000, current value $450,000
     - Income and expenses: rent $4,200, expenses $400, vacancy 5%
     - Debt: balance $300,000, payment $2,650, cash invested $150,000
   - **Right — Results column** (stacked cards):
     - Deal signal: cash flow $940 (green), DSCR 1.35 (green), cap rate 9.57% + chips
     - Investment metrics: Monthly/annual cash flow, equity, cap rate, LTV, NOI, CoC, DSCR, annual rent

**Responsive:** Two-column → stacked on mobile. Form and results each full-width.

---

## Scaling Wrapper

Each mockup renders at a **fixed internal width** (e.g., 960px for dashboard, 920px for mortgage/deal). A shared `MockupFrame` wrapper handles:

1. Measuring the container's actual width
2. Applying `transform: scale(containerWidth / internalWidth)` with `transform-origin: top left`
3. Setting the container height to `internalHeight * scale` to avoid overflow
4. Adding the browser-chrome dots (for hero placement) or rounded border (for pricing placement)
5. `pointer-events-none`, `select-none`, `aria-hidden="true"`, `role="img"` with descriptive `aria-label`

This means the mockup always renders at its "native" size (crisp text), then CSS-scales down to fit. No browser image interpolation involved.

---

## File Structure

```
app/components/mockups/
├── mockup-frame.tsx         # Shared scaling wrapper + browser chrome
├── dashboard-mockup.tsx     # DashboardMockup
├── mortgage-mockup.tsx      # MortgageMockup
└── deal-analyzer-mockup.tsx # DealAnalyzerMockup
```

---

## Integration Changes

### `app/page.tsx` (landing hero)

- **Desktop** (line 306–334): Replace `<Image src="/ScreenDashboard.png" ...>` with `<MockupFrame chrome><DashboardMockup /></MockupFrame>`
- **Mobile** (line 264–280): Replace `<Image>` with `<MockupFrame><DashboardMockup /></MockupFrame>` (no chrome dots on mobile)

### `app/pricing/page.tsx` (See it in action)

- Line 242–251: Replace dashboard `<Image>` with `<MockupFrame><DashboardMockup /></MockupFrame>`
- Line 253–261: Replace mortgage `<Image>` with `<MockupFrame><MortgageMockup /></MockupFrame>`
- Line 262–270: Replace deal `<Image>` with `<MockupFrame><DealAnalyzerMockup /></MockupFrame>`

### Cleanup

- Delete `/public/ScreenDashboard.png`, `/public/ScreenMortgage.png`, `/public/ScreenDeal.png`
- Remove `localPatterns` cache-busting entry from `next.config.ts`
- Remove `hold/` references to screenshots (already stale)

---

## Implementation Order

| # | Task | Estimated effort |
|---|---|---|
| 1 | `MockupFrame` wrapper (scale logic + chrome) | Small |
| 2 | `DashboardMockup` component | Medium — most complex (metric cards + rent-vs-market) |
| 3 | Integrate dashboard mockup into landing hero (both mobile + desktop) | Small |
| 4 | `MortgageMockup` component (includes static SVG chart) | Medium |
| 5 | `DealAnalyzerMockup` component | Medium — form layout + results cards |
| 6 | Integrate all mockups into pricing page | Small |
| 7 | Delete screenshot PNGs + clean up config | Small |
| 8 | Visual QA across breakpoints | Manual |

---

## Acceptance Criteria

- [ ] All three mockup components render with correct design tokens (matches live app appearance)
- [ ] Text is crisp at every display size and DPR — no blur on Retina or standard displays
- [ ] Mockups are non-interactive (`pointer-events-none`) and accessible (`role="img"`, `aria-label`)
- [ ] Mockups scale proportionally in their containers without overflow or clipping
- [ ] Browser chrome dots appear on hero desktop placement only
- [ ] No screenshot PNGs remain in `/public/`
- [ ] No `localPatterns` cache-bust entries remain in `next.config.ts`
- [ ] Pricing page "See it in action" grid still looks correct with mockup components
- [ ] Mobile hero mockup is appropriately sized (not too tall)
- [ ] `prefers-reduced-motion` respected (if any entrance animations are re-added)
- [ ] No hydration errors (components are deterministic — no random data, no Date.now())
- [ ] Bundle size delta is net-negative (components < 3 PNG files combined)

---

## Model Recommendation

### Best choice: **Claude Opus 4.6** (current session)

**Why this task favors careful deliberation over raw speed:**

| Factor | Why it matters | Best fit |
|---|---|---|
| Design system fidelity | Mockups must match the real app pixel-for-pixel. Requires reading actual component source, extracting exact Tailwind classes, and applying them to static replicas. | Opus 4.6 — strongest at detail-matching across many files |
| Existing context | This session already has the design system spec, skill files, component inventory, landing page structure, and screenshots loaded. Starting fresh in another model means re-ingesting all of it. | Opus 4.6 — zero context transfer cost |
| SVG chart construction | The mortgage mockup needs a hand-drawn SVG chart (two declining curves). This requires spatial reasoning about coordinates, not just code generation. | Opus 4.6 — strongest spatial/visual reasoning |
| Multi-file coordination | 4 new files + 2 page edits + config cleanup, all needing to stay consistent. | Opus 4.6 — best at maintaining cross-file coherence |
| Error sensitivity | A wrong color token, missing border, or incorrect metric value would make the mockup look "off" compared to the real app. | Opus 4.6 — lowest error rate on precise tasks |

**Runner-up: GPT 5.3 Codex** — specifically optimized for agentic web dev tasks and would handle this well. The downside is context transfer (would need to re-read all design system files, skills, and component source). Use if you want a second parallel attempt.

**Not recommended for this task:**
- **Sonnet 4.6** — fast but tends to approximate rather than match exactly on visual-fidelity tasks. Fine for the wrapper, less reliable for the mockup interiors.
- **Grok 4.20** — 2M context and multi-agent are strengths that don't apply here. The task is sequential (each mockup depends on the shared frame), detail-sensitive, and visual. Grok's speed advantage doesn't offset the risk of design token drift.
