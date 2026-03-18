# Details Tab Overhaul Proposal

**Status:** Implemented (Phase A + Phase B inline editing)  
**Last updated:** March 2026  
**Scope:** `app/(app)/properties/[id]/details-tab-content.tsx`

---

## 1. Goal

Make the Details tab a clear **Data & Settings** surface: quick to scan, easy to verify, and action-oriented for edits without overwhelming users.

---

## 2. Structure

Details tab is organized into:

1. **Data & settings header** with Edit property action
2. **Data quality card** with context chips (fresh/stale/missing/risk signals)
3. **Property facts card** (identity and physical details)
4. **Financial inputs card** (values that drive calculations)
5. **Notes card** (if present)
6. **Mortgage terms section** (existing mortgage management UI retained)
7. **Inline section editing** for Property facts, Financial inputs, and Notes

---

## 3. UX decisions

- Keep mortgage management in the existing `MortgageSection` to preserve full actions and avoid regressions.
- Add lightweight data quality chips above details to guide attention.
- Separate identity fields from financial inputs so users can find/edit values faster.
- Use compact cards and responsive grids for mobile readability.
- Add inline edit/save/cancel controls on each card for fast updates without leaving the tab.
- Preserve full-page edit page as an escape hatch for advanced edits.

---

## 4. Acceptance criteria

- [x] Details tab headline communicates "Data & settings".
- [x] Data quality chips appear for at least: last updated staleness, benchmark freshness/missing, and mortgage risk cues.
- [x] Property facts are separated from financial inputs.
- [x] Financial inputs remain complete and readable on mobile.
- [x] Existing mortgage add/edit/delete flows remain available in Details tab.
- [x] No regressions in edit property navigation.
- [x] Property facts support inline edit/save/cancel and persist via PATCH.
- [x] Financial inputs support inline edit/save/cancel and persist via PATCH.
- [x] Notes support inline edit/save/cancel and persist via PATCH.
- [x] Inline errors are shown in-card when validation fails.
- [x] `npm run check` passes.

---

## 5. Remaining out of scope

- Per-field change history/audit trail (deferred).

