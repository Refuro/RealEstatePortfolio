# Visual Assets Guide — Veld Portfolio

**Version:** 1.0  
**Last updated:** 2026-03-30  
**Purpose:** Asset inventory and design guidelines for consistent visual generation. Use this when creating or commissioning logos, icons, and illustrations for Veld.

---

## 1. Brand context

**Name:** Veld (short) / Veld Portfolio (formal)  
**Meaning:** "Veld" is Afrikaans/Dutch for "field" — open land, prairie. Fits real estate and portfolio growth.  
**Product:** Portfolio analytics for small real estate investors (1–20 properties). Equity, cash flow, rent/value estimates, deal analyzer, scenario modeling.  
**Audience:** Individual investors; some power users. Professional but approachable.  
**Domain:** veldportfolio.com

---

## 2. Asset inventory & priorities

### Essential (do first)

| Asset | Purpose | Format | Notes |
|-------|---------|--------|-------|
| **Logo** | Primary brand mark. Sidebar, header, marketing. | SVG preferred; PNG fallback | Wordmark or icon + wordmark. Must work at small sizes. |
| **Favicon** | Browser tabs, bookmarks | 32×32, 48×48 PNG or ICO | Simplified logo mark; readable at 16px. |
| **Stripe Checkout icon** | Stripe Dashboard → Branding. Favicon + fallback logo on Checkout. | PNG/JPG, **min 128×128**, square, &lt;512KB | Same design as favicon; export at 128×128 or 512×512. Stripe uses as Checkout favicon. |
| **Stripe Checkout logo** | Stripe Dashboard → Branding. Header on Checkout page. | PNG/JPG, **min 128×128** (shortest side), &lt;512KB | Use main logo. Non-square OK. Checkout has light background — dark logo works. |
| **Open Graph image** | Social sharing (Twitter, LinkedIn, etc.) | 1200×630 PNG/JPG | Include "Veld Portfolio" + tagline or dashboard preview. |

### Nice to have

| Asset | Purpose | Format | Notes |
|-------|---------|--------|-------|
| **Value prop icons** | Landing page bullets (4–5 icons) | SVG, ~24×24 or 32×32 | Replace spreadsheets, rent/value estimates, deal analyzer, scenario modeling. |
| **Hero illustration** | Landing page hero section | SVG or PNG, ~800×400 | Abstract, minimal. Avoid stock-photo feel. |
| **Empty state illustrations** | "No properties yet", "No saved deals" | SVG, ~200×200 | Simple, friendly. Not cartoonish. |

### Lower priority

| Asset | Purpose | Format |
|-------|---------|--------|
| Email header | Marketing emails | ~600×120 PNG |
| PWA icon | Installable app | 192×192, 512×512 PNG |

---

## 3. Design principles (consistency)

All assets must align with the product design spec. The canonical reference is [`docs/design/design-spec-2026.md`](design/design-spec-2026.md); legacy policy notes live in [`docs/policies/design-spec.md`](policies/design-spec.md) where still relevant.

### 3.1 Visual style

- **Minimal** — Robinhood-inspired. One-glance clarity. No unnecessary decoration.
- **Clarity over decoration** — Every element earns its place. No gradients, heavy shadows, or visual noise.
- **Professional** — Trustworthy for financial/real estate context. Not playful or whimsical.
- **Flat or subtle** — Prefer flat shapes. If depth is needed, use very subtle shadow.

### 3.2 Color palette

Use these tokens from `globals.css`:

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--foreground` | `#0a0a0a` | `#fafafa` | Primary text, logo, icons |
| `--foreground-muted` | `#71717a` | `#a1a1aa` | Secondary elements |
| `--accent` | `#0a0a0a` | `#fafafa` | Primary actions, emphasis |
| `--positive` | `#059669` | `#34d399` | Gains, positive cash flow (use sparingly in branding) |
| `--chart-1` | `#0ea5e9` | `#38bdf8` | Optional accent for charts/data visuals |

**Rules:**
- **Transparent backgrounds** — Logo, favicon, icons, and illustrations must have transparent (alpha) backgrounds. The app supports light and dark mode; opaque white backgrounds would break dark mode.
- Logo: Prefer single color (`--foreground`) or black/white. Avoid multi-color logos unless icon + wordmark with one accent.
- Icons: Match `--foreground` or `--foreground-muted`. Consistent stroke weight.
- Illustrations: Restrained palette. Max 2–3 colors. No rainbow or high-saturation.

### 3.3 Typography (for logo wordmark)

- **Font:** Geist Sans (`var(--font-geist-sans)`) is the app font. For logo, Geist or a similar clean sans-serif works.
- **Weight:** Semibold (600) or Bold (700) for "Veld".
- **Style:** Clean, geometric. No serifs, no script. Uppercase optional for impact (e.g. "VELD") but lowercase "Veld" is friendlier.

### 3.4 Icon style

