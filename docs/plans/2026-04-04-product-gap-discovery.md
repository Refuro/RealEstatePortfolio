# Veld Portfolio — Product Gap Discovery & Competitive Analysis

**Created:** 2026-04-04  
**Type:** Discovery / Strategy — no implementation  
**Scope:** Deep read of current product + competitive landscape synthesis + prioritized gap list

---

## 1. What We Are Today

Veld Portfolio is an investor intelligence platform for small passive landlords (1–10 properties) that occupies a unique middle position in the market: it does what no competitor does cleanly — combining full acquisition underwriting with ongoing portfolio tracking in a single product, without requiring bank sync or accounting setup. Users enter their properties once and get a live view of equity, cash flow, cap rate, LTV, and rent-vs-market benchmarks across their whole portfolio, alongside a dedicated deal analyzer (with portfolio context) for evaluating new acquisitions, a mortgage amortization simulator, scenario modeling with what-if sliders, and a growing suite of public SEO calculators (BRRRR, Fix & Flip, STR vs LTR). The free tier is generously featured but gated to 1 property / 5 deals, with paid tiers at $15–$29/mo unlocking 5–20 properties. The product is deliberately scoped out of property management (no rent collection, no tenant screening, no accounting) — a positioning that builds trust with skeptical passive investors and clearly differentiates from the accounting-first tools. Its current gaps are primarily on the output and intelligence side: there is no investor-grade PDF/share output, no side-by-side deal comparison, no refinance what-if, no proactive portfolio alerts, and no native mobile app — each of which is a moment where a passive landlord today leaves the product and reaches for a different tool or a spreadsheet.

---

## 2. Competitive Landscape Summary

| Competitor | Primary category | Their strengths | Their gaps vs. Veld | Veld's edge |
|---|---|---|---|---|
| **Stessa** | Accounting / portfolio tracking | Unlimited free properties, bank sync, Schedule E export, document storage, P&L reports, partner sharing | No deal analyzer, no scenario modeling on owned properties, no mortgage amortization, no deal-to-portfolio flow; paid-tier backlash (features removed from free) | Full deal workspace, scenario modeling, mortgage payoff sim, no bank sync required, honest about scope |
| **Baselane** | Banking + accounting | Free forever, free business checking, free rent collection, 1099/Schedule E prep, digital lease signing | No deal analysis, no rent/value estimates, no scenario modeling, no mobile app, must use Baselane banking | Deal workspace + portfolio analytics without mandatory banking product |
| **Rentastic** | Portfolio tracking + basic deals | Native mobile apps (iOS/Android), deal analyzer (premium), receipt scanning, P&L reports, rent estimates | Shallower deal workspace (no DSCR/GRM/vacancy depth), no scenario modeling on owned properties, no mortgage amortization sim, free tier caps at 2 properties | Deeper underwriting, scenario modeling, mortgage payoff, comparable pricing |
| **DealCheck** | Deal analysis (pre-purchase only) | Best-in-class deal analyzer, MLS/public records auto-import, professional PDF reports with custom branding, mobile app, comps lookup, max offer calculator | **No post-purchase portfolio tracking** (acknowledged in their FAQ), no live rent/value estimates, no deal-to-portfolio continuity | Portfolio tracking + live market data alongside deal analysis; deal-to-portfolio promotion |
| **Landlord Studio** | Landlord operations | AI rental listing syndication, TransUnion tenant screening, OCR receipt scanning, Xero/QuickBooks integration, mobile app, maintenance tracking | No deal analysis, no scenario modeling, no rent/value estimates, per-unit pricing gets expensive | Investor lens vs. operator lens; deal + portfolio in one product |
| **BiggerPockets Pro** | Education + deal tools | 10+ calculators, deal finder, community, lawyer-reviewed leases | Not a portfolio tracker; calculators don't connect to a portfolio; $32–39/mo for a community upsell | Free public calculators + authenticated portfolio tracking in one product |
| **Mashvisor** | Market intelligence + deal sourcing | AI-driven market analysis, Airbnb/LTR comps, neighborhood heat maps, property search | Expensive ($99+/mo); oriented toward deal sourcing, not portfolio intelligence; no deal-to-portfolio continuity | Cheaper, focused on owned portfolio + owned deal analysis; no prospecting overhang |
| **PropertyTools.ai** | AI-powered tracker (new/small) | AI document parsing, smart deadline reminders (insurance/tax), document vault, bank integration | Early-stage, no deal analysis, no rent/value estimates, no scenario modeling | More mature deal + portfolio stack; live RentCast estimates; projections |
| **Rentlab / PropertyLedger** | Bookkeeping automation (new/small) | One-click Schedule E, AI receipt scanning, auto bank categorization | No deal analysis, no scenario modeling, purely accounting-layer tools | Investor intelligence vs. bookkeeping; we're not trying to replace their accountant |
| **Spreadsheets** | DIY (free, universal) | Infinite flexibility, free, familiar | Formula drift, version chaos, no live estimates, re-entering data everywhere | Single source of truth, consistent metric definitions, deal + portfolio in one place, live estimates |

