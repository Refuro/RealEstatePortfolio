import type { CalculatorFaqItem } from "@/lib/marketing/calculator-faqs";

/** Public marketing "alternative / vs" page — static copy only. */
export type CompetitorPageKind = "alternatives" | "vs";

export type CompetitorPageConfig = {
  kind: CompetitorPageKind;
  slug: string;
  /** Table column header for the non-Veld column */
  competitorColumnLabel: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  lede: string;
  /** 2–3 bullets describing who Veld is the right fit for in this comparison */
  fitFor?: string[];
  differentiators: { title: string; body: string }[];
  /** Feature rows: Veld vs other (honest, high-level) */
  features: { label: string; veld: boolean; competitor: boolean }[];
  faqs: CalculatorFaqItem[];
  landingVariant: string;
};

const stessa: CompetitorPageConfig = {
  kind: "alternatives",
  slug: "stessa",
  competitorColumnLabel: "Stessa",
  metaTitle: "Stessa Alternative | Veld Portfolio",
  metaDescription:
    "Compare Veld Portfolio to Stessa for rental portfolio analytics, deal analysis, and modeling—without replacing your accounting stack.",
  h1: "Stessa alternative for rental property investors",
  lede:
    "Most investors looking at Stessa alternatives want stronger deal underwriting or projections without replacing their accounting stack. Veld focuses on portfolio analytics, a dedicated deal workspace, and long-term modeling. No bank sync, no rent collection.",
  fitFor: [
    "Investors who want deal underwriting alongside portfolio tracking",
    "Small portfolios (1–20 properties) that don't need full accounting or bank sync",
    "Spreadsheet users who want structured metrics without rebuilding formulas",
  ],
  differentiators: [
    {
      title: "Deal analyzer workspace",
      body: "Run the numbers before you buy, save the analysis, and promote it to your portfolio when you close. Assumptions and data carry over.",
    },
    {
      title: "Modeling and mortgage clarity",
      body: "Amortization and payoff tracked per loan; projections cover rent growth, expense changes, and an optional sale over 5–20 years.",
    },
    {
      title: "CSV migration",
      body: "Import existing properties via the documented CSV format. No re-entering every address and mortgage.",
    },
  ],
  features: [
    { label: "Portfolio-level metrics (equity, cash flow, benchmarks)", veld: true, competitor: true },
    { label: "Dedicated deal underwriting workspace", veld: true, competitor: false },
    { label: "Scenario modeling / projections on owned properties", veld: true, competitor: false },
    { label: "Mortgage amortization and payoff views", veld: true, competitor: false },
    { label: "Free tier to try core flows", veld: true, competitor: true },
  ],
  faqs: [
    {
      question: "Is Veld a drop-in replacement for Stessa?",
      answer:
        "Not exactly. Veld focuses on analytics, deal underwriting, and modeling; Stessa leans into accounting and bank sync. Try both against your workflow.",
    },
    {
      question: "Can I import my portfolio data?",
      answer:
        "Veld supports CSV import for portfolio migration. Export from your current tool or spreadsheet using the columns described in our portfolio CSV documentation, then import in Settings.",
    },
    {
      question: "Does Veld offer rent collection or bank sync?",
      answer:
        "No. Veld is focused on analytics and underwriting—not rent collection, banking, or full general-ledger accounting. Use it alongside your existing banking or PM tools.",
    },
    {
      question: "How do I try Veld without a card?",
      answer:
        "The Free tier lets you add a property, review metrics, and try Analyze for deals before upgrading.",
    },
  ],
  landingVariant: "alt_stessa_v1",
};

