# Channel posting playbook (rule-safe)

This playbook is the tactical companion to `docs/launch/launch-plan.md` section 6.

Use this doc for:
- copy/paste post starters,
- safe phrasing that avoids spam flags,
- response scripts for comments and moderator interventions,
- attribution naming for PostHog analysis.

---

## 1. Golden rules before posting

1. Read channel rules right before posting (rules change often).
2. Disclose affiliation ("I built this" / "I am the founder").
3. Provide value in the post itself, not just a link.
4. Ask for concrete feedback, not vague hype.
5. Do not repost identical copy across channels.

---

## 2. Account strategy quick reference

- Prefer established personal founder accounts with normal participation history.
- Avoid creating new accounts used only for promotion.
- If account is new, warm up first:
  - 5-10 thoughtful comments,
  - 1-2 non-promotional posts,
  - then one rules-compliant promotional action.

---

## 3. Channel templates

## 3.1 Indie Hackers first post template

**Title options**
- `I built this because property-manager software did not solve my investor workflow`
- `What is missing from rental portfolio software for small investors?`
- `Shipped: a small-investor analytics tool after years in spreadsheets`

**Body template**

```text
Hey everyone, first post here.

I built Veld Portfolio because I could not find tools for the workflow I actually needed as a small rental investor. Most products I found were optimized for tenant operations, while I mostly needed portfolio analytics and underwriting support.

What Veld currently does:
- Portfolio and per-property equity/cash flow metrics
- Deal analysis before purchase
- Mortgage/amortization modeling
- CSV import from spreadsheets

I am not looking for applause. I am looking for blunt feedback:
1) What would block you from trying this?
2) What feels confusing or missing in this workflow?

If useful, link is in my profile.
```

**Why this works**
- Problem-first.
- Feature bullets are specific.
- Explicit feedback ask.
- No hard sell language.

## 3.2 Reddit comment-first template (no direct pitch)

```text
I used to manage this in spreadsheets too. What helped me was tracking portfolio metrics separately from tenant operations: equity, cash flow, LTV, and underwriting assumptions for new deals.

If helpful, I can share the exact structure/checklist I use.
```

Use this by default in strict communities. Add product mention only when rules allow and context is direct.

## 3.3 Reddit monthly self-promo thread template (`r/realestateinvesting`)

```text
Founder disclosure: I built Veld Portfolio.

Veld Portfolio is a portfolio analytics app for small rental real estate investors.

I built it because most tools I tried focused on property management workflows, while I needed portfolio analytics for a small rental portfolio.

Current focus:
- Portfolio and per-property metrics (equity, cash flow, NOI, LTV)
- Deal analyzer for pre-purchase underwriting
- Mortgage/amortization modeling
- CSV import from spreadsheets

I would love feedback from active investors on what is missing or unclear.
Link: <your-url>
```

## 3.4 BiggerPockets participation script (non-promotional default)

```text
My process for this is:
1) Underwrite with conservative rent assumptions.
2) Track equity/cash flow and debt service monthly.
3) Review deal assumptions quarterly against actual performance.

If you want, I can share the exact rubric/checklist.
```

Only discuss product if the forum area and rules explicitly permit it.

---

## 4. Safe phrasing vs risky phrasing

## 4.1 Safe phrasing

- `I built this for my own workflow and I am looking for feedback.`
- `Founder disclosure: this is my product.`
- `If this is helpful, link is in my profile.`
- `What is confusing or missing from this approach?`
- `I can share the checklist/template if helpful.`

## 4.2 Avoid phrasing

- `Best app for investors`
- `Game changer`
- `You need this`
- `DM me for access`
- `Drop an upvote`
- `Launching everywhere today`

---

## 5. Response playbook (comments + moderation)

## 5.1 Supportive comments

```text
Thanks, I appreciate it. If you end up trying it, I would love blunt feedback on the onboarding flow and what is missing for your workflow.
```

## 5.2 Skeptical comments ("this is self-promo")

```text
Fair callout. I am the founder and should be explicit about that. I shared because I had this exact problem myself, but I can remove the link if this thread is not the right place.
```

## 5.3 Hostile comments

```text
Understood. I will keep this to feedback threads and value-first comments only. Thanks for the signal.
```

Do not escalate arguments. One calm reply, then move on.

## 5.4 Moderator warning / removal

```text
Thanks for the heads-up. I will follow the rule and avoid promotional posting here. If allowed, I will use the designated thread/section next time.
```

Then stop posting in that thread and document the rule in your tracker.

---

## 6. UTM naming convention for attribution

Use this convention for every external link:

`https://<domain>/?utm_source=<platform>&utm_medium=community&utm_campaign=soft_launch&utm_content=<post_id_or_variant>`

Examples:
- `utm_source=indiehackers`
- `utm_source=reddit`
- `utm_source=biggerpockets`
- `utm_content=ih_intro_v1`
- `utm_content=rei_monthlypromo_v2`

Track performance against PostHog funnel events in `docs/launch/analytics.md`:
- `user_signed_up`
- `property_created`
- `checkout_started`
- `subscription_activated`

---

## 7. Daily execution tracker (copy/paste)

```text
Date:
Channel:
Post/comment URL:
Variant:
Rule check completed: yes/no
Immediate reactions (first 60m):
Quality feedback notes:
Signups:
Property_created:
Moderation issues:
Next action:
```

Keep this log daily during the first 14 days.
