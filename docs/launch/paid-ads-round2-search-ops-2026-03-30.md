# Paid Ads Round 2 Ops Tracker (Search-only) — 2026-03-30

Use this tracker for the 7-10 day controlled relaunch.

Baseline from round 1:
- Spend: $78.81
- Clicks: 60
- CPC: $1.31
- Signups: 1
- Signup rate: 1.67%
- `property_created`: 0

---

## Pre-launch checklist

- [ ] Calculator CTA copy + signed-in routing verified
- [ ] UTM telemetry QA completed (`docs/launch/pre-live-telemetry-qa-2026-03-30.md`)
- [ ] Campaign/ad-group structure updated per build sheet
- [ ] Negative keywords include drift terms from round 1
- [ ] Landing URLs validated in browser with UTM params
- [ ] Variant URL mapping verified:
  - [ ] `calc_control_v1` -> `/investment-property-calculator`
  - [ ] `calc_paid_v1` -> `/lp/investment-property-calculator`

---

## Day 1 setup

Budget split:
- [ ] 50% Software/Tracker intent
- [ ] 35% Calculator intent
- [ ] 15% Brand/High-intent exact

Match type policy:
- [ ] Phrase/exact only for initial control window

---

## Daily metric log (copy forward)

```text
Date:
Spend (day):
Clicks:
CPC:
Signups (user_signed_up):
Signup rate:
property_created:
checkout_started:
landing_variant split:
- calc_control_v1: clicks / signups / property_created
- calc_paid_v1: clicks / signups / property_created
Top search terms:
Negative keywords added:
Action for tomorrow:
```

---

## Gate decisions

### Day 4 gate
- [ ] Paused spend/no-signup ad groups
- [ ] Confirmed no tracking outages
- [ ] Logged exact changes made

### Day 7 gate
- [ ] Reallocated 20-30% budget toward better signup efficiency
- [ ] Reduced poor quality search-term exposure with negatives
- [ ] Kept one control variant per major ad group

### Day 10 gate (Go/No-Go)
- [ ] Compare signup rate vs baseline (1.67%)
- [ ] Compare paid cohort activation (`property_created`) vs baseline (0)
- [ ] Compare variant performance (`calc_control_v1` vs `calc_paid_v1`)
- [ ] Document recommendation:
  - [ ] GO: increase spend
  - [ ] NO-GO: hold/pause and iterate landing/onboarding

---

## Notes

- Do not introduce major landing architecture changes during the 7-10 day observation window.
- Keep one-variable changes to preserve attribution quality.
