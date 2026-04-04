# Agent Prompt: Public-Facing Copy Review

## Your task

You are a copy editor reviewing all public-facing text across the Veld Portfolio marketing site. Your goal is to identify copy that is too long, reads like AI-generated marketing, repeats itself unnecessarily, creates information overload, or could be stated more directly. You are NOT reviewing code, design, or structure — copy only.

**Audience:** Small landlords (1–5 properties) who are evaluating tools. They are busy and skeptical. They skim. They leave if a page feels like work to read.

**Voice to aim for:** Direct, specific, brief. Describe what the product does. No filler adjectives ("powerful," "seamless," "robust"). No hedging that turns one sentence into three. One idea per sentence.

---

## Files to review

Read every file listed below. For **data files** (where copy lives in `.ts` string objects), that is where you will make edits. For **page files** with inline JSX strings, edit the JSX strings directly. For **component files**, edit the rendered text strings.

### Data files (most of the competitor/VS copy lives here)
- `app/lib/marketing/competitor-data.ts` — All `lede`, `differentiators[].title`, `differentiators[].body`, `fitFor[]`, and `faqs[].question` / `faqs[].answer` strings for every competitor and VS entry
- `app/lib/marketing/resource-data.ts` — Article titles, descriptions, and body content for all resource articles

### Page files (inline copy)
- `app/app/page.tsx` — Homepage: hero h1, hero subhead, VALUE_PROPS descriptions, HOW_IT_WORKS descriptions, VELD_DOES / VELD_DOES_NOT list items, pricing section subhead, bottom CTA
- `app/app/pricing/page.tsx` — Pricing page subheadline, feature descriptions, FAQ copy, any descriptive text in `PricingCards` if copy is inlined there
- `app/app/alternatives/page.tsx` — Hub page lede paragraph
- `app/app/tools/page.tsx` — Hero copy, any descriptive text per calculator card
- `app/app/tools/brrr/page.tsx` — All descriptive copy
- `app/app/tools/fix-and-flip/page.tsx` — All descriptive copy
- `app/app/tools/str-vs-ltr/page.tsx` — All descriptive copy
- `app/app/investment-property-calculator/page.tsx` — All descriptive copy
- `app/app/lp/investment-property-calculator/page.tsx` — All descriptive copy
- `app/app/resources/page.tsx` — Hub header copy
- `app/app/resources/[slug]/page.tsx` — Any wrapper/framing copy (not the article body itself)
- `app/app/contact/page.tsx` — Intro paragraph
- `app/app/vs/page.tsx` — Hub page lede

### Component files (check for verbose inline strings)
- `app/components/marketing/competitor-alternative-page.tsx` — Any hardcoded descriptive strings rendered in the component shell (not the config-driven copy, which lives in competitor-data.ts)
- `app/components/pricing-cards.tsx` — Feature list labels, section headers, any descriptive body text

---

## Editorial criteria — flag and fix any of these

### 1. Information overload
Long paragraphs or multi-sentence descriptions where a single sentence (or a bullet) would do. The reader should be able to understand the point in 3 seconds.

**Example of the problem** (from `competitor-data.ts`, Stessa differentiator body):
> "Run a full acquisition analysis before you buy, save it, and when you close promote it directly to your portfolio with assumptions intact—no re-entering data."

That's fine — one clear action chain. But when every differentiator body is 2–3 sentences long AND the lede is 2 sentences AND there's a feature table AND there are FAQs, the cumulative reading load is too high.

**Fix strategy for competitor/VS pages:** Each `differentiators[].body` should be one sentence, max. Cut anything that restates what the title already says. If the title is "Deal analyzer workspace," the body should not open with "Run a full acquisition analysis..."—the title already said it. The body should add one specific detail the title doesn't cover.

### 2. AI / marketing filler language
Phrases that sound like a generated pitch rather than a human product description. Flag and replace with specific, literal language.

