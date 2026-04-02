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
    "Most investors searching for a Stessa alternative want stronger deal underwriting or projections without replacing their accounting setup. Veld focuses on portfolio analytics, a dedicated deal workspace, and long-term modeling—and is upfront about what it does not do (no bank sync, no rent collection).",
  fitFor: [
    "Investors who want deal underwriting alongside portfolio tracking",
    "Small portfolios (1–20 properties) that don't need full accounting or bank sync",
    "Spreadsheet users who want structured metrics without rebuilding formulas",
  ],
  differentiators: [
    {
      title: "Deal analyzer workspace",
      body: "Run a full acquisition analysis before you buy, save it, and when you close promote it directly to your portfolio with assumptions intact—no re-entering data.",
    },
    {
      title: "Modeling and mortgage clarity",
      body: "See how a property performs over 5, 10, or 20 years with rent growth, expense changes, and an optional sale. Amortization and payoff are tracked per loan, not buried in aggregate totals.",
    },
    {
      title: "CSV migration",
      body: "Import your existing properties from a spreadsheet in minutes using the documented CSV format. No manual re-entry of every address and mortgage.",
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
        "Not exactly. Products differ in scope and roadmap. Veld emphasizes portfolio analytics, deal analysis, and modeling for investors evaluating and holding rentals. Compare features against your own workflow before switching.",
    },
    {
      question: "Can I import my portfolio data?",
      answer:
        "Veld supports CSV import for portfolio migration. Export from your current tool or spreadsheet using the columns described in our portfolio CSV documentation, then import in Settings.",
    },
    {
      question: "Does Veld offer rent collection or bank sync?",
      answer:
        "No. Veld is focused on analytics and underwriting—not rent collection, banking, or full general-ledger accounting. Use it alongside whatever banking or PM tools you already use.",
    },
    {
      question: "How do I try Veld without a card?",
      answer:
        "The Free tier includes a limited number of properties so you can run the core loop—add a property, review metrics, and try Analyze for deals—before upgrading.",
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
    "Investors evaluating Rentastic typically want clearer deal math or longer-term projections on the properties they own. Veld centers on portfolio analytics, a full deal workspace, and scenario modeling—without overstating what it covers.",
  fitFor: [
    "Investors who want to underwrite deals and track the resulting portfolio in one place",
    "Landlords who want rent-vs-market benchmarks alongside their core metrics",
    "Investors who need mortgage amortization and hold-period projections",
  ],
  differentiators: [
    {
      title: "Deal-first workflow",
      body: "Analyze a deal, save it, compare multiple options side by side, and when you buy, convert it to a portfolio property with one click—assumptions carry over.",
    },
    {
      title: "Benchmarks and metrics in one place",
      body: "See whether your rent is above or below market using RentCast estimates that sit right next to your entered assumptions, so you can spot gaps without switching tabs.",
    },
    {
      title: "Transparent limits by plan",
      body: "Free, Investor, and Pro tiers list exact property and deal limits on the Pricing page upfront—no surprises when you hit a wall or need to upgrade.",
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
        "Both products aim to help landlords track performance. Veld leans into deal underwriting, scenario modeling, and calculator surfaces for acquisition work—verify which workflows you need and compare side by side.",
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
    "Cozy was acquired and its path changed; many landlords who used it for tracking are still looking for a home for their numbers. Veld doesn't replace rent collection—it focuses on the investor side: portfolio metrics, deal underwriting, and projections you can pair with whatever payment tool you already use.",
  fitFor: [
    "Former Cozy users who need a dedicated analytics and portfolio metrics layer",
    "Landlords who want cap rate, DSCR, and cash flow tracked per property",
    "Investors adding deal analysis to their workflow for the first time",
  ],
  differentiators: [
    {
      title: "Purpose-built for investor metrics",
      body: "Cap rate, DSCR, cash flow, equity, and LTV are first-class—calculated consistently, visible at portfolio level and per property, not something you have to derive yourself.",
    },
    {
      title: "Deal analyzer for the next acquisition",
      body: "Run the numbers on a property before you buy, save the analysis, and revisit it later. Convert to a portfolio entry when you close.",
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
        "No. Veld does not process rent payments. Use a payments or property-management product for collections and use Veld for analytics and underwriting.",
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
    "Spreadsheets are flexible but brittle: broken formulas, version chaos, and no shared model across deals and owned properties. Veld gives you a single place for portfolio metrics, saved deal analyses, and documented CSV import so you can migrate deliberately.",
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
        "No. Many investors export for ad-hoc analysis or share with a CPA. Veld is the system of record for portfolio and deal math inside the product.",
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
    "Excel works until it doesn't—too many versions, hidden errors, and no standard way to compare a new deal to what you already own. Veld is built for rental investors who want structured metrics, a deal workspace, and imports that match a published CSV contract.",
  differentiators: [
    {
      title: "Investor metrics without formula maintenance",
      body: "Key outputs stay aligned with the same underlying model as the rest of the app.",
    },
    {
      title: "Analyze then own",
      body: "Promote winning assumptions from Analyze into owned properties when you close.",
    },
    {
      title: "Built-in calculators for quick checks",
      body: "Public and in-app calculators share patterns with your portfolio so language stays consistent.",
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