---

## 3. Prioritized Gap List

Gaps are ranked by expected impact on (a) trial→paid conversion, (b) churn reduction, and (c) differentiation vs. the nearest competitor. Each gap includes: what it is, why it matters to the ICP, who has it (if anyone), rough effort tier (S / M / L), and a stack fit note.

---

### Gap 1 — Investor-ready PDF report (deal and/or portfolio)
**Rank:** #1  
**What it is:** Export a deal analysis or portfolio summary as a branded, print-quality PDF suitable for sharing with a lender, CPA, partner, or spouse. Not a browser-print hack — a real output with assumptions visible, metrics formatted, and a Veld header.  
**Why it matters to the ICP:** Passive landlords share deals with partners before buying, hand off numbers to their CPA at year-end, and occasionally need to show a lender what the deal looks like. Right now they're screenshotting the deal analyzer or copying numbers into Word. This is a high-embarrassment moment — the product does the analysis but can't produce a document.  
**Who has it:** DealCheck (full PDF with custom branding, gated to paid). Stessa (PDF download for financial reports). BiggerPockets Pro (calculator reports).  
**Effort:** M — server-rendered or browser-print PDF from existing data; no new data model required. Veld already has a print-friendly portfolio summary (`/export/portfolio-summary`); this extends the pattern to the deal analyzer output.  
**Stack fit:** Extends existing deal analyzer and portfolio summary surfaces. Next.js + CSS print media queries or a lightweight PDF lib (e.g., react-pdf or Puppeteer on Vercel). No new API integrations.  
**Conversion / retention angle:** High-signal premium feature. Gate the branded/detailed version to Investor/Pro; free gets a simple plaintext summary. Immediately differentiates from Rentastic (no PDF) and ties with DealCheck.

---

### Gap 2 — Side-by-side deal comparison
**Rank:** #2  
**What it is:** Two deals (or two scenarios on the same deal) on one screen — metrics side by side, not tabbed. Deal A vs. Deal B, or base case vs. conservative, with visible deltas.  
**Why it matters to the ICP:** Passive landlords almost always have 2–3 active options at any time ("should I buy this duplex in market A or this SFR in market B?"). The current workflow is: save deal A, remember deal A's numbers, open deal B, compare mentally. This is exactly the spreadsheet chaos the product claims to replace.  
**Who has it:** No direct competitor in Veld's category. DealCheck allows saving multiple analyses but no side-by-side UI. BiggerPockets calculators are single-deal. This would be a genuine differentiator.  
**Effort:** M — UI work on top of the existing saved-deals data model. No new API calls; the data already exists.  
**Stack fit:** Saved deals are already a first-class entity. Add a "Compare" selection flow to the Deals list → render a comparison layout with two `DealMetricsPanel` instances side by side. Shares metric calculation code.  
**Conversion / retention angle:** Strong premium feature (select 2 deals → comparison requires saved deals, which requires Investor/Pro tier beyond the free 5-deal limit). Also increases time-in-product during the most active deal evaluation phase.

---

