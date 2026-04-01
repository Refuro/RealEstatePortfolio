# Add-property experience — analysis & overhaul direction

**Status:** **Complete (reference / history)** — Epics A–G shipped (2026-03). Ongoing regression: [`../qa/property-flow-regression-matrix.md`](../qa/property-flow-regression-matrix.md).  
**Priority:** Complete — retain for IA decisions, file map, and epic table; not open build work.  
**Intent:** Complete overhaul of the **add-property** flow, the **Edit property** page, and **property detail (Overview + Details tabs)**—previously overlapping “formy” patterns; Details is read-only + `/edit`, Overview is metrics + wayfinding (Epic F). Preferred over incremental retooling. This is the main gate to portfolio value; abandonment at add means users never see modeling, mortgage, benchmarks, etc.; poor edit/detail UX erodes trust after they’ve invested.

---

## 1. Current architecture (what exists today)

### 1.1 Add property (`/properties/new`)

| Piece | Role |
|-------|------|
| `app/(app)/properties/new/page.tsx` | Shell: back link, title, optional **deal conversion** banner when `?from=<dealId>`. |
| `add-property-wizard.tsx` | **~1,400+ lines**, client-only. Five linear steps + review; owns almost all UX and validation for create. |
| `draft-context.tsx` | **localStorage** draft (`add-property-wizard-draft`), unsaved-change prompts when navigating away from `/properties/new`, `navigateTo()` for draft-aware nav. |
| `mortgage-form-fields.tsx` | Embedded mortgage UI reused inside wizard step 4. |

**Steps (fixed order):**

1. Address & basics (nickname, address, property type, units, ownership %, bedrooms/bathrooms; **optional sqft** for RentCast accuracy)
2. Purchase (price, date, value, cash invested)
3. Income & expenses (rent, unit rents for multi-unit, expenses, vacancy; RentCast estimate hooks — **thread optional `squareFootage`** when stored or entered)
4. Mortgage (optional path: `addMortgage` tri-state; full `MortgageFormFields` when yes)
5. Review → POST `/api/properties` (+ optional mortgage POST)

**Deal prefill:** If `dealId` is set, wizard `fetch`es `/api/deals/[id]` once and maps deal fields into `WizardData`.

### 1.2 Edit property (`/properties/[id]/edit`)

| Piece | Role |
|-------|------|
| `property-form.tsx` | **~800+ lines**, single long **form** (not stepped). PATCH `/api/properties/[id]`. |
| **Not shared** with the wizard | Same *concepts* (address, type, rent, estimates) but **duplicated markup, state patterns, and copy**. |

Mortgage is **not** edited inside this form in the same flow; mortgages live under property detail / API routes.

### 1.3 Property detail — Details tab (`/properties/[id]?tab=details`)

| Piece | Role |
|-------|------|
| `details-tab-content.tsx` | **Read-only** summary (property facts, financial inputs, notes) + primary **Edit property** → `/edit`; **`PropertyHealthStrip`** (chips) shared with Overview. |
| **Mortgage** | `MortgageSection` **embedded** in the Details card stack; full add/edit via mortgage APIs / workspace. |

**Delivered (Epic E):** Inline PATCH editing on Details was removed in favor of A3—one mental model with **`/edit`**.

### 1.4 Property detail — Overview tab (default)

| Piece | Role |
|-------|------|
| `overview-tab-content.tsx` | **Dashboard-style** tab: intro + **Edit** / link to **Details**; **identity** (`PropertyHero`); shared **`PropertyHealthStrip`**; **Inputs at a glance** (rent + economics + mortgage snapshot); **Performance at a glance** (single KPI grid + supporting metrics). |
| Links | Modeling workspace, benchmark refresh when needed; wayfinding to Details and `/edit` aligned with Epic F. |

Overview and Details share **card styling** and **health chips** so the property page feels like one workspace (Epic F).

---

## 2. Entry points (onboarding & traffic into add property)

| Source | Behavior |
|--------|----------|
| **Onboarding modal** (`OnboardingPanel`) | “Add first property” → `router.push("/properties/new")`. |
| **Dashboard** | Empty state + “What’s next” + metric CTAs; multiple “Add property” links. |
| **Sidebar** | “Getting started” (0 props) / “Add property” (≥1) → `/properties/new`. |
| **Properties list** | Primary CTA to add. |
| **Deals list** | “Add to portfolio” → `/properties/new?from=<dealId>`. |
| **Analyze deal** | “Add this deal to portfolio” → same query param. |
| **Modeling / Mortgage empty states** | Link to `/properties/new` when no property. |

**Implication:** Any redesign must preserve **deep links** (`?from=dealId`), **draft persistence**, and **nav-away confirmation** (or an equivalent that doesn’t lose work).

---

## 3. Problems (why it feels “formy” and dated)

1. **Two implementations for one domain**  
   Wizard (create) vs `PropertyForm` (edit) = double maintenance, inconsistent microcopy, risk of validation drift.

2. **Long linear wizard**  
   Five steps + mortgage complexity **before** value; no “minimal add → enrich later” path (user asked to defer quick-add as separate roadmap item earlier—still valid as a **mode** inside a net-new design).

