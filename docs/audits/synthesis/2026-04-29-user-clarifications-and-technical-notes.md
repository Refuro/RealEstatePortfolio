# Audit follow-ups — clarifications & technical notes (2026-04-29)

Single place for your numbered questions, de‑prioritized items, and the writeups you asked for (data consistency, RentCast cron, PostHog). Also answers **math / dashboard–properties consistency**.

---

## 1. `npm run test` — what could have caused “flakes” if it fails elsewhere?

Your local **full green** run is completely plausible. The mobile audit reported **timeouts on some API route tests (401 paths)** in **that agent’s environment**, which often comes from **environment mismatch**, not from a definite bug in your app.

**Common causes:**

| Cause | What happens |
|--------|----------------|
| **Machine load / parallelism** | Vitest runs many files; under CPU contention, `default` test timeouts can fire on slower machines or CI runners. |
| **Timer / fake timers** | A test or dependency that stubs timers and doesn’t restore cleanly can make **fetch/`waitFor`** style assertions hang on the next file (hard to reproduce 1:1). |
| **OS / Node version** | Windows vs Linux CI, or different Node patch versions, occasionally shift timing enough to trip borderline tests. |
| **Single-file vs full suite** | Failures may only appear when **a specific test runs after another** (order/pollution). The audit noted isolated mobile component tests passed while the **full** suite failed—classic ordering or resource leak signal. |
| **Network / mock drift** | Route tests that don’t fully mock `fetch` or that hit real timeouts if env vars differ. |

**What to do if it recurs:** Run with **`--reporter=verbose`**, reproduce with **`vitest --no-file-parallelism`**, and note **first failing file + stack**. If CI fails but local passes, compare **Node version**, **Vitest version**, and **CPU**.

**Bottom line:** There’s no single “known broken test” called out in-repo from this chat—only a **context-specific** failure mode worth ignoring until you see it on your machine or CI.

---

## 2. Admin billing-sync without Sentry

**Acknowledged.** You treat that route as **internal / debugging**; low priority for your workflow.

---

## 3. Pricing FAQ + JSON-LD

**Acknowledged.** You’re **reworking FAQ** and **gating insights** by paid tier. When that ships, **re-align** FAQ copy + any **JSON-LD** fed from the same source so external text matches UI (the audit’s concern drops once you intentionally update that layer).

---

## 4. Data consistency — focused report (CSV, digest, deals PATCH, payoff split)

### Purpose

The audit flagged **different surfaces using different rules** for the same conceptual data—not that the database is corrupt, but that **users or API consumers can see mismatches** if they compare channel A to channel B.

### 4.1 Portfolio CSV export / import vs `Property`

**Observation:** `Property` holds benchmark-oriented fields (e.g. `marketRent`, `marketRentAsOf`, `estimatedValueAsOf` style richness per your schema). **CSV** paths may omit some of these, so a spreadsheet **round-trip** or offline analysis won’t match what the app shows for “as of” / benchmark freshness.

**Impact:** Power users and support scenarios; **trust** when reconciling exports to screens.

**Remedies (choose one or combine):**

- Extend export columns + importer mapping for parity with documented policy (`analytics-math-policy` §3.6-style dating).
- Or document **explicitly** that CSV is a subset and which fields are omitted.

### 4.2 Monthly digest vs dashboard (`ownershipDisplayMode`)

**What’s happening:** Stored snapshots carry **`monthlyCashFlow` in proportional form**. The **digest** intentionally uses that stored number:

```147:148:app/app/api/cron/monthly-digest/route.ts
            // See DI-0409-1 — only chart/history views apply adjustSnapshotCashFlow.
            monthlyCashFlow: Number(snapshot.monthlyCashFlow),
```

Dashboard / chart views can apply **`adjustSnapshotCashFlow`** when the user’s **`ownershipDisplayMode`** is **full liability**—so **the same month’s “cash flow” in email may differ from the trend chart** for that cohort.

**Impact:** Affects users who use **full-liability display** and still read the monthly email; it’s a **known product/channel choice** (batch email vs interactive UI), not a silent math bug in core metrics libs.

