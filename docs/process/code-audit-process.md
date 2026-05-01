# Code Audit Process

**Purpose:** Periodic review of the codebase to ensure we're keeping with design, staying efficient, and not coding ourselves into a corner. The user reviews audit reports and creates tasks from findings as needed.

**Status:** Active — follow this process when running a Code Audit.

**Cursor rule:** [`.cursor/rules/code-audit-agent.mdc`](../../.cursor/rules/code-audit-agent.mdc) — see [Audits README § Running audits](../audits/README.md#running-audits).

---

## 1. Scope

Audit the entire application codebase under `app/` (and related `lib/`, `components/`, API routes, pages). Reference the established docs: `docs/policies/design-spec.md`, `docs/architecture-and-build-practices.md`, `docs/security/security-notes.md`. For performance, see §2.5 Performance Practices in architecture-and-build-practices.md.

---

## 2. Audit Dimensions

### 2.1 Design Compliance

- **Semantic tokens:** Are we using design-spec tokens (`text-muted`, `bg-subtle`, `border-border`, `text-accent`, etc.) or have we drifted to raw zinc/slate/arbitrary colors?
- **Typography:** Do headings, labels, body text follow the typography scale in the design spec?
- **Spacing & layout:** Consistent use of spacing (gap, padding, margins)? Max-widths, responsive breakpoints as specified?
- **Component patterns:** Modals, forms, cards — do they follow established patterns or have we introduced one-off styles?
- **Forbidden elements:** Heavy shadows, decorative gradients, inconsistent spacing — flag any violations.

### 2.2 Architecture Compliance

- **Layered data flow:** UI → API → lib → Prisma. Are API routes thin (auth, validate, orchestrate)? Is business logic in `lib/`?
- **Single source of truth:** Metrics in `lib/metrics/`, plans in `lib/plans.ts`, pricing in `lib/pricing-display.ts`. Any duplicated formulas or config?
- **Component reuse:** CurrencyInput, ChartWrapper, MortgageFormFields — are we reusing or reinventing?
- **API conventions:** `getAppUser()` first, Zod validation, `userId`-scoped queries. Any routes that skip these?
- **File size & focus:** Files > ~300 lines? Logic that belongs in lib but lives in routes/components?

### 2.3 Efficiency

- **Unnecessary re-fetches:** Client components fetching data that could be server-rendered or passed as props?
- **Heavy imports:** Large dependencies pulled in where lighter alternatives exist?
- **N+1 queries:** Prisma queries in loops instead of `include` or batch fetches?
- **Bundle size:** Any obvious bloat (unused imports, duplicate dependencies)?
- **Caching:** Missing `revalidate` or cache headers where they'd help?

### 2.4 Technical Debt & Corners

- **Deprecated APIs:** Use of deprecated Next.js, React, or library patterns?
- **Type safety:** `any` types, loose typing, missing error handling?
- **Dead code:** Unused components, routes, or lib functions?
- **Hardcoded values:** Magic numbers, strings that should be config/env?
- **Coupling:** Tight coupling that would make future changes (e.g. multi-tenant, new plan tiers) painful?
- **Scaling blockers:** Assumptions that break at 100 properties, 1000 users, etc.?

### 2.5 Security

- **Auth:** Every protected route/API uses `getAppUser()`?
- **Authorization:** All data access scoped by `userId` (no IDOR)?
- **Validation:** Request bodies validated with Zod before use?
- **Secrets:** No API keys or secrets in client code?
- **Input sanitization:** User input properly escaped/sanitized?

### 2.6 Product Mantra

Per `docs/architecture-and-build-practices.md`: **thoughtful, robust, modern, frictionless.** Are we living up to it? Flag areas that feel brittle, confusing, or high-friction.

### 2.7 Performance

Per `docs/architecture-and-build-practices.md` §2.5 Performance Practices:

- **Heavy libraries:** Charts and large libs (~50KB+) use `next/dynamic` with `ssr: false`? Loading placeholders shown?
- **Layout/rendering:** No `force-dynamic` at root layout unless required? Public pages static or cached where possible?
- **Images:** `next/image` used for user-facing images? No raw `<img>`?
- **Config:** `optimizePackageImports` includes lucide-react, recharts, and other large packages?
- **Caching:** `revalidate` on static content pages? Layout/query caching where appropriate?
- **External APIs:** Preconnect/dns-prefetch for third-party origins (RentCast, Stripe, etc.)?
- **Blocking calls:** Any server components blocking render on slow external calls (e.g. Stripe) that could be deferred to client?

---

## 3. Output Format

Write the audit report to `docs/audits/code/YYYY-MM-DD-code-audit.md` (use today's date). Structure:

**Required:** Follow the canonical template in `docs/process/audit-report-template.md` and include code-lane sections below as applicable.

```markdown
# Code Audit — YYYY-MM-DD

## Summary

2–3 sentence overview: overall health, top 2–3 findings.

## Findings

### Design Compliance
- [Finding] — [severity: low/medium/high] — [file/area]
- ...

### Architecture Compliance
- ...

### Efficiency
- ...

### Technical Debt & Corners
- ...

### Security
- ...

### Product Mantra
- ...

### Performance
- ...

## Recommendations

Prioritized list of suggested fixes. User will create tasks from these as needed.

## Files Audited

Brief list of key directories/files reviewed.
```

---

## 4. Execution

1. Read this process and the reference docs (`design-spec.md`, `architecture-and-build-practices.md`, `security-notes.md`).
2. Systematically explore the codebase (search, read key files).
3. Document findings with file paths and line references where helpful.
4. Write the report to `docs/audits/code/YYYY-MM-DD-code-audit.md`.
5. Do **not** make code changes. Audit only. The user reviews and creates tasks from findings.

---

## 5. References

- **Design:** `docs/policies/design-spec.md`
- **Architecture:** `docs/architecture-and-build-practices.md`
- **Security:** `docs/security/security-notes.md`
- **Reports:** `docs/audits/code/`
