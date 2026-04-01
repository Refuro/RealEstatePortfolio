# Epic A — Discovery: field inventory & IA decisions

**Status:** Initial delivery (2026-03-19); **A2 & A3 signed** (product owner).  
**Revision:** Optional **square footage** for RentCast **`squareFootage`** (estimate accuracy) scoped in §A1 / Epic B — not in schema yet.  
**Related:** `add-property-experience-overhaul.md`

---

## A1 — Field inventory

**Current wizard steps** (`add-property-wizard.tsx`): **1** Address & basics → **2** Purchase → **3** Income & expenses → **4** Mortgage → **5** Review (+ notes textarea below review).

Legend:

| Col | Meaning |
|-----|---------|
| **Prisma / API** | Field on `Property` model or accepted by `POST /api/properties` / `PATCH /api/properties/[id]` |
| **Zod** | `createPropertySchema` / `updatePropertySchema` (`lib/validations/property.ts`) |
| **Wizard** | `add-property-wizard.tsx` (`WizardData` + steps) |
| **Edit page** | `property-form.tsx` (full form) |
| **Details inline** | `details-tab-content.tsx` — which section can edit it |

### Core property fields

| Field (API key) | Prisma | Zod create | Zod update | Wizard | Edit | Details inline | Notes |
|-----------------|--------|------------|------------|--------|------|----------------|-------|
| nickname | ✓ | ✓ | ✓ | Step 1 | ✓ | — | Details has no nickname; use `/edit` or add to overhaul |
| addressLine1 | ✓ | ✓ | ✓ | Step 1 | ✓ | Facts | |
| addressLine2 | ✓ | ✓ | ✓ | Step 1 | ✓ | Facts | |
| city | ✓ | ✓ | ✓ | Step 1 | ✓ | Facts | |
| state | ✓ | ✓ | ✓ | Step 1 | ✓ | Facts | |
| zipCode | ✓ | ✓ | ✓ | Step 1 | ✓ | Facts | |
| propertyType | ✓ | ✓ | ✓ | Step 1 | ✓ | — | **Gap:** not in Details inline; only full edit |
| units | ✓ | ✓ | ✓ | Step 1 | ✓ | — | **Gap:** not in Details inline |
| ownershipPercent | ✓ | ✓ | ✓ | Step 2 | ✓ | Financial | Wizard: `StepPurchase` (not Step 1) |
| purchasePrice | ✓ | ✓ | ✓ | Step 2 | ✓ | Financial | |
| purchaseDate | ✓ | ✓ | ✓ | Step 2 | ✓ | Facts | Split: wizard step 2, Details “facts” |
| currentEstimatedValue | ✓ | ✓ | ✓ | Step 2 | ✓ | Financial | |
| currentMonthlyRent | ✓ | ✓ (derived) | ✓ | Step 3 (or sum of unitRents) | ✓ | **Read-only** | **Gap:** Details shows rent but **cannot edit** in Financial edit mode; must use `/edit` |
| unitRents | ✓ JSON | ✓ | ✓ | Step 3 | ✓ | — | **Gap:** no per-unit rent on Details inline |
| currentMonthlyExpenses | ✓ | ✓ | ✓ | Step 3 | ✓ | Financial | |
| vacancyPercent | ✓ | ✓ | ✓ | Step 3 | ✓ | Financial | |
| cashInvested | ✓ | ✓ | ✓ | Step 2 | ✓ | Financial | Wizard: purchase step |
| bedrooms | ✓ | ✓ | ✓ | Step 1 | ✓ | Facts | |
| bathrooms | ✓ | ✓ | ✓ | Step 1 | ✓ | Facts | |
| unitMix | ✓ | ✓ | ✓ | — | ✓ | Facts | **Not in add wizard** today; only full edit + Details |
| notes | ✓ | ✓ | ✓ | Step 5 (review textarea) | ✓ | Notes (section) | |
| marketRent | ✓ | ✓ | ✓ | Step 3 (estimate action) | ✓ | — | Often set via RentCast in wizard/form |
| marketRentAsOf | ✓ | ✓ | ✓ | Step 3 (estimate action) | ✓ | — | |
| squareFeet | ✓ | ✓ | ✓ | Step 1 | ✓ | Facts | **Shipped (Epic B).** Optional `squareFeet` on `Property`; RentCast rent/value calls pass **`squareFootage`** when set. Label “Sq. ft.” in UI. |

### Estimate fidelity — RentCast (square footage)

RentCast’s long-term rent AVM accepts a **`squareFootage`** query parameter (alongside `propertyType`, `bedrooms`, `bathrooms`, `units`, etc.). **Manual testing shows materially better rent estimates when sqft is provided** vs address + beds/baths alone.

**Current codebase (post–Epic B):** Optional **`squareFeet`** on `Property` (Prisma + Zod + property APIs). Wizard, `/edit`, and Details show sqft where applicable; `lib/integrations/rentcast.ts` threads **`squareFootage`** into rent (and value) estimates when the property or request supplies it.

**Historical note:** This subsection described the pre-ship gap; kept for discovery audit trail.