**Remedies:**

- Apply the same adjustment in digest when you’re willing to pay the complexity in a batch job; **or**
- Add **one line in the email** that totals are proportional to ownership unless labeled otherwise; **or**
- Link to the dashboard for “your preferred accounting view.”

### 4.3 `GET` vs `PATCH` on `/api/deals/[id]` — `portfolioContext`

**What’s happening:** **GET** returns **`serializeDeal(deal)` plus `portfolioContext`** (built from `buildPortfolioSummaryPayload`). **PATCH** success returns **only** `serializeDeal(deal)` — no `portfolioContext`.

**Impact:** Any client that **merges** the PATCH JSON into local state **without refetching** can **drop** `portfolioContext` and show stale or empty portfolio-level hints on the deal screen.

**Remedies:**

- **API:** Include `portfolioContext` on PATCH (extra read/build of portfolio payload—small cost). **or**
- **Contract:** Document “PATCH returns deal fields only; refetch GET if you need `portfolioContext`” and ensure the Deal Analyzer / clients never merge blindly.

### 4.4 Payoff: tolerance-aware milestones vs “strict” API

**What’s happening:** Milestone detection may use **`getToleranceAwarePayoffProjection`** (amortization tolerance near term end) while some API surfaces expose **`getPayoffProjection`** (strict). Numbers can disagree **slightly** in edge months.

**Impact:** Mostly **edge timing** + **email vs API** clarity; core schedules are still internally consistent per the math audit.

**Remedies:** Align naming/copy in emails, or use one projection consistently per surface, or disclose tolerance in milestone emails.

### Summary table

| Surface | Issue | Severity for you |
|---------|--------|-------------------|
| CSV | Possible missing benchmark “as of” columns | Medium for power users |
| Digest vs dashboard | Documented intentional path (DI-0409-1); full-liability delta | Medium / comms |
| Deals PATCH | Response shape smaller than GET | Medium for optimistic UI |
| Payoff | Strict vs tolerance-aware split | Low–medium, edge cases |

---

## 5. Calculator → app handoff

**Acknowledged.** Today you **don’t persist calculator inputs** in-app; treating full handoff as a **feature/product decision** (storage, privacy, UX) rather than a bugfix is reasonable.

---

## 6. Admin rate limits

**Acknowledged** for your stage: **solo admin**, Google-gated access, low concern for now. The audit flag remains valid if you ever **delegate admin** or broaden access.

---

## 7. RentCast / monthly refresh — writeup (cost & scale)

### What the code does today (high level)

- **`getRefreshEligibleUsers`** loads **all non-deleted users with at least one property**, with **nested properties, mortgages, and snapshots** for the snapshot month, then **filters in JS** to eligible paid/active users who need a snapshot row. That pattern **scales with total user base and property counts** in memory and DB time.
- **`MAX_PROPERTIES_PER_USER_PER_RUN`** is **`Number.POSITIVE_INFINITY`** — there is **no cap** on how many properties one subscriber can refresh in a single cron pass once they’re eligible.
- **`refreshProperty`** calls RentCast for value/rent when the address is complete. **Monthly cron** can issue **many** upstream calls in one run.
- User-facing estimate routes record **`RentCastApiCall`** (or similar accounting); **automation path** historically did **not** always participate in the same per-user hourly accounting—so **interactive quotas** may not bound **cron-driven spend**.

### What can go wrong

- **Cost spikes** if a few users have **many properties** missing monthly snapshots.
- **Long cron duration** → approach serverless limits, overlapping runs, or delayed digests.
- **Provider throttling** if volume jumps.

### Remedies (engineering)

1. **Cap** properties per user per cron (`MAX_PROPERTIES_PER_USER_PER_RUN` to a finite number, queue remainder).
2. **Push filtering into SQL** where possible (e.g. eligibility predicates, pagination) instead of loading everyone.
3. **Unify metering** so cron calls increment the same **`RentCastApiCall`** / quota counters as user routes (see `docs/reference/rentcast-quota.md`).

