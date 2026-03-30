# Pre-Live Telemetry QA — 2026-03-30

Purpose: verify paid attribution and conversion mapping before relaunching Search spend.

---

## 1) Code-path verification (completed)

- [x] UTM ingestion exists in URL sync layer:
  - `app/components/analytics/plan-intent-url-sync.tsx` calls `syncUtmFromSearchParams(...)`.
- [x] UTM persistence helper implemented:
  - `app/lib/utm-attribution.ts` stores `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`.
- [x] Signup event includes UTM payload:
  - `app/components/analytics/posthog-signup-once.tsx` merges `getUtmForAnalytics()` into `user_signed_up`.
- [x] Google conversion mapping implemented:
  - `app/lib/analytics-client.ts` maps:
    - `user_signed_up` -> `NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_CONVERSION_LABEL`
    - `property_created` -> `NEXT_PUBLIC_GOOGLE_ADS_PROPERTY_CREATED_CONVERSION_LABEL`
- [x] Activation events still fire from app flow:
  - `app/app/(app)/properties/add-property-wizard.tsx`
  - `app/app/(app)/properties/property-form.tsx`

---

## 2) Environment checklist (required before live)

- [ ] `NEXT_PUBLIC_GOOGLE_ADS_ID` set in deployment
- [ ] `NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_CONVERSION_LABEL` set
- [ ] `NEXT_PUBLIC_GOOGLE_ADS_PROPERTY_CREATED_CONVERSION_LABEL` set
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` set
- [ ] `NEXT_PUBLIC_POSTHOG_HOST` set appropriately (US/EU)

---

## 3) Browser QA checklist (run in staging/prod)

### 3.1 UTM + signup attribution

1. Visit `/investment-property-calculator?utm_source=google&utm_medium=paid&utm_campaign=round2&utm_content=calc_intent_v1`.
2. Complete sign-up flow.
3. Verify `user_signed_up` appears with UTM properties:
   - `utm_source=google`
   - `utm_medium=paid`
   - `utm_campaign=round2`
   - `utm_content=calc_intent_v1`

- [ ] Completed

### 3.2 Google signup conversion

1. With optional analytics consent accepted, complete sign-up.
2. Verify `gtag` conversion request fires for signup label.

- [ ] Completed

### 3.3 Google activation conversion

1. From the signed-up account, add first property.
2. Verify `gtag` conversion request fires for property-created label.

- [ ] Completed

### 3.4 Consent behavior

1. Reject optional cookies.
2. Repeat sign-up/property flow.
3. Verify no Google conversion/analytics scripts fire.

- [ ] Completed

---

## 4) Go/No-Go telemetry gate

Go live only when:

- Browser checks 3.1–3.4 are complete and pass.
- No missing env vars for conversion labels.
- PostHog event stream shows paid attribution fields consistently on signup.
