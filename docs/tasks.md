# Agent tasks

Tasks you want the **builder** agent to do. The PM adds tasks here when you ask; you can say "have the builder complete the tasks in tasks.md" and the PM will run the builder with these tasks.

**Product mantra (all tasks):** Thoughtful, robust, modern, frictionless. See `docs/architecture-and-build-practices.md`.

**Future features / roadmap:** See `docs/roadmap.md`. PM promotes items from there to here when ready to build.

---

## Current tasks (open)

### Landing page overhaul + branding + SEO

**Scope:** Improve landing page, adopt Veld/Veld Portfolio branding, make key pages public for Stripe compliance, and add SEO.

**Phase 1 — Stripe compliance (quick wins):**
- [x] **Public routes:** Add `/privacy`, `/terms`, `/pricing` to `proxy.ts` `isPublicRoute` matcher so these pages are accessible without sign-in.
- [x] **Pricing page (unauthenticated):** Update `app/(app)/pricing/page.tsx` to render pricing for `!user` — show plan cards with "Sign up to get started" CTA instead of upgrade buttons. Reuse `PricingCards` or a read-only variant.
- [x] **Landing nav:** Add links to Pricing, Privacy, Terms on landing page (or a simple nav bar). Add "Pricing" CTA.

**Phase 1 acceptance criteria:**
- [x] Unauthenticated user can visit `/privacy`, `/terms`, `/pricing` without redirect to sign-in.
- [x] Pricing page is standalone (no app shell/sidebar) — guests see nav bar + pricing + footer only.
- [x] Pricing page shows plan cards with "Sign up" (not "Upgrade") when `!user`.
- [x] Landing page has visible links to Pricing, Privacy, Terms (nav bar or footer).
- [x] `npm run check` passes.

**Phase 2 — Branding (Veld / Veld Portfolio):**
- [x] **Root layout metadata:** `title`: "Veld Portfolio" or "Veld — Portfolio Analytics"; `description`: SEO-friendly (e.g. "Portfolio analytics for real estate investors. Track equity, cash flow, and metrics. Replace spreadsheets.").
- [x] **Landing page:** Replace "Portfolio Intelligence" with "Veld Portfolio" in hero. Use "Veld" for logo/short form.
- [x] **App shell logo:** Change sidebar/header "Portfolio" to "Veld" in `app-layout-client.tsx`.
- [x] **Terms/Privacy:** Replace "Portfolio Intelligence" with "Veld Portfolio" in metadata, headings, and body text.
- [x] **Dashboard:** "Welcome to Portfolio" → "Welcome to Veld" (or similar).
- [x] **Other pages:** Audit for any remaining "Portfolio Intelligence" references; update to Veld Portfolio where appropriate. Leave "portfolio" as product terminology (e.g. "Portfolio summary", "Portfolio charts") — only brand name changes.

**Phase 2 acceptance criteria:**
- [x] Root layout: title includes "Veld Portfolio", description SEO-friendly.
- [x] Landing hero: "Veld Portfolio" (not Portfolio Intelligence).
- [x] App shell: logo/text says "Veld" (not "Portfolio").
- [x] Terms and Privacy: "Veld Portfolio" in metadata and body.
- [x] Dashboard: "Welcome to Veld".
- [x] No "Portfolio Intelligence" in app code. `npm run check` passes.

