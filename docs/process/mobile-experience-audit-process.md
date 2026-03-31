# Mobile experience audit — process

**Lane:** Mobile experience (narrow viewport, touch, `md:hidden` shells).

**Canonical criteria:** Viewport matrix, priority surfaces, checklist, and output instructions live in [`docs/qa/mobile-experience-audit.md`](../qa/mobile-experience-audit.md).

**Report output:** `docs/audits/feature/YYYY-MM-DD-mobile-experience-audit.md` (same folder as Feature/UX reports; distinct filename).

**Relationship to Feature/UX:** This lane **narrows** scope to widths &lt;768px and mobile-specific components (`MobileToolShell`, app chrome, safe-area). It complements the broader [`feature-ux-audit-process.md`](feature-ux-audit-process.md).

**Report structure:** Use [`audit-report-template.md`](audit-report-template.md) unless the QA doc requires extra sections.

**Rules:** Audit only; findings promote to `docs/tasks.md` via PM review (same as other lanes).
