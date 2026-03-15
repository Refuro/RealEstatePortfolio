# Agent tasks

Tasks you want the **builder** agent to do. The PM adds tasks here when you ask; you can say "have the builder complete the tasks in tasks.md" and the PM will run the builder with these tasks.

---

## Current tasks (open)

| # | Task | Focus |
|---|------|-------|
| *(none)* | | |

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

*When the builder completes a task, they check it off here and report back. Add new tasks below.*
