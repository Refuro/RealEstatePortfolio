# Data Integrity & Reconciliation Audit — 2026-04-03 (Run 2)

**Scope:** Focused follow-up on the two open Schedule items from the morning pass (2026-04-03 Run 1), plus deep-dive on import/export ownership scoping and schema consistency. No code changes were made between the two passes; all findings below reflect the current state of the codebase.

---

## Executive summary

- **Both morning Schedule items are confirmed open:** (1) `download-csv-button.tsx` does not read `X-Veld-*` truncation headers from `GET /api/export/portfolio`; (2) `csv-parser.ts` does not normalize `loanType` against `LOAN_TYPE_OPTIONS` and the import route does not surface Papa Parse recoverable errors. Neither was resolved between the morning pass and this run.
- **Ownership scoping on all write/read paths is correct:** both `GET /api/export/portfolio` and `POST /api/import/portfolio` bind every query and create to `userId: user.id`; no cross-user exposure found.
- **Multi-lien import warning is in place:** `import-csv-section.tsx` renders an explicit note that one import row creates at most one mortgage, satisfying the morning's recommendation to keep in-app disclosure.
- **One new Low finding:** `download-csv-button.tsx` catch block silently discards all errors (including rate-limit 429 and server errors), leaving users with no feedback when a download attempt fails.

---

## Severity-ranked findings

### Critical

- None.

### High

- **Multi-lien export→import semantic risk (carried, confirmed)** — Import route creates at most one `mortgage.create` per CSV row (`app/app/api/import/portfolio/route.ts` lines 187–212), while export writes `monthly payment (all liens sum)` and aggregate `mortgage balance` columns. Re-importing a multi-lien export creates a single loan whose payment and balance are portfolio-level aggregates, not first-lien values. The in-app note in `import-csv-section.tsx` (lines 211–216) is present but does not block import or warn at the point where a user chooses the file. **Evidence:** `app/app/api/import/portfolio/route.ts` (`mortgage.create` branch); `app/lib/import/csv-parser.ts` (`getCol` for `"monthly payment (all liens sum)"`, `"mortgage balance (stored sum)"`); `docs/reference/portfolio-csv-export.md` (Round-trip vs lossy matrix).

### Medium

- **Export truncation headers not consumed in download UX (Schedule item 1 — confirmed open)** — `GET /api/export/portfolio` sets `X-Veld-Property-Slice-Truncated`, `X-Veld-Property-Count-Total`, `X-Veld-Property-Count-Included`, and `X-Veld-Property-Limit` on every response (`app/app/api/export/portfolio/route.ts` lines 225–229). `download-csv-button.tsx` calls `res.blob()` immediately after `res.ok` check (lines 12–13) and never reads `res.headers`. The comment at line 22 (`// Could show toast/error in future`) confirms this is acknowledged but not implemented. **Risk:** Users on limited tiers receive a silently incomplete archive they may treat as a full portfolio backup. **Evidence:** `app/app/(app)/settings/download-csv-button.tsx` (full file); `app/app/api/export/portfolio/route.ts` (response header block); `docs/internal/api-list-contract.md` (§`GET /api/export/portfolio`).

- **Import `loanType` bypasses `LOAN_TYPE_OPTIONS` enum — case-sensitivity gap now confirmed (Schedule item 2 — confirmed open)** — `csv-parser.ts` lines 335–336 read the raw cell and call `.trim()` only: `const loanType = loanTypeRaw ? loanTypeRaw.trim() : null`. No normalization or enum validation is applied. `LOAN_TYPE_OPTIONS` is `["conventional", "FHA", "VA", "USDA", "jumbo", "other"]` (`app/lib/validations/mortgage.ts` line 4) — three values are uppercase. A user who imports `loan type = fha` stores `"fha"` rather than `"FHA"`, diverging from API-created mortgages which pass through `loanTypeSchema` (a Zod `z.enum(LOAN_TYPE_OPTIONS)` with case-sensitive matching). The schema permits `null`/empty (transforms to `null`), so non-conforming strings reach the DB unchecked. `Mortgage.loanType` is `String?` in Prisma (`schema.prisma` line 118) — no DB constraint guards against free-form values. **Evidence:** `app/lib/import/csv-parser.ts` (lines 335–336, 385); `app/app/api/import/portfolio/route.ts` (line 209); `app/lib/validations/mortgage.ts` (lines 4–14); `app/prisma/schema.prisma` (line 118).

