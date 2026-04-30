import Link from "next/link";
import type { Metadata } from "next";
import { MockupFrame } from "@/components/mockups/mockup-frame";
import { DashboardMockup } from "@/components/mockups/dashboard-mockup";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import {
  Building2,
  MapPin,
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
    "Live portfolio numbers and deal analysis for landlords — without spreadsheet upkeep. Track equity, cash flow, and rent estimates in one place.",
  alternates: { canonical: APP_URL + "/" },
  openGraph: {
    title: "Veld Portfolio — Track Your Rental Properties in One Place",
    description:
      "Live portfolio numbers and deal analysis in one place — equity, cash flow, rent estimates, and underwriting.",
    url: "/",
  },
};

const HERO_STEPS = [
  {
    title: "Add each property once",
    description: "Price, rent, expenses and mortgage in one profile.",
    icon: Building2,
  },
  {
    title: "Track performance",
    description: "Equity, cash flow, cap rate and LTV. Always current.",
    icon: LayoutGrid,
  },
  {
    title: "Benchmark your rent",
    description: "Live estimates show if your rent is above or below market.",
    icon: TrendingUp,
  },
  {
    title: "Underwrite your next deal",
    description: "Cash flow, DSCR and cash-on-cash before you commit.",
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
  "Portfolio insights: what's working, what's at risk, what to do next",
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
        <section className="bg-gradient-to-b from-accent/[0.04] to-transparent px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-[5fr_6fr] lg:items-center">
              <div className="space-y-4">
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
                  className="hero-animate max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl"
                  style={{ transitionDelay: "0ms" }}
                >
                  Replace spreadsheet chaos with one clear view.
                </h1>

                <p
                  className="hero-animate max-w-xl text-base text-muted sm:text-lg"
                  style={{ transitionDelay: "80ms" }}
                >
                  Track equity, cash flow, and rent estimates. Always current,
                  no manual updates.
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
                        Get started free
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
                    Free plan —{" "}
                    <span className="font-medium text-foreground">
                      no card required
                    </span>
                    . First property in about 60 seconds.
                  </p>
                )}

                <div
                  className="hero-animate grid grid-cols-2 gap-3"
                  style={{ transitionDelay: "300ms" }}
                >
                  {HERO_STEPS.map((step) => (
                    <div
                      key={step.title}
                      className="rounded-lg border border-border bg-card p-4 shadow-sm [border-top:2px_solid_color-mix(in_srgb,var(--accent)_30%,transparent)]"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex shrink-0 items-center justify-center rounded-md bg-accent/10 p-1.5">
                          <step.icon
                            className="size-3.5 text-accent"
                            aria-hidden
                          />
                        </span>
                        <p className="text-sm font-semibold text-foreground">
                          {step.title}
                        </p>
                      </div>
                      <p className="text-xs leading-relaxed text-muted">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="hero-animate relative hidden md:block"
                style={{ transitionDelay: "360ms" }}
              >
                <div
                  className="pointer-events-none absolute -inset-10 rounded-full"
                  style={{
                    background:
                      "radial-gradient(ellipse 80% 70% at 55% 45%, color-mix(in srgb, var(--accent) 32%, transparent) 0%, color-mix(in srgb, var(--accent) 10%, transparent) 45%, transparent 70%)",
                  }}
                  aria-hidden
                />
                <MockupFrame
                  chrome
                  chromeUrl="veldportfolio.com/dashboard"
                  internalWidth={920}
                  className="relative z-10 rounded-xl border border-border shadow-xl"
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
              className="hero-animate flex flex-col items-center gap-2.5 text-center sm:flex-row sm:gap-8"
              style={{ transitionDelay: "400ms" }}
            >
              <p className="flex items-center gap-1.5 text-sm text-muted">
                <Building2 className="size-3.5 shrink-0 text-accent" aria-hidden />
                <span>
                  Built for landlords with{" "}
                  <span className="font-medium text-foreground">1–10 properties</span>
                </span>
              </p>
              <span
                className="hidden h-4 w-px bg-border sm:block"
                aria-hidden
              />
              <p className="flex items-center gap-1.5 text-sm text-muted">
                <LayoutGrid className="size-3.5 shrink-0 text-accent" aria-hidden />
                <span>
                  Track your portfolio and{" "}
                  <span className="font-medium text-foreground">analyze new deals</span>
                </span>
              </p>
              <span
                className="hidden h-4 w-px bg-border sm:block"
                aria-hidden
              />
              <p className="flex items-center gap-1.5 whitespace-nowrap text-sm text-muted">
                <MapPin className="size-3.5 shrink-0 text-accent" aria-hidden />
                <span>
                  Used across{" "}
                  <span className="font-medium text-foreground">20+ states</span>
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section
          aria-label="User reviews"
          className="border-b border-border bg-background px-4 py-8 sm:py-10"
        >
          <AnimatedSection>
            <div className="mx-auto max-w-5xl">
              <div className="mb-6">
                <div className="flex justify-center sm:justify-start">
                  <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                    What users say
                  </span>
                </div>
                <p className="mt-2 text-center text-xs text-muted sm:text-left">
                  From verified Fazier reviews
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    quote:
                      "When they reached out to have me try this, I was pretty sure I wasn't going to use this, but it's actually pretty great, everything just works.",
                    name: "Nardi Braho",
                    credential: "Landlord, 3 properties",
                  },
                  {
                    quote:
                      "This app has saved me so much time messing with my spreadsheets. I've been using it to track my single-units and it's been great.",
                    name: "Elli Tanner",
                    credential: "Landlord, 11 properties",
                  },
                  {
                    quote:
                      "The deal analysis feature is great. I plan to use it as I track more rentals.",
                    name: "Daniel Kjellén",
                    credential: "Landlord, 1 property",
                  },
                ].map(({ quote, name, credential }) => (
                  <figure
                    key={name}
                    className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md [border-top:2px_solid_color-mix(in_srgb,var(--accent)_30%,transparent)]"
                  >
                    <div className="flex flex-1 flex-col gap-1.5">
                      <div
                        className="text-2xl font-semibold leading-none text-accent/35"
                        aria-hidden
                      >
                        &ldquo;
                      </div>
                      <blockquote className="flex-1 text-sm leading-relaxed text-foreground">
                        {quote}
                      </blockquote>
                    </div>
                    <figcaption className="flex items-center gap-2.5">
                      <span
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent"
                        aria-hidden
                      >
                        {name[0]}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {name}
                        </p>
                        <p className="text-xs text-muted">{credential}</p>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </AnimatedSection>
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
