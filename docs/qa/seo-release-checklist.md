# SEO release checklist (lightweight)

**Purpose:** Before or after a release that touches public URLs, indexing, or metadata, confirm sitemap/robots/canonical behavior stays aligned.

**When to run:** Any PR that changes `app/app/sitemap.ts`, `app/app/robots.ts`, root/marketing `metadata`, or public route structure.

---

## Checks

- [ ] **Origin consistency:** `NEXT_PUBLIC_APP_URL` in the target environment has **no trailing slash**. Site helpers use `getAppOrigin()` in `app/lib/app-url.ts` for `sitemap.xml` and `robots.txt` URLs.
- [ ] **Custom domain vs `*.vercel.app`:** In **Vercel → Project → Settings → Environment Variables** (Production), set `NEXT_PUBLIC_APP_URL` to your **public canonical origin** (e.g. `https://veldportfolio.com`), not the default `https://<project>.vercel.app` URL. If this is wrong, `/sitemap.xml` and `/robots.txt` will list the Vercel hostname even when users open the site on your custom domain — search engines should only see the canonical host. Redeploy after changing.
- [ ] **`/sitemap.xml`:** Opens and lists expected public URLs only (no authenticated app paths).
- [ ] **`/robots.txt`:** `Sitemap:` points at `https://<your-domain>/sitemap.xml` (same origin as above).
- [ ] **Marketing pages:** Spot-check `alternates.canonical` on `/` and `/pricing` (and other indexable routes you care about) match the live origin.
- [ ] **App shell:** Authenticated routes remain `noindex` via `app/(app)/layout.tsx` metadata (supplements `robots.txt` disallow).

---

## Related

- Phase 16 tracking in [`docs/tasks.md`](../tasks.md) (synthesis phases).
- SEO audit process: [`docs/process/seo-audit-process.md`](../process/seo-audit-process.md).
