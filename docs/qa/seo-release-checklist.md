# SEO release checklist (lightweight)

**Purpose:** Before or after a release that touches public URLs, indexing, or metadata, confirm sitemap/robots/canonical behavior stays aligned.

**When to run:** Any PR that changes `app/app/sitemap.ts`, `app/app/robots.ts`, root/marketing `metadata`, or public route structure.

---

## Checks

- [ ] **Origin consistency:** `NEXT_PUBLIC_APP_URL` in the target environment has **no trailing slash**. Site helpers use `getAppOrigin()` in `app/lib/app-url.ts` for `sitemap.xml`, `robots.txt`, and `/llms.txt` URLs.
- [ ] **Custom domain vs `*.vercel.app`:** In **Vercel → Project → Settings → Environment Variables** (Production), set `NEXT_PUBLIC_APP_URL` to your **public canonical origin** (e.g. `https://veldportfolio.com`), not the default `https://<project>.vercel.app` URL. If this is wrong, `/sitemap.xml`, `/robots.txt`, and `/llms.txt` will list the Vercel hostname even when users open the site on your custom domain. Redeploy after changing.
- [ ] **`/sitemap.xml`:** Opens and lists expected public URLs only (no authenticated app paths). Per-section `lastmod` dates reflect the most recent `CHANGELOG_ENTRIES` date; legal pages have their own stable date.
- [ ] **`/robots.txt`:** `Sitemap:` points at `https://<your-domain>/sitemap.xml` (same origin as above).
- [ ] **`/llms.txt`:** Returns `text/plain` with 200, lists curated content by section. Auto-derives from the same data files as the sitemap.
- [ ] **Marketing pages:** Spot-check `alternates.canonical` on `/` and `/pricing` (and other indexable routes you care about) match the live origin.
- [ ] **Structured data:** Use [Rich Results Test](https://search.google.com/test/rich-results) on a sampled alternatives page, tool page, and resource article to confirm `BreadcrumbList`, `FAQPage`, and `DefinedTerm` (on metric articles) still validate after changes.
- [ ] **App shell:** Authenticated routes remain `noindex` via `app/(app)/layout.tsx` metadata (supplements `robots.txt` disallow).
- [ ] **Changelog added on release:** A new entry in `lib/changelog-data.ts` means sitemap `lastmod` advances, giving search engines a real freshness signal for this deploy.

---

## Related

- Phase 16 tracking in `docs/tasks.md` (internal doc, not in public repo) (synthesis phases).
- SEO audit process: `docs/process/seo-audit-process.md` (internal doc, not in public repo).
