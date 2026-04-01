# Paid Ads Readout — Round 2 Variant Test (7-10 Days)

Status: In progress (awaiting live run completion)

Related:
- [`paid-ads-round2-search-ops-2026-03-30.md`](paid-ads-round2-search-ops-2026-03-30.md)
- [`../../launch/paid-ads-monitoring-runbook.md`](../../launch/paid-ads-monitoring-runbook.md)

---

## Test setup

- Channel: Google Search only
- Objective: improve paid click -> signup quality and paid signup -> activation quality
- Variants:
  - Variant A (`calc_control_v1`): `/investment-property-calculator`
  - Variant B (`calc_paid_v1`): `/lp/investment-property-calculator`
- Baseline from Round 1:
  - Signup rate: 1.67%
  - `property_created`: 0

---

## Daily rollup (fill during run)

```text
Date:
Spend:
Clicks:
CPC:
user_signed_up:
Signup rate:
property_created:

Variant A (calc_control_v1):
- Clicks:
- user_signed_up:
- property_created:

Variant B (calc_paid_v1):
- Clicks:
- user_signed_up:
- property_created:

Notes / actions:
```

---

## Day 10 decision summary

Decision: Pending

Go criteria:
- signup rate improves vs 1.67% baseline
- at least one variant + ad-group intent cluster is repeatably efficient
- paid cohort `property_created` is non-zero and trending up

No-Go criteria:
- high CTR but weak signup/activation quality persists
- variant attribution is unclear
- search query drift returns despite negatives

Recommended next action (to fill):
- GO -> scale winner by 25-40% WoW, keep one control
- NO-GO -> hold spend and iterate landing/onboarding before relaunch

