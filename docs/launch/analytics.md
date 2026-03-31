# Product analytics (PostHog)

**Purpose:** Funnel and behavior metrics for Veld Portfolio without building internal analytics.  
**Stack:** [PostHog](https://posthog.com) Cloud + `posthog-js` (client) + `posthog-node` (Stripe webhook).

---

## Environment variables

Set in **Vercel** (production) and optionally in `app/.env` locally.

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_POSTHOG_KEY` | Yes, to enable | Project API key from PostHog (starts with `phc_`). |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | Default `https://us.i.posthog.com`. Use `https://eu.i.posthog.com` for EU data residency. |

If `NEXT_PUBLIC_POSTHOG_KEY` is **unset**, the app does not load PostHog (no console errors).

**Dashboards / saved insights:** See [`docs/launch/posthog-views-setup.md`](posthog-views-setup.md).

### Cookie consent

PostHog is initialized only when **optional analytics** is accepted in the cookie consent UI (`PostHogGate` in `app/components/analytics/posthog-provider.tsx`). If the user declines, `posthog` is not initialized and client captures are effectively no-ops.

---

## Plan intent (logged-out → sign-up → post-auth)

**Values:** `free` | `investor` | `pro` | `undecided`

**Source of truth (precedence, highest first):**

1. **URL `?intent=`** on the current page when valid — canonical when present; overwrites `localStorage` and restarts the TTL clock (`app/lib/plan-intent.ts`, synced via `PlanIntentUrlSync` on marketing pages and sign-up).
2. **Explicit client writes** from tracked CTAs (`setPlanIntent` from pricing cards or `FunnelCtaLink`).
3. **Stored record** in `localStorage` if `updated_at` is within the persistence window.
4. **Fallback for analytics payloads:** `plan_intent: "undecided"`, `plan_intent_source: "unknown"` (always explicit — never omit these properties on events that include them).

**Persistence window:** **30 days** (`PLAN_INTENT_TTL_MS` in `app/lib/plan-intent.ts`). After expiry the key is removed; the next resolution yields `undecided` / `unknown` until a new URL or CTA write.

**Post-auth:** Stored intent is registered on the PostHog client (`posthog.register`) after sign-in. `plan_intent_applied` fires once per Clerk user when `plan_intent_source !== "unknown"` (see dedup below). `user_signed_up` includes `plan_intent` and `plan_intent_source` when that event fires.

---

## Deduplication rules

| Mechanism | Scope | Window / key |
|-----------|--------|----------------|
| `user_signed_up` | Per Clerk user | **Once ever** per user via `localStorage` key `veld_ph_signup_sent_{userId}` (`STORAGE_PREFIX` + Clerk id in `posthog-signup-once.tsx`); only eligible if `createdAt` within **7 days** of capture. |
| `plan_intent_applied` | Per Clerk user | **Once ever** per user via `localStorage` `veld_plan_intent_applied_{userId}`; skipped when source is `unknown`. |
| `funnel_cta_clicked` | Per browser tab session | **Once per** `(placement, cta_id)` via `sessionStorage` key `veld_dedup_sess_funnel_cta_{placement}_{cta_id}`. |
| `onboarding_step_completed` | Per Clerk user × step | **Once per** `(userId, step)` via `localStorage` `veld_dedup_onb_{userId}_{step}`. |
| `add_property_milestone_reached` | Per browser tab session × milestone | **Once per** milestone id via `sessionStorage` `veld_dedup_sess_apm_{milestone}`. |

All dedup keys are defined in `app/lib/analytics-dedup.ts` (session vs onboarding vs signup/plan-intent in their respective components).

---

## Events (reference)

Stable names live in `app/lib/analytics-events.ts`. **Existing** names are unchanged; **new** Batch 10 names use **snake_case**.

### `user_signed_up` (existing name)

| Property | Type | Description |
|----------|------|-------------|
| `clerk_user_id` | string | Clerk user id |
| `plan_intent` | string | `free` \| `investor` \| `pro` \| `undecided` |
| `plan_intent_source` | string | `url` \| `pricing_card` \| `landing_cta` \| `unknown` |

**Sample payload:**

```json
{
  "clerk_user_id": "user_2abc…",
  "plan_intent": "investor",
  "plan_intent_source": "url"
}
```

**Eligibility:** Account `createdAt` within **7 days** of first qualifying session; fired at most once per user (localStorage).

---

### `checkout_started` (existing name)

| Property | Type | Description |
|----------|------|-------------|
| `plan` | string | Product/plan slug sent to Stripe |
| `billing_cycle` | string | Billing interval |
| `plan_intent` | string | Resolved intent at checkout click |
| `plan_intent_source` | string | Source for resolved intent |

**Sample payload:**

```json
{
  "plan": "investor",
  "billing_cycle": "annual",
  "plan_intent": "investor",
  "plan_intent_source": "pricing_card"
}
```

---

### `subscription_activated` (existing name, server)

Emitted from Stripe webhook path after subscription sync. Metadata includes `plan`, `billing_cycle` as implemented in server capture (see `app/` Stripe integration). Optional **billing success page** view can be modeled in PostHog via `$pageview` on the success URL if you add such a route — no separate product event required unless product adds one later.

---

### `funnel_cta_clicked` (new)

| Property | Type | Description |
|----------|------|-------------|
| `placement` | string | e.g. `landing_hero`, `landing_nav` |
| `cta_id` | string | Stable id, e.g. `get_started_free`, `view_pricing` |
| `href` | string | Link destination |
| `landing_variant` | string | Optional variant label, e.g. `calc_control_v1`, `calc_paid_v1`, `home_default_v2` |

**Sample:**

```json
{
  "placement": "landing_hero",
  "cta_id": "get_started_free",
  "href": "/sign-up?intent=free",
  "landing_variant": "home_default_v2"
}
```

---

### `onboarding_step_completed` (new)

| Property | Type | Description |
|----------|------|-------------|
| `step` | string | `welcome_modal_viewed` \| `welcome_maybe_later` \| `welcome_add_first_property` |
| `plan_intent` | string | At time of event |
| `plan_intent_source` | string | At time of event |

**Sample:**

```json
{
  "step": "welcome_add_first_property",
  "plan_intent": "free",
  "plan_intent_source": "landing_cta"
}
```

---

### `add_property_milestone_reached` (new)

| Property | Type | Description |
|----------|------|-------------|
| `milestone` | string | `wizard_opened` \| `section_location` \| `section_economics` \| `section_income` \| `section_mortgage` \| `section_review` |

**Sample:**

```json
{
  "milestone": "section_review"
}
```

---

### `plan_intent_applied` (new)

| Property | Type | Description |
|----------|------|-------------|
| `plan_intent` | string | Resolved value |
| `plan_intent_source` | string | Not `unknown` when fired |
| `clerk_user_id` | string | Clerk user id |

**Sample:**

```json
{
  "plan_intent": "pro",
  "plan_intent_source": "url",
  "clerk_user_id": "user_2abc…"
}
```

---

### Other product events (existing)

| Event | When |
|-------|------|
| `property_created` | After successful `POST /api/properties` |
| `deal_created` | After successful new deal save from Deal analyzer |

**Page views:** `$pageview` on client-side navigations (pathname + URL with query).

---

## Privacy

- Analytics is **optional** via env. Describe PostHog in your **Privacy Policy** if you enable it in production (third-party processor, approximate location, product analytics).
- Respect **cookie banner** requirements for your jurisdictions (PostHog may use cookies/localStorage).

## Google Ads conversion mapping (optional)

When Google Ads tag is enabled and optional analytics consent is accepted:

- `user_signed_up` can trigger Google conversion via `NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_CONVERSION_LABEL`.
- `property_created` can trigger Google conversion via `NEXT_PUBLIC_GOOGLE_ADS_PROPERTY_CREATED_CONVERSION_LABEL`.

UTM params (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`) are persisted from landing URLs and attached to signup analytics payloads to verify paid attribution quality.

---

## Saved insight (PM)

**Suggested funnel in PostHog UI:**

1. **Activation:** `funnel_cta_clicked` → `user_signed_up` → `onboarding_step_completed` (step = `welcome_add_first_property` or `property_created`) → `property_created`
2. **Monetization:** `checkout_started` → `subscription_activated`

Prioritize **onboarding progress** (`onboarding_step_completed`, `add_property_milestone_reached`) for activation diagnostics.

---

## PM validation checklist (Batch 10)

Use after deploy to staging or production with PostHog key enabled and analytics cookies accepted.

- [ ] **Consent:** With analytics **off**, no PostHog network calls after page load (or only non-analytics traffic as expected). With analytics **on**, events appear in PostHog Live.
- [ ] **Plan intent URL:** Visit `/sign-up?intent=pro` → storage / registered properties show `pro` and `url`; `plan_intent_applied` fires once for a test user with `plan_intent_source` = `url`.
- [ ] **Pricing cards:** From `/pricing`, click a tier → `checkout_started` includes `plan_intent` / `plan_intent_source`; sign-up links include `?intent=` and `setPlanIntent` on click.
- [ ] **Landing CTAs:** `funnel_cta_clicked` fires once per session per CTA (repeat click same session does not duplicate).
- [ ] **Onboarding:** Welcome modal shows → `welcome_modal_viewed`; “Maybe later” / “Add first property” → corresponding `onboarding_step_completed` steps; repeat visit does not duplicate (localStorage per user per step).
- [ ] **Add property:** Open wizard → `wizard_opened`; scroll sections → each `section_*` milestone once per session.
- [ ] **Signup window:** `user_signed_up` only for accounts created within 7 days and only once per user.
- [ ] **Docs:** This file matches implemented property names and dedup behavior.

For paid relaunch QA, use:
- [`pre-live-telemetry-qa-2026-03-30.md`](pre-live-telemetry-qa-2026-03-30.md)

---

## Changelog process

Release notes for users live in **`app/lib/changelog-data.ts`** and render at **`/changelog`**.  
For each production deploy with user-visible changes: add a new entry at the **top** of `CHANGELOG_ENTRIES`.