3. **Visual pattern**  
   Dense labels, uniform `inputClass`, stepper is functional but not product-led (little progressive disclosure, weak emotional “you’re almost there” pacing).

4. **Mortgage step weight**  
   Step 4 can feel like a second app inside the wizard; unclear that “skip and add later” is safe.

5. **Review step**  
   Acts as a fifth screen of reading, not a celebration or clear “launch” moment.

6. **Edit experience (`/edit`)**  
   Single scrolling `PropertyForm` reads like an admin panel, not a continuation of the same product story as add.

7. **Details tab inline editing**  
   Third pattern for the same data; three mini-forms with separate save/discard flows; easy to diverge from wizard/edit validation.

8. **Discovery**  
   Strong Overview once data exists; first-time users never see it if they bounce on add.

---

## 4. Principles for a complete overhaul

- **One conceptual model** for “property record” shared by create, edit, and (where relevant) detail—implemented as **shared sections/components** + one validation source of truth (`lib/validations/property.ts` already exists; extend carefully).
- **Estimate fidelity:** optional **square footage** on the property record, passed to RentCast as **`squareFootage`** on rent (and value if supported)—product testing shows **substantially** better rent AVM accuracy vs beds/baths alone; treat as **profile** field, not required for first save.
- **Progressive disclosure:** smallest viable first save (address + type + rough numbers **or** explicit “guided full setup” mode)—user preference for **full replacement** over small tweaks.
- **Emotional design:** clear milestones, fewer anonymous fields per screen, stronger primary actions, optional illustrations or summary cards.
- **Mortgage:** default path = “I’ll add later” with one tap; advanced path = structured, not a wall of fields at once (accordion, sub-stepper, or post-save redirect to mortgage workspace).
- **Deal import:** keep `?from=` prefill; consider a **dedicated first screen** (“We pulled this from your deal—confirm”) before generic steps.
- **Drafts:** keep autosave; consider server-side draft later—out of scope unless product requires cross-device.
- **Accessibility:** preserve focus management, step announcements, and escape hatches (keyboard, screen readers).

---

## 5. Suggested workstreams (for implementation planning)

1. **Information architecture** — New step list or non-linear flow (e.g. hub with sections). Decide mandatory vs optional fields for **first save**.
2. **Component library** — Extract “PropertySection” primitives: Location, Economics, **Property profile** (type, units, beds/baths, **optional sqft**, unit mix where relevant), Loan (optional), Review. Used by **wizard, full edit, and (replacing or wrapping) Details inline edits**—one visual language and one validation path per field group.
3. **Retire duplicate forms** — Route `/edit` and detail inline flows through the same building blocks as create (POST vs PATCH; partial PATCH for sections if needed).
4. **Mortgage** — Thin wizard entry; heavy editing stays on existing mortgage workspace/detail (already strong).
5. **QA** — Matrix: new user, deal import, multi-unit, with/without mortgage, mobile, draft resume, nav-away cancel.
6. **Metrics** — Core product funnel events are live (PostHog); **optional** future work: step-level completion events inside the wizard (not required for launch).

---

## 6. Key files to touch (non-exhaustive)

- `app/(app)/properties/add-property-wizard.tsx` — replace or split.
- `app/(app)/properties/property-form.tsx` — align or merge into shared flow.
- `app/(app)/properties/[id]/details-tab-content.tsx` — replace inline triple-edit pattern with shared primitives or new pattern (sheet, tabs, single settings view).
- `app/(app)/properties/new/page.tsx` — layout shell, deal banner.
- `app/(app)/properties/[id]/edit/page.tsx` — shell around new edit experience.
- `app/(app)/draft-context.tsx` — adapt to new step/section model if structure changes.
- `app/(app)/mortgage-form-fields.tsx`, `lib/validations/property.ts`, `lib/validations/mortgage.ts` — reuse contracts.
- `lib/integrations/rentcast.ts`, `app/api/estimates/rent/route.ts` / `.../value/route.ts` — extend with **`squareFootage`** when property or query supplies sqft.
- `prisma/schema.prisma` — `squareFeet` on `Property` (shipped).

---

## 7. Relation to roadmap

The older line *“Add-property wizard overhaul (quick add / skip)”* in `docs/reference/roadmap.md` is **subsumed** by this initiative: aim for a **full experience redesign**, not only quick-add. Update roadmap when implementation tasks are promoted to `docs/tasks.md`.

---

## 8. Implementation epics, tasks & acceptance criteria

*Epics were checked off in [`docs/tasks-archived.md`](../tasks-archived.md) § **Tasks.md archive (2026-03-20)** (**Active: Add-property experience overhaul**). Use this section as the acceptance-criteria reference.*

### Epic A — Information architecture & design freeze

**Discovery doc (field inventory + A2–A4 drafts):** [`epic-a-discovery.md`](epic-a-discovery.md)