### Gap 3 — Refinance / cash-out refi what-if calculator
**Rank:** #3  
**What it is:** On an owned property: "If I refinance to rate X at LTV Y%, what happens to my monthly payment, cash flow, equity release, and DSCR?" Distinct from the existing scenario-modeling sliders (which adjust rent/value/payment in isolation), this models the full refi decision: new loan terms, cash out amount, closing costs, post-refi metrics.  
**Why it matters to the ICP:** In a high-rate environment (2026), passive landlords are asking "should I refinance now?" or "should I cash out to buy another property?" constantly. They're currently running this in a spreadsheet or a random mortgage calculator with no portfolio context. Veld already has all the data — loan balance, current rate, property value, cash flow — and could answer this question better than any standalone tool.  
**Who has it:** No competitor in the portfolio-tracking category. DealCheck doesn't model existing properties. Standalone calculators exist (Bankrate, etc.) but have no portfolio context. This is a gap across the entire space.  
**Effort:** M — extends the existing Mortgage workspace and scenario modeling patterns. New calculation module; no new API integrations.  
**Stack fit:** Lives naturally in the Mortgage workspace or as a modal off the property detail page. Reuses amortization lib (`app/lib/amortization.ts`). Aligns with the already-roadmapped "Refinance / payoff insights" (Priority 10).  
**Conversion / retention angle:** High retention driver — creates a reason to return to the product at the moment a landlord is considering a major financial decision. Sticky, high-value, no direct competitor.

---

### Gap 4 — Portfolio-level alerts & prioritized insights
**Rank:** #4  
**What it is:** The product moves from "here are your numbers" to "here is what you should pay attention to." Ranked, plain-language alerts: "Property B's DSCR has dropped below 1.0," "Your rent for Property A is 18% below market — you may be leaving ~$260/mo on the table," "Property C's LTV is above 80% — if values have dropped, your equity cushion is thin."  
**Why it matters to the ICP:** Passive landlords — by definition — are not staring at their portfolio daily. They want the product to tell them when something needs attention, not require them to remember to check. This is retention as a feature: a product that emails you when something's off gives you a reason to come back even when you're not actively buying.  
**Who has it:** No competitor does this well. Stessa has basic notifications. Nothing has a ranked, prioritized "here's what needs your attention" intelligence layer for a small portfolio.  
**Effort:** M–L — requires a notification system (email via Resend, already integrated), alert logic layer on top of existing metrics, and a UI surface in the dashboard. Notification scheduling adds backend complexity.  
**Stack fit:** Built on top of existing metric calculation library. Email via Resend (already in stack). Aligns with the highest-priority item in the strategic backlog (Priority 9).  
**Conversion / retention angle:** Primary retention driver. Users who get a valuable alert email become habitual product users. Also drives re-engagement for users who added their portfolio and then went quiet.

---

### Gap 5 — Read-only share link (deal snapshot or portfolio summary)
**Rank:** #5  
**What it is:** Generate a time-limited, read-only URL that shows a deal analysis or portfolio summary to someone who doesn't have a Veld account — a CPA, a partner, a lender, a spouse reviewing the numbers.  
**Why it matters to the ICP:** Passive landlords frequently need to loop in a third party without giving them app access. "Can you look at this deal?" to a business partner, "Here's our portfolio for tax prep" to a CPA. Currently, they're exporting CSVs or screenshotting. A shareable link is a natural product moment and a word-of-mouth driver (the recipient sees a professional Veld-branded output and may sign up themselves).  
**Who has it:** Stessa has limited partner sharing. No competitor has a clean, public-facing read-only deal snapshot link for non-users.  
**Effort:** M — time-limited signed URL pointing to a read-only render of existing data. No new data model complexity; just a share token + public render route.  
**Stack fit:** Extends the existing deal and portfolio data model. Next.js dynamic route + database token. No new external APIs. Aligns with the roadmapped "Investor outputs & sharing" (Priority 11–12).  
**Conversion / retention angle:** Viral mechanism — every shared link is an impression of the product with a high-intent audience (the link recipient is a landlord or advisor in the network). Gate link creation to paid tiers.

---

