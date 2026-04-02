# Veld Portfolio — Technical Implementation Guide 2026

**Version:** 1.0  
**Date:** 2026-04-01  
**Status:** Active  
**Companion document:** `docs/design/design-brief-2026.md` (design rationale and direction)

---

## How to Use This Document

This guide is written for AI-assisted implementation. Each section is self-contained and scoped to a single file or component. You do not need to load the full document to execute a single step.

**Execution model:** Work through sections in the order defined in Part 6 (Sequencing). Complete the token layer first — it cascades changes automatically and reduces per-component work. Then work through components, then pages.

**Before touching any file:** Read the current file contents first. Every instruction in this guide was written against a known file state; if the file has changed since this guide was written, reconcile the instruction with the current state before applying.

**Convention used throughout:**
- `OLD:` — the exact current code to be replaced (or removed)
- `NEW:` — the replacement code
- `ADD:` — new code to insert (location described in context)
- `REMOVE:` — code to delete with no replacement
- `NOTE:` — important context or caveat

---

## Table of Contents

- [Part 1: Token Layer (`globals.css`)](#part-1-token-layer)
- [Part 2: Component Updates](#part-2-component-updates)
  - [2.1 MetricCard](#21-metriccardcomponentsmmetric-cardtsx)
  - [2.2 AppNav](#22-appnavappappapp-navtsx)
  - [2.3 AppLayoutClient](#23-applayoutclientappappapp-layout-clienttsx)
  - [2.4 LandingNav](#24-landingnav-componentslandingnav-tsx)
  - [2.5 PricingCards](#25-pricingcards-componentspricing-cardstsx)
  - [2.6 Footer](#26-footer-componentsfootertsx)
  - [2.7 CalculatorsHubCards](#27-calculatorshubcards-componentscalculatorscalculators-hub-cardstsx)
  - [2.8 PropertyHero](#28-propertyhero-appappproperties-idproperty-herotsx)
  - [2.9 Surface Hierarchy — Pattern Reference](#29-surface-hierarchy--pattern-reference)
- [Part 3: Page-Level Instructions](#part-3-page-level-instructions)
  - [3.1 Landing Page](#31-landing-page-appappagetsx)
  - [3.2 Pricing Page](#32-pricing-page-appapppricing-pagetsx)
  - [3.3 Changelog](#33-changelog-appappchangelogpagetsx)
  - [3.4 Contact](#34-contact-page-appappcontactpagetsx)
  - [3.5 Dashboard](#35-dashboard-appappappdashboardpagetsx)
  - [3.6 Properties List](#36-properties-list-appappapppropertiespagetsx)
  - [3.7 Property Detail](#37-property-detail-appappappproperties-idpagetsx)
  - [3.8 Dashboard Charts](#38-dashboard-charts-appappappdashboarddashboard-chartstsx)
  - [3.9 Analyze Deal](#39-analyze-deal-appappappanalyzepagetsx)
  - [3.10 Saved Deals](#310-saved-deals-appappappdealspagetsx)
  - [3.11 Calculators Hub In-App](#311-calculators-hub-in-app-appappappcalculatorspagetsx)
  - [3.12 Settings](#312-settings-appappappsettingspagetsx-panel-consolidation)
- [Part 4: Clerk Appearance](#part-4-clerk-appearance-customization)
- [Part 5: design-spec.md Update](#part-5-design-specmd-update-instructions)
- [Part 6: Implementation Sequencing](#part-6-implementation-sequencing)

---

## Part 1: Token Layer

**File:** `app/app/globals.css`

This is step 1 of implementation. The token changes here cascade automatically to every component that uses `bg-accent`, `text-accent`, `text-accent-foreground`, `bg-accent-hover`, and `hover:bg-accent-hover`. Completing this step first means you do not need to update individual component colors — they inherit.

### 1.1 Accent Color Tokens — Light Mode

Find the `:root` block. Change the following lines:

```css
OLD:
  --accent: #0a0a0a;
  --accent-hover: #262626;
  --accent-foreground: #ffffff;

NEW:
  --accent: #6366f1;
  --accent-hover: #4f46e5;
  --accent-foreground: #ffffff;
```

### 1.2 Accent Color Tokens — Dark Mode (system preference)

Find the `@media (prefers-color-scheme: dark)` block. Change:

```css
OLD:
    --accent: #fafafa;
    --accent-hover: #e4e4e7;
    --accent-foreground: #0a0a0a;

NEW:
    --accent: #818cf8;
    --accent-hover: #a5b4fc;
    --accent-foreground: #1e1b4b;
```

### 1.3 Accent Color Tokens — Explicit Dark Mode

Find the `[data-theme="dark"]` block. Change:

```css
OLD:
  --accent: #fafafa;
  --accent-hover: #e4e4e7;
  --accent-foreground: #0a0a0a;

NEW:
  --accent: #818cf8;
  --accent-hover: #a5b4fc;
  --accent-foreground: #1e1b4b;
```

### 1.4 Explicit Light Mode Block

Find the `[data-theme="light"]` block. Change:

```css
OLD:
  --accent: #0a0a0a;
  --accent-hover: #262626;
  --accent-foreground: #ffffff;

NEW:
  --accent: #6366f1;
  --accent-hover: #4f46e5;
  --accent-foreground: #ffffff;
```

### 1.5 New Tokens — Add to `:root` block

After the existing `--chart-5` line in `:root`, add:

```css
  /* Brand accent tints for badges and icon backgrounds */
  --accent-subtle: #eef2ff;
  --accent-subtle-foreground: #4338ca;
```

### 1.6 New Tokens — Add to Dark Mode blocks

In both the `@media (prefers-color-scheme: dark)` block and `[data-theme="dark"]` block, after `--chart-5`, add:

```css
    --accent-subtle: #1e1b4b;
    --accent-subtle-foreground: #a5b4fc;
```

### 1.7 Add to `@theme inline` block

In the `@theme inline` block, after `--color-chart-5: var(--chart-5);`, add:

```css
  --color-accent-subtle: var(--accent-subtle);
  --color-accent-subtle-foreground: var(--accent-subtle-foreground);
```

### 1.8 Tabular Numerals on Body

In the `body` selector, add `font-variant-numeric: tabular-nums;`:

```css
OLD:
body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
}

NEW:
body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  font-variant-numeric: tabular-nums;
}
```

NOTE: Applying `font-variant-numeric: tabular-nums` globally is safe. It only affects digit spacing, not letter spacing, and Geist supports it correctly. All financial figures will now align in columns without any per-component changes.

### 1.9 Verify

After applying these changes, run `npm run dev` and visually verify:
- Primary CTA buttons (e.g., "Add property" on the dashboard) render indigo, not black
- The active pricing card tab uses indigo background
- The `ValueChip` checkmarks in the onboarding panel use the new indigo accent
- Dark mode accent buttons render `#818cf8` (a lighter indigo), not white

---

## Part 2: Component Updates

### 2.1 MetricCard — `components/metric-card.tsx`

**Full file replacement.** The current file is 51 lines. Replace entirely with:

```tsx
type MetricCardProps = {
  label: string;
  value: string;
  primary?: boolean;
  cashFlow?: number;
  compact?: boolean;
  tone?: "positive" | "warning" | "negative";
  /** Optional: raw delta number to determine color direction. */
  delta?: number | null;
  /** Optional: formatted string shown below the value (e.g., "+$1,200 this month"). */
  deltaLabel?: string | null;
};

const toneClass: Record<"positive" | "warning" | "negative", string> = {
  positive: "text-positive",
  warning: "text-warning",
  negative: "text-negative",
};

export function MetricCard({
  label,
  value,
  primary = true,
  cashFlow,
  compact = false,
  tone,
  delta,
  deltaLabel,
}: MetricCardProps) {
  const sizeClass = compact ? "text-base md:text-lg" : "text-2xl";
  const valueClassName = tone
    ? `font-semibold ${toneClass[tone]} ${sizeClass}`
    : cashFlow !== undefined
      ? `font-semibold ${cashFlow >= 0 ? "text-positive" : "text-negative"} ${sizeClass}`
      : primary
        ? compact
          ? "text-base md:text-lg font-semibold text-foreground"
          : "text-2xl sm:text-3xl font-semibold text-foreground"
        : compact
          ? "text-sm md:text-base font-medium text-foreground"
          : "text-lg font-medium text-foreground";

  const deltaColorClass =
    delta === undefined || delta === null
      ? "text-muted"
      : delta > 0
        ? "text-positive"
        : delta < 0
          ? "text-negative"
          : "text-muted";

  return (
    <div
      className={`min-w-0 rounded-lg border border-border bg-card shadow-sm ${
        compact ? "p-3" : "p-5"
      }`}
    >
      <dt
        className={`font-medium text-muted ${compact ? "text-xs" : "text-base"}`}
      >
        {label}
      </dt>
      <dd className={`mt-1 truncate ${valueClassName}`}>{value}</dd>
      {deltaLabel && (
        <p className={`mt-0.5 text-xs ${deltaColorClass}`}>{deltaLabel}</p>
      )}
    </div>
  );
}
```

**Key changes from original:**
- Added `delta` and `deltaLabel` optional props
- Added delta rendering below the value
- Added `shadow-sm` to the container class
- `tabular-nums` is now inherited from `body` (Part 1.8) — no per-component change needed

### 2.2 AppNav — `app/app/(app)/app-nav.tsx`

**Full file replacement.** The current file is 112 lines. Replace entirely with:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDraft } from "./draft-context";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Calculator,
  ClipboardList,
  SlidersHorizontal,
  Landmark,
  CreditCard,
  Settings,
  Shield,
  Plus,
} from "lucide-react";

const portfolioNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Building2 },
];

const toolsNav = [
  { href: "/modeling", label: "Modeling", icon: SlidersHorizontal },
  { href: "/mortgage", label: "Mortgage", icon: Landmark },
  { href: "/calculators", label: "Calculators", icon: Calculator },
  { href: "/analyze", label: "Analyze deal", icon: ClipboardList },
  { href: "/deals", label: "Deals", icon: Briefcase },
];

const accountNav = [
  { href: "/plans", label: "Plans", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface AppNavProps {
  onClose?: () => void;
  showAdmin?: boolean;
  propertyCount?: number;
}

function NavGroup({
  label,
  items,
  pathname,
  onClose,
  useDraftNav,
  draft,
}: {
  label?: string;
  items: { href: string; label: string; icon: React.ComponentType<{ size?: number }> }[];
  pathname: string;
  onClose?: () => void;
  useDraftNav: boolean;
  draft: ReturnType<typeof useDraft>;
}) {
  return (
    <div>
      {label && (
        <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted">
          {label}
        </p>
      )}
      {items.map(({ href, label: itemLabel, icon: Icon }) => {
        const isActive =
          pathname === href ||
          (href !== "/dashboard" && pathname.startsWith(href));
        const baseClass = `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm w-full text-left transition-colors duration-100`;
        const activeClass = `${baseClass} bg-subtle font-medium text-foreground border-l-2 border-accent`;
        const inactiveClass = `${baseClass} text-muted hover:bg-subtle hover:text-foreground`;
        const className = isActive ? activeClass : inactiveClass;

        if (useDraftNav) {
          return (
            <button
              key={href}
              type="button"
              onClick={() => {
                draft?.navigateTo(href);
                onClose?.();
              }}
              className={className}
            >
              <Icon size={16} />
              {itemLabel}
            </button>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={className}
          >
            <Icon size={16} />
            {itemLabel}
          </Link>
        );
      })}
    </div>
  );
}

export function AppNav({
  onClose,
  showAdmin,
  propertyCount = 0,
}: AppNavProps) {
  const pathname = usePathname();
  const draft = useDraft();
  const useNavigateTo =
    draft != null && pathname === "/properties/new" && draft.hasDraft;

  const adminItems = showAdmin
    ? [{ href: "/admin", label: "Admin", icon: Shield }]
    : [];

  return (
    <nav className="flex flex-1 flex-col gap-0 overflow-y-auto py-2">
      <NavGroup
        items={portfolioNav}
        pathname={pathname}
        onClose={onClose}
        useDraftNav={useNavigateTo}
        draft={draft}
      />
      <NavGroup
        label="Tools"
        items={toolsNav}
        pathname={pathname}
        onClose={onClose}
        useDraftNav={useNavigateTo}
        draft={draft}
      />
      <NavGroup
        label="Account"
        items={[...accountNav, ...adminItems]}
        pathname={pathname}
        onClose={onClose}
        useDraftNav={useNavigateTo}
        draft={draft}
      />

      <div className="mt-auto border-t border-border px-3 pt-3 pb-2">
        {useNavigateTo ? (
          <button
            type="button"
            onClick={() => {
              draft?.navigateTo("/properties/new");
              onClose?.();
            }}
            className="flex w-full items-center gap-2 rounded-md bg-accent/10 px-3 py-2 text-sm font-medium text-accent hover:bg-accent/15 transition-colors duration-100"
          >
            <Plus size={14} />
            {propertyCount === 0 ? "Getting started" : "Add property"}
          </button>
        ) : (
          <Link
            href="/properties/new"
            onClick={onClose}
            className="flex items-center gap-2 rounded-md bg-accent/10 px-3 py-2 text-sm font-medium text-accent hover:bg-accent/15 transition-colors duration-100"
          >
            <Plus size={14} />
            {propertyCount === 0 ? "Getting started" : "Add property"}
          </Link>
        )}
      </div>
    </nav>
  );
}
```

**Key changes from original:**
- Nav items split into three groups: portfolio (no label), tools (labeled "Tools"), account (labeled "Account")
- Nav item font size: `text-base py-2.5` → `text-sm py-2`
- Active state adds `border-l-2 border-accent` left indicator
- Icon size: `size={18}` → `size={16}`
- "Getting started / Add property" CTA: ghost link → accent-tinted button with `Plus` icon
- `Lightbulb` icon → `Plus` icon (clearer intent)
- Helper `NavGroup` component to reduce repetition

### 2.3 AppLayoutClient — `app/app/(app)/app-layout-client.tsx`

**Targeted changes only. Do not rewrite the full file.**

**Change 1 — Desktop sidebar LogoLink area:**

Find:
```tsx
<div className="flex h-14 items-center gap-2 border-b border-border px-4">
  <LogoLink />
</div>
```

Replace with:
```tsx
<div className="flex h-14 items-center gap-2 border-b border-border px-4">
  <img src="/favicon.svg" className="size-5 shrink-0 object-contain" alt="" aria-hidden="true" />
  <LogoLink />
</div>
```

**Change 2 — Mobile drawer LogoLink area (there are two instances):**

Find both instances of:
```tsx
<div className="flex h-14 items-center gap-2 border-b border-border px-4" onClick={closeDrawer}>
  <LogoLink />
</div>
```

Replace each with:
```tsx
<div className="flex h-14 items-center gap-2 border-b border-border px-4" onClick={closeDrawer}>
  <img src="/favicon.svg" className="size-5 shrink-0 object-contain" alt="" aria-hidden="true" />
  <LogoLink />
</div>
```

NOTE: There is one desktop sidebar instance and one mobile drawer instance. Update both.

**Change 3 — AppNav `p-4` wrapper:**

Find in both the desktop `<aside>` and the mobile `<aside>`:
```tsx
<AppNav
  showAdmin={showAdmin}
  propertyCount={bannerProps?.propertyCount ?? 0}
/>
```

No change to the `AppNav` usage — the new `AppNav` component handles its own padding internally. But verify the `<aside>` container does not have conflicting `p-4` padding that would double up.

In the desktop aside, remove `p-4` from the `<AppNav>` container if it was wrapping the nav. The new `AppNav` handles its own internal padding.

### 2.4 LandingNav — `components/landing-nav.tsx`

**Targeted changes. Do not rewrite the full file.**

**Change 1 — Desktop nav links: remove Privacy and Terms**

Find in the `navLinks` constant (the JSX block assigned to `navLinks`):

```tsx
REMOVE these two Link elements entirely:
      <Link
        href="/privacy"
        className="text-muted hover:text-foreground"
        onClick={() => setMobileMenuOpen(false)}
      >
        Privacy
      </Link>
      <Link
        href="/terms"
        className="text-muted hover:text-foreground"
        onClick={() => setMobileMenuOpen(false)}
      >
        Terms
      </Link>
```

After this removal, the desktop link set will be: [Dashboard if signed in] · Calculators · Pricing · Changelog · [Sign in if not signed in] · [Sign up CTA if not signed in].

**Change 2 — Add logo mark to nav header**

Find:
```tsx
<Link href="/" className="text-lg font-semibold text-foreground">
  Veld
</Link>
```

Replace with:
```tsx
<Link href="/" className="flex items-center gap-2 text-lg font-semibold text-foreground">
  <img src="/favicon.svg" className="size-5 shrink-0 object-contain" alt="" aria-hidden="true" />
  Veld
</Link>
```

**Change 3 — Increase hamburger button touch target**

Find:
```tsx
className="flex size-10 min-h-10 min-w-10 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-foreground md:hidden"
```

Replace with:
```tsx
className="flex size-11 min-h-11 min-w-11 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-foreground md:hidden"
```

NOTE: This also fixes the P3 issue from the mobile experience audit.

**Change 4 — Add keyboard Escape handler and a11y to mobile drawer**

This addresses the P2 issue from the mobile experience audit. The `LandingNav` already has a `useEffect` for Escape handling — verify it exists. If the current file already has:
```tsx
useEffect(() => {
  if (!mobileMenuOpen) return;
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") closeMenu();
  };
  document.addEventListener("keydown", handleEscape);
  return () => document.removeEventListener("keydown", handleEscape);
}, [mobileMenuOpen, closeMenu]);
```
Then the Escape handler is already present. If not, add it.

Verify the mobile drawer `<div>` has `role="dialog"` and `aria-modal="true"`:
```tsx
OLD (if missing these attributes):
<div
  ref={drawerRef}
  id="landing-nav-drawer"
  className={`fixed inset-y-0 right-0 ...`}
>

NEW:
<div
  ref={drawerRef}
  id="landing-nav-drawer"
  role="dialog"
  aria-modal="true"
  aria-label="Site navigation"
  aria-hidden={!mobileMenuOpen}
  className={`fixed inset-y-0 right-0 ...`}
>
```

If these attributes are already present in the current file, no change is needed.

### 2.5 PricingCards — `components/pricing-cards.tsx`

**Targeted changes. Do not rewrite the full file.**

**Change 1 — Import `Check` from lucide-react**

Find the import line(s) from `lucide-react`. If none exist, add:
```tsx
import { Check } from "lucide-react";
```

If lucide-react imports exist, add `Check` to the existing import.

**Change 2 — Replace dot bullets with Check icons**

Find (there are two instances — one for desktop, one for mobile `MobileCollapsible`):
```tsx
<span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-border" />
```

Replace both instances with:
```tsx
<Check className="mt-0.5 size-3.5 shrink-0 text-positive" aria-hidden="true" />
```

**Change 3 — Strengthen highlighted Investor card**

Find the `cardBorder` variable assignment:
```tsx
const cardBorder = isCurrent
  ? "border-positive ring-1 ring-positive/60"
  : highlightInvestor
    ? "border-accent/60 ring-1 ring-accent/30"
    : "border-border";
```

Replace with:
```tsx
const cardBorder = isCurrent
  ? "border-positive ring-1 ring-positive/60"
  : highlightInvestor
    ? "border-accent/50 ring-2 ring-accent/25 bg-accent/5"
    : "border-border";
```

NOTE: The `bg-accent/5` here adds a very subtle indigo tint to the highlighted card background. Since this is applied as part of the card's className (along with `bg-card/95`), Tailwind will apply both — the `bg-accent/5` will provide a faint tint layer.

**Change 4 — Improve highlighted card badge position**

Find:
```tsx
{highlightInvestor && (
  <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-foreground">
    Recommended next
  </span>
)}
```

Replace with:
```tsx
{highlightInvestor && (
  <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
    Recommended
  </span>
)}
```

This makes the "Recommended" badge use the solid brand accent fill, making it clearly distinct from all other card elements.

**Change 5 — Tabular numerals on price display**

Find the price `<p>` elements (there are three — free, investor, pro). Each has a pattern like:
```tsx
<p className="mt-3 text-xl font-semibold text-foreground">
```

Add `tabular-nums` to each:
```tsx
<p className="mt-3 text-xl font-semibold tabular-nums text-foreground">
```

NOTE: With the body-level `font-variant-numeric: tabular-nums` from Part 1.8, this may already be inherited. Apply it explicitly anyway for clarity.

### 2.6 Footer — `components/footer.tsx`

**Minor change — link grouping on wider screens.**

The current footer renders all links in a single flat flex row. No structural changes needed for the initial pass — this is a low-priority visual refinement. If implementing: separate product links from legal links on `md+` with a small divider or spacing gap.

**No changes required for this initial implementation pass.** Mark as complete without modification.

### 2.7 CalculatorsHubCards — `components/calculators/calculators-hub-cards.tsx`

**Targeted changes. Do not rewrite the full file.**

**Change 1 — Add Lucide imports**

Add to the top of the file:
```tsx
import { Home, Hammer, ArrowLeftRight, Wrench } from "lucide-react";
```

**Change 2 — Add icon and hover shadow to each calculator card link**

There are four calculator cards. For each, change the `<Link>` inner content structure.

**Investment property calculator card — find:**
```tsx
<h2 className="text-lg font-semibold text-foreground">Investment property calculator</h2>
<p className="mt-1 text-sm text-muted">
  Monthly cash flow, cap rate, DSCR, and cash-on-cash for a stabilized rental.
</p>
<p className="mt-3 text-sm font-medium text-accent">Open calculator →</p>
```

**Replace with:**
```tsx
<div className="flex items-start gap-3">
  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
    <Home className="size-4 text-accent" aria-hidden />
  </div>
  <div className="min-w-0">
    <h2 className="text-lg font-semibold text-foreground">Investment property calculator</h2>
    <p className="mt-1 text-sm text-muted">
      Monthly cash flow, cap rate, DSCR, and cash-on-cash for a stabilized rental.
    </p>
    <p className="mt-3 text-sm font-medium text-accent">Open calculator →</p>
  </div>
</div>
```

**BRRRR calculator card — same pattern:**
```tsx
<div className="flex items-start gap-3">
  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
    <Hammer className="size-4 text-accent" aria-hidden />
  </div>
  <div className="min-w-0">
    <h2 className="text-lg font-semibold text-foreground">BRRRR calculator</h2>
    <p className="mt-1 text-sm text-muted">
      Buy, rehab, rent, refinance—estimate cash-out at refi and stabilized cash flow vs. ARV.
    </p>
    <p className="mt-3 text-sm font-medium text-accent">Open calculator →</p>
  </div>
</div>
```

**STR vs LTR card:**
```tsx
<div className="flex items-start gap-3">
  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
    <ArrowLeftRight className="size-4 text-accent" aria-hidden />
  </div>
  <div className="min-w-0">
    <h2 className="text-lg font-semibold text-foreground">STR vs LTR</h2>
    <p className="mt-1 text-sm text-muted">
      Compare short-term (STR) and long-term rental (LTR) income, expenses, and cash flow side by
      side on the same financing.
    </p>
    <p className="mt-3 text-sm font-medium text-accent">Open calculator →</p>
  </div>
</div>
```

**Fix and flip card:**
```tsx
<div className="flex items-start gap-3">
  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
    <Wrench className="size-4 text-accent" aria-hidden />
  </div>
  <div className="min-w-0">
    <h2 className="text-lg font-semibold text-foreground">Fix and flip</h2>
    <p className="mt-1 text-sm text-muted">
      Estimate net profit, ROI, and annualized return on a flip — purchase, rehab, hold, and
      sale.
    </p>
    <p className="mt-3 text-sm font-medium text-accent">Open calculator →</p>
  </div>
</div>
```

**Change 3 — Add hover shadow to each card Link:**

Find each card's `<Link>` className:
```tsx
className="block rounded-xl border border-border bg-card/95 p-5 shadow-sm transition hover:border-accent/30 hover:bg-subtle"
```

Replace with:
```tsx
className="block rounded-xl border border-border bg-card/95 p-5 shadow-sm transition-all duration-150 hover:border-accent/30 hover:bg-subtle hover:shadow-md"
```

### 2.8 PropertyHero — `app/app/(app)/properties/[id]/property-hero.tsx`

**Single change — background color:**

Find:
```tsx
<div className="rounded-lg border border-border bg-card p-4">
```

Replace with:
```tsx
<div className="rounded-lg border border-border bg-subtle p-4">
```

### 2.9 Surface Hierarchy — Pattern Reference

**Reference:** Design Brief, Section 2.9.

This section defines the exact Tailwind patterns for the three surface levels and the specific consolidation changes for the card-heavy pages. Apply these patterns as you encounter card containers throughout the implementation — do not treat them as a separate pass; integrate with each page as it is touched.

**Pattern definitions:**

**Panel (discrete content object — properties, deals, metrics, charts):**
```tsx
<div className="rounded-xl border border-border bg-card shadow-sm">
  {/* content */}
</div>
```

**Panel with multiple internal sections (settings pattern — see 3.12 for full usage):**
```tsx
<div className="rounded-xl border border-border bg-card shadow-sm">
  <div className="px-6 py-5">
    <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Section A</p>
    {/* Section A content */}
  </div>
  <div className="border-t border-border px-6 py-5">
    <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Section B</p>
    {/* Section B content */}
  </div>
</div>
```

**Inset (secondary content nested inside a Panel — never has shadow or border):**
```tsx
<div className="rounded-lg bg-subtle/50 p-3">
  {/* secondary content */}
</div>
```

**Metric grid grouping container (not a Panel — clusters tiles without adding visual weight):**
```tsx
<div className="rounded-xl bg-subtle/30 p-2">
  <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-5">
    {/* Individual MetricCard components — each retains its own bg-card styling */}
  </div>
</div>
```

NOTE: The grouping container deliberately omits `border` and `shadow-sm`. It is a context frame, not a Panel. The `bg-subtle/30` creates a barely-perceptible tint — enough to cluster the tiles visually without competing with the card surfaces inside. If it appears too heavy in testing, reduce to `bg-subtle/20`. If it disappears entirely in dark mode, increase to `bg-subtle/40`.

**The discrete object test (apply before adding any card wrapper):**
Ask: *"Is this a standalone object that could exist in a list, be moved, or be removed without breaking the rest of the page?"* If yes → Panel. If no (it is a section of a document) → use Page level with spacing and dividers instead.

---

## Part 3: Page-Level Instructions

### 3.1 Landing Page — `app/app/page.tsx`

This is the most substantial page change. The current page is ~282 lines. The new structure is a full rebuild. Read the current file, then implement the new structure below.

**Imports to add:**
```tsx
import { ChevronRight } from "lucide-react";
```

The existing imports (`Link`, `Image`, `Metadata`, `dynamic`, `Suspense`, `auth`, `Footer`, `LandingNav`, `PlanIntentUrlSync`, `FunnelCtaLink`, Lucide icons, pricing constants, `getAppOrigin`) all remain.

**New VALUE_PROPS — update descriptions:**

Replace the existing `VALUE_PROPS` array:
```tsx
const VALUE_PROPS = [
  {
    title: "Replace spreadsheets",
    description: "Equity, debt, and cash flow across every property — always current. No manual updates.",
    icon: LayoutGrid,
  },
  {
    title: "Rent & value estimates",
    description: "See what your property could rent for today, pulled from live market data. Know if you're above or below market.",
    icon: TrendingUp,
  },
  {
    title: "Deal analyzer",
    description: "Enter purchase price, rent, and expenses. Get cash flow, cap rate, DSCR, and CoC return instantly before you commit.",
    icon: Calculator,
  },
  {
    title: "Scenario modeling",
    description: "What-if sliders for rent, value, and mortgage. See how changes in assumptions affect your returns.",
    icon: SlidersHorizontal,
  },
];
```

**New HOW_IT_WORKS steps constant — add after VALUE_PROPS:**
```tsx
const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Add your properties",
    description: "Enter purchase price, estimated value, rent, expenses, and mortgage details. Takes about 2 minutes per property.",
    icon: Building2,
  },
  {
    step: "02",
    title: "See your portfolio clearly",
    description: "Equity, cash flow, cap rate, and LTV across every property in one dashboard — always current, never a spreadsheet.",
    icon: LayoutGrid,
  },
  {
    step: "03",
    title: "Analyze and model",
    description: "Run deal analyses before buying, model what-if scenarios with sliders, and simulate mortgage payoff.",
    icon: SlidersHorizontal,
  },
];
```

Add `Building2` to the existing Lucide imports.

**Updated ValuePropIcon component:**
```tsx
function ValuePropIcon({
  Icon,
}: {
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 sm:size-11">
      <Icon className="size-5 text-accent sm:size-5" aria-hidden />
    </div>
  );
}
```

**New main JSX — replace everything inside `<main className="flex flex-1 flex-col">`:**

```tsx
<main className="flex flex-1 flex-col">
  {/* Hero */}
  <section className="px-4 py-12 sm:py-16 md:py-20">
    <div className="mx-auto max-w-6xl">
      <div className="grid items-center gap-12 lg:grid-cols-[3fr_2fr]">
        {/* Left: copy + CTAs */}
        <div className="flex flex-col items-start gap-5">
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Replace spreadsheet sprawl with one clear view of your rental portfolio
          </h1>
          <p className="max-w-lg text-base text-muted sm:text-lg">
            All the numbers that matter — equity, cash flow, rent estimates, and deal analysis — without the spreadsheet chaos.
          </p>
          {deletedParam === "1" && (
            <p className="max-w-md rounded-lg border border-border bg-card px-4 py-3 text-center text-sm text-foreground">
              Your account has been deactivated. You can sign in again to restore it.
            </p>
          )}
          {deletedParam === "permanent" && (
            <p className="max-w-md rounded-lg border border-border bg-card px-4 py-3 text-center text-sm text-foreground">
              Your account and data have been permanently deleted.
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {userId ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:bg-accent-hover transition-colors"
                >
                  Go to dashboard
                </Link>
                <Link
                  href="/pricing"
                  className="text-sm font-medium text-muted hover:text-foreground hover:underline"
                >
                  View pricing plans
                </Link>
              </>
            ) : (
              <>
                <FunnelCtaLink
                  href="/sign-up?intent=free"
                  placement="landing_hero"
                  ctaId="get_started_free"
                  planIntent="free"
                  landingVariant="home_default_v2"
                  className="inline-flex items-center rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:bg-accent-hover transition-colors"
                >
                  Get started free
                </FunnelCtaLink>
                <FunnelCtaLink
                  href="/pricing"
                  placement="landing_hero"
                  ctaId="view_pricing"
                  landingVariant="home_default_v2"
                  className="text-sm font-medium text-muted hover:text-foreground hover:underline"
                >
                  See pricing
                </FunnelCtaLink>
              </>
            )}
          </div>
          {!userId && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="rounded-full border border-border/70 px-3 py-1">No card required for Free</span>
              <span className="rounded-full border border-border/70 px-3 py-1">Start in about 60 seconds</span>
              <span className="rounded-full border border-border/70 px-3 py-1">Cancel anytime</span>
            </div>
          )}
        </div>

        {/* Right: product screenshot — hidden on < lg */}
        <div className="hidden lg:block">
          <div className="overflow-hidden rounded-xl border border-border/60 shadow-xl">
            {/* Faux browser chrome */}
            <div className="flex items-center gap-1.5 border-b border-border/60 bg-subtle px-3 py-2">
              <span className="size-2.5 rounded-full bg-border" />
              <span className="size-2.5 rounded-full bg-border" />
              <span className="size-2.5 rounded-full bg-border" />
            </div>
            <Image
              src="/ScreenDashboard.png"
              alt="Veld Portfolio dashboard showing property value, equity, cash flow, and portfolio metrics"
              className="h-auto w-full"
              loading="eager"
              width={1280}
              height={800}
              sizes="(max-width: 1280px) 50vw, 640px"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* Social proof strip */}
  <section className="border-y border-border bg-subtle px-4 py-6">
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-8">
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">"Finally replaced my spreadsheet."</span>
          {" "}— Small landlord, 4 properties
        </p>
        <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">"The deal analyzer alone is worth it."</span>
          {" "}— First-time investor
        </p>
        <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">"Clear numbers without the chaos."</span>
          {" "}— Portfolio of 8 rentals
        </p>
      </div>
    </div>
  </section>

  {/* Calculator section */}
  <section className="border-b border-border bg-card/40 px-4 py-12 sm:py-16">
    <div className="mx-auto max-w-5xl">
      <h2 className="text-2xl font-semibold text-foreground">
        Try the free calculator
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Estimate cash flow, cap rate, DSCR, and cash-on-cash return before you commit to anything. No account required.
      </p>
      <div className="mt-6">
        <PublicCalculator compact />
      </div>
      <div className="mt-4">
        <FunnelCtaLink
          href="/investment-property-calculator"
          placement="landing_how_it_works"
          ctaId="open_public_calculator"
          landingVariant="home_default_v2"
          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          Open full calculator
          <ChevronRight className="size-4" aria-hidden />
        </FunnelCtaLink>
      </div>
    </div>
  </section>

  {/* Value props */}
  <section className="border-b border-border px-4 py-12 sm:py-16">
    <div className="mx-auto max-w-5xl">
      <h2 className="mb-2 text-2xl font-semibold text-foreground">
        Everything your portfolio needs
      </h2>
      <p className="mb-8 text-base text-muted">Built for individual investors who want clarity, not complexity.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-6">
        {VALUE_PROPS.map((prop) => (
          <div
            key={prop.title}
            className="flex flex-row items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-col sm:gap-3"
          >
            <ValuePropIcon Icon={prop.icon} />
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-foreground">
                {prop.title}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {prop.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* How it works */}
  <section className="border-b border-border bg-card/40 px-4 py-12 sm:py-16">
    <div className="mx-auto max-w-5xl">
      <h2 className="mb-2 text-2xl font-semibold text-foreground">How it works</h2>
      <p className="mb-10 text-base text-muted">Set up your portfolio in minutes. No learning curve.</p>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {HOW_IT_WORKS.map((item) => (
          <div key={item.step} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                {item.step}
              </span>
              <item.icon className="size-5 text-muted" aria-hidden />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm text-muted">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* Pricing teaser */}
  <section className="px-4 py-12 sm:py-16">
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="mb-2 text-2xl font-semibold text-foreground">Simple pricing</h2>
      <p className="mb-8 text-base text-muted">
        Start free. Upgrade as your portfolio grows.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-base font-semibold text-foreground">Free</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">$0<span className="text-base font-normal text-muted">/mo</span></p>
          <p className="mt-2 text-sm text-muted">{PLAN_PROPERTY_LIMITS.free} property · {PLAN_DEAL_LIMITS.free} saved deals</p>
        </div>
        <div className="rounded-xl border border-accent/40 bg-accent/5 p-5 shadow-sm ring-2 ring-accent/20">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-base font-semibold text-foreground">Investor</p>
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">Popular</span>
          </div>
          <p className="text-2xl font-semibold tabular-nums text-foreground">${PRICING_DISPLAY.investorMonthly}<span className="text-base font-normal text-muted">/mo</span></p>
          <p className="mt-2 text-sm text-muted">{PLAN_PROPERTY_LIMITS.investor} properties · {PLAN_DEAL_LIMITS.investor} saved deals</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-base font-semibold text-foreground">Pro</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">${PRICING_DISPLAY.proMonthly}<span className="text-base font-normal text-muted">/mo</span></p>
          <p className="mt-2 text-sm text-muted">{PLAN_PROPERTY_LIMITS.pro} properties · {PLAN_DEAL_LIMITS.pro} saved deals</p>
        </div>
      </div>
      <div className="mt-6">
        <FunnelCtaLink
          href="/pricing"
          placement="landing_pricing_preview"
          ctaId="view_pricing"
          landingVariant="home_default_v2"
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-subtle transition-colors"
        >
          See full pricing
          <ChevronRight className="size-4" aria-hidden />
        </FunnelCtaLink>
      </div>
    </div>
  </section>
</main>
```

NOTE: The `PRICING_DISPLAY` import is already present in the current file. `PLAN_PROPERTY_LIMITS` and `PLAN_DEAL_LIMITS` are also already imported. The `Building2` icon needs to be added to the Lucide import. `ChevronRight` needs to be added.

### 3.2 Pricing Page — `app/app/pricing/page.tsx`

**Targeted changes only.**

**Change 1 — Screenshot grid section heading:**

Find:
```tsx
<h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-wide text-muted">
  See what you get
</h2>
```

Replace with:
```tsx
<h2 className="mb-6 text-center text-xl font-semibold text-foreground">
  See it in action
</h2>
```

**Change 2 — Trust pill containers:**

Find:
```tsx
<div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-muted">
  <span className="rounded-full border border-border/70 px-3 py-1">
    Secure billing via Stripe
  </span>
  <span className="rounded-full border border-border/70 px-3 py-1">
    No card required for Free
  </span>
  <span className="rounded-full border border-border/70 px-3 py-1">
    Cancel anytime
  </span>
</div>
```

Replace with:
```tsx
<div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-muted">
  <span className="rounded-full border border-border bg-card px-3 py-1 shadow-sm">
    Secure billing via Stripe
  </span>
  <span className="rounded-full border border-border bg-card px-3 py-1 shadow-sm">
    No card required for Free
  </span>
  <span className="rounded-full border border-border bg-card px-3 py-1 shadow-sm">
    Cancel anytime
  </span>
</div>
```

**Change 3 — FAQ details hover state:**

Find the three `<details>` elements in the bottom CTA section. Each has:
```tsx
<details className="group rounded-lg border border-border/70 p-3">
```

Replace with:
```tsx
<details className="group rounded-lg border border-border/70 p-3 transition-colors hover:bg-subtle">
```

### 3.3 Changelog — `app/app/changelog/page.tsx`

**Change the `<ol>` list into a timeline.**

Find the `<ol>` element:
```tsx
<ol className="mt-10 space-y-10">
```

Replace with:
```tsx
<ol className="relative mt-10 space-y-10 border-l-2 border-border pl-6">
```

For each `<li>` inside the `<ol>`, find:
```tsx
<li key={`${entry.date}-${entry.title}`}>
  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
    <time
      dateTime={entry.date}
      className="text-sm font-medium text-muted"
    >
      {entry.date}
    </time>
    <h2 className="text-lg font-semibold text-foreground">
      {entry.title}
    </h2>
  </div>
  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground">
    {entry.items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
</li>
```

Replace with:
```tsx
<li key={`${entry.date}-${entry.title}`} className="relative">
  {/* Timeline dot */}
  <span
    className="absolute -left-[1.625rem] top-1.5 flex size-3 items-center justify-center rounded-full bg-accent ring-2 ring-background"
    aria-hidden="true"
  />
  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
    <time
      dateTime={entry.date}
      className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-muted shadow-sm"
    >
      {entry.date}
    </time>
    <h2 className="text-lg font-semibold text-foreground">
      {entry.title}
    </h2>
  </div>
  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground">
    {entry.items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
</li>
```

NOTE: The timeline dot uses `ring-2 ring-background` to create a gap between the dot and the border line, which makes the dot visually "pop" off the timeline. The `-left-[1.625rem]` value positions the dot centered on the `border-l-2` border of the `<ol>` (accounts for the `pl-6` padding + border width).

### 3.4 Contact Page — `app/app/contact/page.tsx`

**Single change — back link icon:**

Find:
```tsx
import Link from "next/link";
```

The file imports are at the top. Add `ChevronLeft` to the Lucide import (or add a new import if none exists):
```tsx
import { ChevronLeft } from "lucide-react";
```

Find:
```tsx
<Link
  href={userId ? "/dashboard" : "/"}
  className="mb-8 inline-block text-sm text-muted hover:text-foreground"
>
  ← {userId ? "Back to dashboard" : "Back to home"}
</Link>
```

Replace with:
```tsx
<Link
  href={userId ? "/dashboard" : "/"}
  className="mb-8 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
>
  <ChevronLeft className="size-4" aria-hidden />
  {userId ? "Back to dashboard" : "Back to home"}
</Link>
```

### 3.5 Dashboard — `app/app/(app)/dashboard/page.tsx`

**Targeted changes for the zero-state and the populated dashboard.**

**Change 1 — Zero-state: add empty-properties illustration**

Find the zero-state return:
```tsx
return (
  <>
    <PaidIntentCheckoutBanner effectiveTier={effectiveTier} />
    <div>
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome to Veld
        </h1>
```

Replace the inner `<div>` opening through the `<h1>` with:
```tsx
return (
  <>
    <PaidIntentCheckoutBanner effectiveTier={effectiveTier} />
    <div>
      <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <img
          src="/empty-properties.png"
          alt=""
          className="mx-auto mb-4 size-24 object-contain opacity-80"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome to Veld
        </h1>
```

**Change 2 — Remove "Portfolio summary" line**

Find:
```tsx
<p className="text-sm text-muted">
  Portfolio summary across {metrics.propertyCount} propert{metrics.propertyCount === 1 ? "y" : "ies"}.
</p>
```

Remove this entire `<p>` element. The metric cards below communicate this information directly.

**Change 3 — Dashboard action area: remove card wrapper, simplify**

Find the action area card (starts with):
```tsx
<div className="mt-4 rounded-xl border border-border/70 bg-card/95 p-3 shadow-sm md:p-4">
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div>
      <p className="text-sm text-muted">
        Portfolio summary across {metrics.propertyCount} propert...
      </p>
```

This section is significantly restructured. Replace the entire action area card (from `<div className="mt-4 rounded-xl ...">` through its closing `</div>`) with:

```tsx
<div className="mt-4 flex flex-wrap items-center gap-2">
  <Link
    href="/properties/new"
    className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover transition-colors"
  >
    Add property
  </Link>
  <Link
    href="/analyze"
    className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle transition-colors"
  >
    Analyze a deal
  </Link>
  {/* Desktop workspace links */}
  <div className="hidden flex-wrap gap-2 md:flex">
    <Link
      href={propertyHref}
      className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle transition-colors"
    >
      {singleProperty ? "Property" : "Properties"}
    </Link>
    <Link
      href={modelingHref}
      className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle transition-colors"
    >
      Modeling
    </Link>
    <Link
      href={mortgageHref}
      className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle transition-colors"
    >
      Mortgage
    </Link>
    <Link
      href="/export/portfolio-summary"
      className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle transition-colors"
    >
      Print summary
    </Link>
  </div>
  {/* Mobile workspace dropdown */}
  <div className="md:hidden">
    <WorkspaceNavMobile
      propertyHref={propertyHref}
      propertyLabel={singleProperty ? "Property" : "Properties"}
      modelingHref={modelingHref}
      mortgageHref={mortgageHref}
    />
  </div>
</div>
```

**Change 4 — Single-property upsell card: brand tint**

Find:
```tsx
<div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm">
```

Replace with:
```tsx
<div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/20 bg-accent/5 p-4 shadow-sm">
```

**Change 5 — MetricHelpLink: move below metric grid**

The `<MetricHelpLink />` element should move from inside the action area to immediately after the `MobileCollapsible` closing tag. Find its current position (inside the action area div) and move it:

```tsx
{/* After the MobileCollapsible closing tag */}
<div className="mt-2">
  <MetricHelpLink />
</div>
```

**Change 6 — Metric grid grouping container**

The primary metric grid (5 MetricCards) currently floats directly on the page background with no shared context. Wrap it with the grouping container from Part 2.9.

Find:
```tsx
<div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
  <MetricCard
    label={metrics.propertyCount > 1 ? "Total property value" : "Property value"}
```

Replace with:
```tsx
<div className="mt-4 rounded-xl bg-subtle/30 p-2">
  <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-5">
  <MetricCard
    label={metrics.propertyCount > 1 ? "Total property value" : "Property value"}
```

Then find the closing of the metric grid (the `</div>` that closes `grid grid-cols-2 gap-3`) and add a second closing `</div>` after it for the new outer container. The `MobileCollapsible` for secondary metrics remains outside the grouping container — it is its own section.

NOTE: The gap changes from `gap-3` to `gap-2` because the container's `p-2` padding provides visual breathing room on the outside; the internal gap can be slightly tighter. Adjust to `gap-3` if it looks cramped in testing.

### 3.6 Properties List — `app/app/(app)/properties/page.tsx`

**Targeted changes — shadow and hover on property cards.**

The properties list has two rendering modes: single property expanded card and multi-property grid. Both need the shadow treatment.

**Single property card:** Find `rounded-xl border border-border/70 bg-card shadow-sm` (the single property card wrapper). Add `hover:shadow-md transition-shadow duration-150` to it.

**Multi-property grid cards:** Find the grid card `<Link>` wrappers. Each will have a pattern like `rounded-xl border border-border/70 bg-card/95 shadow-sm`. Add `hover:shadow-md transition-shadow duration-150`.

NOTE: The exact class strings vary in the full `properties/page.tsx` (618 lines). When reading the file, search for `rounded-xl border` and identify all card-level elements to apply the shadow hover treatment.

### 3.7 Property Detail — `app/app/(app)/properties/[id]/page.tsx`

**Change 1 — Back navigation with ChevronLeft:**

Add `ChevronLeft` to the file's imports:
```tsx
import { ChevronLeft } from "next/navigation"; // NOTE: import from "lucide-react", not "next/navigation"
```

Actually: `import { ChevronLeft } from "lucide-react";`

Find:
```tsx
<Link
  href="/properties"
  className="text-base text-muted hover:text-foreground"
>
  ← Properties
</Link>
```

Replace with:
```tsx
<Link
  href="/properties"
  className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
>
  <ChevronLeft className="size-4" aria-hidden />
  Properties
</Link>
```

**Change 2 — Property detail tabs active state:**

In `app/app/(app)/properties/[id]/property-detail-tabs.tsx`, find the tab button active state styling. It likely has a pattern like `border-b-2` or `font-semibold` for the active tab. Update the active tab to use:
```tsx
// Active tab class — add or update:
"border-b-2 border-accent font-medium text-foreground"

// Inactive tab class:
"border-b-2 border-transparent text-muted hover:text-foreground hover:border-border transition-colors"
```

The exact implementation depends on the current tab component code. Read `property-detail-tabs.tsx` to find the tab button class strings and update accordingly.

**Change 3 — Tab content card consolidation (Surface Hierarchy, Design Brief 2.9):**

Within each tab's content area, sequential sub-sections (e.g., mortgage summary and tax/insurance details within the "Details" tab) are chapters in the property's document, not discrete objects. If they currently render as separate sibling card containers, consolidate them.

**Read the tab content components first.** The property detail likely has multiple components rendered by `property-detail-tabs.tsx` (e.g., `PropertyOverviewTab`, `PropertyDetailsTab`, `PropertyMortgageTab`, `PropertyProjectionsTab`). For each tab:

1. Identify sibling `<div className="rounded-lg border border-border bg-card p-4/p-5/p-6">` containers that a user would scroll past as part of the same task (reading one property's details).
2. If two or more such siblings exist within the same tab, consolidate them using the Panel-with-dividers pattern from Part 2.9:

```tsx
{/* OLD: two sibling cards */}
<div className="rounded-lg border border-border bg-card p-5">
  <h3>Section A</h3>
  {/* ... */}
</div>
<div className="mt-4 rounded-lg border border-border bg-card p-5">
  <h3>Section B</h3>
  {/* ... */}
</div>

{/* NEW: one panel with internal divider */}
<div className="rounded-xl border border-border bg-card shadow-sm">
  <div className="px-5 py-4">
    <h3 className="text-sm font-semibold text-foreground">Section A</h3>
    {/* ... */}
  </div>
  <div className="border-t border-border px-5 py-4">
    <h3 className="text-sm font-semibold text-foreground">Section B</h3>
    {/* ... */}
  </div>
</div>
```

NOTE: If a tab has only a single card container for its content, leave it as-is (it is already a single Panel). Only consolidate when there are multiple sibling cards that logically belong to the same section. The property detail files were not read during the drafting of this guide — read them before applying this change. Do not apply it blindly; the goal is reduction of sibling card count, not flattening of legitimately distinct sections.

### 3.8 Dashboard Charts — `app/app/(app)/dashboard/dashboard-charts.tsx`

**Change 1 — Chart loading placeholder shadow:**

Find:
```tsx
<div className="rounded-lg border border-border bg-card p-5">
```

Replace with:
```tsx
<div className="rounded-lg border border-border bg-card p-5 shadow-sm">
```

**Change 2 — Chart card title style:**

In the chart rendering (lines 60+, which were not fully read — read the full file first), find chart card section titles that use `uppercase tracking-wide text-muted`. Change each from:
```tsx
// Pattern to find:
className="... text-sm font-semibold uppercase tracking-wide text-muted ..."

// Change to:
className="... text-sm font-semibold text-foreground ..."
```

NOTE: Remove `uppercase`, `tracking-wide`, and change `text-muted` to `text-foreground` on chart titles only. Apply only to chart titles — do not change data labels within the chart itself.

**Change 3 — Add shadow to chart card wrappers:**

Any chart section card `<div>` that uses `rounded-lg border border-border bg-card` should get `shadow-sm` added.

### 3.9 Analyze Deal — `app/app/(app)/analyze/page.tsx`

**Single change — consistent heading hierarchy:**

The page header uses:
```tsx
<h1 className="text-2xl font-semibold text-foreground">Analyze deal</h1>
```
This is correct. No change.

**Mobile sticky bar fix (in `deal-analyzer-form.tsx`):**

Find the mobile sticky results bar. It will have a `fixed bottom-0` className. Add the safe-area inset:

```tsx
OLD (pattern to find):
className="... fixed bottom-0 left-0 right-0 ... md:hidden ..."

NEW:
className="... fixed bottom-0 left-0 right-0 ... pb-safe md:hidden ..."
```

If `pb-safe` is not a defined Tailwind utility, use inline style or add a utility class:
```tsx
style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
```

This addresses the P1 issue from the mobile experience audit.

### 3.10 Saved Deals — `app/app/(app)/deals/page.tsx`

**Change 1 — Add empty-deals illustration:**

Find the empty state `<div>`:
```tsx
<div className="mt-8 rounded-xl border border-border/70 bg-card/95 p-8 text-center shadow-sm">
  <h2 className="text-lg font-medium text-foreground">
    No saved deals yet
  </h2>
```

Replace the opening and h2 with:
```tsx
<div className="mt-8 rounded-xl border border-border/70 bg-card/95 p-8 text-center shadow-sm">
  <img
    src="/empty-deals.png"
    alt=""
    className="mx-auto mb-4 size-24 object-contain opacity-80"
    aria-hidden="true"
  />
  <h2 className="text-lg font-medium text-foreground">
    No saved deals yet
  </h2>
```

**Change 2 — Deal list cards shadow (in `deals-list.tsx`):**

Read `deals-list.tsx`. Find the card container elements (likely `rounded-xl border` cards or `<li>` wrappers). Add `shadow-sm hover:shadow-md transition-shadow duration-150` to clickable deal cards.

### 3.11 Calculators Hub In-App — `app/app/(app)/calculators/page.tsx`

**Change 1 — Remove eyebrow label:**

Find and remove entirely:
```tsx
<p className="text-sm font-medium uppercase tracking-wide text-muted">Calculators</p>
```

The `<h1>` element on the next line is sufficient.

**Change 2 — Adjust h1 margin:**

Since the eyebrow is removed, the h1 may need a slight margin adjustment:
```tsx
OLD:
<h1 className="mt-2 text-2xl font-semibold text-foreground">Real estate calculators</h1>

NEW:
<h1 className="text-2xl font-semibold text-foreground">Real estate calculators</h1>
```

### 3.12 Settings — `app/app/(app)/settings/page.tsx` — Panel Consolidation

**Reference:** Design Brief, Section 6.11 and Section 2.9.

This is the most substantial single-file change for the in-app card-heavy problem. The current file has five separate `rounded-lg border border-border bg-card p-6` card containers (Appearance, Portfolio display, Profile, Plan & billing, Export) plus a sixth danger-zone card for Delete account — six total. This change consolidates all six into four logically grouped Panels.

**Read the full file before starting.** The current file is ~224 lines and should be read in full to understand the complete structure and all component prop signatures before making changes.

---

**Change 1 — Panel A: Merge Appearance + Portfolio display + Profile**

Find and remove these three separate `<section>` blocks (lines ~100–134 in the current file):

```tsx
<section className="mt-8">
  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-4">Appearance</h2>
  <div className="rounded-lg border border-border bg-card p-6">
    <ThemeToggle />
  </div>
</section>

<section className="mt-8">
  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Portfolio display</h2>
  <div className="rounded-lg border border-border bg-card p-6">
    <OwnershipDisplayToggle
      initialMode={((user as { ownershipDisplayMode?: string | null }).ownershipDisplayMode ?? "proportional") as "proportional" | "full_liability"}
    />
  </div>
</section>

<section className="mt-8">
  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Profile</h2>
  <div className="rounded-lg border border-border bg-card p-6">
    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 sm:gap-y-3">
      {(user.firstName || user.lastName) && (
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
          <dt className="text-sm font-medium text-muted">Name</dt>
          <dd className="text-base font-medium text-foreground">
            {[user.firstName, user.lastName].filter(Boolean).join(" ")}
          </dd>
        </div>
      )}
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
        <dt className="text-sm font-medium text-muted">Email</dt>
        <dd className="text-base font-medium text-foreground">{user.email || "—"}</dd>
      </div>
    </dl>
  </div>
</section>
```

Replace with Panel A (one unified panel with internal section dividers):

```tsx
<div className="mt-6 rounded-xl border border-border bg-card shadow-sm">
  <div className="px-6 py-5">
    <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Appearance</p>
    <ThemeToggle />
  </div>
  <div className="border-t border-border px-6 py-5">
    <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Portfolio display</p>
    <OwnershipDisplayToggle
      initialMode={((user as { ownershipDisplayMode?: string | null }).ownershipDisplayMode ?? "proportional") as "proportional" | "full_liability"}
    />
  </div>
  <div className="border-t border-border px-6 py-5">
    <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Profile</p>
    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 sm:gap-y-3">
      {(user.firstName || user.lastName) && (
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
          <dt className="text-sm font-medium text-muted">Name</dt>
          <dd className="text-base font-medium text-foreground">
            {[user.firstName, user.lastName].filter(Boolean).join(" ")}
          </dd>
        </div>
      )}
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
        <dt className="text-sm font-medium text-muted">Email</dt>
        <dd className="text-base font-medium text-foreground">{user.email || "—"}</dd>
      </div>
    </dl>
  </div>
</div>
```

NOTE: The `<section>` wrappers and `<h2>` section headings are replaced. The heading elements become `<p>` tags because they are now category labels *inside* a Panel, not page-level section headings. The `mt-8` margin on each section collapses to `mt-6` on the single outer Panel. The `p-6` padding on inner divs becomes `px-6 py-5` (slightly less vertical padding, matching the tighter internal section rhythm).

---

**Change 2 — Panel B: Upgrade Plan & billing**

Find:
```tsx
<section className="mt-8">
  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Plan & billing</h2>
  <div className="rounded-lg border border-border bg-card p-6">
```

Replace with:
```tsx
<section className="mt-6">
  <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Plan & billing</p>
  <div className="rounded-xl border border-border bg-card shadow-sm px-6 py-5">
```

NOTE: Changes are `mt-8` → `mt-6`, `<h2>` → `<p>`, `rounded-lg` → `rounded-xl`, add `shadow-sm`, change `p-6` to `px-6 py-5`.

---

**Change 3 — Panel C: Upgrade Your data (Export + Import)**

Find:
```tsx
<section id="export" className="mt-8 scroll-mt-8">
  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Export your data</h2>
  <div className="space-y-6 rounded-lg border border-border bg-card p-6">
```

Replace with:
```tsx
<section id="export" className="mt-6 scroll-mt-8">
  <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Your data</p>
  <div className="rounded-xl border border-border bg-card shadow-sm px-6 py-5 space-y-6">
```

NOTE: Heading text changes from "Export your data" to "Your data" (the panel handles both export and import). The internal `<div className="border-t border-border pt-6">` wrapping `<ImportCsvSection />` remains unchanged — it is already the correct internal-divider pattern.

---

**Change 4 — Panel D: Upgrade Delete account / fix border override**

Find:
```tsx
<section className="mt-8">
  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Delete account</h2>
  <div className="rounded-lg border border-negative/20 bg-card p-6 md:border-border">
```

Replace with:
```tsx
<section className="mt-6">
  <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Delete account</p>
  <div className="rounded-xl border border-negative/20 bg-card shadow-sm px-6 py-5">
```

NOTE: The `md:border-border` override is removed — the danger-zone border must show on all screen sizes. `rounded-lg` → `rounded-xl`, add `shadow-sm`, change `p-6` to `px-6 py-5`.

---

**Change 5 — Privacy section: leave as-is**

The Privacy section (lines ~95–98) has no card wrapper on the page itself — it passes directly to `<CookiePreferencesSection />` which renders its own visual container internally. Do not wrap it in the Panel A container; leave it as a standalone section. Only update the `<h2>` to `<p>` for typography consistency:

Find:
```tsx
<section className="mt-8">
  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-4">Privacy</h2>
  <CookiePreferencesSection />
</section>
```

Replace with:
```tsx
<section className="mt-6">
  <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Privacy</p>
  <CookiePreferencesSection />
</section>
```

---

**Change 6 — Mobile account snapshot card: no change needed**

The `<div className="rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm">` card (lines ~40–93) already has `shadow-sm` and is a correctly scoped discrete object (a summary card on mobile). No changes needed.

---

## Part 4: Clerk Appearance Customization

**File:** `app/app/layout.tsx`

Read the current `layout.tsx` to find the `<ClerkProvider>` component. It will look similar to:

```tsx
<ClerkProvider>
  {children}
</ClerkProvider>
```

Or it may already have an `appearance` prop. Add or update the `appearance` prop:

```tsx
<ClerkProvider
  appearance={{
    variables: {
      colorPrimary: '#6366f1',
      colorPrimaryForeground: '#ffffff',
      borderRadius: '0.5rem',
    },
    elements: {
      formButtonPrimary: 'bg-accent hover:bg-accent-hover text-accent-foreground',
    },
  }}
>
  {children}
</ClerkProvider>
```

NOTE: Clerk's `appearance.variables.colorPrimary` accepts a hex string. Setting it to `#6366f1` will apply the Veld brand indigo to Clerk's primary buttons, links, and focused input borders on the sign-in and sign-up pages. The `elements.formButtonPrimary` override ensures Tailwind classes are applied for hover state consistency.

If `ClerkProvider` is in a different file (e.g., a providers wrapper), apply the change there instead.

---

## Part 5: design-spec.md Update Instructions

**File:** `docs/policies/design-spec.md`

Add the following note to the top of the file, below the status line:

```markdown
**Superseded sections:** Sections 2 (Typography), 3 (Color Palette), and 9 (What to avoid) are superseded by `docs/design/design-brief-2026.md`. All other sections remain in effect. For new UI work, consult the design brief first, then this spec for patterns not covered there.
```

Update the color palette table in Section 3 to reflect the new accent values:

Find the accent row:
```
| `--accent` | `#0a0a0a` | `#fafafa` | Primary buttons, links |
```

Replace with:
```
| `--accent` | `#6366f1` | `#818cf8` | Primary buttons, links, active indicators |
| `--accent-hover` | `#4f46e5` | `#a5b4fc` | Button hover states |
| `--accent-subtle` | `#eef2ff` | `#1e1b4b` | Badge backgrounds, icon tints |
```

No other changes to `design-spec.md` are needed — the design brief covers the rest.

---

## Part 6: Implementation Sequencing

Work through sections in this exact order. Each step is self-contained and testable before moving to the next.

### Stage 1: Token Layer (30 minutes estimated)

1. **Part 1: `globals.css`** — All accent token changes + `tabular-nums` on body + new `accent-subtle` tokens

Verify after: Run `npm run dev`. Open the dashboard. Primary "Add property" button should be indigo. The onboarding welcome modal primary button should be indigo. Dark mode should show lighter indigo. All other UI should be unchanged.

### Stage 2: High-Surface Components (2–3 hours estimated)

Work through these in order — each builds on the token layer and affects many pages:

2. **Part 2.1: MetricCard** — delta props, shadow, (tabular-nums already inherited)
3. **Part 2.2: AppNav** — grouping, text size, active state, CTA button
4. **Part 2.3: AppLayoutClient** — logo mark only (two instances)
5. **Part 2.7: CalculatorsHubCards** — icons, hover shadow

Verify after each: Check the dashboard, app nav, and calculator hub pages.

### Stage 3: Marketing Components (2–3 hours estimated)

6. **Part 2.4: LandingNav** — logo mark, nav links, hamburger size, a11y
7. **Part 2.5: PricingCards** — checkmarks, tier emphasis, tabular price
8. **Part 3.1: Landing page** — full rebuild (this is the largest single step)

Verify after: Check the landing page on desktop and mobile. Verify the hero screenshot appears on `lg+`. Verify the social proof strip, value props with icons, how-it-works steps, and pricing teaser all render correctly.

### Stage 4: In-App Pages (3–4 hours estimated)

9. **Part 3.5: Dashboard** — zero-state illustration, remove summary line, action strip (card → plain strip), metric grid grouping container, single-property upsell tint
10. **Part 3.8: Dashboard Charts** — placeholder shadow, chart title style
11. **Part 3.6: Properties list** — shadow and hover on cards
12. **Part 3.7: Property detail** — back nav, tab active state
13. **Part 3.9: Analyze deal** — mobile sticky bar safe-area fix
14. **Part 3.10: Saved deals** — empty-deals illustration, card shadow
15. **Part 3.12: Settings** — panel consolidation (5 separate cards → 4 grouped panels); highest-impact card-heavy fix in the app
16. **Part 3.11: Calculators hub in-app** — remove eyebrow label

### Stage 5: Public Pages Polish (1–2 hours estimated)

17. **Part 3.2: Pricing page** — screenshot heading, trust pill elevation, FAQ hover
18. **Part 3.3: Changelog** — timeline treatment
19. **Part 3.4: Contact** — back link icon
20. **Part 2.8: PropertyHero** — `bg-subtle` background

### Stage 6: Final Polish (1 hour estimated)

21. **Part 4: Clerk appearance** — add appearance prop to ClerkProvider
22. **Part 5: design-spec.md** — add superseded note + update accent table
23. **Part 2.6: Footer** — optional grouping improvement (defer if time-constrained)

### Total Estimated Time

- Experienced developer with AI assistance: 9–13 hours across all stages
- Each stage is independently deployable and testable
- Stages 1–3 deliver the highest visible impact; stages 4–6 are polish

### Regression Checks After Completion

- [ ] Run `npm run check` (linting + type check)
- [ ] Run `npm run test` (227 tests should still pass)
- [ ] Visually verify dark mode: all accent elements should render `#818cf8` (lighter indigo), not white
- [ ] Visually verify light mode: primary CTAs render `#6366f1` (indigo)
- [ ] Verify the onboarding panel modal: blur orbs should now be indigo-tinted
- [ ] Verify pricing cards: recommended tier has indigo ring + tinted background
- [ ] Verify dashboard charts: chart titles are no longer uppercase-muted
- [ ] Verify changelog: timeline dots are indigo, date chips are styled as pills
- [ ] Verify landing page on mobile (375px): hero shows copy without the screenshot; all sections stack cleanly
- [ ] Verify properties with `tabular-nums`: metric values in grids should align vertically
- [ ] Verify settings page: exactly 4 visible card panels (Privacy component's internal card + Account preferences panel + Plan & billing panel + Your data panel + Delete account panel = 5 total bordered containers; Privacy's is internal to the component, not visible as a page-level card)
- [ ] Verify settings page: no `<h2>` section heading elements remain inside `<section>` wrappers — all should be `<p>` with uppercase-muted classes
- [ ] Verify dashboard: action area has no card wrapper (plain flex strip) — no `rounded-xl border` container above the metric grid
- [ ] Verify dashboard: metric grid sits inside a subtle `rounded-xl bg-subtle/30` container; the container itself should have no border or shadow
- [ ] Verify settings — Delete account: the `border-negative/20` border should be visible on desktop (not overridden to `border-border`)

---

*Reference: `docs/design/design-brief-2026.md` for design rationale. `docs/policies/design-spec.md` for base component patterns not covered in this guide.*
