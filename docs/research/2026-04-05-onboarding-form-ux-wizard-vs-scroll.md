# Research: Single-Page Scroll vs. Multi-Step Wizard for SaaS Onboarding Forms

**Date:** 2026-04-05  
**Context:** Veld Portfolio — property intake form UX decision  
**Audience:** Small passive landlords, 1–5 properties, skews 35–55, non-technical, mobile-first  
**Primary conversion event:** First property added  
**Current form structure:** 5 sections on a single scrollable page — (1) Address & basics, (2) Purchase & value, (3) Income & expenses, (4) Mortgage, (5) Review  
**Note:** Several fields have RentCast auto-estimates that fire on address entry.

---

## Recommendation

**Multi-Step Wizard — High Confidence (9/10)**

For a 20+ field property intake form targeting non-technical, mobile-first landlords aged 35–55, the evidence overwhelmingly favors a wizard. Every comparative study in the 2023–2026 period points in the same direction. The only meaningful caveat is implementation quality: a poorly built wizard (no progress bar, broken back-navigation, no state persistence) can perform worse than a clean single-scroll page.

---

## Top 3 Evidence Points

### 1. Conversion rate differential for complex forms is large and consistent

The most-cited benchmark is HubSpot's finding of **86% higher conversion rates for multi-step forms** across a large form dataset. More directly comparable to Veld: BrokerNotes restructured a financial services form from single-page to multi-step and saw conversions jump from **11% → 46%** — a 4× lift. Venture Harbour measured **0.96% → 8.1%** (+700%) in a similar restructuring exercise. Zuko's analysis of 215 live forms found multi-step outperforming single-page on 74% of them. The failure cases were mostly simple forms (under 6 fields) — not relevant to a 20+ field property intake.