### Gap 6 — Interactive demo / seeded demo account
**Rank:** #6  
**What it is:** "Try without signing up" — a pre-loaded app session with realistic fake properties and saved deals. The visitor experiences the real dashboard, can enter an address and get a live rent estimate, and then is prompted to save their work when they try to add their own property. Phase A: Arcade.so embed. Phase B: real seeded session.  
**Why it matters to the ICP:** Skeptical passive landlords (the exact ICP) don't sign up for tools they can't first verify do what they claim. The biggest conversion objection is "I don't know what I'm getting." A demo removes this friction before the sign-up step.  
**Who has it:** No competitor in this category offers a live seeded demo. This would be a differentiating first impression in a category where products typically ask you to connect your bank account before showing you anything.  
**Effort:** S (Phase A: Arcade embed, zero engineering) / M (Phase B: seeded session with read-only guards)  
**Stack fit:** Phase B extends Clerk auth with a special demo user type. Read-only guards on write API routes. Demo data seeding via a cron-reset script. Already fully scoped in the roadmap.  
**Conversion / retention angle:** Direct trial→activation driver. Removes the largest pre-signup objection without changing the free tier.

---

### Gap 7 — Lightweight document storage per property
**Rank:** #7  
**What it is:** Per-property file uploads: mortgage statements, purchase docs, insurance certificates, lease agreements, HOA docs. Not a full document management system — just a simple "attach files to this property" drawer. CPA-facing use case: "here is everything you need for property B."  
**Why it matters to the ICP:** Passive landlords with a few properties currently have their docs scattered across email attachments, Dropbox folders they've forgotten the structure of, and physical files. When the CPA asks for the mortgage statement, they spend 20 minutes finding it. A property-anchored document drawer — even a simple one — addresses a real pain point without touching PM territory.  
**Who has it:** Stessa (document storage is a praised feature), PropertyTools.ai (AI-parsed document vault), Landlord Studio (document storage on PRO).  
**Effort:** M — file upload + S3/Cloudflare R2 storage + per-property association in DB. No AI parsing needed in v1. Storage costs are manageable at Veld's scale.  
**Stack fit:** New data model (`PropertyDocument`) + file upload component + storage bucket. Can be gated to paid tiers by file count/size. Does not conflict with the "no PM" positioning — this is document storage for the investor, not tenant portal documents.  
**Conversion / retention angle:** High lock-in / data gravity — once a user stores docs in the product, switching cost increases substantially. Also a strong paid-tier feature (e.g., free: 3 files/property, Investor/Pro: unlimited).

---

### Gap 8 — Hold vs. sell analysis ("Should I sell this property?")
**Rank:** #8  
**What it is:** A structured "sell or keep" decision tool for an owned property: projected capital gains estimate (simplified — purchase price, depreciation recapture rough estimate, sales costs), net proceeds, opportunity cost of the equity at an assumed reinvestment return, vs. continued hold projections. Not tax advice — just the investor math.  
**Why it matters to the ICP:** This is the single most emotionally charged decision a passive landlord makes. "This property is a headache — should I sell?" or "I have a lot of equity locked up — is it working hard enough?" Nobody currently does this in a portfolio-aware way. The existing Modeling workspace handles hold projections; this extends it to include the sale comparison.  
**Who has it:** No competitor does portfolio-aware hold/sell analysis. EstatePass has a 1031 exchange calculator. Some standalone cap gains calculators exist. This is a genuine gap across the whole space.  
**Effort:** M — extends the existing Projections/Modeling workspace. The sale-at-hold-end option already partially exists in projections. Adding a "sell now vs. continue holding" comparison panel is incremental.  
**Stack fit:** Extends `ProjectionsTabContent` and the Modeling workspace. Reuses hold-period projections, equity calculations, and property value assumptions. Possible optional pairing with a 1031 exchange note/link.  
**Conversion / retention angle:** High-stakes decision = high engagement. A landlord who uses this feature has a very strong reason to keep their portfolio in Veld. Also relevant to the acquisition decision loop (would I sell X to buy Y?).

---