- **Stroke-based** preferred over filled. Consistent stroke width (e.g. 1.5–2px).
- **Rounded corners** — Slight rounding (2–4px) for friendliness. Not sharp.
- **Size:** Icons should scale cleanly. Design at 24×24 or 32×32; export SVG for scalability.
- **No text in icons** — Icons are symbolic only.

### 3.5 Illustration style

- **Abstract over literal** — Suggest real estate (horizon, chart line, property silhouette) without being clip-art.
- **Line work** — Prefer line/outline style over photorealistic or 3D.
- **Whitespace** — Leave breathing room. Don't overcrowd.
- **Monochromatic or duotone** — Foreground + muted, or foreground + one accent (e.g. chart-1).

---

## 4. Asset-specific specs

### Logo

- **Variants needed:** Full (icon + "Veld"), wordmark only ("Veld"), icon only (for favicon, app icon).
- **Minimum size:** Readable at 24px height. Test at 16px for favicon.
- **Backgrounds:** Use transparent PNG. Must work on light (`#fafafa`) and dark (`#0a0a0a`) backgrounds.
- **Clear space:** Leave padding equal to height of "Veld" on all sides.

### Favicon

- **Source:** Simplified logo icon or first letter "V". No wordmark at 16px.
- **Format:** PNG with transparent background (alpha channel). ICO if legacy support needed.
- **Sizes:** 32×32 primary; 16×16, 48×48 for completeness.

### Stripe Checkout branding

Configure in **Stripe Dashboard → Settings → Branding** (or Checkout → Appearance). Assets appear on the Stripe-hosted checkout page.

- **Icon:** Square image, **min 128×128 px**, PNG or JPG, &lt;512KB. Used as favicon in the Checkout tab; if no logo provided, also shown in header. Use same design as favicon but export at 128×128 or 512×512.
- **Logo:** **Min 128 px on shortest side**, PNG or JPG, &lt;512KB. Non-square OK (e.g. wordmark). Displayed in Checkout header. Use main logo; Checkout uses light background — dark/black logo works well.
- **Brand color (optional):** Hex for accent. Use `#0a0a0a` (accent) or `#059669` (positive) per design tokens.
- **Overlap:** Logo asset = main logo PNG. Icon asset = square favicon at 128×128+. Ensure both are generated when creating logo/favicon.

### Open Graph image

- **Dimensions:** 1200×630 px (required by most platforms).
- **Content:** "Veld Portfolio" text + tagline ("Portfolio analytics for real estate investors") or subtle dashboard/metric mockup.
- **Background:** Use `--background` or `--card`. Avoid busy imagery.
- **Safe zone:** Keep important content in center 1000×500; edges may be cropped on some platforms.

### Value prop icons

- **Set of 4–5:** Each icon represents one value prop.
  - Replace spreadsheets → document/table with checkmark or similar
  - Rent/value estimates → house with chart or dollar sign
  - Deal analyzer → magnifying glass + document
  - Scenario modeling → sliders or dial
- **Consistent:** Same stroke weight, same size, same style across set.
- **Format:** SVG with viewBox. Export at 24×24 or 32×32 base.

### Hero illustration

- **Mood:** Calm, professional, growth. Suggest "portfolio" or "properties" without literal houses.
- **Options:** Abstract horizon line + rising chart; minimal property silhouettes; geometric shapes suggesting structure.
- **Colors:** Foreground + muted, or add chart-1 (blue/teal) sparingly.
- **Aspect:** Landscape. ~2:1 ratio. Works at 800×400 or 1200×600.

### Empty state illustrations

**Purpose:** Shown when user has no properties or no saved deals. Encouraging, not bleak. Must match the app's geometric, minimal style (logo, favicon, value prop icons).

**Exact constraints:**

