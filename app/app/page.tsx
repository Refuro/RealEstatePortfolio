import Link from "next/link";
import type { Metadata } from "next";
import { MockupFrame } from "@/components/mockups/mockup-frame";
import { DashboardMockup } from "@/components/mockups/dashboard-mockup";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import {
  Building2,
  Calculator,
  Check,
  ChevronRight,
  LayoutGrid,
  Minus,
  SlidersHorizontal,
  Target,
  TrendingUp,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { LandingNav } from "@/components/landing-nav";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";
import { AnimatedSection } from "@/components/marketing/animated-section";
import { PRICING_DISPLAY } from "@/lib/pricing-display";
import { PLAN_DEAL_LIMITS, PLAN_PROPERTY_LIMITS } from "@/lib/plans";
import { getAppOrigin } from "@/lib/app-url";

const PublicCalculator = dynamic(
  () =>
    import("@/components/marketing/public-calculator").then(
      (m) => m.PublicCalculator
    ),
  { loading: () => <div className="min-h-[240px]" aria-hidden /> }
);

const APP_URL = getAppOrigin();
const LANDING_VARIANT = "home_v4";

export const metadata: Metadata = {
  title: {
    absolute: "Veld Portfolio — Track Your Rental Properties in One Place",
  },
  description:
    "Track equity, cash flow, and rent estimates across your rental portfolio. Analyze deals before you buy. Replace your spreadsheet with Veld.",
  alternates: { canonical: APP_URL + "/" },
  openGraph: {
    title: "Veld Portfolio — Track Your Rental Properties in One Place",
    description:
      "Track equity, cash flow, and rent estimates across your rental portfolio. Analyze deals before you buy.",
    url: "/",
  },
};

const HERO_STEPS = [
  {
    title: "Add each property once",
    description:
      "Purchase price, value, rent, expenses, and mortgage — one profile per property.",
    icon: Building2,
  },
  {
    title: "Track portfolio performance",
    description:
      "Equity, cash flow, cap rate, and LTV — always current, no formula maintenance.",
    icon: LayoutGrid,
  },
  {
    title: "Underwrite your next deal",
    description: "Cash flow, cap rate, DSCR, and CoC return before you commit.",
    icon: Target,
  },
];

const VALUE_PROPS = [
  {
    title: "Always-current portfolio numbers",
    description:
      "Equity, cash flow, cap rate, and LTV across every property — pulled together automatically. Enter your data once, never again.",
    icon: LayoutGrid,
  },
  {
    title: "Know if your rent is above market",
    description:
      "Live rent and value estimates from real market data. See where you stand without switching tabs or Googling comps.",
    icon: TrendingUp,
  },
  {
    title: "Underwrite a deal in minutes",
    description:
      "Enter purchase price, rent, and expenses. Get cash flow, cap rate, DSCR, and cash-on-cash return instantly.",
    icon: Calculator,
  },
  {
    title: "Model what happens next",
    description:
      "Adjust rent, value, and mortgage assumptions with sliders. See how your returns shift over 5, 10, or 20 years.",
    icon: SlidersHorizontal,
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Add a property",
    description:
      "Enter purchase price, estimated value, rent, expenses, and mortgage details. Takes a few minutes per property.",
    icon: Building2,
  },
  {
    step: "02",
    title: "See your portfolio at a glance",
    description:
      "Equity, cash flow, cap rate, and LTV — all in one dashboard. Always current, no manual updates.",
    icon: LayoutGrid,
  },
  {
    step: "03",
    title: "Analyze deals before you buy",
    description:
      "Run full deal analyses, save and compare them, and promote a winning deal to your portfolio when you close.",
    icon: Calculator,
  },
];

const VELD_DOES = [
  "Portfolio tracking — equity, cash flow, cap rate, LTV",
  "Deal underwriting — cash flow, DSCR, CoC return, cap rate",
  "Scenario modeling with 5, 10, and 20-year projections",
  "Mortgage amortization and payoff tracking",
  "Live rent and value estimates via RentCast",
  "CSV import and export",
];

const VELD_DOES_NOT = [
  "Rent collection or payment processing",
  "Bank sync or transaction import",
  "Full general-ledger accounting",
  "Tenant screening or lease management",
];

const CALCULATOR_LINKS = [
  { label: "Deal analyzer", href: "/investment-property-calculator" },
  { label: "BRRRR calculator", href: "/tools/brrr" },
  { label: "Fix and flip calculator", href: "/tools/fix-and-flip" },
  { label: "STR vs LTR calculator", href: "/tools/str-vs-ltr" },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { userId } = await auth();
  const params = await searchParams;
  const deletedParam = params.deleted;
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant={LANDING_VARIANT} />

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="bg-gradient-to-b from-accent/[0.04] to-transparent px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:items-center">
              <div className="space-y-5">
                {deletedParam === "1" && (
                  <p className="max-w-md rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm">
                    Your account has been deactivated. You can sign in again to
                    restore it.
                  </p>
                )}
                {deletedParam === "permanent" && (
                  <p className="max-w-md rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm">
                    Your account and data have been permanently deleted.
                  </p>
                )}

                <h1
                  className="hero-animate max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl"
                  style={{ transitionDelay: "0ms" }}
                >
                  Replace spreadsheet chaos with one clear view of your rental
                  portfolio
                </h1>

                <p
                  className="hero-animate max-w-xl text-base text-muted sm:text-lg"
                  style={{ transitionDelay: "80ms" }}
                >
                  Add your properties once and get equity, cash flow, rent
                  estimates, and deal analysis — always current, without
                  spreadsheet maintenance.
                </p>

                <div
                  className="hero-animate flex flex-col gap-3 sm:flex-row sm:items-center"
                  style={{ transitionDelay: "160ms" }}
                >
                  {userId ? (
                    <>
                      <FunnelCtaLink
                        href="/dashboard"
                        placement="landing_hero_signed_in"
                        ctaId="go_to_dashboard"
                        landingVariant={LANDING_VARIANT}
                        className="cta-accent-glow inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover sm:w-auto"
                      >
                        Go to dashboard
                      </FunnelCtaLink>
                      <FunnelCtaLink
                        href="/pricing"
                        placement="landing_hero_signed_in"
                        ctaId="view_pricing"
                        landingVariant={LANDING_VARIANT}
                        className="inline-flex min-h-[44px] items-center justify-center gap-1 text-sm font-medium text-muted transition-colors duration-150 hover:text-foreground sm:justify-start"
                      >
                        View pricing
                        <ChevronRight className="size-3.5" aria-hidden />
                      </FunnelCtaLink>
                    </>
                  ) : (
                    <>
                      <FunnelCtaLink
                        href="/sign-up?intent=free"
                        placement="landing_hero"
                        ctaId="get_started_free"
                        planIntent="free"
                        landingVariant={LANDING_VARIANT}
                        className="cta-accent-glow inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover sm:w-auto"
                      >
                        Start your free trial
                      </FunnelCtaLink>
                      <FunnelCtaLink
                        href="/pricing"
                        placement="landing_hero"
                        ctaId="view_pricing"
                        landingVariant={LANDING_VARIANT}
                        className="inline-flex min-h-[44px] items-center justify-center gap-1 text-sm font-medium text-muted transition-colors duration-150 hover:text-foreground sm:justify-start"
                      >
                        See pricing
                        <ChevronRight className="size-3.5" aria-hidden />
                      </FunnelCtaLink>
                    </>
                  )}
                </div>

                {!userId && (
                  <p
                    className="hero-animate text-sm text-muted"
                    style={{ transitionDelay: "220ms" }}
                  >
                    <span className="font-medium text-foreground">No credit card required.</span>{" "}
                    Your first property in about 60 seconds.
                  </p>
                )}

                <div
                  className="hero-animate sm:hidden"
                  style={{ transitionDelay: "280ms" }}
                >
                  <MockupFrame
                    className="rounded-xl border border-border shadow-lg"
                    ariaLabel="Veld Portfolio dashboard showing property equity, cash flow, and portfolio metrics"
                  >
                    <DashboardMockup />
                  </MockupFrame>
                </div>

                <div
                  className="hero-animate hidden gap-2 sm:grid sm:grid-cols-3"
                  style={{ transitionDelay: "300ms" }}
                >
                  {HERO_STEPS.map((step) => (
                    <div
                      key={step.title}
                      className="rounded-lg border border-border bg-card p-3 shadow-sm"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <step.icon
                          className="size-4 text-accent"
                          aria-hidden
                        />
                        <p className="text-sm font-semibold text-foreground">
                          {step.title}
                        </p>
                      </div>
                      <p className="text-xs text-muted">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden md:block">
                <MockupFrame
                  chrome
                  className="rounded-xl border border-border shadow-xl"
                  ariaLabel="Veld Portfolio dashboard showing property equity, cash flow, cap rate, and portfolio metrics"
                >
                  <DashboardMockup />
                </MockupFrame>
              </div>
            </div>
          </div>
        </section>

        {/* Social proof strip */}
        <section
          aria-label="Product highlights"
          className="border-y border-border bg-subtle px-4 py-6"
        >
          <div className="mx-auto max-w-5xl">
            <div
              className="hero-animate flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-8"
              style={{ transitionDelay: "400ms" }}
            >
              <p className="text-sm text-muted">
                Built for landlords with{" "}
                <span className="font-medium text-foreground">
                  1–10 properties
                </span>
              </p>
              <span
                className="hidden h-4 w-px bg-border sm:block"
                aria-hidden
              />
              <p className="text-sm text-muted">
                Track your portfolio and{" "}
                <span className="font-medium text-foreground">
                  analyze new deals
                </span>
              </p>
              <span
                className="hidden h-4 w-px bg-border sm:block"
                aria-hidden
              />
              <p className="text-sm text-muted">
                Free plan —{" "}
                <span className="font-medium text-foreground">
                  no card required
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Calculator */}
        <section
          aria-labelledby="calculator-heading"
          className="border-b border-border bg-subtle px-4 py-12 sm:py-16"
        >
          <AnimatedSection>
            <div className="mx-auto max-w-5xl">
              <div className="mb-3 flex justify-center sm:justify-start">
                <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                  Free tool
                </span>
              </div>
              <h2
                id="calculator-heading"
                className="text-2xl font-semibold text-foreground"
              >
                Underwrite a deal in 30 seconds
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted">
                Cash flow, cap rate, DSCR, and cash-on-cash return — right here,
                no account needed. Sign up to save, compare, and track deals
                over time.
              </p>
              <div className="mt-6">
                <PublicCalculator compact />
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <FunnelCtaLink
                  href="/investment-property-calculator"
                  placement="landing_calculator"
                  ctaId="open_public_calculator"
                  landingVariant={LANDING_VARIANT}
                  className="inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-accent transition-colors duration-150 hover:underline"
                >
                  Open full calculator
                  <ChevronRight className="size-4" aria-hidden />
                </FunnelCtaLink>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {CALCULATOR_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="inline-flex min-h-[44px] items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
                    >
                      {item.label}
                      <ChevronRight className="size-3.5" aria-hidden />
                    </Link>
                  ))}
                </div>
              </div>
              {!userId && (
                <p className="mt-4 text-sm text-muted">
                  Want to save and compare deals?{" "}
                  <FunnelCtaLink
                    href="/sign-up?intent=free"
                    placement="landing_calculator"
                    ctaId="signup_from_calculator"
                    planIntent="free"
                    landingVariant={LANDING_VARIANT}
                    className="font-medium text-accent transition-colors duration-150 hover:underline"
                  >
                    Create a free account
                  </FunnelCtaLink>
                </p>
              )}
            </div>
          </AnimatedSection>
        </section>

        {/* Value props */}
        <section
          aria-labelledby="value-props-heading"
          className="px-4 py-12 sm:py-16"
        >
          <AnimatedSection>
            <div className="mx-auto max-w-5xl">
              <div className="mb-3 flex justify-center sm:justify-start">
                <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                  Why Veld
                </span>
              </div>
              <h2
                id="value-props-heading"
                className="mb-2 text-2xl font-semibold text-foreground"
              >
                The numbers that matter, always current
              </h2>
              <p className="mb-8 text-base text-muted">
                For small landlords who want clarity, not complexity.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {VALUE_PROPS.map((prop) => (
                  <div
                    key={prop.title}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <prop.icon className="size-5 text-accent" aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        {prop.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        {prop.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </section>

        {/* How it works */}
        <section
          aria-labelledby="how-it-works-heading"
          className="px-4 py-12 sm:py-16"
        >
          <AnimatedSection>
            <div className="mx-auto max-w-5xl">
              <div className="mb-3 flex justify-center sm:justify-start">
                <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                  How it works
                </span>
              </div>
              <h2
                id="how-it-works-heading"
                className="mb-2 text-2xl font-semibold text-foreground"
              >
                Up and running in minutes
              </h2>
              <p className="mb-10 text-base text-muted">
                No learning curve. No onboarding call.
              </p>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {HOW_IT_WORKS.map((item) => (
                  <div key={item.step} className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold tabular-nums text-accent">
                        {item.step}
                      </span>
                      <item.icon className="size-5 text-muted" aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </section>

        {/* Honest scope */}
        <section
          aria-labelledby="scope-heading"
          className="border-y border-border bg-subtle px-4 py-12 sm:py-16"
        >
          <AnimatedSection>
            <div className="mx-auto max-w-5xl">
              <h2
                id="scope-heading"
                className="mb-2 text-2xl font-semibold text-foreground"
              >
                Built for one job, done well
              </h2>
              <p className="mb-8 max-w-2xl text-base text-muted">
                Veld is portfolio analytics and deal underwriting—not a full
                property management platform. It works alongside your existing
                banking, PM, or accounting tools.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-foreground">
                    What Veld does
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {VELD_DOES.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-positive"
                          aria-hidden
                        />
                        <span className="text-sm text-muted">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-foreground">
                    What it doesn&apos;t do
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {VELD_DOES_NOT.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <Minus
                          className="mt-0.5 size-4 shrink-0 text-muted"
                          aria-hidden
                        />
                        <span className="text-sm text-muted">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-xs text-muted">
                    Not accounting software. Not rent collection. Just the
                    investor numbers that matter.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </section>

        {/* Pricing preview */}
        <section
          aria-labelledby="pricing-heading"
          className="px-4 py-12 sm:py-16"
        >
          <AnimatedSection>
            <div className="mx-auto max-w-3xl">
              <div className="mb-3 flex justify-center sm:justify-start">
                <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                  Pricing
                </span>
              </div>
              <h2
                id="pricing-heading"
                className="mb-2 text-2xl font-semibold text-foreground"
              >
                Simple pricing
              </h2>
              <p className="mb-8 text-base text-muted">
                Try everything free for 14 days. No credit card required.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <p className="text-base font-semibold text-foreground">
                    Free
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                    $0
                    <span className="text-base font-normal text-muted">/mo</span>
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    {PLAN_PROPERTY_LIMITS.free} property &middot;{" "}
                    {PLAN_DEAL_LIMITS.free} saved deals
                  </p>
                </div>

                <div className="rounded-xl border border-accent/50 bg-accent/5 p-5 shadow-sm ring-2 ring-accent/25">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-base font-semibold text-foreground">
                      Investor
                    </p>
                    <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                      Popular
                    </span>
                  </div>
                  <p className="text-2xl font-semibold tabular-nums text-foreground">
                    ${PRICING_DISPLAY.investorMonthly}
                    <span className="text-base font-normal text-muted">/mo</span>
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    {PLAN_PROPERTY_LIMITS.investor} properties &middot;{" "}
                    {PLAN_DEAL_LIMITS.investor} saved deals
                  </p>
                  <p className="mt-1 tabular-nums text-xs text-muted">
                    ${PRICING_DISPLAY.investorYearly}/year (2 months free)
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <p className="text-base font-semibold text-foreground">Pro</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                    ${PRICING_DISPLAY.proMonthly}
                    <span className="text-base font-normal text-muted">/mo</span>
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    {PLAN_PROPERTY_LIMITS.pro} properties &middot;{" "}
                    {PLAN_DEAL_LIMITS.pro} saved deals
                  </p>
                  <p className="mt-1 tabular-nums text-xs text-muted">
                    ${PRICING_DISPLAY.proYearly}/year (2 months free)
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <FunnelCtaLink
                  href="/pricing"
                  placement="landing_pricing_preview"
                  ctaId="view_pricing"
                  landingVariant={LANDING_VARIANT}
                  className="inline-flex min-h-[44px] items-center gap-1 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors duration-150 hover:bg-subtle"
                >
                  See full pricing
                  <ChevronRight className="size-4" aria-hidden />
                </FunnelCtaLink>
                {!userId && (
                  <FunnelCtaLink
                    href="/sign-up?intent=free"
                    placement="landing_pricing_preview"
                    ctaId="signup_from_pricing"
                    planIntent="free"
                    landingVariant={LANDING_VARIANT}
                    className="inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-muted transition-colors duration-150 hover:text-foreground"
                  >
                    or get started free
                    <ChevronRight className="size-3.5" aria-hidden />
                  </FunnelCtaLink>
                )}
              </div>
            </div>
          </AnimatedSection>
        </section>

        {/* Bottom CTA — signed-out only */}
        {!userId && (
          <section
            aria-labelledby="bottom-cta-heading"
            className="border-y border-border bg-subtle px-4 py-16 sm:py-20"
          >
            <AnimatedSection>
              <div className="mx-auto max-w-xl text-center">
                <h2
                  id="bottom-cta-heading"
                  className="text-2xl font-semibold text-foreground"
                >
                  Start tracking your portfolio today
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-base text-muted">
                  Full Investor access for 14 days. No card required.
                </p>
                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <FunnelCtaLink
                    href="/sign-up?intent=free"
                    placement="landing_bottom_cta"
                    ctaId="create_free_account"
                    planIntent="free"
                    landingVariant={LANDING_VARIANT}
                    className="cta-accent-glow inline-flex min-h-[44px] items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
                  >
                    Start your free trial
                  </FunnelCtaLink>
                  <FunnelCtaLink
                    href="/vs/spreadsheets"
                    placement="landing_bottom_cta"
                    ctaId="compare_vs_spreadsheets"
                    landingVariant={LANDING_VARIANT}
                    className="inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-muted transition-colors duration-150 hover:text-foreground"
                  >
                    Compare Veld vs spreadsheets
                    <ChevronRight className="size-4" aria-hidden />
                  </FunnelCtaLink>
                </div>
                <p className="mt-3 text-xs text-muted">
                  Set up in under a minute.
                </p>
              </div>
            </AnimatedSection>
          </section>
        )}
      </main>

      <Footer supportEmail={supportEmail} />
    </div>
  );
}