Sources: HubSpot State of Lead Capture; [Venture Harbour](https://www.ventureharbour.com/multi-step-lead-forms-get-300-conversions/); [Zuko](https://www.zuko.io/blog/single-page-or-multi-step-form)

### 2. Mobile completion specifically sees ~180% lift with wizard UX

Mobile single-page forms hit completion rates of **15–25%**, while well-implemented multi-step mobile flows reach **45–65%** — nearly matching desktop. Abandonment drops from 67–75% to 25–40%. A long scroll form feels "endless" on a small screen, while a wizard shows only 2–3 fields at a time with a clear progress indicator. Airbnb's host onboarding — arguably the most A/B-tested landlord intake form in existence — uses exactly this pattern: step-based, single CTA per screen, real-time earnings estimate surfaced mid-flow to sustain motivation.

Sources: [Dashform / multi-step conversion guide](https://getaiform.com/blog/multi-step-forms-300-percent-more-conversions-complete-guide); [Airbnb UX case study](https://www.chameleon.io/inspiration/airbnb-value-reminder)

### 3. Sunk cost + goal gradient effects kick in after Step 1 — the most critical intervention point

Zuko's research shows that **70% of users who abandon a form exit before ever engaging with it** — they see the perceived length and leave. Multi-step forms fix this by hiding total length. Once past Step 1, the psychology changes: the **sunk cost effect** ("I already entered my address...") makes abandonment costly, and the **goal gradient effect** — acceleration as people near a goal — is activated by a visible progress bar. Research on progress indicators found **3× greater willingness to continue** among users shown animated progress feedback.

Sources: [Atticus Li / cognitive commitment research](https://atticusli.com/blog/posts/multi-step-forms-vs-single-page-behavioral-science-progressive-commitment); [Dashform](https://getaiform.com/blog/multi-step-forms-300-percent-more-conversions-complete-guide); [Zuko](https://www.zuko.io/blog/single-page-or-multi-step-form)

---

## Caveats and "It Depends" Factors

**1. Auto-populated fields partially offset — but don't eliminate — the wizard advantage.**
The cognitive load argument for wizards weakens when RentCast pre-fills many fields. Chrome's 2024 autofill study found that autofill users abandon forms 75% less frequently. However, pre-fill reduces *effort per field* while the wizard reduces *perceived total scope* — different psychological mechanisms. Even with pre-filled fields, showing 20+ fields at once on mobile is visually overwhelming. The wizard remains the right call even with heavy pre-population.

**2. Wizard execution risk is real — a bad wizard is worse than a clean scroll.**
Consistent failure modes in the literature: broken back-navigation that clears state (~10% conversion loss per Zuko), no progress bar (kills goal gradient), too many steps (>6 makes the progress bar unreadable on mobile), and per-step validation errors that are confusing. If engineering capacity is constrained, a clean single-scroll page beats a poorly shipped wizard.

**3. A wizard enables per-step drop-off analytics — use this.**
With a single-scroll form there's no visibility into where users abandon. A wizard lets you instrument exactly which step loses users and iterate. This is especially valuable while optimizing a nascent onboarding funnel.

**4. Hybrid accordion patterns are not recommended for this use case.**
UK Government UX research explicitly concluded "no more accordions" after finding that users skip crucial guidance when sections appear collapsible. Baymard's e-commerce research recommends accordion *only* for the Review step (collapsed completed sections shown as summaries). For primary data entry, accordion adds implementation complexity without conversion benefit.

**5. The Review step matters beyond UX — it reduces data quality issues.**
Smashing Magazine's 2024 guide on multi-step forms notes that a Review & Submit step meaningfully reduces correction requests and downstream errors. Keep it.

---

## Recommended Step Grouping for Veld's 5-Section Form

**Recommendation: Collapse from 5 steps to 4.**

| Step | Label | Fields | Notes |
|------|-------|--------|-------|
| **1** | Property | Address, property type, beds/baths, year built | Triggers RentCast API call. Keep ≤5 fields. Low bar to start. |
| **2** | Value & Financing | Purchase price, current value, mortgage details | Merge "Purchase & value" + "Mortgage" — same mental frame ("how I acquired and financed this"). Mortgage fields toggle off via "I have a mortgage" checkbox — collapses them entirely for unencumbered properties. |
| **3** | Income & Expenses | Monthly rent, vacancy, recurring expenses, mgmt fees | Isolated performance frame. Default to RentCast estimates where available so users confirm rather than fill. |
| **4** | Review & Submit | Compact summary with per-step "Edit" links | The correct use of accordion: collapsed *completed* sections as read-only summaries with inline edit access. |

**Rationale:**
- Step 1 stays light to clear the 70% first-screen abandonment threshold quickly
- Merging Purchase & Value with Mortgage is logically coherent — same acquisition frame
- Income & Expenses is a distinct operational frame and benefits from isolation
- 4 steps fits cleanly in a mobile progress bar (4 dots or "Step 2 of 4")
- The conditional mortgage toggle means users without a mortgage see only 3 active data-entry steps — reduces perceived effort for the majority of free-and-clear landlords

**Progress indicator format:** Use labeled steps ("Property → Finances → Income → Review"), not an unlabeled percentage bar. Labeled steps let users anticipate what's coming and allow clickable back-navigation to any completed step. Zuko specifically recommends this over percentage bars for multi-section forms where each step has a distinct name.

---

## Summary Table

| Dimension | Single-Scroll | Multi-Step Wizard | Winner |
|-----------|:------------:|:-----------------:|:------:|
| Completion rate (complex forms) | ~4–5% typical | ~13–20% typical | Wizard |
| Mobile completion | 15–25% | 45–65% | Wizard |
| Cognitive load (non-technical users) | High | Low | Wizard |
| Drop-off analytics granularity | None | Per-step | Wizard |
| Auto-fill interaction | Positive | Positive (additive) | Tie |
| Implementation risk | Low | Medium | Scroll |
| Step count sweet spot | N/A | 3–5 | 4 steps recommended |