**Phase 3 — Landing page overhaul:**
- [x] **Hero:** Benefit-focused headline (e.g. "Track your rental portfolio in one place"); keep "Veld Portfolio" as brand line. Subhead: current or similar. Primary CTA for guests: "Get started free" or "Sign up". Secondary CTA: "View pricing" as visible link/button in hero (not just nav). Signed-in: "Go to dashboard" primary; value props and pricing preview still visible.
- [x] **Value props:** 4 bullets with icons — (1) Replace spreadsheets, (2) Rent & value estimates (RentCast), (3) Deal analyzer (analyze before you buy), (4) Scenario modeling (what-if sliders). Use `icon-spreadsheet.png`, `icon-estimates.png`, `icon-deal-analyzer.png`, `icon-scenario.png` from `app/public/`. If `icon-scenario.png` missing, use lucide-react placeholder.
- [x] **Pricing preview:** Compact teaser section — one-line summary ("Free, Investor, and Pro plans — start free") or 3-tier overview (Free $0, Investor $10, Pro $20). Prominent "View pricing" link to `/pricing`.
- [x] **Footer:** Privacy, Terms, Support links. Add "© 2025 Veld Portfolio". Support conditional on `SUPPORT_EMAIL`.
- [x] **Guest nav:** Add Sign in and Sign up links to nav for guests (so they're reachable after scrolling past hero).
- [x] **Responsive:** Hero, value props, pricing preview work on mobile (stacked layout, readable text, touch targets).

**Phase 3 acceptance criteria:**
- [x] Hero: benefit-focused headline, subhead, primary CTA ("Get started free" or "Sign up"), secondary CTA ("View pricing") in hero.
- [x] Value props section with 4 bullets + icons (spreadsheets, estimates, deal analyzer, scenario).
- [x] Pricing preview (summary or 3-tier teaser) + "View pricing" link visible.
- [x] Footer: Privacy, Terms, Support, "© 2025 Veld Portfolio".
- [x] Guest nav includes Sign in and Sign up.
- [x] Mobile-responsive. `npm run check` passes.

**Phase 4 — SEO:**
- [x] **Metadata (base):** `metadataBase` with `NEXT_PUBLIC_APP_URL` or `veldportfolio.com`. Root `openGraph` and `twitter` for social sharing.
- [x] **Per-page metadata:** `/`, `/pricing`, `/privacy`, `/terms` have unique `title` and `description`. "Veld Portfolio" in titles.
- [x] **Sitemap/robots:** `sitemap.xml` and `robots.txt` exist.
- [x] **Canonical URLs:** Add `alternates.canonical` to `/`, `/pricing`, `/privacy`, `/terms` (avoid duplicate content from query params, UTM).
- [x] **Per-page openGraph for Privacy & Terms:** Add page-specific `openGraph` (title, description, url) so shares show correct preview (not homepage).
- [x] **Open Graph image metadata:** Use object form with `width: 1200`, `height: 630`, `alt` for better platform compatibility.
- [x] **JSON-LD structured data:** Add Organization, WebSite, and WebApplication schemas (root layout or key pages). Supports Knowledge Panel, sitelinks, AI/LLM understanding.
- [x] **Robots disallow:** Add `/sign-in`, `/sign-up`, `/billing/` to `disallow` (auth flows, not content).
- [x] **Auth pages noindex:** Add `robots: { index: false, follow: false }` to sign-in, sign-up, billing pages.
- [x] **Favicon:** Confirm `favicon-512.png` (or `favicon.png`) correct in layout; verify displays in browser tab.

**Phase 4 acceptance criteria:**
- [x] Root layout has metadataBase, openGraph, twitter, JSON-LD.
- [x] Canonical URLs on all public pages.
- [x] Per-page openGraph for Privacy and Terms.
- [x] OG images have width, height, alt.
- [x] Robots disallow auth routes; auth pages noindex.
- [x] Favicon correct. `npm run check` passes.

**Acceptance criteria (overall):**
- [ ] `/privacy`, `/terms`, `/pricing` accessible without sign-in.
- [ ] Pricing visible to unauthenticated users.
- [ ] "Veld" in app shell; "Veld Portfolio" in formal contexts (Terms, Privacy, metadata).
- [ ] Landing has hero, value props, pricing link, nav to key pages.
- [ ] Root and key pages have SEO metadata (title, description, openGraph).
- [ ] Run `npm run check` when done.

---

### Visual assets integration

**Scope:** Wire generated assets into the app. Assets in `app/public/` per `docs/visual-assets-guide.md`.

- [ ] **Wire up empty states:** Display `empty-properties.png` on Properties page when propertyCount === 0; display `empty-deals.png` on Deals page when dealCount === 0. Replace or augment existing empty-state UI with these images.
- [ ] **Value props with icons:** Add value props section to landing page using the 4 icons (`icon-spreadsheet.png`, `icon-estimates.png`, `icon-deal-analyzer.png`, `icon-scenario.png`). Bullets: replace spreadsheets, rent/value estimates, deal analyzer, scenario modeling. See Phase 3 value props.
- [ ] **Confirm favicon:** Ensure root layout metadata `icons.icon` points to correct favicon file (`/favicon.png`). Verify favicon displays in browser tab.

**Visual assets acceptance criteria:**
- [ ] Properties empty state shows empty-properties.png when 0 properties.
- [ ] Deals empty state shows empty-deals.png when 0 deals.
- [ ] Landing has value props section with 4 icons + copy.
- [ ] Favicon correct in layout. `npm run check` passes.

---

### Contact page (form + support email)

**Scope:** Replace footer mailto link with a `/contact` page that has a contact form and displays the support email. Users can submit via form or email directly.

**Implementation:**
- [ ] **Route:** Add `/contact` page. Add to `proxy.ts` `isPublicRoute`. `robots: { index: false }` (utility page).
- [ ] **Form:** Email (required), Subject (dropdown: General, Billing, Bug report, Feature request, Other), Message (required). Pre-fill email from Clerk when signed in.
- [ ] **Below form:** "Or email us directly at support@example.com" with mailto link. Only show when `SUPPORT_EMAIL` is set.
- [ ] **API:** `POST /api/contact` — validate with Zod, rate limit (5/hour per IP or per user), honeypot field. Send via Resend to `SUPPORT_EMAIL`.
- [ ] **Env:** Add `RESEND_API_KEY` to `.env.example` and `docs/manual-steps.md`.
- [ ] **Footer:** Change Support link from mailto to `Link href="/contact"`. When `SUPPORT_EMAIL` unset: show Contact link (no email on page) or hide per current behavior.
- [ ] **Privacy:** Add brief note to Privacy Policy about contact form submissions.
- [ ] **Design:** Follow `docs/design-spec.md`; match standalone pages (Privacy, Terms).

**Acceptance criteria:**
- [ ] `/contact` accessible without sign-in.
- [ ] Form submits successfully; email arrives at SUPPORT_EMAIL.
- [ ] Support email displayed on page when set; mailto fallback works.
- [ ] Footer Support links to /contact.
- [ ] Rate limit and honeypot prevent abuse.
- [ ] `npm run check` passes.

---

### Launch pre-flight tasks (completed)

- [x] **Privacy Policy & Terms of Service** — Implemented at `/privacy` and `/terms`. Third-party services listed; age 18+; soft-delete retention (30 days); refund policy; sign-up notice with links.
- [x] **Support / contact and footer** — Footer on landing and app shell; Support (mailto), Privacy, Terms. Support hidden when `SUPPORT_EMAIL` unset.

---

## Code audit tasks (completed 2025-03-15)

| # | Task | Focus |
|---|------|-------|
| 1 | Permanent delete server-side confirmText | Security |
| 2 | Extract formatCurrency to lib | DRY |
| 3 | Move import parsing to lib | Architecture |
| 4 | Reduce modal shadows | Design |
| 5 | Resolve Prisma `any` in settings | Technical debt |
| 6 | Zod for account delete routes | Consistency |
| 7 | Extract MetricCard to shared component | DRY |
| 8 | Block API access for deleted users | Security |
| 9 | Env validation at startup | Robustness |
| 10 | Accessibility pass | A11y |

---

## Builder tasks

- [x] **Next.js middleware → proxy:** Migrate `app/middleware.ts` from the deprecated middleware convention to the new proxy convention. See [Next.js docs](https://nextjs.org/docs/messages/middleware-to-proxy). Dev/build currently show this deprecation warning; app works as-is until migrated.

- [x] **Fix important lint errors:** Fix TypeScript and ESLint errors in the app. Run `npm run check` from `app/` to verify. **Ignore** the Prisma `schema.prisma` linter warning about the datasource URL — it's required for Prisma 6.

- [x] **Standardize state field:** Store and validate US states as 2-letter abbreviations (e.g. TX, CA). Add a state dropdown to the property form with all US state abbreviations. Update validation in `lib/validations/property.ts` to accept only valid abbreviations.

- [x] **Property type and units:** When property type is single_family, units should always be 1. Hide or disable the units field for single_family; only show it for multi_family. Enforce units=1 in validation when propertyType is single_family.

- [x] **Mortgage section input text color:** Fix the mortgage form inputs so entered text and placeholder text are clearly visible (currently very light grey, hard to read). Ensure sufficient contrast for accessibility.

- [x] **Interest rate as percent:** Allow users to enter interest rate as percent (e.g. 6.25) instead of decimal (0.0625). Convert input to decimal when saving; display as percent when showing. Update form label/placeholder accordingly.

- [x] **Loan type enum:** Enforce loan type as a dropdown with common options (e.g. conventional, FHA, VA, USDA, jumbo, other). Update schema, validation, and mortgage form. Allow null/optional for existing data.

- [x] **Partial ownership support:** Allow users to record partial ownership of a property (e.g. 25%, 50%). Schema, validation, and UI updates needed. Affects metrics calculations (equity, cash flow, etc.) — scale by ownership %.

- [x] **Dark/light mode toggle:** Add a theme switcher in Settings so users can choose light or dark mode. Persist preference (e.g. localStorage or user preference). The design spec already defines light/dark tokens in `globals.css`; wire up the toggle to switch between them.

- [x] **Mortgage payment effective date:** Add optional `paymentEffectiveDate` (or `lastUpdated`) to the Mortgage model. When users add or edit a mortgage, they can optionally set when the monthly payment was last confirmed (e.g. after annual escrow review). Display "Payment as of [date]" on the mortgage section so users know the currency of the data and are nudged to review when it's stale.

- [x] **Annual billing option:** Add monthly/yearly toggle to the pricing page. Use new env vars: `STRIPE_PRICE_ID_INVESTOR_MONTHLY`, `STRIPE_PRICE_ID_PRO_MONTHLY`, `STRIPE_PRICE_ID_INVESTOR_YEARLY`, `STRIPE_PRICE_ID_PRO_YEARLY`. Update `lib/stripe-config.ts`, checkout API (accept `billingCycle`), and webhook (map all 4 price IDs to investor/pro). Unintrusive: small toggle above plan cards, monthly default; annual shows "Save 2 months" or similar. Remove old `STRIPE_PRICE_ID_INVESTOR` / `STRIPE_PRICE_ID_PRO` usage.

- [x] **Readability and space pass:** Improve use of space and readability across the app. (1) Add max-width (e.g. max-w-4xl) to main content so it centers on wide screens instead of stretching. (2) Bump body/description text from text-sm to text-base where readability matters (Settings, Pricing, Billing success, page subtitles). (3) Pricing page: larger cards, more padding, bigger plan names/descriptions; consider centering the pricing block. (4) Settings page: tighter layout for label/value pairs (avoid huge justify-between gaps); bump section text to text-base. (5) Billing success page: more prominent layout (larger heading, more padding), clearer confirmation copy. Follow docs/design-spec.md; keep minimal aesthetic but improve legibility.

- [x] **Sidebar uplift:** Add icons to nav items (Dashboard, Properties, Pricing, Settings). Increase padding (px-4 py-2.5) and gap between items (gap-2). Bump nav links to text-base. Slightly larger header (text-lg) for "Portfolio". Clearer separation between nav and Account area. Use lucide-react or similar for icons. Keep minimal aesthetic per design spec.

- [x] **Pricing page: show prices and incentivize annual:** (1) Display actual prices on pricing cards. Use config/env (e.g. lib/plans.ts or env vars) for Investor $10/mo, Pro $20/mo; annual $100 and $200 (2 months free). (2) Show both monthly and annual prices in the toggle area so users see the incentive without clicking: e.g. "Monthly $10" | "Annual $100 (Save $20)". Add "Save 2 months" or "Best value" badge on annual option visible always. (3) Update pricing-cards.tsx to show prices and the enhanced toggle.

- [x] **Dashboard: single-property view:** When propertyCount === 1, hide redundant charts (Equity by property, Cash flow by property — they duplicate the summary cards). Keep Debt vs value chart (still useful for one property). Add a compact "Property summary" or simple equity/debt breakdown for the single property. Add CTA: "Add another property to compare performance across your portfolio." When propertyCount >= 2, show all charts as today. Update dashboard-charts.tsx and dashboard page.tsx.

- [x] **Responsive layout for wide screens:** Optimize the app for large monitors (e.g. 2560x1440). (1) **App layout** (`app/(app)/layout.tsx`): Sidebar `w-56` → add `xl:w-64 2xl:w-72` so it scales up on large screens; main content `max-w-4xl` → add `xl:max-w-6xl 2xl:max-w-7xl` so content uses more viewport. (2) **Pricing page** (`pricing-cards.tsx`): Grid has redundant `max-w-4xl`; change to `max-w-5xl xl:max-w-6xl` so pricing cards get more room on wide screens. (3) **Dashboard** (`dashboard/page.tsx`): Metric cards grid `sm:grid-cols-2 lg:grid-cols-3` → add `xl:grid-cols-4 2xl:grid-cols-5` for 4–6 metrics when space allows. (4) **Dashboard charts** (`dashboard-charts.tsx`): "Property at a glance" already has `lg:grid-cols-4`; consider `xl:grid-cols-4` or leave as-is. Charts row `lg:grid-cols-2` is fine. (5) **Property detail** (`properties/[id]/page.tsx`): Grid `sm:grid-cols-2` is fine; no change needed. (6) **Property metrics** (`property-metrics-section.tsx`): `md:grid-cols-3` → add `xl:grid-cols-4` for 4+ metrics on wide screens. (7) **Settings**: Grids are fine. Follow design spec; run `npm run check` when done.

- [x] **Properties page overhaul:** Improve the Properties list page for wide screens and add meaningful content. (1) **Richer property cards:** Include mortgages in the query; compute per-property metrics (value, equity, monthly cash flow). Display Value, Equity, Monthly cash flow on each card; color cash flow positive/negative. (2) **Property type badge:** Show property type (Single family / Multi family) as a small badge on each card; for multi_family show units e.g. "Multi family (4 units)". (3) **Grid layout:** Use `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3` so cards fill space on wide screens. (4) **Portfolio summary header:** When 1+ properties exist, add a summary strip at top: total value, total equity, total monthly cash flow (reuse computePortfolioMetrics). (5) **Typography:** Bump buttons to `text-base`, address to `text-base` for consistency with dashboard. Update `app/(app)/properties/page.tsx`. Run `npm run check` when done.

- [x] **Add Property guided flow:** Replace the single-page "giant form" with a multi-step guided flow (wizard). Includes optional mortgage step. See acceptance criteria below.

  **Step breakdown:**
  1. Address & basics — Nickname, address (line 1 & 2, city, state, ZIP), property type, units
  2. Purchase — Purchase price, purchase date, current estimated value, cash invested
  3. Income & expenses — Monthly rent, monthly expenses
  4. Mortgage (optional) — "Add mortgage?" Yes → mortgage form (reuse existing); No → skip
  5. Review — Summary of property + mortgage (if any), notes, submit

  **Acceptance criteria:**
  - [x] Wizard has 5 steps as defined above; mortgage step is clearly optional (Yes/No choice)
  - [x] Progress indicator visible (e.g. "Step 2 of 5" or stepper dots)
  - [x] Back/Next navigation; Next validates current step before advancing
  - [x] Review step shows full summary with edit links to jump back to a step
  - [x] Mortgage step reuses existing mortgage form fields/validation; one mortgage only in wizard
  - [x] Submitting creates property (and mortgage if added) in one flow; redirect to property detail
  - [x] Standalone "Add mortgage" on property detail page still works for adding mortgages later
  - [x] Design aligns with `docs/design-spec.md` (semantic tokens, typography, spacing)

- [x] **Property detail page readability:** Improve typography and layout on the property detail page for better readability on large monitors. (1) **Mortgage section:** Bump section header, labels, values, buttons, empty state to text-base; values use text-lg; card padding p-4→p-5, gap-y-2→gap-y-3; display original loan amount, loan type (formatted), loan start date when available. (2) **Property details section:** Labels text-sm→text-base; values text-base/text-lg; Edit property link text-base. (3) **Property metrics section:** Labels text-base; values text-base. (4) **Breadcrumb:** ← Properties link text-base. Run `npm run check` when done.

- [x] **Mobile responsive layout (hamburger + slide-out drawer):** Make the app usable on mobile. On viewports below `md` (768px), hide the fixed sidebar and use a hamburger menu that opens a slide-out drawer. Update `app/(app)/layout.tsx` and related components. See acceptance criteria below.

  **Implementation approach:**
  - On mobile (< md): Sidebar hidden; show a top bar with hamburger icon (left) + "Portfolio" logo (center or left) + UserButton (right).
  - Hamburger opens a slide-out drawer from the left containing the full nav (Dashboard, Properties, Pricing, Settings) and Account area — same structure as desktop sidebar.
  - Drawer overlays content with a semi-transparent backdrop; tapping backdrop or a nav link closes the drawer.
  - On md and up: Keep current layout (sidebar always visible, no hamburger).
  - Main content area uses full width on mobile; reduce padding if needed (e.g. p-4 instead of p-6).

  **Acceptance criteria:**
  - [x] On viewport width < 768px, sidebar is hidden and a mobile top bar is visible with hamburger + logo + UserButton.
  - [x] Tapping hamburger opens a slide-out drawer from the left with the same nav links and Account section as the desktop sidebar.
  - [x] Tapping a nav link navigates and closes the drawer.
  - [x] Tapping the backdrop (outside the drawer) closes the drawer.
  - [x] On viewport width ≥ 768px, layout matches current desktop behavior (sidebar visible, no hamburger).
  - [x] Main content is readable and usable on mobile (no horizontal overflow, adequate touch targets).
  - [x] Follow docs/design-spec.md; use semantic tokens. Run `npm run check` when done.

- [x] **Mobile-friendly input attributes (keyboard & autocomplete):** Ensure form inputs use appropriate `inputmode` and `autocomplete` so mobile devices show the correct keyboard and autofill works. CurrencyInput already has `inputMode="decimal"` ✓. Add the following per industry standard (MDN, WCAG, mobile UX best practices):

  **1. ZIP code** (add-property-wizard.tsx, property-form.tsx):
  - Add `inputMode="numeric"` — shows numeric keypad on mobile (ZIP is digits only)
  - Add `autoComplete="postal-code"` — enables address autofill

  **2. Address fields** (add-property-wizard.tsx, property-form.tsx):
  - addressLine1: `autoComplete="street-address"`
  - addressLine2: `autoComplete="address-line2"`
  - city: `autoComplete="address-level2"`
  - state: (select — no change; autocomplete for selects is less standard)
  - zipCode: as above

  **3. Mortgage form** (mortgage-form-fields.tsx):
  - Interest rate (type="number"): add `inputMode="decimal"` — ensures numeric keypad with decimal on Android (some show full keyboard for type="number")
  - Term years (type="number"): add `inputMode="numeric"` — integer numeric keypad

  **4. Add property wizard** (add-property-wizard.tsx):
  - Units (type="number"): add `inputMode="numeric"`
  - Ownership % (type="number"): add `inputMode="numeric"` (integer 1–100)

  **5. Property form** (property-form.tsx):
  - Units (type="number"): add `inputMode="numeric"`
  - Ownership %: add `inputMode="numeric"` if present

  **Acceptance criteria:**
  - [x] ZIP inputs have inputMode="numeric" and autoComplete="postal-code"
  - [x] Address inputs have appropriate autoComplete values
  - [x] Numeric inputs (interest rate, term, units, ownership %) have inputMode="decimal" or "numeric" as appropriate
  - [x] CurrencyInput unchanged (already has inputMode="decimal")
  - [x] Run `npm run check` when done

- [x] **Onboarding (welcome + first property prompt + metric help):** Add onboarding for new users with 0 properties. (1) **When:** After sign-up, user lands on dashboard. If propertyCount === 0, show onboarding state instead of empty dashboard. (2) **Welcome screen:** Brief "Welcome to Portfolio" heading, one-sentence value prop ("Track your rental properties and see equity, cash flow, and more at a glance."), primary CTA "Add your first property" linking to /properties/new. (3) **Metric help:** Add "What do these mean?" link near dashboard "Portfolio summary" or chart section. Clicking opens a modal/panel with short definitions: Total property value, Total debt, Total equity, Monthly cash flow, Portfolio cap rate, Portfolio LTV. (4) Once user has 1+ properties, normal dashboard shows; onboarding is not shown again.

  **Acceptance criteria:**
  - [x] User with 0 properties sees onboarding welcome (not empty dashboard with "No properties yet").
  - [x] Onboarding has "Add your first property" CTA that links to /properties/new.
  - [x] Dashboard (when 1+ properties) has "What do these mean?" link that opens metric definitions.
  - [x] Metric definitions cover: Total property value, Total debt, Total equity, Monthly cash flow, Portfolio cap rate, Portfolio LTV.
  - [x] Onboarding is not shown when user has 1+ properties.
  - [x] Follow docs/design-spec.md. Run `npm run check` when done.

- [x] **Data export (CSV):** Implement CSV export in Settings. (1) **Location:** Existing "Export your data" section in Settings. (2) **Format:** CSV only. (3) **Content:** One CSV with flattened rows. Each row = one property. Columns: address, nickname, property type, units, purchase price, purchase date, value, rent, expenses, cash invested, ownership %, mortgage balance, mortgage rate, mortgage term, monthly payment, lender, equity, monthly cash flow, cap rate, LTV. Include header row. (4) **Serving:** API route (e.g. GET /api/export/portfolio) that queries user's properties + mortgages, computes metrics, builds CSV in memory, returns with `Content-Disposition: attachment; filename="portfolio-export.csv"` and `Content-Type: text/csv`. (5) **UI:** "Download CSV" button in Settings → Export section; triggers fetch to API, then client creates blob and triggers download.

  **Acceptance criteria:**
  - [x] Settings export section has "Download CSV" button.
  - [x] Clicking downloads a CSV file with filename portfolio-export.csv.
  - [x] CSV includes property details, mortgage details (one mortgage per property if present), and computed metrics (equity, cash flow, cap rate, LTV).
  - [x] CSV has header row.
  - [x] Empty portfolio: CSV has headers only or empty file; no error.
  - [x] Run `npm run check` when done.

- [x] **Delete account (soft delete + restore):** Implement self-service account deletion with password confirmation and restore capability. (1) **Schema:** Add `deletedAt DateTime?` to User model. Migration required. (2) **Auth flow:** When user requests delete, require password re-entry. Use Clerk's `clerkClient.users.verifyPassword` or equivalent to verify before proceeding. (3) **Delete flow:** On confirm: (a) Set `user.deletedAt = new Date()`. (b) Cancel Stripe subscription if active (call Stripe API to cancel). (c) Clear or null `stripeCustomerId` to avoid billing. (d) Keep properties and mortgages (soft delete only; data stays for restore). (e) Sign user out and redirect to landing with message "Your account has been deactivated." (4) **Auth guard:** Update `getAppUser` (or equivalent): if user exists and `deletedAt` is set, return user with a `deleted: true` flag. App layout or middleware: when user is deleted, show "Restore account" screen instead of dashboard. (5) **Restore flow:** "Restore account" button clears `deletedAt`; user returns to dashboard with data intact. (6) **UI:** Settings → Delete account section: replace "Coming soon" with "Delete account" button. Two-step: (a) Click "Delete account" → modal with password field + warning. (b) Submit → verify password → perform delete → sign out. (7) **Restore screen:** When deleted user signs in, show full-screen "Your account was deactivated" with "Restore account" button. No access to dashboard/properties until restored.

  **Acceptance criteria:**
  - [x] User model has `deletedAt` field; migration applied.
  - [x] Delete account flow requires password; Clerk verifies before delete.
  - [x] On delete: deletedAt set, Stripe subscription canceled, stripeCustomerId cleared, user signed out, redirect to landing.
  - [x] Properties and mortgages remain in DB (soft delete).
  - [x] Deleted user signing in sees "Restore account" screen, not dashboard.
  - [x] Restore clears deletedAt; user returns to dashboard with data intact.
  - [x] All app queries (dashboard, properties, etc.) exclude or handle deleted users; no data leakage.
  - [x] Run `npm run check` when done.

- [x] **Permanent account deletion (GDPR/CCPA compliance):** Add a separate "Permanently delete" option alongside the existing "Deactivate" flow. Users need both choices for privacy law compliance (right to erasure). (1) **UI:** In Settings → Delete account section, show two distinct options: (a) **Deactivate account** — "Pause your account and hide your data. You can restore it later by signing in." Button opens existing deactivate modal (password, soft delete). (b) **Permanently delete account** — "Permanently delete all your data. This cannot be undone." Button opens a separate modal with stronger confirmation: password + require user to type "DELETE" (or check "I understand this cannot be undone") before enabling Confirm. (2) **API:** Create POST /api/account/delete-permanent (or add `permanent: true` to existing delete). Verify password via Clerk. Then: (a) Cancel Stripe subscription if active. (b) Delete user from DB (cascade deletes properties, mortgages, subscription). (c) Optionally delete user from Clerk via `clerkClient.users.deleteUser(clerkUserId)` for full erasure. (d) Sign user out, redirect to /?deleted=permanent. (3) **Landing:** When ?deleted=permanent, show "Your account and data have been permanently deleted." (4) **Copy:** Ensure deactivate vs permanent are clearly labeled; deactivate says "restore later," permanent says "cannot be undone."

  **Acceptance criteria:**
  - [x] Settings Delete account section shows two options: Deactivate and Permanently delete.
  - [x] Deactivate: existing flow (password, soft delete, restore possible).
  - [x] Permanently delete: separate modal, password + type "DELETE" (or equivalent) confirmation, then hard delete.
  - [x] Permanent delete: Stripe subscription canceled, user + properties + mortgages + subscription deleted from DB.
  - [x] Optional: delete user from Clerk for full erasure.
  - [x] User signed out and redirected; landing shows appropriate message for permanent vs deactivate.
  - [x] Run `npm run check` when done.

- [x] **Rent estimate integration (RentCast):** Add rent estimate capability so users can get market-based rent suggestions when adding or editing properties. Follow `docs/architecture-and-build-practices.md` integration pattern.

  **Architecture:**
  - Create `lib/integrations/rentcast.ts` — adapter that accepts address, city, state, zipCode, propertyType, units; calls RentCast API; handles errors, rate limits, timeouts; returns typed result `{ rent: number }` or error.
  - Create `GET /api/estimates/rent` — auth via `getAppUser()`, validate query params with Zod (addressLine1, city, state, zipCode required; addressLine2, propertyType, units optional), call RentCast adapter, return estimate or error. Never expose API key to client.
  - Env: `RENTCAST_API_KEY` — add to `.env.example` and `docs/manual-steps.md`.

  **UI — Add Property wizard (Step 3, Income & expenses):**
  - Add "Estimate rent" button/link next to Monthly rent field.
  - On click: call API with address from Step 1 (addressLine1, city, state, zipCode) and propertyType/units from Step 1.
  - Loading state while fetching.
  - On success: populate rent field with estimate; optionally show "Estimate: $X" or similar.
  - On error: show "Estimate unavailable for this address" or similar; user can still enter manually.
  - Estimate is optional; user can always enter rent manually.

  **UI — Edit property form:**
  - Same "Estimate rent" control next to Monthly rent field.
  - Use existing property address.

  **Acceptance criteria:**
  - [x] `lib/integrations/rentcast.ts` exists; fetches rent estimate; handles errors gracefully.
  - [x] `GET /api/estimates/rent` exists; auth + Zod validation; returns `{ rent: number }` or `{ error: string }`.
  - [x] Add Property wizard Step 3 has "Estimate rent" that populates rent field.
  - [x] Edit property form has "Estimate rent" that populates rent field.
  - [x] API key in env; documented in `.env.example` and `docs/manual-steps.md`.
  - [x] Graceful failure: API error or address not found shows clear message; manual entry still works.
  - [x] Run `npm run check` when done.

- [x] **Add Property wizard: tabbing and Enter-key UX:** Make the add-property wizard behave industry-standard for keyboard users. (1) **Tab order:** Ensure logical tab order through all inputs in each step (no skips, no reverse order). (2) **Enter key:** When user presses Enter in any input field, advance to the next step (same as clicking Next). On the last step, Enter submits the form. Do not submit on Enter in the middle of a step (e.g. Enter in ZIP should go to next step, not submit). (3) **Focus:** After advancing, focus the first input of the next step so user can continue typing without clicking. (4) **Scope:** Apply to add-property-wizard.tsx; reuse pattern for property-form.tsx if applicable. Follow WCAG 2.1 keyboard interaction guidelines.

  **Acceptance criteria:**
  - [x] Tab moves through fields in logical order within each step
  - [x] Enter in any input advances to next step (or submits on final step)
  - [x] Focus moves to first input of next step after advancing
  - [x] No accidental form submission when Enter is pressed mid-step
  - [x] Run `npm run check` when done

- [x] **Per-unit rent + optional property details (bedrooms, unit mix):** Support per-unit rent for multi-family (e.g. duplex: Unit 1 $1500, Unit 2 $1900) and optional bedrooms/bathrooms for more accurate rent estimates. Minimal friction.

  **Schema:**
  - Add `unitRents Json?` to Property — array of numbers, one per unit. For single-family: `[total]`. For multi-family: `[1500, 1900]`. Total rent = sum(unitRents). When null, fall back to `currentMonthlyRent` for backward compat.
  - Add `bedrooms Int?`, `bathrooms Decimal?` — optional, for single-family. Improves RentCast estimate.
  - Add `unitMix String?` — optional, for multi-family. E.g. "2BR, 3BR" for duplex. Improves RentCast estimate.
  - Migration: existing properties keep currentMonthlyRent; new/edited properties use unitRents. On read: if unitRents present, total = sum; else total = currentMonthlyRent.

  **Validation (lib/validations/property.ts):**
  - Add optional bedrooms (1-10), bathrooms (0.5-10), unitMix (max 100 chars).
  - For create/update: when propertyType is multi_family and units=N, require unitRents array of length N, each non-negative. When single_family, unitRents is single-element array or we derive from currentMonthlyRent.
  - API accepts unitRents as number[] or derives from currentMonthlyRent for backward compat.

  **RentCast integration:**
  - Extend RentCastParams and API route to accept bedrooms, bathrooms (single-family) and unitMix (multi-family). RentCast API supports these for better estimates.
  - Update `lib/integrations/rentcast.ts` and `GET /api/estimates/rent` to pass bedrooms, bathrooms when provided.

  **Add Property wizard (Step 3, Income & expenses):**
  - Single-family: one "Monthly rent" field. Optional "Bedrooms" and "Bathrooms" (dropdown or number input) with helper text "Optional — improves rent estimates."
  - Multi-family: show "Unit 1 rent", "Unit 2 rent", ... "Unit N rent" (N = units). Total computed and displayed. Optional "Unit mix" field (e.g. "2BR, 3BR") with helper text "Optional — improves rent estimates."
  - Rent estimate: pass bedrooms/bathrooms or unitMix to API. For multi-family estimate: if RentCast returns per-unit, show "Estimate: $X/unit × N = $Y total" and let user apply to each unit or fill total. If total, show and let user split.

  **Edit property form:**
  - Same structure: per-unit rent for multi-family, optional bedrooms/bathrooms or unit mix.
  - Load existing unitRents when editing.

  **Property detail page:**
  - For multi-family: display per-unit rents (Unit 1: $X, Unit 2: $Y) and total. For single-family: display rent as today.
  - Show bedrooms/bathrooms or unit mix when present.

  **API routes (create/update property):**
  - Accept unitRents, bedrooms, bathrooms, unitMix. Compute currentMonthlyRent = sum(unitRents) when unitRents provided. Store all new fields.

  **Acceptance criteria:**
  - [x] Schema has unitRents, bedrooms, bathrooms, unitMix; migration applied.
  - [x] Single-family: one rent field; optional bedrooms/bathrooms.
  - [x] Multi-family: Unit 1, Unit 2, ... Unit N rent fields; optional unit mix.
  - [x] Rent estimate API accepts and passes bedrooms, bathrooms, unitMix to RentCast.
  - [x] Add Property wizard and Edit form support new structure.
  - [x] Property detail shows per-unit rents for multi-family.
  - [x] Metrics use total rent (sum of unitRents); no regression.
  - [x] Existing properties without unitRents still work (currentMonthlyRent fallback).
  - [x] Run `npm run check` when done.

- [x] **RentCast unit mix fix:** RentCast API does not support `unitMix` (see [RentCast rent estimate docs](https://developers.rentcast.io/reference/rent-estimate-long-term)). Replaced with `bedrooms` and `bathrooms` for multi-family ("Typical unit bedrooms/bathrooms") — these are supported params per [RentCast changelog](https://developers.rentcast.io/changelog/api-release-2025-08). Removed unitMix from RentCast integration. Multi-family now uses same bedrooms/bathrooms fields as single-family for estimates. unitMix kept in schema for backwards compat (display only).

- [x] **Additional property types (Condo, Townhouse, Manufactured, Apartment):** RentCast supports 6 property types; we currently support 2. Add: Condo, Townhouse, Manufactured, Apartment. (1) **Schema/validation:** Extend propertyType enum. (2) **Units rule:** Only Multi-Family and Apartment allow units > 1; Single Family, Condo, Townhouse, Manufactured enforce units = 1. (3) **RentCast mapping:** Map to RentCast values (Single Family, Condo, Townhouse, Manufactured, Multi-Family, Apartment). (4) **UI:** Add options to property type dropdown in wizard and form. (5) **Per-unit rent:** Single-unit types use one rent field; multi-unit types use per-unit fields.

- [x] **Admin dashboard:** Add an admin section to manage users, view aggregate stats, and monitor API usage. Admin access restricted by env var; all checks server-side.

  **Admin auth (lib/auth.ts):**
  - Add `isAdmin(user: { email: string }): boolean` — parses `ADMIN_EMAILS` from env (comma-separated), checks if `user.email` (lowercase) is in the list. Returns false if `ADMIN_EMAILS` is empty or unset.
  - Add `ADMIN_EMAILS` to `app/.env.example` (placeholder: `admin@example.com`). Document in `docs/manual-steps.md`. Do not commit real admin emails.
  - Admin check is server-side only; never expose to client.

  **RentCast API usage logging:**
  - Add `RentCastApiCall` model to Prisma: `userId`, `propertyId?`, `createdAt`. Log each successful/failed call from the rent estimate API route.
  - Migration required.
  - Enables admin to see total calls and per-user breakdown.

  **Admin layout and guard:**
  - Create `app/(app)/admin/` route group. Layout: call `getAppUser()`, then `isAdmin(user)`. If not admin, redirect to `/` or 403.
  - Admin routes are under `/admin/*`. Same app shell (sidebar) but add "Admin" nav link only when `isAdmin(user)`.

  **Admin dashboard page (`/admin`):**
  - **Summary cards:** Total users, total properties, subscription breakdown (free / investor / pro), RentCast API calls this month.
  - **User list:** Table with email, plan, property count, last active (from User.updatedAt or most recent property/mortgage update). Paginated or limited to recent 50.
  - **RentCast usage:** Total calls this month, calls by user (optional). Simple table or summary.

  **Admin API routes (optional):**
  - `GET /api/admin/stats` — returns aggregate counts. Auth: `getAppUser()` + `isAdmin()`. Returns 403 if not admin.
  - Or compute stats in server component; no separate API if data comes from Prisma directly.

  **Nav:**
  - In app nav (sidebar), show "Admin" link only when `isAdmin(user)`. Use same layout as Dashboard, Properties, etc.

  **Security checklist:**
  - [x] `ADMIN_EMAILS` in .env only; never in client bundle.
  - [x] Every admin route and layout checks `isAdmin(user)` server-side.
  - [x] No client-side admin checks (bypassable).
  - [x] Admin API routes (if any) also enforce `isAdmin()`.

  **Acceptance criteria:**
  - [x] `isAdmin(user)` in lib/auth.ts; uses ADMIN_EMAILS env var.
  - [x] ADMIN_EMAILS in .env.example and docs/manual-steps.md.
  - [x] RentCastApiCall model + migration; rent estimate route logs each call.
  - [x] `/admin` route group with layout guard (redirect non-admins).
  - [x] Admin dashboard shows: user count, property count, plan breakdown, RentCast calls this month.
  - [x] Admin dashboard shows user list (email, plan, property count, last active).
  - [x] "Admin" nav link visible only to admins.
  - [x] Non-admins cannot access /admin (redirect or 403).
  - [x] Run `npm run check` when done.

- [x] **Add Property draft save / unsaved changes guard:** When user is in the add property wizard and navigates away (e.g. clicks "View plans" after hitting property limit), they lose all entered data. Add: (1) **Leave warning:** Popup when user tries to navigate away with unsaved data. Options: "Save draft and continue", "Don't save and continue", "Cancel" (stay). (2) **Draft restoration:** When user returns to Add Property, if a draft exists, prompt: "Continue from draft" or "Start fresh". Show draft timestamp (e.g. "Saved at 2:34 PM"). Start fresh deletes the draft. (3) **Draft storage:** Each save overwrites the previous; one draft per user. Modern app focus: smooth UX, no data loss.

  **Implementation (refined):**

  - **Storage:** `localStorage` key `add-property-wizard-draft`. Store `{ data: WizardData, savedAt: string }` (ISO timestamp). No backend. Defer auto-save to Phase 2.

  - **Navigation interception:** Create `DraftContext` with `navigateTo(href)`. When `hasDraft` is true, `navigateTo` shows modal first; on confirm, saves/clears draft and navigates. Nav links and "View plans" CTA (property limit) all use `navigateTo` instead of direct Link. `beforeunload` for browser close/refresh.

  - **Dirty detection:** `hasAnyWizardData(data)` — true if any address, purchase, income, or mortgage field has meaningful content. Avoid false positives on empty form.

  - **Draft timestamp:** Store `savedAt` with draft. In restore modal: "Saved at 2:34 PM" or "Saved 2 hours ago". Helps user decide Continue vs Start fresh.

  - **Property limit CTA:** "View plans" button must call `navigateTo('/pricing')` so it goes through the same modal flow.

  **Acceptance criteria:**
  - [x] Navigating away with entered data shows modal: Save draft / Don't save / Cancel.
  - [x] "Save draft" persists `{ data, savedAt }` to localStorage and navigates.
  - [x] Returning to Add Property with draft shows prompt: Continue or Start fresh, with timestamp.
  - [x] Start fresh deletes draft.
  - [x] Each save overwrites previous draft.
  - [x] Successful property creation clears draft.
  - [x] Run `npm run check` when done.

- [x] **Security: headers + rate limiting:** Per docs/security-audit.md §3–4. (1) **Security headers:** Add to `app/next.config.ts` — X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. (2) **Rent estimate rate limit:** In GET /api/estimates/rent, after getAppUser(), count RentCastApiCall for userId in last hour; if >= 20 return 429. DB-based, no new deps. (3) **Account delete:** Defer or add AccountActionAttempt table; see audit for Option A/B. Document in security-notes.md.

  **Acceptance criteria:**
  - [x] Security headers in next.config
  - [x] Rent estimate API rate limited (20/hour per user)
  - [x] Run `npm run check` when done

---

## New tasks (to be picked up by builder)

- [x] **Dashboard enhancements (charts, metrics, diverging bar):** Improve dashboard charts and add new metrics. See recommendations below.

  **1. Cash flow chart — fix negative values:**
  - Add `domain={['dataMin', 'dataMax']}` to YAxis in `cash-flow-chart.tsx` so negative bars render below the zero line instead of being clipped.

  **2. Cash flow chart — diverging bar (optional, if clean):**
  - Replace vertical bar chart with a **diverging bar chart**: bars extend left (negative) and right (positive) from a center line. Very clear for mixed positive/negative cash flow. Use Recharts BarChart with `layout="vertical"` and `stackId` or a custom approach. Only implement if it can be done cleanly and elegantly; otherwise keep the fixed vertical bar chart.

  **3. New summary metrics (dashboard cards):**
  - **Cash-on-cash return** — `annualCashFlow / cashInvested` when cashInvested > 0. Portfolio-level: weighted by property or sum(annualCashFlow) / sum(cashInvested). Show as percentage.
  - **NOI (Net Operating Income)** — `grossAnnualRent - annualExpenses`; portfolio total. Add to summary cards or a secondary row.

  **4. Rent vs expenses breakdown (optional chart):**
  - Stacked bar or pie: Rent vs Expenses vs Mortgage by property. Helps users see where money goes. Add only if it fits the layout and doesn’t clutter.

  **5. Metric help modal:**
  - Add definitions for any new metrics (cash-on-cash, NOI) to `metric-help-modal.tsx`.

  **Acceptance criteria:**
  - [ ] Negative cash flow bars display correctly (YAxis domain fix).
  - [ ] Diverging bar chart for cash flow OR keep vertical bar with fix (builder’s call based on elegance).
  - [ ] Cash-on-cash return and NOI shown on dashboard when applicable.
  - [ ] Metric help updated for new metrics.
  - [ ] Run `npm run check` when done.

- [ ] **Ownership % audit + display options:** Ensure ownership % is applied consistently and offer user choice for how debt/liability is displayed.

  **Current behavior (audit):**
  - `property-metrics.ts` and `portfolio-metrics.ts` scale by ownership %: equity, rent, expenses, cash flow, value, debt.
  - **Dashboard** (`dashboard/page.tsx`): Does NOT pass `ownershipPercent` in portfolioInput — metrics default to 100%. **Bug:** partial owners see full-property numbers on dashboard.
  - **Charts:** `debtVsValue` uses raw `estimatedValue` and `totalMortgageBalance` — shows full property, not user’s share. May be intentional (property-level view) or inconsistent.
  - Properties page, property detail, export, summary API: all pass ownershipPercent correctly.

  **Ownership model — recommendations:**

  | Metric | Proportional (My share) | Full liability |
  |--------|-------------------------|-----------------|
  | **Equity** | (value − debt) × % | Same — you own X% of equity |
  | **Rent** | rent × % | Same — you receive X% of rent |
  | **Expenses** | expenses × % | Same — your share of taxes, insurance, etc. |
  | **Debt** | debt × % (your share of the asset’s debt) | debt × 100% (full liability — you’re on the hook) |
  | **Mortgage payment** | payment × % | payment × 100% (full payment) |
  | **Cash flow** | (rent − expenses − payment) × % | (rent × % − expenses × % − payment) — income scaled, debt full |

  **Recommendation:** Default to **Proportional** (current behavior) for all metrics. It answers “What’s my piece?” and is what most partial owners want. Add an optional **Settings** toggle: “Display mode: My share (proportional) | Full liability” for users who want to see their joint liability.

  **Implementation:**
  1. **Fix dashboard:** Pass `ownershipPercent: p.ownershipPercent ?? 100` in dashboard `portfolioInput`. Same for chart data — ensure equity, debtVsValue, cashFlow use scaled metrics when ownership < 100%.
  2. **Chart consistency:** Decide: charts show (a) property-level (full numbers) or (b) user’s share (scaled). Recommend (b) for consistency with summary cards. Update debtVsValue and equity charts to use scaled values when ownership < 100%.
  3. **Display mode (Phase 2):** Add User or App setting: `ownershipDisplayMode: 'proportional' | 'full_liability'`. When `full_liability`: debt and mortgage payment use 100%; equity, rent, expenses stay scaled; cash flow = (rent×% − expenses×% − payment). Store in User model or localStorage; default proportional.
  4. **Documentation:** Add brief note to `docs/architecture-and-build-practices.md` or `docs/security-notes.md` (or new `docs/ownership-metrics.md`) explaining the two modes and when to use each.

  **Acceptance criteria:**
  - [x] Dashboard passes ownershipPercent; partial owners see correct scaled metrics.
  - [x] Charts (equity, debtVsValue, cashFlow) use scaled values when ownership < 100%.
  - [x] Display mode toggle (proportional vs full liability) — Phase 2 implemented.
  - [x] Run `npm run check` when done.

- [x] **Ownership display mode toggle (Phase 2):** Add Settings toggle for "My share (proportional)" vs "Full liability" view. See docs/ownership-metrics.md.

  **1. Schema:** Add `ownershipDisplayMode String?` to User model. Values: `"proportional"` (default) or `"full_liability"`. Migration required.

  **2. Metrics logic:** Extend `computePortfolioMetrics` and `computePropertyMetrics` to accept optional `displayMode`. When `full_liability`:
  - Debt: 100% (not scaled by ownership %)
  - Mortgage payment: 100% (not scaled)
  - Equity, rent, expenses: stay scaled by ownership %
  - Cash flow: (rent×% − expenses×% − full payment) per property; portfolio = sum
  - LTV: totalDebt (full) / totalMarketValue (scaled) — debt uses 100%, value uses scaled

  **3. API:** Add PATCH /api/me or extend existing to accept `ownershipDisplayMode`. Auth via getAppUser(). Validate value is "proportional" or "full_liability".

  **4. Settings UI:** Add section "Portfolio display" with toggle/select: "My share (proportional)" | "Full liability". Helper text: "Proportional shows your share of each metric. Full liability shows 100% of debt and mortgage (joint liability)." Client component that calls API on change; server refetches or use router.refresh().

  **5. Wire up everywhere:** Dashboard, properties page, property detail, charts, export API, portfolio summary API — pass user.ownershipDisplayMode ?? "proportional" into metrics. getAppUser() already returns user; ensure it includes ownershipDisplayMode from DB.

  **6. Documentation:** Update docs/ownership-metrics.md to mark Full Liability as implemented.

  **Acceptance criteria:**
  - [x] User can toggle display mode in Settings.
  - [x] Dashboard, properties, property detail, charts, export use the selected mode.
  - [x] Proportional = current behavior (default).
  - [x] Full liability = debt and payment at 100%; equity, rent, expenses scaled; cash flow = (rent×% − expenses×% − payment).
  - [x] Run `npm run check` when done.

---

## New tasks (value-add pipeline)

- [x] **Vacancy assumption:** Add vacancy % to properties for more realistic cash flow and NOI.

  **Schema:** Add `vacancyPercent Int @default(5)` to Property (0–100). Migration required.

  **Metrics:** In `lib/metrics/property-metrics.ts`, add `vacancyPercent?: number` to PropertyMetricsInput. Effective rent = `monthlyRent * (1 - vacancyPercent/100)`. Use effective rent (not gross rent) for: grossAnnualRent, NOI, cash flow, cap rate. Expenses and mortgage unchanged. Portfolio metrics aggregate from property metrics (no change to portfolio-metrics signature; vacancy flows through property input).

  **Data flow:** All callers that build PortfolioPropertyInput or PropertyMetricsInput must pass `vacancyPercent: p.vacancyPercent ?? 5`. Dashboard, properties page, property detail, export API, portfolio summary API, property metrics API.

  **Forms:** Add "Vacancy %" field to add-property-wizard (Step 3, Income & expenses) and property-form. Number input 0–100, default 5. Helper text: "Expected vacancy (e.g. 5%). Reduces rent in cash flow calculations."

  **Validation:** `lib/validations/property.ts` — optional vacancyPercent 0–100, default 5.

  **Display:** Property detail page — show vacancy % when not default. Dashboard/charts — no change (metrics already use it). CSV export — add vacancy % column.

  **Acceptance criteria:**
  - [x] Property has vacancyPercent; migration applied.
  - [x] Metrics use effective rent (rent × (1 − vacancy/100)) for cash flow, NOI, cap rate.
  - [x] Add property wizard and edit form have vacancy field (default 5).
  - [x] Dashboard, properties, property detail, export, APIs all pass vacancyPercent.
  - [x] Run `npm run check` when done.

- [x] **Scenario modeling:** "What if" sliders on property detail to recalculate metrics with adjusted inputs.

  **Location:** Property detail page (`properties/[id]/page.tsx`). Add a collapsible "Scenario" section below Property metrics.

  **UI:** Client component. Sliders or number inputs for: Rent % change (−20 to +20), Value % change (−20 to +20), Mortgage payment % change (−20 to +20). Each applies to the property's current values. Display recalculated: monthly cash flow, cap rate, cash-on-cash return. Label clearly: "What if rent increased 10%?" etc.

  **Logic:** Reuse `computePropertyMetrics` from `lib/metrics/property-metrics.ts`. Pass base property data with adjusted values: `monthlyRent * (1 + rentChange/100)`, etc. No persistence — scenario is ephemeral.

  **Design:** Follow design-spec; use semantic tokens. Collapsible so it doesn't clutter. "Reset" button to clear overrides.

  **Acceptance criteria:**
  - [x] Property detail has Scenario section (collapsible).
  - [x] User can adjust rent %, value %, mortgage payment % and see recalculated metrics.
  - [x] Uses computePropertyMetrics with adjusted inputs; no new formulas.
  - [x] Reset clears overrides.
  - [x] Run `npm run check` when done.

- [x] **Data staleness nudges:** Show "Last updated X ago" on property cards and nudge when stale.

  **Data:** Use `Property.updatedAt`. No schema change.

  **Helper:** Add `formatTimeAgo(date: Date): string` in `lib/` (e.g. `lib/date-utils.ts`). Returns "2 days ago", "3 months ago", "1 year ago" for recent; "X months ago" or "X years ago" for older. Use `Intl.RelativeTimeFormat` or simple logic.

  **Property cards (properties page):** Show "Updated 2 months ago" or similar below address or in card footer. Muted text.

  **Property detail:** Optionally show "Last updated X ago" in property details section.

  **Stale nudge:** When `updatedAt` is > 6 months ago, show a subtle badge or note: "Consider updating" or "Data may be stale" — muted, non-intrusive. On property cards and/or property detail.

  **Acceptance criteria:**
  - [x] Property cards show "Updated X ago" (or "Updated today" for same-day).
  - [x] Properties not updated in 6+ months show "Consider updating" or similar nudge.
  - [x] Property detail shows last updated.
  - [x] formatTimeAgo utility in lib.
  - [x] Run `npm run check` when done.

---

## New tasks (value-add pipeline — next)

- [x] **CSV import:** Allow users to import properties from a CSV file. Onboarding lever for users with existing spreadsheet data.

  **Format:** Accept CSV matching the export format. Required columns: address (or addressLine1, city, state, zipCode), purchasePrice, purchaseDate, currentEstimatedValue, rent, expenses. Optional: nickname, property type, units, vacancy %, cash invested, ownership %, mortgage balance, mortgage rate, mortgage term, monthly payment, lender. Header row required. See `app/app/api/export/portfolio/route.ts` for export column order — import should accept same or a minimal subset.

  **API:** POST /api/import/portfolio — auth via getAppUser(). Accept multipart/form-data with file, or base64/raw CSV in JSON body. Parse CSV (use a lightweight parser; consider papaparse or built-in line-by-line). Validate each row with createPropertySchema (or a relaxed import schema). Respect property limit (canAddProperty). Create properties (and mortgages if columns present) in a transaction. Return { imported: number, errors: { row: number, message: string }[] }.

  **Validation:** Create import-specific schema that maps CSV columns to property fields. Handle date formats (YYYY-MM-DD, MM/DD/YYYY). Property type: map "Single family" / "Multi family" to single_family / multi_family. State: 2-letter. Fail row on invalid data; collect errors; import valid rows.

  **UI:** Settings → Export section, add "Import from CSV" with file input. On submit: upload, show progress/loading, display result (X imported, Y errors with row numbers). Offer download of template CSV (headers only or sample row) for users who don't have export format.

  **Acceptance criteria:**
  - [x] POST /api/import/portfolio accepts CSV file; auth required.
  - [x] Parses CSV; validates rows; creates properties (and mortgages when columns present).
  - [x] Respects property limit; returns imported count and per-row errors.
  - [x] Settings has "Import from CSV" with file input and result feedback.
  - [x] Template CSV available for download (headers matching export format).
  - [x] Invalid rows reported with row number; valid rows imported.
  - [x] Run `npm run check` when done.

- [x] **Property value estimate (RentCast AVM):** Add "Estimate value" for properties, mirroring the rent estimate flow. RentCast has GET /v1/avm/value — same API key as rent.

  **Integration:** Create `lib/integrations/rentcast.ts` value function or extend existing. `fetchValueEstimate(params: { address, city, state, zipCode, ... })` → `{ value: number }`. Handle errors, timeouts. See [RentCast value estimate docs](https://developers.rentcast.io/reference/value-estimate).

  **API:** GET /api/estimates/value — auth via getAppUser(), validate query params (addressLine1, city, state, zipCode required). Call RentCast value endpoint. Return { value: number } or { error: string }. Rate limit: same as rent (RentCastApiCall or extend to track value calls). Consider separate model or type field if needed.

  **UI — Add property wizard (Step 2, Purchase):** Add "Estimate value" button next to Current estimated value. On click: call API with address from Step 1. Populate value field on success. Loading and error states.

  **UI — Edit property form:** Same "Estimate value" next to value field.

  **Logging:** Log value estimate calls (RentCastApiCall or new table) for admin/usage tracking. Reuse existing pattern.

  **Acceptance criteria:**
  - [x] lib/integrations/rentcast.ts has fetchValueEstimate; uses RentCast AVM value endpoint.
  - [x] GET /api/estimates/value exists; auth + validation; returns { value } or { error }.
  - [x] Add property wizard Step 2 has "Estimate value" that populates value field.
  - [x] Edit property form has "Estimate value".
  - [x] API calls logged for admin; rate limit applied (reuse rent limit or extend).
  - [x] Graceful failure: API error shows message; manual entry still works.
  - [x] Run `npm run check` when done.

- [x] **Deal analyzer / scratchpad:** "Analyze a deal" without adding to portfolio. Enter address, rent, price, expenses, mortgage → instant metrics. Acquisition evaluation; can drive sign-ups.

  **Location:** New route /analyze or /deal-analyzer. Accessible to signed-in users (or optionally public for acquisition — if public, no auth; if auth, use getAppUser). Recommend auth required for consistency.

  **UI:** Single page with form: Address (line1, city, state, zip — optional for quick analysis), Purchase price, Current value (default same as price), Monthly rent, Monthly expenses, Mortgage (balance, monthly payment — optional). Ownership % (default 100), Vacancy % (default 5). Submit or live-update as user types.

  **Logic:** Reuse computePropertyMetrics with form inputs. No persistence. Display: monthly cash flow, annual cash flow, equity, cap rate, cash-on-cash (if cash invested provided), LTV. Show metrics in same style as PropertyMetricsSection.

  **Design:** Follow design-spec. Clean form, clear labels. Optional: "Add to portfolio" CTA that redirects to /properties/new with pre-filled data (query params or state) — nice-to-have, can defer.

  **Acceptance criteria:**
  - [x] /analyze (or /deal-analyzer) route exists; auth required.
  - [x] Form: address, price, value, rent, expenses, mortgage (balance, payment), ownership %, vacancy %.
  - [x] Metrics computed with computePropertyMetrics; displayed (cash flow, cap rate, cash-on-cash, equity, LTV).
  - [x] No persistence; ephemeral analysis.
  - [x] Follow design-spec; add to nav or link from dashboard/properties (e.g. "Analyze a deal").
  - [x] Run `npm run check` when done.

- [x] **Save potential deals:** Persist analyzed deals so users can save, list, and promote them to portfolio. Address becomes meaningful; enables future "compare deals" feature.

  **Plan limits:** Free tier: 5 saved deals max. Paid (Investor, Pro): 20 saved deals max. Enforce on create; show limit in UI when near or at cap.

  **Schema:** New `SavedDeal` model. Fields: `id`, `userId`, `nickname?`, `addressLine1`, `addressLine2?`, `city`, `state`, `zipCode`, `purchasePrice`, `currentEstimatedValue`, `currentMonthlyRent`, `currentMonthlyExpenses`, `totalMortgageBalance`, `totalMonthlyPayment`, `ownershipPercent`, `vacancyPercent`, `cashInvested?`, `notes?`, `createdAt`, `updatedAt`. Store raw inputs; metrics computed on read via `computePropertyMetrics`. No mortgage sub-model — single balance + payment for simplicity.

  **API:**
  - `POST /api/deals` — create saved deal. Auth, Zod validation, enforce limit. Return created deal.
  - `GET /api/deals` — list user's saved deals (auth). Return array with computed metrics for display.
  - `GET /api/deals/[id]` — single deal (auth, ownership check).
  - `PATCH /api/deals/[id]` — update deal (auth, ownership).
  - `DELETE /api/deals/[id]` — delete deal (auth, ownership).

  **UI — Analyze page:**
  - Add "Save deal" button. Enabled when form has minimum required data (address, price or value, rent, expenses). On click: POST to API. On success: toast or inline message "Saved"; optionally navigate to /deals or stay with form cleared for next deal.
  - If at limit: disable button, show "Upgrade to save more deals" or similar with link to /pricing.

  **UI — Saved deals list (`/deals`):**
  - New nav item "Deals" (or "Saved deals") between Analyze and Pricing. List cards: address/nickname, key metrics (cash flow, cap rate, equity), created date. Actions: View, Edit, Add to portfolio, Delete.
  - Empty state: "No saved deals yet. Analyze a deal and save it to compare later."
  - At limit: banner or inline note: "You've reached your limit. Upgrade to save more."

  **UI — Deal detail (`/deals/[id]`):**
  - Full form pre-filled; metrics section (reuse PropertyMetricsSection). Edit in place or "Edit" mode. "Add to portfolio" button: redirect to /properties/new with query params or POST to prefill endpoint.

  **Add to portfolio flow:**
  - From deal detail or list: "Add to portfolio" opens add-property wizard with fields pre-filled from saved deal. User can adjust before submitting. On success: optionally delete saved deal or keep (user choice — recommend keep for now; user can delete manually).

  **Acceptance criteria:**
  - [x] SavedDeal model + migration; all fields stored.
  - [x] Plan limits: 5 (free), 20 (paid). Enforced on create; clear UI feedback at limit.
  - [x] POST/GET/PATCH/DELETE /api/deals; auth + ownership; Zod validation.
  - [x] Analyze page: "Save deal" button; saves current form; disabled at limit with upgrade CTA.
  - [x] /deals list page: cards with address, metrics, actions (View, Add to portfolio, Delete).
  - [x] /deals/[id] detail: full deal data, metrics, Edit, Add to portfolio.
  - [x] Add to portfolio: pre-fills add-property wizard from saved deal; user submits to create property.
  - [x] Design: modern, minimal; follows design-spec; no friction (one-click save, clear CTAs).
  - [x] Future-ready: structure supports "compare deals" (e.g. side-by-side) in a later task.
  - [x] Run `npm run check` when done.

- [x] **Import CSV: selection when over limit (Option A):** When user imports more valid rows than their plan allows, use a two-phase flow so they can choose which properties to add. Clear upgrade CTA.

  **Problem:** Currently, importing 3 rows with a 1-property limit shows "1 imported, 1 error(s)" — confusing, no choice, no upgrade path.

  **Flow:**
  1. User uploads CSV. API parses and validates.
  2. If `validRows.length <= slotsRemaining`: import all (current behavior).
  3. If `validRows.length > slotsRemaining`: **do not import**. Return `{ requiresSelection: true, validRows, slotsRemaining, limit, validationErrors }`.
  4. UI shows selection step: "Your file has 3 properties. Your plan allows 1. Choose which to import:" — checkboxes per valid row (address/nickname), max `slotsRemaining` selectable.
  5. "Import selected" button + prominent "Upgrade to import all" link → /pricing.
  6. User selects, clicks "Import selected". Second POST with same file + `selectedIndices` (e.g. "0,2" in formData).
  7. API imports only selected rows (up to limit).

  **API changes (POST /api/import/portfolio):**
  - Accept optional `selectedIndices` in formData (comma-separated: "0,2" = row indices in validRows).
  - When over limit and no selectedIndices: return `requiresSelection` payload; do not import.
  - When selectedIndices provided: import only those rows (validate indices, enforce limit).

  **UI changes (import-csv-section.tsx):**
  - Store uploaded File in state when starting import (for second request).
  - When response has `requiresSelection`: render selection UI (checkboxes, address/nickname per row, max = slotsRemaining).
  - "Import selected" triggers second POST with file + selectedIndices.
  - Prominent "Upgrade to import all" link to /pricing.
  - Separate validation errors from limit messaging — show validation errors in list; limit message in selection header.

  **Acceptance criteria:**
  - [x] When validRows > slotsRemaining: no import; API returns requiresSelection with validRows, slotsRemaining, limit.
  - [x] UI shows selection step with checkboxes (address/nickname), max slotsRemaining selectable.
  - [x] "Import selected" sends file + selectedIndices; API imports only selected rows.
  - [x] "Upgrade to import all" link to /pricing is prominent and clear.
  - [x] Validation errors displayed separately from limit/selection messaging.
  - [x] When validRows <= slotsRemaining: current behavior unchanged (import all).
  - [x] Run `npm run check` when done.

- [x] **Deal limits visibility + Pro limit bump:** Surface saved-deal usage across the app so users see limits and upgrade incentives. Bump Pro deal limit.

  **Plan limit change (lib/plans.ts):**
  - Pro: 20 → 50 saved deals. Investor stays 20. Free stays 5.

  **Deals page (`/deals`):**
  - Add usage in header/subtitle: "3 of 5 saved deals" (or "3/5 saved deals"). Always visible.
  - When at limit: add "Upgrade to save more" link.
  - Replace current at-limit-only banner with persistent usage + upgrade when needed.

  **Settings — Plan & billing:**
  - Add "Saved deals" row: "3 / 5" (or "3 of 5 saved deals").
  - When at limit: "(limit reached)" + upgrade link, same pattern as Properties.

  **Pricing page (pricing-cards.tsx):**
  - Add saved-deal limits to each plan card. Free: "5 saved deals", Investor: "20 saved deals", Pro: "50 saved deals".
  - Update plan descriptions to include both properties and deals (e.g. "1 property · 5 saved deals").

  **Analyze page (optional):**
  - Add subtle "3 of 5 deals saved" near Save button to reinforce limit.

  **Acceptance criteria:**
  - [x] Pro deal limit = 50 in lib/plans.ts.
  - [x] Deals page shows "X of Y saved deals" with upgrade link when at limit.
  - [x] Settings Plan & billing shows Saved deals row.
  - [x] Pricing cards show saved-deal limits per plan.
  - [x] Run `npm run check` when done.

- [x] **View deal → Analyze with prefill:** When user clicks "View" on a saved deal, take them to the Analyze page with the deal pre-filled so they can tweak numbers and see live metrics. Overwrite on save.

  **Problem:** Current deal detail (`/deals/[id]`) looks like a property view — static display, separate Edit mode. Users saving deals are considering them and want to circle back, mess with numbers, and see if it's worth it. The Analyze experience (editable form + live metrics) is the right mental model.

  **Flow:**
  1. "View" on a deal card → navigate to `/analyze?deal=id` (not `/deals/[id]`).
  2. Analyze page: when `deal` query param present, fetch deal via GET /api/deals/[id], prefill form.
  3. Form shows deal data; metrics update live as user edits (same as new analysis).
  4. "Update deal" button (instead of "Save deal") — PATCH /api/deals/[id] to overwrite.
  5. "New deal" clears form and clears query param; user can start fresh.
  6. "Add to portfolio" still available — link to /properties/new?from=dealId.

  **Deal detail page (`/deals/[id]`):**
  - Option A: Remove. All "View" links go to /analyze?deal=id.
  - Option B: Keep as lightweight redirect — /deals/[id] redirects to /analyze?deal=id.
  - Option C: Keep minimal detail page with "Edit in Analyze" CTA that goes to /analyze?deal=id.
  - Recommend Option B: /deals/[id] redirects to /analyze?deal=id. Single source of truth; no duplicate UI.

  **Analyze page changes:**
  - Accept `deal` query param. Server or client fetches deal, passes to form as initialData.
  - DealAnalyzerForm: accept optional `dealId` and `initialData`. When present, prefill and show "Update deal" instead of "Save deal".
  - On Update: PATCH instead of POST. On success: stay on page, show "Updated"; optionally clear dealId to allow "New deal" flow.

  **Deals list:**
  - "View" link: `/analyze?deal=${d.id}` instead of `/deals/${d.id}`.
  - "Add to portfolio" unchanged.

  **Acceptance criteria:**
  - [x] View on deal → /analyze?deal=id with form pre-filled.
  - [x] "Update deal" overwrites existing deal (PATCH).
  - [x] "New deal" clears form and param.
  - [x] Live metrics as user edits.
  - [x] /deals/[id] redirects to /analyze?deal=id (or remove; no orphan).
  - [x] Add to portfolio still works from Analyze when editing deal.
  - [x] Run `npm run check` when done.

---

## Membership lapse handling

**Context:** When a user's subscription lapses (e.g. 5 properties, downgrades to Free with limit 1), we currently: (1) set tier to "free" via webhook; (2) block adding new properties/deals; (3) allow full access to all data. Gaps: no over-limit banner, no re-sync if webhook fails, no past_due handling, no restriction of stats when over limit. Follow docs/architecture-and-build-practices.md product mantra: thoughtful, robust, modern, frictionless.

- [x] **Membership lapse: full hardening (5 items):** Implement over-limit restriction, banner, re-sync, past_due banner, and clear block messaging.

  **1. Restrict stats when over limit (Option A)**
  - When `propertyCount > limit` or `dealCount > dealLimit`: only the first N properties/deals count for stats and display. N = limit.
  - **"First N" rule:** Order by `updatedAt` descending; take the N most recently updated. So user sees their most active properties.
  - **Dashboard:** Portfolio metrics (total value, equity, cash flow, etc.) computed from only the first N properties. Charts (equity, cash flow, debt vs value) use only those N.
  - **Properties list:** Show only the first N properties. Add note: "Showing X of Y properties (plan limit). Upgrade to see all."
  - **Property detail:** Allow viewing any property (user owns it). Excess properties don't contribute to portfolio totals. No 403 — user can still open any property page.
  - **Deals list:** Show only the first N deals when over deal limit. Same note pattern.
  - **Export:** Restrict to first N properties (consistent with view). Deals export: restrict to first N if we have deal export; else N/A.
  - **Helper:** Add `getActivePropertyIds(userId, limit)` or similar — returns IDs of first N properties by updatedAt desc. Use everywhere we need "active" set. Same for deals.
  - **Implementation:** Create `lib/plans.ts` helper `getActiveIds<T>(items: T[], limit: number, orderBy: (a:T,b:T)=>number): T[]` or integrate into data-fetching. Dashboard, properties page, portfolio summary API, export API must all filter to active set when over limit.

  **2. Over-limit banner**
  - When over limit (properties or deals): show banner above main content in app layout.
  - Copy: "You're over your plan limit (X properties, Y saved deals). Portfolio shows your first N. Upgrade to see all, or remove some to stay within your plan."
  - Link to /pricing. Dismissible per session (sessionStorage key `over-limit-banner-dismissed`).
  - App layout (server) passes propertyCount, dealCount, limits, overLimit boolean to client `OverLimitBanner`. Banner only renders when overLimit.

  **3. Subscription re-sync on app load**
  - Add `GET /api/billing/sync`: auth via getAppUser(). If user has stripeCustomerId and subscriptionTier !== "free", fetch Stripe subscriptions for customer (limit 1, status in ['active','trialing']). If none found or status canceled/past_due for too long, update User.subscriptionTier to "free" and Subscription status. Return { synced: boolean, tier: string }.
  - Call from app layout client (e.g. AppLayoutClient) on mount. Use sessionStorage key `billing-sync-last` with timestamp; skip if last sync < 5 minutes.
  - Only call when user has stripeCustomerId and tier !== free. No-op for free users.

  **4. past_due banner**
  - When subscription.status === "past_due": show banner "Payment issue — update your payment method to avoid losing access." Link to billing portal.
  - Fetch subscription status from GET /api/billing/status (or include in layout). Show banner above or below over-limit banner. Dismissible per session.
  - past_due takes precedence in messaging (payment issue is more urgent than over-limit).

  **5. Clear error messaging when blocked**
  - POST /api/properties when blocked: return message "Property limit reached. Upgrade your plan or remove a property to add more." Include link or code so UI can show CTA to /pricing.
  - POST /api/deals when blocked: "Deal limit reached. Upgrade to save more deals."
  - Import when at limit: ensure message includes upgrade CTA.
  - UI: when these errors surface, show upgrade link/button prominently.

  **Acceptance criteria:**
  - [x] When over property limit: dashboard, properties list, portfolio summary API, export use only first N properties (by updatedAt desc). Same for deals when over deal limit.
  - [x] Over-limit banner shown when over limit; dismissible; links to /pricing; copy explains "Portfolio shows your first N."
  - [x] GET /api/billing/sync verifies Stripe; downgrades if invalid. Called on app load, max once per 5 min.
  - [x] past_due banner when subscription.status === "past_due"; links to billing portal; dismissible.
  - [x] All block responses (property, deal, import) include clear message + upgrade CTA.
  - [x] Property detail remains viewable for any property (no 403 on excess).
  - [x] Run `npm run check` when done.

- [x] **Cancel-at-period-end confirmation in Plan & billing:** When a user cancels their subscription (cancel at period end), show clear confirmation in Settings → Plan & billing so they know it worked. No new webhook events needed — we already receive `customer.subscription.updated` when they cancel; extend sync to store `cancel_at_period_end`.

  **Implementation:**
  1. Add `cancelAtPeriodEnd Boolean?` to Subscription model. Migration.
  2. Webhook `syncSubscriptionToDb`: read `sub.cancel_at_period_end` from Stripe, store in DB. `setSubscriptionCanceled` already clears subscription; ensure cancelAtPeriodEnd is null when canceled.
  3. Settings Plan & billing: when `subscription?.currentPeriodEnd` exists:
     - If `cancelAtPeriodEnd`: "Plan ends [date]. You have access until then."
     - Else: "Next billing: [date]" or "Renews [date]"

  **Acceptance criteria:**
  - [x] Schema has cancelAtPeriodEnd; migration applied.
  - [x] Webhook syncs cancel_at_period_end from Stripe subscription.updated.
  - [x] Plan & billing shows "Plan ends [date]. You have access until then." when canceled.
  - [x] Plan & billing shows "Next billing: [date]" when renewing.
  - [x] Run `npm run check` when done.

- [x] **Permanent delete: server-side confirmText validation:** In `/api/account/delete-permanent/route.ts`, require `body.confirmText === "DELETE"` before proceeding. Return 400 if missing or incorrect. Client already enforces; this closes the gap for direct API calls.

  **Acceptance criteria:**
  - [x] Request body validated for `confirmText === "DELETE"` (exact string, case-sensitive).
  - [x] Return 400 with clear error if confirmText is missing or does not match.
  - [x] Permanent delete only proceeds when validation passes.
  - [x] Run `npm run check` when done.

- [x] **Extract formatCurrency to lib:** Same `Intl.NumberFormat` logic duplicated in 6+ places (dashboard, properties, deals, charts, scenario section). Create `lib/format-currency.ts` with `formatCurrency(n: number): string` and use it everywhere.

  **Acceptance criteria:**
  - [x] `lib/format-currency.ts` exists with `formatCurrency(n: number): string` using `Intl.NumberFormat` (locale en-US, style currency).
  - [x] Dashboard, properties page, deals list, property-metrics-section, scenario-section, dashboard-charts use the shared function.
  - [x] No duplicated formatCurrency logic remains.
  - [x] Run `npm run check` when done.

- [x] **Move import parsing to lib:** CSV parsing and row validation in `api/import/portfolio/route.ts` (~382 lines). Extract `parseRow`, `parseDate`, `parseNum`, `getCol`, `parseAddressFromCombined` (or equivalent) to `lib/import/csv-parser.ts` or similar. Route stays thin.

  **Acceptance criteria:**
  - [x] `lib/import/csv-parser.ts` (or similar) contains parsing and validation logic.
  - [x] Import route imports from lib and stays thin (orchestration only).
  - [x] Import behavior unchanged; CSV import works as before.
  - [x] Run `npm run check` when done.

- [x] **Reduce modal shadows:** `draft-context.tsx` and `metric-help-modal.tsx` use `shadow-lg`. Design spec §9: "Prefer flat or very subtle shadow." Replace with `shadow-sm` or remove.

  **Acceptance criteria:**
  - [x] `draft-context.tsx` and `metric-help-modal.tsx` use `shadow-sm` or no shadow (per design spec).
  - [x] Modals still visually distinct from background.
  - [x] Run `npm run check` when done.

- [x] **Resolve Prisma `any` in settings:** `(prisma as any).savedDeal` and `as any` for `cancelAtPeriodEnd` in `app/(app)/settings/page.tsx`. Run `npx prisma generate`; if types are correct, remove casts. If schema/client mismatch, fix and document.

  **Acceptance criteria:**
  - [x] No `as any` or `(prisma as any)` in settings page for savedDeal or cancelAtPeriodEnd.
  - [x] TypeScript and Prisma client in sync; types resolve correctly.
  - [x] Run `npm run check` when done.

- [x] **Zod for account delete routes:** Add Zod schemas for `/api/account/delete` and `/api/account/delete-permanent` request bodies. Matches pattern used by property, deal, mortgage routes.

  **Acceptance criteria:**
  - [x] Delete route: Zod schema validates `{ password: string }`.
  - [x] Delete-permanent route: Zod schema validates `{ password: string, confirmText: string }`.
  - [x] Return 400 on validation failure with clear error.
  - [x] Run `npm run check` when done.

- [x] **Extract MetricCard to shared component:** Similar MetricCard in `dashboard/page.tsx` and `properties/page.tsx`. Extract to shared component (e.g. `components/metric-card.tsx`).

  **Acceptance criteria:**
  - [x] Shared `MetricCard` component exists and is used by dashboard and properties pages.
  - [x] No duplicated MetricCard markup.
  - [x] Run `npm run check` when done.

- [x] **Block API access for deleted users:** `getAppUser()` returns deleted users; layout blocks UI but direct API calls still work. Add check: if `user.deletedAt` is set, return 401 (or equivalent) so deleted users cannot access protected APIs.

  **Acceptance criteria:**
  - [x] `getAppUser()` or a wrapper returns null/throws when `user.deletedAt` is set, OR each protected route checks `user.deletedAt` and returns 401.
  - [x] Deleted user with valid session cannot access GET /api/properties, /api/deals, etc.
  - [x] Restore flow still works (restore route does not block deleted users).
  - [x] Run `npm run check` when done.

- [x] **Env validation at startup:** Validate required env vars (e.g. `DATABASE_URL`, `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`) at app startup or first use. Fail fast with clear error message if missing.

  **Acceptance criteria:**
  - [x] Required env vars validated (document which ones in code or manual-steps).
  - [x] Clear error message when validation fails (e.g. "DATABASE_URL is required").
  - [x] App does not proceed with invalid/missing env for critical paths.
  - [x] Run `npm run check` when done.

- [x] **Accessibility pass:** Audit modals, forms, and interactive elements for aria labels, focus management, and keyboard navigation. Fix gaps.

  **Acceptance criteria:**
  - [x] Modals have appropriate aria attributes (role, aria-labelledby, aria-modal).
  - [x] Focus trapped in modals when open; focus returns on close.
  - [x] Form inputs have associated labels; buttons have accessible names.
  - [x] Key interactive elements keyboard-accessible.
  - [x] Run `npm run check` when done.

---

*When the builder completes a task, they check it off here and report back. Add new tasks below.*
