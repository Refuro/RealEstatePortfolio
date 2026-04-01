# SEO Audit Process

**Purpose:** Systematically review indexable surfaces, metadata, crawl signals, and content structure so search engines and social previews accurately represent the product. Complements **Growth Funnel** (conversion) and **Performance & Cost** (Core Web Vitals); this lane owns **search/discovery correctness**, not paid campaigns.

**Status:** Active.

---

## 1. Scope

Audit **marketing and public content** shipped in the Next.js app (`app/`), plus config that affects crawling and previews:

- Public routes (landing, pricing, legal, contact, changelog, tools/calculators, investment calculator, LP variants if indexable)
- `app/app/sitemap.ts`, `app/app/robots.ts`
- Layout/root `metadata` defaults and per-route `metadata` / `generateMetadata`
- Structured data (JSON-LD) on public pages
- **Out of scope for this lane:** implementing fixes (audit only); **Performance** owns detailed CWV remediation unless the finding is purely metadata or blocking resources called out here as a **handoff** to Performance.

**Explicitly exclude** (or note as “verify noindex only”):

- Authenticated app shell routes (`/dashboard`, `/analyze`, `/properties/*`, etc.) — should be `noindex` or non-canonical; confirm they are not accidentally indexable with duplicate titles.

---

## 2. Audit dimensions (comprehensive criteria)

Use the checklist below. For each **indexable** URL pattern, record pass/fail/gap with file evidence.

### 2.1 Crawling and indexing

| Criterion | What to verify |
|-----------|----------------|
| **Robots.txt** | `robots.ts` allows crawling of intended public paths; disallows or noindex strategy for staging if applicable; `sitemap` directive points to production sitemap URL when supported. |
| **Sitemap** | `sitemap.ts` lists all URLs that should be discovered; uses stable absolute URLs (`NEXT_PUBLIC_APP_URL` or equivalent); sensible `changeFrequency` / `priority`; no duplicate entries; **no** authenticated-only URLs. |
| **Indexability** | Public pages do **not** set `robots: { index: false }` unless intentional (e.g. thank-you pages). Auth/onboarding shells use `noindex` where appropriate. |
| **Canonical** | Each indexable page sets `alternates.canonical` to the **preferred** URL (HTTPS, non-www vs www per production config, no stray query params in canonical). |
| **Duplicates** | No competing canonicals for the same content (e.g. `/tools/foo` vs alternate path); trailing-slash policy consistent with Next.js and hosting. |
| **Status codes** | No critical public URLs returning 404/500 in a production build smoke (note if only verifiable in deployed env). |

### 2.2 Page metadata (titles and descriptions)

| Criterion | What to verify |
|-----------|----------------|
| **Title** | Unique per indexable route; primary keyword/intent near the front; brand (e.g. “Veld Portfolio”) consistent with positioning; not stuffed; reasonable length (~50–60 chars display target, avoid truncation on important pages). |
| **Meta description** | Present on indexable routes; unique where it matters; readable pitch, not boilerplate-only; roughly 150–160 chars where possible (avoid empty or duplicate across many pages). |
| **Open Graph** | `openGraph.title`, `openGraph.description`, `openGraph.url` (or site defaults) set for shareable pages; `type` appropriate (`website` vs `article` if used). |
| **Twitter** | If the app sets Twitter card metadata globally or per page, verify alignment with OG and no empty cards on key landings. |
| **Keywords** | If `keywords` are used, they add value; remove redundant lists that duplicate title/description without intent. |

### 2.3 Structured data (JSON-LD)

| Criterion | What to verify |
|-----------|----------------|
| **Validity** | JSON-LD parses; `@context` and `@type` appropriate; no broken templates or `dangerouslySetInnerHTML` with malformed JSON. |
| **Honesty** | FAQ and Q&A blocks match on-page content; no misleading claims for rich results. |
| **Fit** | Types used match page purpose (e.g. `FAQPage`, `WebSite`, `Organization`); avoid types that invite manual action penalties if content does not qualify. |

### 2.4 On-page content and semantics

