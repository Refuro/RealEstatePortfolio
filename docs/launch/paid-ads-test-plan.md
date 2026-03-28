# Paid Ads Test Plan (14 Days)

This is the execution companion for the launch plan. It is designed to get signal fast with controlled spend.

---

## 1) Objective

Find which channel + message angle drives the lowest cost for meaningful activation, not just clicks.

Primary KPI:
- **Cost per activated user** (`property_created` within 7 days of first visit).

Secondary KPIs:
- CPC
- CTR
- Signup rate
- Cost per signup (`user_signed_up`)
- `checkout_started`

---

## 2) Tracking readiness (confirmed)

## 2.1 Event instrumentation status

- `user_signed_up` is defined in `app/lib/analytics-events.ts`.
- `property_created` is defined in `app/lib/analytics-events.ts`.
- `checkout_started` is defined in `app/lib/analytics-events.ts`.
- `subscription_activated` is defined in `app/lib/analytics-events.ts`.

## 2.2 PostHog capture status

- Client pageviews are captured with full URL + query string in `app/components/analytics/posthog-page-view.tsx`.
- Server-side capture helper exists in `app/lib/posthog-server.ts`.
- PostHog env variables are documented in `app/.env.example`.

## 2.3 UTM naming status

UTM convention exists in `docs/launch/channel-posting-playbook.md`:

`https://<domain>/?utm_source=<platform>&utm_medium=community&utm_campaign=soft_launch&utm_content=<variant>`

For paid campaigns, use the same structure and set `utm_medium=paid`.

---

## 3) Budget tiers (pick one)

## Lean ($350-$500 total / 14 days)
- Google Search: 70%
- Meta Prospecting: 20%
- Retargeting: 10%

## Balanced (recommended) ($900-$1,400 total / 14 days)
- Google Search: 60%
- Meta Prospecting: 25%
- Retargeting: 15%

## High-learning ($2,000-$3,000 total / 14 days)
- Google Search: 50%
- Meta Prospecting: 30%
- Retargeting: 20%

Notes:
- If retargeting audience is too small in week 1, reallocate that budget to Google Search.
- Do not change total budget mid-test unless there is a clear winner after day 7.

---

## 4) What to advertise

## 4.1 Core message angles

Run 3 message angles across channels:

1. **Spreadsheet replacement**
   - "Track your rental portfolio without spreadsheets."
2. **Portfolio clarity**
   - "See equity, debt, and cash flow across properties in one dashboard."
3. **Deal underwriting**
   - "Analyze a rental deal before you buy."

## 4.2 Offer framing

- Free plan available (no credit card required).
- Primary CTA: **Start free**
- First-value action: **Add your first property**

---

## 5) Channel setup specifics

## 5.1 Google Search (first priority)

Campaign structure:
- Campaign 1: Spreadsheet replacement
- Campaign 2: Portfolio analytics
- Campaign 3: Deal analyzer

Suggested keyword themes:
- rental portfolio tracker
- rental property spreadsheet alternative
- track rental property cash flow
- real estate portfolio dashboard
- rental deal analyzer

Suggested negatives:
- property management jobs
- tenant screening service
- lease template free
- wholesaling course
- realtor leads

Landing alignment:
- Spreadsheet + portfolio campaigns -> `/`
- Pricing intent terms -> `/pricing`

## 5.2 Meta Prospecting (second priority)

Audience seeds:
- landlord / rental property investing interests
- BRRR / house hacking interests
- exclude existing users if possible

Creative set (minimum):
- 2 static image ads (dashboard screenshot, deal analyzer screenshot)
- 1 short video/GIF walkthrough if available
- 3 primary texts (one per message angle)

Landing alignment:
- Start on `/` for message consistency.
- Use `/pricing` only for price-sensitive creative.

## 5.3 Retargeting

Audience:
- visited `/pricing` or `/sign-up`
- no `property_created`

Message:
- light reminder + proof point ("No credit card for free plan")

---

## 6) Benchmark-informed expectations (for sanity)

Use as directional guardrails only.

- Search ads in real estate can have lower CPC than many industries, but lower CVR than SaaS average.
- Meta real estate traffic CPC is often around low single dollars or below, but click quality varies.
- Do not optimize to CTR alone. Optimize to `property_created`.

Reference benchmarks:
- WordStream/LocaliQ 2025 Google Ads benchmarks
- LocaliQ 2025 Facebook benchmarks
- Rentec Direct case study (Search + Meta + retargeting)

---

## 7) Decision gates (kill / iterate / scale)

## Day 4-5
- Pause ad groups with spend and zero signups.
- Kill creative variants with materially poor CTR for that channel.
- Keep offer and landing stable (avoid major page edits yet).

## Day 7
- Keep only top 1-2 creatives per channel.
- Shift 20-30% budget from worst to best channel based on:
  - cost per signup
  - early `property_created`

## Day 14
- Scale only if there is repeatable `property_created` at acceptable cost.
- If signups exist but `property_created` is weak, prioritize onboarding fixes before scaling spend.

---

## 8) Success criteria

Primary success:
- Paid traffic generates measurable `property_created`, not just signups.

Secondary success:
- One winning message angle identified.
- One channel shows stable and repeatable economics.

---

## 9) Daily operations checklist

- [ ] Spend pacing reviewed (no accidental overspend)
- [ ] UTM hygiene checked on live ads
- [ ] PostHog events arriving by `utm_source` and `utm_content`
- [ ] Top/bottom creative noted
- [ ] Any moderation/compliance issues logged
- [ ] One action chosen for tomorrow (single-variable change)

---

## 10) Week-3 plan if test works

- Increase budget by 25-40% on the winning channel only.
- Keep one control creative while adding one new variant weekly.
- Add lifecycle retargeting for signed-up users without `property_created`.
- Keep community/reddit value posting running for blended CAC support.