| Task | Acceptance criteria |
|------|---------------------|
| **A1. Field inventory** | Spreadsheet or doc listing every field across wizard, `PropertyForm`, and Details inline edits; mapped to API (`POST`/`PATCH`) and validation schema. |
| **A2. First-save vs enrich-later** | **Signed** in `epic-a-discovery.md`: hybrid — portfolio-ready minimum + optional enrich tier + checklist; not address-only minimal save without incomplete-property program. |
| **A3. Edit surface model** | **Signed** in `epic-a-discovery.md`: same IA for add and `/edit`; Details read-only + “Edit property” → `/edit` (or sheet); mortgage thin on add, full elsewhere. |
| **A4. Visual / UX references** | Moodboard or Figma: spacing, typography, step chrome, empty states—not necessarily pixel-perfect before build, but enough to align engineering. |

### Epic B — Shared property UI layer

| Task | Acceptance criteria |
|------|---------------------|
| **B1. Section components** | Reusable components for Location, Economics, Property profile (type/units/beds/**optional sqft**), Notes; shared `input`/`label` tokens matching design spec. |
| **B2. Single validation path** | Create/update payloads validated through `lib/validations/property.ts` (and mortgage where applicable); no duplicate ad-hoc validation in three places. **Include optional `squareFeet` (or chosen name)** with sensible bounds. |
| **B3. Estimates integration** | Rent/value estimate buttons behavior consistent across surfaces (clear stale on address change, same error copy). **Pass RentCast `squareFootage`** when the user has entered or stored sqft; document that estimates improve vs beds/baths-only. Value endpoint updated if API supports sqft. |

### Epic C — Add property (replace wizard)

| Task | Acceptance criteria |
|------|---------------------|
| **C1. New flow implemented** | Replaces `add-property-wizard.tsx` responsibilities; preserves `?from=<dealId>` prefill and draft persistence (`draft-context` or successor). |
| **C2. Mortgage path** | Obvious “Add mortgage later” path; optional detailed loan capture does not block first save. |
| **C3. Entry QA** | Smoke-tested from: onboarding, dashboard empty, sidebar, properties list, deal import, analyze deal CTA. |

### Epic D — Edit property page

| Task | Acceptance criteria |
|------|---------------------|
| **D1. Rebuild `/edit`** | Uses shared section components from Epic B; no standalone copy-paste of wizard markup. |
| **D2. PATCH behavior** | Saving updates property correctly; plan limits and error states match current API behavior. |
| **D3. Wayfinding** | Clear hierarchy (title, back to detail, primary save); feels consistent with new add flow. |

### Epic E — Property detail (Details tab)

| Task | Acceptance criteria |
|------|---------------------|
| **E1. Remove or replace triple inline pattern** | No three disconnected “form islands” unless justified; aligns with A3 decision—either shared sections inline, or “Edit” flows that match D. |
| **E2. Unsaved changes** | Replace raw `window.confirm` with pattern consistent with app (modal or inline banner)—or eliminate by auto-save / single edit surface. |
| **E3. Mortgage block** | Still works; any restyling matches new cards. |

### Epic F — Property Overview tab

| Task | Acceptance criteria |
|------|---------------------|
| **F1. KPI layout** | No duplicate hero + grid metrics; **Performance at a glance** is the single KPI block. |
| **F2. Visual parity** | Cards and primary **Edit** match Details tab patterns; shared health strip. |
| **F3. Wayfinding** | Explicit path to **Details** tab (`?tab=details`) and `/edit`. |
| **F4. Inputs snapshot** | Rent visible in **Inputs at a glance**; copy distinguishes read-only Details vs edit. |

### Epic G — QA & cleanup

| Task | Acceptance criteria |
|------|---------------------|
| **G1. Regression matrix** | [`property-flow-regression-matrix.md`](../qa/property-flow-regression-matrix.md) — multi-tab smoke: add, edit, Overview, Details, workspaces, APIs. |
| **G2. Dead code removal** | Unused `section-nav.tsx` removed; no orphaned imports. |
| **G3. Docs** | `architecture-and-build-practices.md` § property routes / detail surfaces updated. |

---

## 9. Resolved (Epic A — see `epic-a-discovery.md`)

- **First-save / enrich-later:** **Hybrid** — portfolio-ready minimum economics + labeled optional tier + checklist (**A2 signed**).
- **Edit / add / Details:** **Same section IA** for add and `/edit`; **Details = read-only + primary “Edit property” → `/edit`** (or sheet with same components); tabs vs anchors on edit is an implementation choice (**A3 signed**).
- **Square footage:** optional field name (`squareFeet` vs `sqft`) and **Details** placement (profile/Facts vs Economics)—implementation in Epic B; **not** required for first save; **RentCast param** is `squareFootage` on the AVM query string.

---

## 10. Tracking

- **Master checklist (archived):** [`docs/tasks-archived.md`](../tasks-archived.md) § **Tasks.md archive (2026-03-20)** → **Active: Add-property experience overhaul** *(complete — regression only)*.
- **This doc:** historical reference; update only if you change add/edit/detail behavior materially.

*Batch 8 (analytics, changelog, uptime) and production launch verification: see [`docs/tasks-archived.md`](../tasks-archived.md) (same section, Batch 8) and [`docs/launch/launch-plan.md`](../launch/launch-plan.md) §6.*