### Mortgage (separate model)

| Surface | Behavior |
|---------|----------|
| **Wizard** | Step 4: optional `addMortgage` + `MortgageFormFields` → `POST /api/properties` then mortgage create or bundled in create flow |
| **Edit** | Not in `PropertyForm`; mortgages edited via `MortgageSection` on Details / APIs |
| **Details** | `MortgageSection` embedded in `details-tab-content` |

### Validation & API notes

- **Create** uses `createPropertySchema` + optional `mortgage` payload in `POST` body.
- **PATCH** uses `updatePropertySchema.partial()`; unit rent updates may recalc `currentMonthlyRent` server-side (`route.ts`).
- **Details** sends **partial** PATCH per section; must still satisfy Zod when fields are present.

### Critical gaps (inventory findings)

1. **Rent / unitRents:** Editable in wizard + `PropertyForm`; **not** in Details Financial inline form (display only). High-impact for “one mental model” overhaul.
2. **propertyType / units:** Editable in wizard + full edit; **not** in Details inline — users may not discover type change without `/edit`.
3. **nickname:** Wizard + full edit only.
4. **unitMix:** Captured on **Edit** and Details inline **Facts**; **not** in add wizard — inconsistent “profile” coverage at create time.
5. **Three PATCH UXes:** Full form submit vs three inline saves vs wizard POST — normalization target for Epic B+.
6. **Square footage missing:** No persistence or UI; RentCast can use **`squareFootage`** but app does not send it—addressing this is part of Epic B estimates work, not a separate product initiative.

---

## A2 — First-save vs enrich-later (**signed**)

**Decision: Hybrid (c)** — *not* a bare “address-only” first save (that would force **incomplete** states across analytics and is out of scope unless we invest in gated tools and empty charts). Instead:

| Tier | Meaning | UX |
|------|---------|-----|
| **Portfolio-ready (required for create / core analytics)** | Address + property type/units + **minimum economics** aligned with current API expectations: `addressLine1`, `city`, `state`, `zipCode`, `propertyType`, `units` (with type rules), `purchasePrice`, `purchaseDate`, `currentEstimatedValue`, `currentMonthlyRent` (or `unitRents`), `currentMonthlyExpenses` | One primary path: users complete this set so **reports and analytics stay honest**. Label this block clearly (not buried optional fields). |
| **Sharper modeling (optional / enrich-later)** | Mortgage (skip path stays), `nickname`, `bedrooms`/`bathrooms`/`unitMix`, **`squareFeet`**, `cashInvested`, benchmark fields | Sections or post-save prompts labeled **“Optional — improves estimates & reports”** plus a **single checklist** on the property (e.g. “Add sqft”, “Add mortgage”, “Run benchmark”) so hybrid stays **legible**. |

**Rejected for now:** (b) API relaxation for nullable purchase/rent/value without a dedicated **incomplete property** program.

**Sign-off:** [x] Product owner

---

## A3 — Edit surface model (**signed**)

| Area | Decision | Notes |
|------|----------|--------|
| **Add flow** | **Same IA as `/edit`:** sectioned experience — **Location → Economics → Profile** (type, units, beds/baths, optional sqft, unit mix) → **optional mortgage** → review. Prefer **one scroll with sticky section nav** on desktop *or* short steps; either way, **same section names/order as edit**. | Replaces opaque linear wizard-only mental model. |
| **Full edit (/edit)** | **Same sections as add** (not one undifferentiated long form): **one page with anchor sections** *or* **tabs** if section count is heavy—**parity of labels and order with add** matters more than tabs vs anchors. Save per section *or* one global save with dirty state—implementation choice in Epic B/D. | |
| **Details tab** | **Option A:** Mostly **read-only** summary + metrics; **one primary “Edit property”** → **`/edit`** (or **slide-over/panel** embedding the **same** components as `/edit`). **Not** three independent inline edit modes as the final pattern. | Removes rent display/edit split and triple `window.confirm`. |
| **Mortgage** | Thin capture on add; full editing continues on **Mortgage workspace / `MortgageSection`** — no change to mortgage APIs. | |

**Sign-off:** [x] Product owner / design

---

## A4 — Visual / UX references (checklist)

- [ ] **Internal:** Review `docs/policies/design-spec.md` for tokens, spacing, and component tone.
- [ ] **References:** Collect 2–3 competitor or adjacent-app screenshots (portfolio, accounting, Linear-style settings) for **sectioned settings** — not blockers for engineering spike.
- [ ] **Figma (optional):** One frame for “Add property — section 1” and “Edit property — tabbed” to lock padding/typography before Epic B.

**Status:** Checklist ready; moodboard/Figma **optional** before starting Epic B if team is comfortable with design-spec + iterative UI.

---

## Epic A task completion

| ID | Deliverable | Status |
|----|-------------|--------|
| A1 | Field inventory (this doc, §A1) | Done |
| A2 | First-save vs enrich-later (§A2) | **Signed** |
| A3 | Edit surface model (§A3) | **Signed** |
| A4 | Checklist (§A4) | Done (placeholders for optional assets) |