const rentastic: CompetitorPageConfig = {
  kind: "alternatives",
  slug: "rentastic",
  competitorColumnLabel: "Rentastic",
  metaTitle: "Rentastic Alternative | Veld Portfolio",
  metaDescription:
    "See how Veld Portfolio compares for rental analytics, deal analysis, and portfolio modeling when you are evaluating Rentastic alternatives.",
  h1: "Rentastic alternative for rental property investors",
  lede:
    "Most investors looking at Rentastic want better deal math or longer-term projections. Veld focuses on portfolio analytics, a full deal workspace, and scenario modeling.",
  fitFor: [
    "Investors who want to underwrite deals and track the resulting portfolio",
    "Landlords who want rent-vs-market benchmarks alongside their core metrics",
    "Investors who need mortgage amortization and hold-period projections",
  ],
  differentiators: [
    {
      title: "Deal-first workflow",
      body: "Analyze a deal, save it, compare multiple options side by side, and when you buy, convert it to a portfolio property with one click—assumptions carry over.",
    },
    {
      title: "Rent benchmarks alongside your assumptions",
      body: "RentCast estimates sit next to your entered assumptions so you can spot rent gaps immediately.",
    },
    {
      title: "Transparent limits by plan",
      body: "Free, Investor, and Pro tiers list exact property and deal limits on the Pricing page—no surprises.",
    },
  ],
  features: [
    { label: "Portfolio dashboard and property detail metrics", veld: true, competitor: true },
    { label: "Saved deals / deal analyzer workspace", veld: true, competitor: true },
    { label: "Modeling projections on owned properties", veld: true, competitor: false },
    { label: "Mortgage amortization tools", veld: true, competitor: false },
    { label: "Marketing calculators (BRRRR, STR vs LTR, flip)", veld: true, competitor: false },
  ],
  faqs: [
    {
      question: "How is Veld different from Rentastic?",
      answer:
        "Both track performance. Veld adds deal underwriting, scenario modeling, and acquisition calculators that Rentastic doesn't have.",
    },
    {
      question: "Can I import from a spreadsheet?",
      answer:
        "Yes. Use the portfolio CSV import path documented in Settings and in our portfolio CSV reference. Validate a small file first.",
    },
    {
      question: "Is there a free tier?",
      answer:
        "Yes. Free tier limits are listed on the Pricing page and in-app where limits apply.",
    },
  ],
  landingVariant: "alt_rentastic_v1",
};

const cozy: CompetitorPageConfig = {
  kind: "alternatives",
  slug: "cozy",
  competitorColumnLabel: "Cozy (legacy)",
  metaTitle: "Cozy Alternative | Veld Portfolio",
  metaDescription:
    "Landlords moving off Cozy can use Veld for portfolio analytics and deal analysis—focused on numbers, not rent collection.",
  h1: "Cozy alternative focused on analytics and deals",
  lede:
    "Cozy was acquired and its direction changed; many landlords are still looking for a replacement analytics layer. Veld doesn't replace rent collection—it covers portfolio metrics, deal underwriting, and projections alongside whatever payment tool you use.",
  fitFor: [
    "Former Cozy users who need a dedicated analytics and portfolio metrics layer",
    "Landlords who want cap rate, DSCR, and cash flow tracked per property",
    "Investors adding deal analysis to their workflow for the first time",
  ],
  differentiators: [
    {
      title: "Investor metrics, calculated consistently",
      body: "Cap rate, DSCR, cash flow, equity, and LTV are calculated consistently at both portfolio and property level.",
    },
    {
      title: "Deal analyzer for the next acquisition",
      body: "Save the analysis before you buy and promote it to your portfolio when you close—assumptions carry over.",
    },
    {
      title: "No pretend feature parity",
      body: "Veld doesn't do rent collection, and we say so upfront. That clarity makes it easier to pick the right combination of tools instead of one that does everything poorly.",
    },
  ],
  features: [
    { label: "Rent collection / payments", veld: false, competitor: true },
    { label: "Portfolio analytics and exports", veld: true, competitor: false },
    { label: "Deal analysis workspace", veld: true, competitor: false },
    { label: "Mortgage and projection tools", veld: true, competitor: false },
  ],
  faqs: [
    {
      question: "Does Veld include rent collection like Cozy?",
      answer:
        "No. Veld doesn't handle rent payments. Use a PM or payments product for collections; use Veld for analytics and underwriting.",
    },
    {
      question: "Can I track my rentals after moving data?",
      answer:
        "Yes. Import via CSV where applicable, add properties manually, and keep metrics updated as assumptions change.",
    },
    {
      question: "Where do I see pricing?",
      answer:
        "Visit the Pricing page for current tiers, limits, and billing intervals.",
    },
  ],
  landingVariant: "alt_cozy_v1",
};

