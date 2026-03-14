# Agent tasks

Tasks you want the **builder** agent to do. The PM adds tasks here when you ask; you can say "have the builder complete the tasks in tasks.md" and the PM will run the builder with these tasks.

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

---

*When the builder completes a task, they check it off here and report back. Add new tasks below.*
