# SEO plan — Phase 5 & 6 runbook

**Purpose:** Operational checklist for [`seo-growth-plan.md`](seo-growth-plan.md) **Phase 5** (community distribution) and **Phase 6** (monitoring). No app build required for the core loop—engineering already persists UTMs for signup attribution.

**Related:** [Product analytics (PostHog)](analytics.md) · [Channel posting playbook](channel-posting-playbook.md) (tone/templates)

---

## Phase 5 — Community distribution (owner-led)

### What the app already does

- Visiting a marketing URL with `utm_*` query params stores attribution in `localStorage` for **30 days** (`app/lib/utm-attribution.ts`), synced from the URL by `PlanIntentUrlSync` on public pages.
- When `user_signed_up` fires in PostHog, the event includes **`utm_source`**, **`utm_medium`**, **`utm_campaign`**, **`utm_content`** when present (see [analytics.md § `user_signed_up`](analytics.md)).
- **Do not** put UTMs on canonical URLs in the sitemap—only on links you paste in posts, emails, or chats.

### Rules (non-negotiable)

- Share tools **only** where the thread question is genuinely answered by a calculator or link.
- **Disclose** affiliation: e.g. “I built this — here’s a free calculator.”
- **No** astroturfing, fake accounts, or drive-by spam.
- **Tool-first:** help with the math; signup is secondary.

### Link templates (copy and add your domain)

Use **your** production origin (replace `<domain>` with your host, no path prefix). Replace campaign strings if you want finer grouping.

| Channel | Example URL |
|--------|-------------|
| Reddit r/realestateinvesting | `https://<domain>/investment-property-calculator?utm_source=reddit&utm_medium=community&utm_campaign=organic_re_investing` |
| Reddit — BRRRR thread | `https://<domain>/tools/brrr?utm_source=reddit&utm_medium=community&utm_campaign=organic_brrr` |
| BiggerPockets | `https://<domain>/tools/brrr?utm_source=biggerpockets&utm_medium=community&utm_campaign=organic_brrr` |
| Fix-and-flip thread | `https://<domain>/tools/fix-and-flip?utm_source=reddit&utm_medium=community&utm_campaign=organic_fix_flip` |
| Resources article | `https://<domain>/resources/dscr-explained?utm_source=reddit&utm_medium=community&utm_campaign=organic_resource_dscr` |

Optional: add `utm_content=post_2026_04` to distinguish posts.

### Phase 5 acceptance (manual)

- [ ] PostHog: filter `user_signed_up` where `utm_medium` = `community` (and/or `utm_source` = `reddit`) — confirm events appear after a test signup from a UTM link (same browser, within 7 days of account creation per event rules).
- [ ] Keep a short list of **5+** communities you actually read (subreddits, BP forums, REIA).
- [ ] Complete **3** genuine help-first posts with UTM links; note dates in a spreadsheet or doc.

---

## Phase 6 — Monitoring and iteration (recurring)

### Monthly (calendar reminder)

| Check | What to do |
|-------|------------|
| **Google Search Console** | Impressions/clicks by page and query. Watch `/alternatives/*`, `/vs/*`, `/tools/*/[state]`, `/resources/*`. |
| **PostHog** | Paths or landing URLs leading to signup; compare competitor vs location vs resource pages. |
| **Indexing** | URL Inspection on a sample of location URLs + 1–2 competitor URLs — “URL is on Google.” |
| **Rich Results** | After any FAQ/content change, spot-check with [Rich Results Test](https://search.google.com/test/rich-results). |
| **Repo** | If you changed SEO-related code, run `npm run check` from `app/` before deploy. |

### Decision gates (from the growth plan)

Use [`seo-growth-plan.md` § Phase 6](seo-growth-plan.md) table: e.g. expand competitor pages if impressions justify it; add resource articles if SGE cites you; investigate technical SEO if **zero** impressions after ~90 days on key URLs.

### Phase 6 acceptance (manual)

- [ ] One note per month: “Search Console: [trend]. PostHog: [what converted]. Next experiment: […].”
- [ ] Prioritize the **next** build (if any) from data, not from a fixed roadmap alone.

---

## When engineering *is* needed

- UTM not appearing on `user_signed_up` after a controlled test → verify `NEXT_PUBLIC_POSTHOG_KEY`, cookie consent, and that the user hit a page with `PlanIntentUrlSync` **before** sign-up with UTM params in the URL.
- Indexing issues → `NEXT_PUBLIC_APP_URL` (no trailing slash), sitemap submission, `robots.txt`, staging `noindex` policy.
- New content waves → follow patterns in `docs/launch/seo-growth-plan.md` (metadata, `proxy.ts`, `sitemap.ts`, FAQ + visible copy).

---

**Last updated:** 2026-04-01
