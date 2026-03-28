# Paid Ads Monitoring Runbook (Day 0-14)

Use this while campaigns are live. This document is about decision quality and pace, not strategy brainstorming.

---

## 1) Non-negotiables

- Do not make major changes in the first 72-96 hours unless tracking is broken.
- Change one variable at a time.
- Optimize to `property_created`, not CTR alone.
- Log every budget shift and why it was made.

---

## 2) Daily check routine (15-25 minutes)

1. Confirm spend pacing by channel vs planned budget.
2. Check broken URLs and UTM parameters.
3. Pull yesterday metrics by `utm_source` + `utm_content`:
   - clicks
   - CPC
   - `user_signed_up`
   - `property_created`
   - `checkout_started`
4. Flag:
   - high-spend / zero-signup units
   - signup-heavy / no-activation units
5. Record one planned action for next day.

---

## 3) Day-4 / Day-5 gate

Goal: remove obvious losers, keep test integrity.

Actions:
- Pause ad groups/ad sets that have meaningful spend and zero signups.
- Pause creative variants with significantly weaker CTR than sibling variants.
- Keep only decent performers running; do not re-architect campaigns yet.

Do not:
- change landing page architecture,
- change offer,
- add many new audiences.

---

## 4) Day-7 gate

Goal: concentrate budget into early winners.

Actions:
- Keep top 1-2 creatives per channel.
- Reallocate 20-30% budget from weakest channel to strongest channel.
- For search, prioritize ad groups with actual signup -> activation flow.
- For Meta, prioritize ad sets with acceptable signup cost and non-zero activation.

Diagnostics:
- If CTR is fine but signups are weak: landing/copy mismatch.
- If signups are fine but activation is weak: onboarding/first-value issue.

---

## 5) Day-14 gate

Goal: decide scale vs fix-first.

Scale criteria:
- repeatable `property_created` from at least one channel,
- stable spend-to-activation trend over final 5-7 days.

Fix-first criteria:
- signups with near-zero activation,
- activation cost too high to be viable,
- large channel volatility without pattern.

Decision:
- **Scale winner** by 25-40% week-over-week, keep one control creative.
- **Pause and fix** onboarding if activation is the bottleneck.

---

## 6) Budget shift logic

Use this sequence:

1. Protect channel delivering the lowest cost per `property_created`.
2. Reduce spend from channels with:
   - zero activation after meaningful spend,
   - poor signup quality trend.
3. Reassign in increments of 10-15% per move (avoid all-in jumps).

---

## 7) Monitoring table (copy/paste)

```text
Date:
Total spend (yesterday):

Channel: Google Search
- Spend:
- Clicks:
- CPC:
- user_signed_up:
- property_created:
- checkout_started:
- Action today:

Channel: Meta Prospecting
- Spend:
- Clicks:
- CPC:
- user_signed_up:
- property_created:
- checkout_started:
- Action today:

Channel: Retargeting
- Spend:
- Clicks:
- CPC:
- user_signed_up:
- property_created:
- checkout_started:
- Action today:

Budget shifts made:
Reason:
```

---

## 8) Escalation checks

If any of these happen, pause and fix before spending more:

- UTM parameters not passing reliably.
- PostHog events delayed/missing for paid traffic.
- Landing page or signup path outages.
- Major mismatch between ad promise and landing page content.