| Constraint | Requirement |
|------------|-------------|
| **Format** | PNG, transparent background (alpha channel) |
| **Dimensions** | 400×400 px (displayed smaller in UI; scale down) |
| **Color** | Single color: black (#0a0a0a) only. No grays, **no solid fills** — outline/line art only. |
| **Style** | Geometric, minimal line art. Stroke-based outlines only. Same stroke weight as value prop icons. Sharp/angular. NOT illustrative, NOT handdrawn. |
| **Elements** | Icon only. NO text. NO people. NO decorative elements (no chimney, smoke, grass, paths, clouds). |
| **Composition** | Centered. Plenty of negative space. Simple, readable at 200px display size. |

**empty-properties.png — "Add your first property"**
- **Concept:** Minimal house + plus sign. "Add property" action.
- **Allowed:** Simple geometric house outline (triangle roof + rectangle body, optional door). Bold plus (+) to the right or below.
- **NOT allowed:** Chimney, smoke, grass, winding path, windows with grids, doorknob, tufts, ground line. Keep to 2–3 basic shapes.

**empty-deals.png — "No saved deals yet"**
- **Concept:** Empty/save concept. Document or folder suggesting "deals to be saved."
- **Allowed:** Simple document outline with dashed/broken line suggesting "empty" or "to fill." Or: empty folder as **outline only** (no solid fill). Stroke-based line art only.
- **NOT allowed:** Solid fills (outline only). X mark. Magnifying glass. Person. Checkmark. Extra decorative shapes (arrows, triangles, icons inside). Keep to 2–3 basic outline shapes.

---

## 5. Generation prompts (AI-assisted)

When generating assets with AI, include these in your prompt:

**Logo:**
> Minimal logo for "Veld" — a portfolio analytics app for real estate investors. Clean sans-serif wordmark, optional small icon. Single color, flat, no gradients. TRANSPARENT BACKGROUND. Professional, trustworthy. Works at small sizes.

**Favicon:**
> Favicon for "Veld" — simplified icon or "V" monogram. Minimal, flat, single color. TRANSPARENT BACKGROUND. Readable at 16×16 pixels. Clean geometric shape.

**Stripe Checkout (icon + logo):**
> Same as logo and favicon above. Export icon as 128×128 or 512×512 PNG (square) for Stripe. Export logo as PNG with min 128px height for Stripe Checkout header. Both &lt;512KB.

**OG image:**
> Open Graph image 1200×630 for "Veld Portfolio". Text: "Veld Portfolio — Portfolio analytics for real estate investors." Minimal layout, light background, clean typography. No stock photos. Professional SaaS style.

**Value prop icons:**
> Set of 4 minimal line icons, consistent stroke weight: (1) document/spreadsheet replacement, (2) house with value/rent estimate, (3) deal analysis/magnifier, (4) scenario sliders. Single color, flat, TRANSPARENT BACKGROUND. Professional.

**Hero illustration:**
> Minimal abstract illustration for real estate portfolio app. Suggest horizon, growth, or property without literal clip art. Line-based, 2–3 colors max. TRANSPARENT BACKGROUND. Calm, professional. Landscape format.

**Empty state — empty-properties.png:**
> Empty state icon 400×400. "Add your first property." Minimal geometric house (triangle roof + rectangle) + bold plus sign. Single color black. TRANSPARENT BACKGROUND. NO chimney, smoke, grass, path, windows, doorknob. Geometric line art only. 2–3 basic shapes. Match logo/favicon style.

**Empty state — empty-deals.png:**
> Empty state icon 400×400. "No saved deals yet." Simple document outline with dashed line suggesting empty, OR empty folder as outline only (NO solid fill). Stroke-based line art only — outlines, no fills. Single color black. TRANSPARENT BACKGROUND. NO X mark, NO magnifying glass, NO person, NO arrows, NO triangles, NO extra shapes. 2–3 basic outline shapes. Match logo/favicon style.

---

## 6. File naming & placement

**Generated assets (2025-03-15):** Logo, favicon, OG image, value prop icons, and empty states are in `app/public/`. Hero skipped. Wired up: favicon and OG image in root layout; logo in app sidebar and landing page. Empty states follow exact constraints in §4.

**Stripe Checkout:** Upload `favicon-512.png` as icon and `logo.png` as logo in Stripe Dashboard → Settings → Branding. Both meet Stripe's min 128px requirement.

| Asset | Suggested path | Naming |
|-------|----------------|--------|
| Logo (SVG) | `app/public/logo.svg` | `logo.svg` |
| Logo (PNG) | `app/public/logo.png` | `logo.png`, `logo-dark.png` |
| Favicon | `app/public/favicon.ico` or `favicon.png` | `favicon.ico`, `favicon-32.png` |
| Stripe Checkout | Upload via Stripe Dashboard | `stripe-icon-128.png`, `stripe-logo.png` (keep local copy) |
| OG image | `app/public/og-image.png` | `og-image.png` |
| Value prop icons | `app/components/icons/` or `app/public/icons/` | `icon-spreadsheet.svg`, etc. |
| Hero illustration | `app/public/hero.svg` or in components | `hero.svg` |
| Empty states | `app/public/` or `app/components/` | `empty-properties.svg`, `empty-deals.svg` |

---

## 7. Checklist before publishing

- [ ] Logo readable at 24px and 16px
- [ ] Works on light and dark backgrounds
- [ ] Stripe Checkout: icon 128×128+ square PNG; logo 128px+ shortest side PNG. Both &lt;512KB. Upload to Stripe Dashboard → Branding.
- [ ] Colors match design tokens (no arbitrary hex)
- [ ] No gradients, heavy shadows, or decorative clutter
- [ ] SVG assets have proper viewBox and scale cleanly
- [ ] OG image is 1200×630 and text is legible
- [ ] Empty states: geometric only, no decorative elements, no X/magnifier/person, transparent
- [ ] All assets align with design-spec-2026.md principles

---

*Reference: [design-spec-2026.md](design/design-spec-2026.md), [architecture-and-build-practices.md](architecture-and-build-practices.md)*
