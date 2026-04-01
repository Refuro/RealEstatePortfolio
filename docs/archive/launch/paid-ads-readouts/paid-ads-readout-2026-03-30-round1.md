# Paid Ads Test Readout — 2026-03-30 (Google Search early run)

## 1) Test summary

- Test window: ~2 days
- Budget tier: Lean exploratory (Google-only)
- Planned budget: not fully deployed (test stopped early)
- Actual spend: **$78.81**
- Primary KPI target: Cost per `property_created`
- Outcome: **mixed** (excellent CTR/CPC, weak signup volume)

---

## 2) Channel performance snapshot

| Channel | Spend | Clicks | CPC | `user_signed_up` | Signup rate | `property_created` | Cost per `property_created` | `checkout_started` |
|--------|-------|--------|-----|------------------|-------------|--------------------|------------------------------|--------------------|
| Google Search | $78.81 | 60 | $1.31 | 1 | 1.67% | 0 | N/A | 0 |
| Meta Prospecting | $0 | 0 | N/A | 0 | N/A | 0 | N/A | 0 |
| Retargeting | $0 | 0 | N/A | 0 | N/A | 0 | N/A | 0 |
| Total | $78.81 | 60 | $1.31 | 1 | 1.67% | 0 | N/A | 0 |

Supporting context:
- Impressions: 229
- CTR: 26.2%
- Top queries included broad calculator intent (`investment property calculator`, `real estate investment calculator`, `rental property calculator`, `landlord calculator`).

---

## 3) Winning message angle

- Winner (provisional): **Calculator / analysis intent**
- Why it appears to win:
  - High click engagement at low CPC indicates ad relevance.
- Losing angles:
  - Not enough data for reliable loser declaration.

---

## 4) Funnel quality notes

### 4.1 Signup quality
- Click quality appears top-of-funnel strong, but conversion to signup is weak.
- Likely cause: intent mismatch between ad promise (calculator-first) and destination flow (broader product page/sign-up friction).

### 4.2 Activation quality
- No `property_created` yet from this cohort.
- Need stronger first-value bridge from ad click -> immediate calculator value -> account creation -> first property action.

### 4.3 Monetization signal
- No meaningful `checkout_started` in this short run.

---

## 5) What changed during test

- Day 4-5 cuts made: N/A (test stopped before normal gate windows)
- Day 7 budget shifts: N/A
- Other meaningful edits: none during this run

---

## 6) Decision

- [ ] Scale now (week 3)
- [x] Hold spend and run one more controlled test
- [x] Pause paid and fix onboarding/landing first

Reason:
- CTR/CPC are strong, but signup and activation are too weak to scale.
- Corrective action should prioritize intent-matched landing and conversion tracking quality before larger spend.

---

## 7) Week-3 plan

Budget plan:
- total: controlled Search-only test budget (keep lean while validating CVR improvements)
- channel split:
  - 50% software/tracker intent
  - 35% calculator intent
  - 15% brand/high-intent exact

Changes to make:
1. Launch `/investment-property-calculator` as dedicated landing for calculator-intent keywords.
2. Split Google campaigns by intent and tighten match types/negative keywords.
3. Ensure conversion mapping is explicit (`user_signed_up` primary, `property_created` secondary quality signal).

Changes to avoid:
1. Scaling budget before signup + activation quality improves.
2. Mixing multiple major variables in the same 48-hour window.

---

## 8) Retrospective

What worked:
- High ad relevance and strong click performance at low CPC.

What did not work:
- Click-to-signup conversion quality.

What to test next:
- Intent-matched landing + CTA architecture and stricter keyword segmentation.
