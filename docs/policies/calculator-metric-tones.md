# Calculator metric tones (UI semantics)

**Purpose:** Define how **DSCR**, **monthly cash flow**, **cash-on-cash**, and **cap rate** are tinted on marketing and in-app calculator surfaces. **Math is unchanged** — this document only governs presentation. Calculators are educational; copy must not imply lender approval.

**Implementation:** `app/lib/calculator-metric-tones.ts` (single source of truth for thresholds). **Accessibility:** Tone pairs with numeric value and existing helper text — color is not the only signal (WCAG 1.4.1).

## DSCR (debt service coverage ratio)

| Condition | Tone |
|-----------|------|
| Missing / not computable (`null`) | `default` (foreground — no “bad” tint) |
| ≥ **1.00** | `positive` |
| ≥ **0.90** and **&lt; 1.00** | `warning` |
| **&lt; 0.90** | `negative` |

## Monthly cash flow

| Condition | Tone |
|-----------|------|
| ≥ **0** | `positive` |
| **&lt; 0** | `negative` |

## Cash-on-cash return

Stored as a decimal (e.g. `0.12` = 12%). **Display** uses `%`; tone uses the decimal.

| Condition | Tone |
|-----------|------|
| Missing (`null`) | `default` |
| **&lt; 0** | `negative` |
| **≥ 0** | `positive` |

## Cap rate

**Always `default`** — cap rate without market/strategy context is ambiguous; we do not apply red/green “good/bad” semantics to cap rate values on calculators.

## CSS tokens

Use theme utilities only: `text-positive`, `text-warning`, `text-negative`, `border-positive`, etc. (see `app/app/globals.css`). Verify light and dark themes.