const spreadsheets: CompetitorPageConfig = {
  kind: "vs",
  slug: "spreadsheets",
  competitorColumnLabel: "Spreadsheets",
  metaTitle: "Spreadsheet Alternative for Rental Properties | Veld Portfolio",
  metaDescription:
    "Replace fragile spreadsheets with a structured portfolio and deal workspace—Veld keeps metrics consistent and importable.",
  h1: "Spreadsheet alternative for rental property investors",
  lede:
    "Spreadsheets are flexible but brittle: broken formulas, version chaos, and no shared model across deals and owned properties. Veld keeps portfolio metrics and deal analyses in a structured workspace, with CSV import for migration.",
  differentiators: [
    {
      title: "One source of truth",
      body: "Centralized metrics reduce copy-paste errors between tabs and files.",
    },
    {
      title: "Deal and portfolio in one product",
      body: "Underwrite acquisitions and track owned properties without rebuilding the same sheet for every deal.",
    },
    {
      title: "Documented CSV path",
      body: "Import from your existing workbook using the portfolio CSV format—no magic, just a clear contract.",
    },
  ],
  features: [
    { label: "Single system of record (no broken cross-sheet references)", veld: true, competitor: false },
    { label: "Portfolio + deal workspaces in one app", veld: true, competitor: false },
    { label: "Mortgage amortization and projections", veld: true, competitor: false },
    { label: "Instant start with a blank workbook", veld: false, competitor: true },
    { label: "Fully custom layout and ad-hoc formulas", veld: false, competitor: true },
  ],
  faqs: [
    {
      question: "Do I have to abandon Excel completely?",
      answer:
        "No. Many investors export for ad-hoc analysis or share with a CPA. Veld is the system of record for portfolio and deal math.",
    },
    {
      question: "How do I migrate from a workbook?",
      answer:
        "Use the portfolio CSV import documented in Settings. Start with a small test file, fix validation errors, then import the rest.",
    },
    {
      question: "What if I outgrow the Free tier?",
      answer:
        "Upgrade when you need more properties or deals—see Pricing for current limits.",
    },
  ],
  landingVariant: "vs_spreadsheets_v1",
};

const excelRentalProperty: CompetitorPageConfig = {
  kind: "vs",
  slug: "excel-rental-property",
  competitorColumnLabel: "Excel",
  metaTitle: "Excel Rental Property Tracker Alternative | Veld Portfolio",
  metaDescription:
    "Move from Excel rental trackers to Veld for consistent metrics, deal analysis, and portfolio reporting without formula sprawl.",
  h1: "Excel rental property tracker alternative",
  lede:
    "Excel works until it doesn't—too many versions, hidden errors, and no standard way to compare a new deal to what you already own. Veld gives rental investors structured metrics, a deal workspace, and CSV imports with a documented format.",
  differentiators: [
    {
      title: "Investor metrics without formula maintenance",
      body: "Cap rate, DSCR, and cash flow use consistent definitions across the app. No formula drift when you update assumptions.",
    },
    {
      title: "Analyze then own",
      body: "Promote winning assumptions from Analyze into owned properties when you close.",
    },
    {
      title: "Built-in calculators for quick checks",
      body: "BRRRR, fix-and-flip, STR vs LTR, and investment property calculators are built in. No separate tools.",
    },
  ],
  features: [
    { label: "Repeatable underwriting in a saved deal workspace", veld: true, competitor: false },
    { label: "Property-level mortgage and projection tabs", veld: true, competitor: false },
    { label: "CSV import matching documented columns", veld: true, competitor: false },
    { label: "Fully custom cell-level formulas", veld: false, competitor: true },
    { label: "Offline editing", veld: false, competitor: true },
  ],
  faqs: [
    {
      question: "Can I still export to Excel?",
      answer:
        "Portfolio CSV export is available for data portability. Use exports for offline work or sharing; keep Veld as the live system of record if you want consistent metrics.",
    },
    {
      question: "Will my cap rate and DSCR match my old sheet?",
      answer:
        "Only if assumptions match. Veld applies consistent definitions across the app; small differences from Excel usually come from inputs, rounding, or timing—not a hidden bug.",
    },
    {
      question: "Is there a free tier?",
      answer:
        "Yes—see Pricing for property and deal limits on Free.",
    },
  ],
  landingVariant: "vs_excel_v1",
};

export const COMPETITOR_ALTERNATIVES: Record<string, CompetitorPageConfig> = {
  stessa,
  rentastic,
  cozy,
};

export const COMPETITOR_VS: Record<string, CompetitorPageConfig> = {
  spreadsheets,
  "excel-rental-property": excelRentalProperty,
};