**Difficulty:** **Medium**—touches cron, possibly Prisma queries, and quota tables; needs a quick **staging** dry-run to validate duration and counts.

---

## 8. PostHog server (`captureServerEvent`) — writeup

### What the code does

```8:28:app/lib/posthog-server.ts
export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
): Promise<void> {
  ...
  const client = new PostHog(key, {
    host,
    flushAt: 1,
  });
  try {
    client.capture({ distinctId, event, properties });
    await client.shutdown();
```

Every call **constructs a new `PostHog` client**, **`flushAt: 1`**, then **`await shutdown()`**.

### Why it matters

- In **webhooks** and **crons** that fire **several events per request**, you pay **repeated client setup + network flush** instead of **batching**.
- On **serverless**, that can add **latency** and **compute** proportional to event count.

### Remedies

- **Reuse** one client per invocation (module singleton with care for cold starts), or use a **small pool**.
- Increase **`flushAt`** and call **`shutdown()` once** at the end of the handler (or rely on `await flush()` with explicit lifecycle).
- **Difficulty:** **Easy–medium** for a single route; **medium** to do **safely everywhere** (lifecycle across all callers, avoiding double-shutdown, tests).

---

## 9. Sitemap `lastModified` — “quick update”

### How it works now

`SITE_LAST_MODIFIED` is **`latestChangelogDate()`** — the **latest `date` on `CHANGELOG_ENTRIES`** in `app/lib/changelog-data.ts`. Almost all marketing URLs use that value. Legal pages use **`LEGAL_LAST_MODIFIED`** (manually bumped when legal copy changes).

**So:** There is **no separate stale constant** for marketing URLs—the sitemap is already as “fresh” as your **last changelog release day** (currently **2026-04-22** in the file we read).

### “Quick” ways to refresh without fake dates

1. **Add a changelog entry** on your next real release (your documented process) — **all** marketing URLs pick up the new date automatically.
2. **Bump `LEGAL_LAST_MODIFIED`** only when you edit privacy/terms.

**We should not** stamp **today’s date** on every URL without an actual content change—search engines care about **meaningful** updates.

A short comment was added in `sitemap.ts` pointing maintainers at the changelog-driven rule (see repo).

---

## 10. How difficult is “the rest” of the SEO nitpicks?

| Item | Difficulty | Notes |
|------|------------|--------|
| **Sitemap freshness** | **Trivial** | Release + changelog row, or bump legal constant when legal changes. |
| **Homepage `<title>` vs H1 wording** | **Easy** | One page (`page.tsx` / metadata)—copy decision > engineering. |
| **Per-route `lastModified` for `/resources/[slug]`** | **Medium** | Needs a **trustworthy date source** per article (frontmatter, file mtime, or CMS). Your `resource-data` may not expose it yet. |
| **Root JSON-LD offers vs Stripe/pricing** | **Medium** | Must stay in sync with **FAQ + pricing UI**—easy to get wrong if sources diverge. |

---

## Math & logic — anything flagged? Dashboard / properties rewrite consistency?

From **`docs/audits/math/2026-04-29-math-logic-audit.md`:**

- **Critical / High:** **None** for formula defects in scoped modules (`amortization`, `property-metrics`, `portfolio-metrics`, `benchmark-utils`, plans/quotas).
- **Executive summary:** Core libraries **match** the math process doc; **golden tests** cover the heavy paths.

**Residual items are not “wrong math” on dashboard/properties:**

- **Medium:** **Mortgage milestone emails** use tolerance-aware payoff **without** saying so in the email copy (clarity, not wrong NOI/cap math on the dashboard).
- **Low:** Process doc **wording** vs three-tier `getBalanceSource`; tiny **boundary** notes.

So for **consistency through your dashboard/properties rewrite**: the **2026-04-29 math lane did not flag systemic incorrect formulas** in those metrics paths—your main concern is addressed at **audit’s scoped depth** (read-only + tests), with **channel-specific** digest/PATCH/CSV issues living under **data integrity / product**, not “math is broken.”

---

*Prepared from the 2026-04-29 full audit synthesis and follow-up research in-repo.*
