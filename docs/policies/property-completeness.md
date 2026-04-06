# Property Completeness Policy (Canonical)

**Purpose:** Define which fields are required vs. optional for the property completeness score, how the score is computed, and what threshold triggers the completion banner.

**Implementation file:** [`app/lib/property-completeness.ts`](../../app/lib/property-completeness.ts) — this document is the governing spec; the implementation must match it.

**Scope:** Property detail overview tab, Properties list page, property edit form, and any future surface that signals to a user that their property data is incomplete.

---

## 1) Why completeness matters

A quick-add property (address + rent + estimated value only) unlocks the dashboard but scores poorly on financial metrics:

- **Equity** is unreliable when purchase price equals estimated value (defaults to 0 or estimated value).
- **Cash-on-cash return** requires `cashInvested`.
- **LTV, DSCR** require at least one mortgage or an explicit "no mortgage" flag.
- **Market listings, insurance, and underwriting** typically require bed/bath/sqft.

The completeness score signals to the user which gaps to fill next.

---

## 2) Field classification

### Required (always collected at creation)

These fields are present on every property record regardless of add mode. They do not contribute individually to the score because they are guaranteed:

| Field | Notes |
|---|---|
| `addressLine1` | Required at creation |
| `propertyType` | Required at creation |
| `currentEstimatedValue` | Required at creation |
| `currentMonthlyRent` | Required at creation (may be 0 for vacant properties) |
| `currentMonthlyExpenses` | Required at creation (may be 0) |

These collectively provide the base score of **10 points**.

### Scored optional fields

These fields are not required at creation but are needed for meaningful financial analysis. Each has a point weight. Missing scored fields trigger the completion banner.

| Field | Weight | Missing label |
|---|---|---|
| `purchasePrice` (distinct from `currentEstimatedValue`) | 25 | `"actual purchase price"` |
| Mortgage confirmed (`mortgageCount > 0` OR `hasMortgage === false`) | 25 | `"mortgage status"` or `"mortgage details"` |
| `cashInvested` | 20 | `"cash invested"` |
| `bedrooms` + `bathrooms` + `squareFeet` (all three) | 20 | individual labels per missing field |

**Max achievable score: 100.**

### Unscored optional fields

These fields enrich the property but do not affect the completeness score. They are never listed in `missingFields`:

- `nickname`
- `unitRents` / multi-unit breakdown
- `vacancyPercent`, `ownershipPercent`
- `marketRent`, `marketRentAsOf`
- `isRented`
- `notes`
- `addressLine2`, `city`, `state`, `zipCode` (filled via Google Places)

---

## 3) Scoring algorithm

```
score = 10   // base: required fields always present

if purchasePrice rounded ≠ currentEstimatedValue rounded:
    score += 25
else:
    missing += "actual purchase price"

if mortgageCount > 0 OR hasMortgage === false:
    score += 25
elif hasMortgage === true AND mortgageCount === 0:
    missing += "mortgage details"
else:
    missing += "mortgage status"

if cashInvested is not null:
    score += 20
else:
    missing += "cash invested"

if bedrooms is not null AND bathrooms is not null AND squareFeet is not null:
    score += 20
else:
    if bedrooms is null:   missing += "bedrooms"
    if bathrooms is null:  missing += "bathrooms"
    if squareFeet is null: missing += "square feet"
```

**Threshold:** score ≥ **60** → `isComplete = true` → banner is hidden.

A property with purchase price differentiated + mortgage confirmed (35 + 25 = 60 base-inclusive) meets the threshold. Bed/bath/sqft and cash invested are then bonus fields that push score higher.

---

## 4) Threshold rationale

| Score | What the user has filled in |
|---|---|
| 10 | Quick-add only (address, rent, value) |
| 35 | + actual purchase price |
| 60 | + mortgage confirmed → **threshold met, banner hidden** |
| 80 | + cash invested |
| 90–100 | + home profile (bed/bath/sqft) |

60 was chosen so that a property with at minimum a real purchase price and mortgage status confirmed is considered "complete enough" for core metrics (equity, LTV, cap rate). Cash invested and home profile are encouraged but not blocking.

---

## 5) Banner behavior

- **Shown when:** `isComplete === false` (score < 60) on the property detail overview tab, property edit form highlight, and properties list completeness indicator.
- **Hidden when:** `isComplete === true` (score ≥ 60) — the banner never reappears unless data is deleted to bring the score back below threshold.
- **Missing fields list:** Displayed as a comma-joined hint of which fields to fill (`missingFields` array). The UI maps each label to the corresponding form section and scrolls/highlights it on click.

---

## 6) Mortgage edge cases

| State | Points awarded | Missing label |
|---|---|---|
| `mortgageCount > 0` | 25 | — |
| `hasMortgage === false` | 25 | — |
| `hasMortgage === true`, `mortgageCount === 0` | 0 | `"mortgage details"` (user said they have one but hasn't entered it) |
| `hasMortgage === null`, `mortgageCount === 0` | 0 | `"mortgage status"` (unknown) |

---

## 7) Home profile (bed/bath/sqft)

All three must be non-null to earn the 20 points. If any are missing, only the missing ones appear in `missingFields`. This allows a user who has filled in two of three to see exactly which field remains.

If all three are null, the property detail overview displays `"Not set"` in the home profile row rather than hiding the row entirely.

---

## 8) Implementation guardrails

- All completeness logic lives in `app/lib/property-completeness.ts`. Do not duplicate the scoring formula in components or pages.
- All call sites must pass `bedrooms`, `bathrooms`, and `squareFeet` from the property record. Omitting them defaults to `null` (missing), which is incorrect.
- If weights or the threshold change, update **both** this document and `property-completeness.ts` in the same commit.
- Builder reviews touching `getPropertyCompleteness`, the overview tab, or the property form must verify behavior against this policy before approval.