- **Papa Parse recoverable errors silently dropped (Schedule item 2 — confirmed open)** — Import route line 47: `if (parsed.errors.length > 0 && parsed.data.length === 0)` returns 400 only when the parser yields no data at all. When Papa Parse reports errors alongside non-empty `parsed.data` (e.g. malformed cells, column count mismatches in some rows), processing continues and `parsed.errors` are never aggregated into the response. The final response shape (`{ imported, errors }`) contains only row-level validation errors from `parseRow`, not parse-phase structural warnings. **Risk:** Column misalignment or partially corrupt rows in edge-case CSVs are silently dropped; users see a success count without indication that some rows were skipped at the parser level. **Evidence:** `app/app/api/import/portfolio/route.ts` (lines 42–52); Papa Parse `{ header: true, skipEmptyLines: true }` config returns `errors` array independently of `data`.

- **Export omits `original loan amount` and `loan type` columns (carried, confirmed)** — Export headers (`app/app/api/export/portfolio/route.ts` lines 61–94) include 32 columns but not `original loan amount` or `loan type`. The import template (`GET /api/import/portfolio/template`) and parser (`csv-parser.ts` lines 295–301, 335–336) both support these columns. For single-lien properties, round-trip export→import loses origination metadata. **Evidence:** `app/app/api/export/portfolio/route.ts` (headers array); `app/lib/import/csv-parser.ts` (`getCol` for `"original loan amount"`, `"loan type"`).

### Low

- **Download failures are silently swallowed in `download-csv-button.tsx`** — The `catch` block at line 22 is empty with a comment `// Could show toast/error in future`. A failed export (e.g. 429 rate limit, 401 session expiry, 500 server error) shows no user-visible message; the button simply re-enables. Users may attempt the download repeatedly without knowing the cause of failure. **Evidence:** `app/app/(app)/settings/download-csv-button.tsx` (lines 22–24).

- **`display mode` exported but not imported (carried, confirmed as expected product behavior)** — Export writes `ownershipDisplayMode` as a snapshot context column; import has no corresponding field. Expected behavior per `docs/policies/ownership-metrics.md`; not a data integrity gap.

- **Cap rate / LTV cells are numeric without `%` suffix (carried, confirmed as intentional)** — Matches spreadsheet convention documented in `docs/reference/portfolio-csv-export.md` §Percent / money basis.

---

## Evidence reviewed

- **Process:** `docs/process/data-integrity-audit-process.md`, `docs/process/audit-report-template.md`
- **Morning report:** `docs/audits/data-integrity/2026-04-03-data-integrity-audit.md`
- **Reference:** `docs/reference/portfolio-csv-export.md` (last updated 2026-04-01), `docs/internal/api-list-contract.md`
- **Schema:** `app/prisma/schema.prisma` (`Property`, `Mortgage`, `User` — full file)
- **Validation:** `app/lib/validations/mortgage.ts` (`LOAN_TYPE_OPTIONS`, `createMortgageSchema`, `loanTypeSchema`)
- **Export:** `app/app/api/export/portfolio/route.ts` (full file — headers array, response header block, zero-vs-blank mortgage logic)
- **Export UX:** `app/app/(app)/settings/download-csv-button.tsx` (full file)
- **Import route:** `app/app/api/import/portfolio/route.ts` (full file — Papa Parse config, `parsed.errors` guard, `mortgage.create` branch)
- **Import parser:** `app/lib/import/csv-parser.ts` (full file — `loanType` cell read, `getCol` aliases)
- **Import mortgage validation:** `app/lib/import/validate-import-mortgage.ts` (full file)
- **Import UX:** `app/app/(app)/settings/import-csv-section.tsx` (full file — multi-lien warning note)
- **Audit limits:** Static code review only; no runtime trace of Papa Parse error conditions or live tier-limit truncation scenario.

---

## Risk & impact assessment

The two Schedule items remain the highest practical exposure for typical users:

- **Truncation invisibility (Medium):** Affects any user on a plan whose property count exceeds their tier limit. The risk is proportional to plan distribution; free/investor tier users are most likely to hit this. A user who believes they have a full backup archive may import it to a new account and silently lose properties. Likelihood: moderate for active multi-property users.
- **`loanType` normalization (Medium):** Affects data consistency for any imported mortgage that includes a `loan type` cell. Short-term impact is limited (loanType is display/filter metadata, not used in metrics math), but degrades reporting quality and would complicate any future analytics that filter or group by loan type. Likelihood of user-visible divergence: low today, higher if loan-type filtering is added.
- **Papa Parse errors (Medium):** Edge-case risk; most well-formed CSVs will not trigger Papa Parse error objects alongside valid data. Likelihood is low for template-generated files; moderate for hand-edited or third-party CSVs.
- **Download error silence (Low):** UX friction, not a data integrity risk. Users learn to retry after a page refresh.

---

## Recommendations (prioritized)

1. **Read `X-Veld-*` headers in `download-csv-button.tsx`** — After `res.blob()`, read `res.headers.get("X-Veld-Property-Slice-Truncated")` and related headers. Show a banner or toast before or after download when `truncated === "true"`: e.g. "Export includes N of M properties (plan limit). Upgrade to export all." Surfaces the denominator documented in `docs/internal/api-list-contract.md`.
2. **Normalize `loanType` in `csv-parser.ts` against `LOAN_TYPE_OPTIONS`** — Apply case-insensitive lookup after trim: map `"fha"` → `"FHA"`, `"va"` → `"VA"`, `"usda"` → `"USDA"`, `"conventional"` → `"conventional"`, etc. Reject (with a row-level warning, not a hard error) values that don't match any option; fall back to `null` to preserve import success for rows with unknown loan types.
3. **Surface Papa Parse errors when `parsed.data.length > 0`** — Aggregate `parsed.errors` into a structured warning (e.g. `parseWarnings: [{ type, row, message }]`) and include them in the import response alongside `imported` and `errors`. The import UX can display these as non-blocking warnings so users know some rows were structurally suspect even if they parsed into data.
4. **Add error feedback to `download-csv-button.tsx` catch block** — At minimum, set a local error state and render a short message ("Download failed. Please try again.") when the fetch throws or returns non-OK. The comment already anticipates this.
5. **Optional: add `original loan amount` and `loan type` to export headers** — Improves single-lien round-trip fidelity and makes the export a more complete data record for users who rely on it as a source of truth.

---

## Task candidates

- [ ] Read `X-Veld-Property-Slice-Truncated` / count headers in `download-csv-button.tsx` and surface truncation warning in Settings CSV download UX.
- [ ] Normalize or validate CSV `loan type` against `LOAN_TYPE_OPTIONS` in `csv-parser.ts` (case-insensitive map; fall back to `null` for unknowns with optional warning).
- [ ] Aggregate Papa Parse `errors` into import response when `parsed.data.length > 0`; surface as non-blocking warnings in `import-csv-section.tsx`.
- [ ] Add download error feedback in `download-csv-button.tsx` catch block (toast or inline error state).
- [ ] Add `original loan amount` and `loan type` (first lien) to export headers in `app/app/api/export/portfolio/route.ts`.

---

## Re-test checklist

- [ ] Verify truncation warning appears in download UX for a user whose DB property count exceeds plan limit.
- [ ] Verify `loanType = "fha"` in imported CSV stores as `"FHA"` after normalization; `loanType = "balloon"` stores as `null` with a warning.
- [ ] Verify Papa Parse structural errors (e.g. extra columns in one row) appear in import response `parseWarnings` or equivalent field.
- [ ] Verify download error state is shown when `GET /api/export/portfolio` returns 429.
- [ ] Verify multi-lien import warning still renders after any settings-page UI changes.
- [ ] `npm run check` (when code changes are made)

---

## Next trigger and cadence

- **Trigger:** Any merge touching `app/app/(app)/settings/download-csv-button.tsx`, `app/lib/import/csv-parser.ts`, `app/app/api/import/portfolio/route.ts`, or `app/app/api/export/portfolio/route.ts`.
- **Recommended next run:** 2026-07-01, or immediately after the first Schedule item above is shipped (to verify the truncation UX fix and confirm no regression in the export header block).
