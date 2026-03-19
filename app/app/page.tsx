import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { Footer } from "@/components/footer";
import { LandingNav } from "@/components/landing-nav";
import {
  LayoutGrid,
  TrendingUp,
  Calculator,
  SlidersHorizontal,
} from "lucide-react";
import { PRICING_DISPLAY } from "@/lib/pricing-display";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://veldportfolio.com";

export const metadata: Metadata = {
  title: "Veld Portfolio — Portfolio Analytics for Real Estate Investors",
  description:
    "Track and analyze your rental property portfolio. Equity, cash flow, rent and value estimates. Replace spreadsheets with Veld.",
  alternates: { canonical: APP_URL + "/" },
  openGraph: {
    title: "Veld Portfolio — Portfolio Analytics for Real Estate Investors",
    description:
      "Track and analyze your rental property portfolio. Equity, cash flow, rent and value estimates.",
    url: "/",
  },
};

const VALUE_PROPS = [
  {
    title: "Replace spreadsheets",
    description: "One place for your portfolio data",
    icon: LayoutGrid,
  },
  {
    title: "Rent & value estimates",
    description: "Market-based rent and value estimates (RentCast)",
    icon: TrendingUp,
  },
  {
    title: "Deal analyzer",
    description: "Analyze deals before you buy",
    icon: Calculator,
  },
  {
    title: "Scenario modeling",
    description: "What-if sliders for rent, value, mortgage",
    icon: SlidersHorizontal,
  },
];

function ValuePropIcon({
  Icon,
}: {
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card sm:size-12">
      <Icon className="size-5 text-muted sm:size-6" aria-hidden />
    </div>
  );
}

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
      <LandingNav userId={userId} />

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center gap-6 px-4 py-12 sm:py-16 md:py-20">
          <p className="text-sm font-medium uppercase tracking-wide text-muted">
            Veld Portfolio
          </p>
          <h1 className="max-w-2xl text-center text-3xl font-semibold text-foreground sm:text-4xl md:text-5xl">
            Track your rental portfolio in one place
          </h1>
          <p className="max-w-lg text-center text-base text-muted sm:text-lg">
            See equity, cash flow, and key metrics at a glance.
          </p>
          {deletedParam === "1" && (
            <p className="max-w-md rounded-lg border border-border bg-card px-4 py-3 text-center text-sm text-foreground">
              Your account has been deactivated. You can sign in again to
              restore it.
            </p>
          )}
          {deletedParam === "permanent" && (
            <p className="max-w-md rounded-lg border border-border bg-card px-4 py-3 text-center text-sm text-foreground">
              Your account and data have been permanently deleted.
            </p>
          )}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            {userId ? (
              <>
                <Link
                  href="/dashboard"
                  className="w-full rounded-lg bg-accent px-6 py-3 text-center text-sm font-medium text-accent-foreground hover:bg-accent-hover sm:w-auto"
                >
                  Go to dashboard
                </Link>
                <Link
                  href="/pricing"
                  className="w-full rounded-lg border border-border px-6 py-3 text-center text-sm font-medium hover:bg-subtle sm:w-auto"
                >
                  View pricing
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="w-full rounded-lg bg-accent px-6 py-3 text-center text-sm font-medium text-accent-foreground hover:bg-accent-hover sm:w-auto"
                >
                  Get started free
                </Link>
                <Link
                  href="/pricing"
                  className="w-full rounded-lg border border-border px-6 py-3 text-center text-sm font-medium hover:bg-subtle sm:w-auto"
                >
                  View pricing
                </Link>
              </>
            )}
          </div>
          {!userId && (
            <p className="text-sm text-muted">
              No credit card required for Free.
            </p>
          )}
        </section>

        {/* Product screenshots */}
        <section className="border-t border-border bg-card/30 px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-wide text-muted">
              See it in action
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <img
                  src="/ScreenDashboard.png"
                  alt="Veld Portfolio dashboard showing property value, equity, cash flow, and portfolio metrics"
                  className="w-full rounded-xl border border-border/70 shadow-lg"
                  loading="lazy"
                  width={1280}
                  height={800}
                />
              </div>
              <div>
                <img
                  src="/ScreenMortgage.png"
                  alt="Mortgage workspace with payoff simulation, extra payment controls, and balance projection chart"
                  className="w-full rounded-xl border border-border/70 shadow-lg"
                  loading="lazy"
                  width={1280}
                  height={800}
                />
                <p className="mt-2 text-center text-sm text-muted">
                  Mortgage payoff simulator
                </p>
              </div>
              <div>
                <img
                  src="/ScreenDeal.png"
                  alt="Deal analyzer with income, expenses, deal signal metrics, and investment metrics"
                  className="w-full rounded-xl border border-border/70 shadow-lg"
                  loading="lazy"
                  width={1280}
                  height={800}
                />
                <p className="mt-2 text-center text-sm text-muted">
                  Deal analyzer
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Value props */}
        <section className="border-t border-border bg-card/50 px-4 py-10 sm:py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-wide text-muted sm:mb-8">
              What you get
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8">
              {VALUE_PROPS.map((prop) => (
                <div
                  key={prop.title}
                  className="flex flex-row items-start gap-4 rounded-lg border border-border bg-card p-4 sm:flex-col sm:gap-3 sm:p-6"
                >
                  <ValuePropIcon Icon={prop.icon} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-foreground">
                      {prop.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted sm:mt-1">
                      {prop.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing preview */}
        <section className="border-t border-border px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              Simple pricing
            </h2>
            <p className="mb-6 text-base text-muted">
              Free, Investor, and Pro plans — start free.
            </p>
            <div className="mb-8 flex flex-wrap items-center justify-center gap-4 text-sm">
              <span className="rounded-md border border-border bg-card px-4 py-2 font-medium text-foreground">
                Free $0 · 1 property
              </span>
              <span className="rounded-md border border-border bg-card px-4 py-2 font-medium text-foreground">
                Investor ${PRICING_DISPLAY.investorMonthly}/mo · 5 properties
              </span>
              <span className="rounded-md border border-border bg-card px-4 py-2 font-medium text-foreground">
                Pro ${PRICING_DISPLAY.proMonthly}/mo · 20 properties
              </span>
            </div>
            <Link
              href="/pricing"
              className="inline-flex rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
            >
              View pricing
            </Link>
          </div>
        </section>
      </main>

      <Footer supportEmail={supportEmail} />
    </div>
  );
}
