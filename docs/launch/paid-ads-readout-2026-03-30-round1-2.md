# Paid Ads Readout — 2026-03-30 (Round 1 Reassessment, Go/No-Go)

This readout preserves the original round-1 report and adds explicit go/no-go guidance after calculator + funnel updates.

Related:
- `docs/launch/paid-ads-readout-2026-03-30-round1.md`
- `docs/launch/pre-live-telemetry-qa-2026-03-30.md`
- `docs/launch/paid-ads-round2-search-ops-2026-03-30.md`

---

## 1) Performance recap (Round 1)

- Spend: **$78.81**
- Clicks: **60**
- Impressions: **229**
- CTR: **26.2%**
- Avg CPC: **$1.31**
- Signups (`user_signed_up`): **1**
- Signup rate: **1.67%**
- `property_created`: **0**

Interpretation:
- Top-of-funnel click quality looked strong.
- Click -> signup -> activation quality did not yet validate scaling.

---

## 2) Evidence from search-term quality

Observed search-term drift included terms likely to underperform for immediate signup intent:
- `biggerpockets multifamily analysis`
- `dealcheck`
- `investor weekly`
- `realty income stock`
- broad/generic analysis terms with weak direct product intent

Positive intent clusters remain:
- `investment property calculator`
- `real estate deal analyzer`
- `analyze real estate deal`
- `multifamily deal analyzer`

---

## 3) What has changed before round-2 relaunch

### Product/funnel changes
- Public calculator is live at `/investment-property-calculator`.
- Calculator CTA copy now aligns better with account-gated behavior.
- Signed-in users route directly to `/analyze`.

### Telemetry changes
- UTM persistence and signup attribution are implemented.
- Google conversion mapping is implemented for:
  - `user_signed_up`
  - `property_created`
- Pre-live telemetry QA checklist is documented.

### Campaign structure changes
- Search campaigns are now intent-split.
- Negative keyword list expanded based on round-1 drift.
- 7-10 day controlled operations with day-4/day-7/day-10 gates documented.

---

## 4) Go/No-Go recommendation (current)

## Recommendation: **NO-GO for immediate scale**

Status before scaling:
- [ ] Browser telemetry QA fully passed in deployed environment
- [ ] Round-2 controlled Search run completed (7-10 days)
- [ ] Signup rate improvement proven vs baseline (1.67%)
- [ ] Paid cohort activation (`property_created`) non-zero and improving

Because these are not yet all satisfied, recommendation is:
- **Run controlled round-2 first**
- **Do not increase spend yet**

---

## 5) Conditional scale trigger

Promote to **GO** only when all conditions hold:

1. Signup conversion materially improves above round-1 baseline.
2. At least one intent cluster shows repeatable signup efficiency.
3. `property_created` from paid signups is non-zero and trending up.
4. Telemetry QA confirms reliable attribution and conversion mapping.