**Common patterns to kill:**
- "powerful analytics" → name the analytics
- "seamless" → delete or describe the actual UX
- "robust" → delete or describe what makes it thorough
- "in one place" (overused — okay once, not as a differentiator on every page)
- "best-in-class" → delete
- "purpose-built for" → usually can just say what it does instead
- Passive voice pileups: "is built to be used by" → "works for"
- Nominalization: "provides visibility into" → "shows"

### 3. Excessive hedging that adds length without adding honesty
There is a difference between honest scope-setting (good) and hedging that buries the point. Veld already has an "Honest Scope" section on the homepage for disclaimers.

**Examples of hedging that hurts readability:**
- "compare features against your own workflow before switching" — this is a disclaimer, not a feature description. Fine in an FAQ answer, but remove it from lede paragraphs where it interrupts the pitch.
- "only if assumptions match" — technically true but creates doubt without payoff; move to a tooltip or remove.
- "Not financial or lending advice; confirm with your own professionals." — appropriate once on the Resources hub; does not need to appear in every resource article header.

### 4. Repetition across sections of the same page
On competitor/VS pages the page structure is: lede → fitFor bullets → differentiators → feature table → FAQs. Each section should add new information. Flag cases where the same idea appears in two sections without adding anything.

**Example:** If the lede says "Veld centers on deal analysis" and then a differentiator is also titled "Deal-first workflow," and the FAQ also asks "How is Veld different?" and answers with deal analysis — that's three mentions of the same point. One should survive; the others should cover different ground.

### 5. Sentence-level wordiness
Cut any sentence that can be shortened by 30%+ without losing meaning.

**Before:** "Investors evaluating Rentastic typically want clearer deal math or longer-term projections on the properties they own."  
**After:** "Most investors looking at Rentastic want better deal math or projections on what they own."

Apply this throughout. Don't be precious about preserving sentence structure.

### 6. FAQ answers that re-ask the question
FAQ answers should answer immediately. Do not start an answer by restating the question.

**Before:** "Is Veld a drop-in replacement for Stessa? Not exactly. Products differ in scope and roadmap."  
**After:** "Not exactly. Veld does analytics and deal underwriting; Stessa leans into accounting and bank sync. Check both against your workflow."

### 7. Inconsistent voice across pages
The homepage, pricing, and tools pages feel more direct than the competitor pages, which are more hedged and formal. Flag places where the voice shifts to formal/corporate.

---

## Output format

For each issue you find, output a block in this format:

```
FILE: app/lib/marketing/competitor-data.ts
LOCATION: stessa.differentiators[1].body
ISSUE: Sentence 1 restates what the title ("Modeling and mortgage clarity") already conveys. Sentence 2 is the actual differentiator.
ORIGINAL: "See how a property performs over 5, 10, or 20 years with rent growth, expense changes, and an optional sale. Amortization and payoff are tracked per loan, not buried in aggregate totals."
SUGGESTED: "Amortization and payoff tracked per loan, not buried in aggregate totals. Projections cover rent growth, expense changes, and an optional sale over 5–20 years."
```

Group your findings by file. Within each file, work top to bottom.

After all findings, provide a **Summary** section with:
- A count of issues found per file
- The 2–3 highest-priority fixes (the ones most likely to meaningfully reduce reading load or improve first impression)
- Any systemic patterns that should become a writing rule going forward (e.g., "differentiator bodies should be capped at one sentence")

---

## Do NOT change

- CTAs (button labels) — these are governed by separate rules
- The "What Veld does / doesn't do" list on the homepage — this is intentionally brief already
- Pricing tier names or price figures
- Legal/disclaimer copy on the privacy and terms pages (excluded from scope)
- Changelog entries (excluded from scope)
- Any `className`, `href`, `aria-label`, or other non-copy attributes

---

## Tone guardrails

The product serves small landlords who already know what cap rate and DSCR are. Do not over-explain investor terminology. Do not condescend. Do not hype. The product is a numbers tool — the copy should feel like it was written by someone who also uses spreadsheets and appreciates when software gets out of the way.
