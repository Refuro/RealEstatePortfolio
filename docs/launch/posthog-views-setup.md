# PostHog Views Setup — Paid Ads Monitoring

Use this to build the PostHog views needed to monitor paid ad performance during the 7-10 day controlled test. Set these up before or on Day 1 of the campaign.

Related:
- `docs/launch/paid-ads-campaign-build-sheet.md`
- `docs/launch/paid-ads-monitoring-runbook.md`
- `docs/launch/analytics.md`

---

## How to navigate PostHog (read first)

```
PostHog sidebar
├── Dashboards     ← pinned metric views, build these last
├── Insights       ← where you build individual charts/funnels
├── Persons        ← individual user lookup
├── Cohorts        ← saved audience segments
└── Session replay ← watch individual sessions
```

Build each **Insight** first, then pin the ones you want to a **Dashboard**.

---

## View 1 — Paid acquisition funnel (most important)

**What it tells you:** how many paid clicks become signups, and how many signups activate.

**Where:** Insights → + New insight → Funnel

**Steps to add:**
1. Step 1: `funnel_cta_clicked`
2. Step 2: `user_signed_up`
3. Step 3: `property_created`

**Filter to add (top of screen):**
- Property: `utm_source` = `google`

**Conversion window:** set to **7 days** (a signup who adds a property within 7 days counts as activated)

**Save as:** `Paid Funnel — Google Search`

---

## View 2 — Landing variant comparison

**What it tells you:** which page variant (control vs paid-focused) converts better.

**Where:** Insights → + New insight → Funnel

Same funnel as View 1, but instead of filtering by utm_source, use **Breakdown:**

- Click **Breakdown** → select property `landing_variant`

This will show the funnel split by:
- `calc_control_v1` (traffic to `/investment-property-calculator`)
- `calc_paid_v1` (traffic to `/lp/investment-property-calculator`)
- `home_default_v2` (homepage traffic)

**Save as:** `Variant Funnel — Landing Comparison`

---

## View 3 — Ad group intent comparison

**What it tells you:** which ad group / keyword cluster produces the best signup quality.

**Where:** Insights → + New insight → Funnel

Same 3-step funnel, Breakdown by `utm_content`:

Expected values:
- `calc_control_v1` — calculator intent ad groups (C + D)
- `search_spreadsheet_v1` — spreadsheet alternative (A)
- `search_portfolio_v1` — portfolio tracking (B)
- `search_dealanalyzer_v1` — deal analyzer high intent (E)

**Save as:** `Ad Group Funnel — Intent Comparison`

---

## View 4 — Daily paid signups trend

**What it tells you:** day-by-day signup volume from paid traffic, to spot patterns or drops.

**Where:** Insights → + New insight → Trends

- Event: `user_signed_up`
- Filter: `utm_source` = `google`
- Date range: rolling last 14 days
- Display: line chart by day

**Save as:** `Paid Signups — Daily Trend`

---

## View 5 — Signup plan intent breakdown

**What it tells you:** what plan users intend when they sign up from paid — free vs investor intent. Tells you whether your ads are attracting upgrade candidates.

**Where:** Insights → + New insight → Trends

- Event: `user_signed_up`
- Filter: `utm_source` = `google`
- Breakdown by: `plan_intent`
- Display: bar chart

**Save as:** `Paid Signups — Plan Intent`

---

## View 6 — CTA click heatmap by placement

**What it tells you:** which CTAs on your landing pages are actually being clicked.

**Where:** Insights → + New insight → Trends

- Event: `funnel_cta_clicked`
- Breakdown by: `placement`
- No UTM filter (see all placements)

Values you'll see:
- `public_calculator` — CTA inside the calculator card
- `lp_calc_footer` — footer CTA on the `/lp/` variant
- `landing_hero` — homepage hero
- `landing_how_it_works` — homepage calculator section
- `landing_nav` — nav sign-up button

**Save as:** `CTA Clicks — By Placement`

---

## View 7 — Activation rate for paid cohort

**What it tells you:** of all paid signups, what % added a property within 7 days.

**Where:** Insights → + New insight → Funnel

- Step 1: `user_signed_up`
- Step 2: `property_created`
- Filter: `utm_source` = `google`
- Conversion window: 7 days

**Save as:** `Paid Activation Rate — 7 Day`

---

## Build the dashboard

Once all 7 insights are saved:

1. Go to **Dashboards → + New dashboard**
2. Name it: `Paid Ads — Round 2 Monitor`
3. Click **Add insight** and add all 7 saved views above
4. Recommended layout:
   - Row 1: View 1 (Paid funnel) + View 7 (Activation rate)
   - Row 2: View 2 (Variant comparison) + View 3 (Ad group comparison)
   - Row 3: View 4 (Daily trend) + View 5 (Plan intent) + View 6 (CTA clicks)

Set date range on the dashboard to **last 14 days** and pin it.

---

## How to look up a specific user session

When a signup comes in and you want to see exactly what they did:

1. **Persons** → search by email or Clerk user ID
2. Click the person → scroll to **Events** tab to see their full event timeline
3. If session replay is enabled, click **Recordings** to watch their session

---

## Day-by-day check routine (using PostHog)

During the 7-10 day run, spend 5 minutes each morning:

1. Open `Paid Ads — Round 2 Monitor` dashboard
2. Check View 1 (funnel) — did conversion rate hold or drop?
3. Check View 4 (daily trend) — any spike or flatline in signups?
4. Check View 3 (ad group comparison) — any single `utm_content` dominating?
5. Cross-reference against the archived daily log in [`docs/archive/launch/paid-ads-readouts/paid-ads-round2-search-ops-2026-03-30.md`](../archive/launch/paid-ads-readouts/paid-ads-round2-search-ops-2026-03-30.md)

---

## Go/No-Go signals to watch for in PostHog

| Signal | What to look for |
|---|---|
| Funnel step 1→2 drops | Low intent match — check which `utm_content` is driving bounces |
| Step 2→3 drops | Onboarding issue — users sign up but don't activate |
| `calc_paid_v1` outperforms `calc_control_v1` | Move more budget to `/lp/` variant |
| One `utm_content` has 0 signups after 4 days | Pause that ad group |
| `plan_intent = undecided` dominates | Ad copy not setting intent — review headlines |