| Criterion | What to verify |
|-----------|----------------|
| **H1** | One clear H1 per public view; aligned with title intent; not hidden or replaced only in client-only trees for critical landings without SSR fallback. |
| **Heading hierarchy** | Logical `h2`/`h3` order on long pages (pricing, legal, hub pages). |
| **Internal links** | Important hubs (e.g. `/tools`, calculators) link to each other where users expect; no orphan indexable islands; anchor text descriptive (not only “click here”). |
| **Core content in HTML** | Critical explanatory copy is present in server-rendered output for key landings (spot-check View Source or build output—not only client-only empty shells for SEO-critical text). |

### 2.5 URLs, redirects, and migration

| Criterion | What to verify |
|-----------|----------------|
| **Stable URLs** | Public URLs documented for ads/bookmarks remain stable; breaking renames have redirect plan (config or hosting). |
| **Lowercase / encoding** | Consistent path casing; no mixed-case duplicates. |

### 2.6 Internationalization

| Criterion | What to verify |
|-----------|----------------|
| **Locales** | If multiple languages ship: `hreflang`, canonical per locale, no cross-locale duplicate content without alternates. If single locale: note “N/A.” |

### 2.7 Images and media (SEO-relevant)

| Criterion | What to verify |
|-----------|----------------|
| **Alt text** | Meaningful `alt` on important images; decorative images empty or marked appropriately. |
| **LCP image** | Hero/above-fold images on marketing pages not unnecessarily blocking (hand off specifics to **Performance & Cost** if large). |

### 2.8 Trust, compliance, and snippet quality

| Criterion | What to verify |
|-----------|----------------|
| **Snippet control** | No accidental `nosnippet` or over-broad directives unless intentional. |
| **Legal pages** | Privacy/Terms indexable if desired; titles/descriptions reflect compliance pages. |

### 2.9 Operational / post-deploy (documentation only)

| Criterion | What to verify |
|-----------|----------------|
| **Search Console** | Note whether property verification and sitemap submission are documented for the owner (not necessarily verifiable in repo). |
| **Staging** | Staging/preview URLs should be noindex or blocked; call out if unknown from code. |

### 2.10 Cross-lane deduplication

- **Performance & Cost:** CWV, TTFB, bundle size — reference, don’t re-audit deeply; open tasks as “see Performance audit.”
- **Growth Funnel:** CTA and conversion copy — Growth owns; SEO flags **conflicts** (e.g. title promises something H1 doesn’t support).
- **Mobile experience:** Mobile parity of SEO-critical content — flag if hidden behind tabs/interactions that harm discovery (see `docs/qa/mobile-experience-audit.md` P2 SEO note).

---

## 3. Output

Write report to:

- `docs/audits/seo/YYYY-MM-DD-seo-audit.md`

Use the shared report template in `docs/process/audit-report-template.md`.

Include:

- **Indexable URL inventory** (table: path, title, canonical OK?, notes)
- **Severity-ranked findings** (Critical / High / Medium / Low)
- **Task candidates** for PM promotion to `docs/tasks.md`
- **Re-test / verify** items for production-only checks (Search Console, live fetch)

---

## 4. Execution

1. Enumerate public routes from `app/`, `proxy.ts` / auth allowlist, and `sitemap.ts`; reconcile the three (sitemap ⊆ intended indexable set).
2. Sample metadata: home, pricing, tools hub, each major calculator, changelog, legal, contact.
3. Review `robots.ts` and `layout.tsx` defaults.
4. Check structured data on pages that emit JSON-LD.
5. Spot-check internal linking from hub pages and footer/nav.
6. Note gaps that require **deployed** verification separately.
7. Audit only; do not implement fixes in this pass.

---

## 5. References

- `docs/architecture-and-build-practices.md` (metadata / canonical checklist)
- `docs/process/pm-review-checklist.md` (public page SEO expectations)
- `app/app/sitemap.ts`, `app/app/robots.ts`
- `docs/audits/README.md`
- `docs/qa/mobile-experience-audit.md` (SEO-critical content, mobile)