### Gap 9 — Depreciation tracking / Schedule E summary export
**Rank:** #9  
**What it is:** Track each property's depreciable basis and accumulated depreciation (straight-line, 27.5-year residential). Output a one-page Schedule E summary (income, expenses, depreciation, net income/loss per property) exportable as CSV or PDF for the CPA. Not full bookkeeping — just the investor-facing tax summary layer.  
**Why it matters to the ICP:** Tax preparation is the one moment every year when a passive landlord is forced to organize their property numbers. If Veld can produce a pre-populated Schedule E summary they hand to their CPA, that's a retention event with a clear, recurring annual value. Stessa losing goodwill by moving this to paid tier = opportunity to capture those users.  
**Who has it:** Stessa (Schedule E export, moving to paid tier — user backlash), Baselane (free, but requires their banking), Rentlab (one-click Schedule E), PropertyLedger.  
**Effort:** M — new depreciation data model (purchase date, cost basis, land value %), calculation module (straight-line 27.5yr), and a per-property + portfolio summary export.  
**Stack fit:** New data fields on `Property` model (depreciable basis, land value%). New calculation in the metrics lib. Export extends existing CSV export pattern. Can be standalone from bank sync (user enters income/expenses manually, as they do today).  
**Conversion / retention angle:** Annual retention hook. Creates strong annual return habit. "At tax time, open Veld and export your Schedule E summary" is a powerful retention loop. Gate to paid tiers.

---

### Gap 10 — Insurance / key date reminders per property
**Rank:** #10  
**What it is:** Lightweight date tracking per property: insurance renewal date, property tax due dates, mortgage ARM reset date, lease expiration. Email or in-app reminder N days before. No tenant portal, no full PM workflow — just investor-facing critical dates.  
**Why it matters to the ICP:** Passive landlords forget insurance renewal dates (sometimes catastrophically) and property tax due dates. A simple reminder system attached to the property data they already entered would be high value at very low complexity. PropertyTools.ai is building around this concept — it's clearly a felt need.  
**Who has it:** PropertyTools.ai (their differentiated feature), Landlord Studio (deadline tracking on PRO).  
**Effort:** S–M — new `PropertyDate` model (date type, date, reminder N days before). Email via Resend (already in stack). Cron job or daily email batch. UI: simple date fields on property detail.  
**Stack fit:** Resend already integrated. Cron scheduling is the only new infrastructure. Low UI complexity. No new external APIs.  
**Conversion / retention angle:** Moderate retention driver — creates periodic touchpoints. Lower urgency than alerts/insights (Gap 4) but simpler to build and immediately differentiates from Stessa/Baselane.

---

### Gap 11 — Native mobile app (iOS/Android)
**Rank:** #11  
**What it is:** A real native app (React Native or Expo) with the core dashboard, property list, deal analyzer, and mortgage view. Not a full feature parity — just the "check my portfolio on the train" experience.  
**Why it matters to the ICP:** Most landlord tools have mobile apps. DealCheck, Landlord Studio, Rentastic, Stessa all have mobile apps. Passive landlords review their portfolio at odd moments — traveling, in a meeting break, at a property showing. The web app is mobile-responsive but not native.  
**Who has it:** DealCheck, Landlord Studio, Rentastic, Stessa all have mobile apps.  
**Effort:** L — significant engineering effort. React Native/Expo reuse of business logic but requires parallel UI development, app store submission, and ongoing maintenance.  
**Stack fit:** Business logic (metrics, amortization, deal calculations) is pure TypeScript and could be shared via a monorepo package. Next.js API routes would serve the mobile app. But the UI layer requires near-complete rebuild for native.  
**Conversion / retention angle:** Removes a meaningful churn reason ("I can't check my portfolio on my phone"). Deferred in roadmap for good reason — validate web stickiness first. More relevant at 500+ MAU than at early stage.

---

### Gap 12 — Address autocomplete + property data prefill
**Rank:** #12  
**What it is:** When adding a property, autocomplete the address via Google Places or Smarty, then optionally pull in a property value estimate and rent estimate in one step. Reduce the "add property" form from ~8 manual fields to ~3.  
**Why it matters to the ICP:** Friction at add-property is a conversion leak. Every extra field before the user sees value is a dropout risk. The product promises "first property in 60 seconds" — address autocomplete is table stakes for that to feel true.  
**Who has it:** DealCheck (auto-imports from public records). Most modern form tools. This is a UX baseline, not a differentiator.  
**Effort:** S — Google Places Autocomplete or Smarty ($0–low cost). Plugs into the existing add-property wizard. Already flagged as High priority in the external API section of the roadmap.  
**Stack fit:** Next.js API route proxies the autocomplete API. Existing property form wizard (`/properties/new`) adds an address autocomplete step. No new data model.  
**Conversion / retention angle:** Activation metric improvement — reduces friction to "first property added." This unlocks value from everything else downstream.

---

### Gap 13 — Wholesale / assignment and rent-vs-buy calculators
**Rank:** #13  
**What it is:** Two additional public calculators for the SEO / top-of-funnel: (1) a wholesale/assignment calculator (ARV, MAO, assignment fee → spread) and (2) a rent-vs-buy calculator (time horizon, appreciation, opportunity cost → break-even year).  
**Why it matters to the ICP:** The wholesale calculator reaches aspiring investors and flippers who are adjacent to the ICP. The rent-vs-buy calculator captures early-stage landlords contemplating their first investment. Both feed the free-tool → sign-up funnel.  
**Who has it:** BiggerPockets has both. Standalone sites for each. No competitor combines these with portfolio tracking in one product.  
**Effort:** S — each calculator is a pure math component following the existing calculator pattern (BRRRR, Fix & Flip). Public tool page + authenticated in-app version.  
**Stack fit:** Direct extension of the existing tools hub (`/tools/`) and authenticated calculators (`/calculators/`). Follows the established pattern exactly.  
**Conversion / retention angle:** Top-of-funnel acquisition (SEO) and secondary funnel diversification. Lower retention impact than gaps 1–10 but low-effort.

---

## Synthesis: Effort-Impact Matrix

| Gap | Effort | Differentiation | Conversion impact | Retention impact |
|---|---|---|---|---|
| 1 — PDF/lender report | M | High (vs. Rentastic) | High (premium gated) | Medium |
| 2 — Side-by-side comparison | M | Very high (no competitor) | High (premium) | High |
| 3 — Refi what-if | M | Very high (no competitor) | Medium | Very high |
| 4 — Portfolio alerts & insights | M–L | Very high (no competitor) | Medium | Very high |
| 5 — Read-only share link | M | High (no competitor) | Medium (viral) | High |
| 6 — Interactive demo | S–M | High | Very high | Low |
| 7 — Document storage | M | Medium (Stessa has it) | Medium (lock-in) | High |
| 8 — Hold vs. sell analysis | M | Very high (no competitor) | Medium | High |
| 9 — Schedule E / depreciation | M | Medium (Stessa gap) | Medium | High (annual) |
| 10 — Key date reminders | S–M | Medium (PropertyTools.ai) | Low | Medium |
| 11 — Native mobile app | L | Low (table stakes) | Medium | High |
| 12 — Address autocomplete | S | Low (table stakes) | High (activation) | Low |
| 13 — More calculators | S | Low | Low–medium (SEO) | Low |

---

## Strategic Observations

**The unbundling opportunity:** Stessa's paid-tier backlash (moving Schedule E, receipt capture, and other features behind a paywall) is creating a real window. Users who signed up for Stessa when it was "free forever" are actively looking for alternatives in 2025–2026. Veld doesn't do accounting, but a clean Schedule E summary export (Gap 9) and document storage (Gap 7) could capture this segment without requiring bank sync.

**The "investor PDF" is the product's missing output layer:** Every other serious deal tool produces a PDF — DealCheck, BiggerPockets Pro, even basic mortgage calculators. Veld has the best analysis in the category for the ICP, but can't produce a document to show for it. Gap 1 has asymmetric impact relative to its effort.

**No competitor has the "intelligence + no bank sync" positioning locked up:** Stessa and Baselane are building toward full financial OS (banking + rent collection + accounting). Rentastic is trending accounting-first. DealCheck is analysis-only. The "investor intelligence platform that doesn't require connecting your bank account" lane is genuinely open — Veld should double down on it, and Gaps 2, 3, 4, and 8 are all high-differentiation moves within that lane.

**Mobile app is table stakes but high cost:** Every competitor has mobile apps. Veld's mobile-responsive web app covers the basics but the absence of a native app will become a more meaningful churn driver as the user base scales. Phase 1 investment: ensure the web app works excellently at 390px (already a focus via `veld-mobile` skill). Phase 2: Expo/React Native when web MAU justifies it.

**Lock-in comes from outputs, not inputs:** The current product takes inputs (property data) and shows metrics. Users who have no outputs (PDFs, shared links, Schedule E summaries, stored documents) have low switching cost. Gaps 1, 5, 7, and 9 all increase data gravity and switching cost — they make Veld the place where investor artifacts live, not just metrics are displayed.
