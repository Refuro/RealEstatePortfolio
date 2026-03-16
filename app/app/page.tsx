import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { Footer } from "@/components/footer";
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
    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
      <Icon className="size-6 text-muted" aria-hidden />
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
      <nav className="flex items-center justify-between border-b border-border px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-foreground">
          Veld
        </Link>
        <div className="flex items-center gap-4 sm:gap-6 text-sm">
          <Link href="/pricing" className="text-muted hover:text-foreground">
            Pricing
          </Link>
          <Link href="/privacy" className="text-muted hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="text-muted hover:text-foreground">
            Terms
          </Link>
          {!userId && (
            <>
              <Link
                href="/sign-in"
                className="text-muted hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>

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

        {/* Value props */}
        <section className="border-t border-border bg-card/50 px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-wide text-muted">
              What you get
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {VALUE_PROPS.map((prop) => (
                <div
                  key={prop.title}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6"
                >
                  <ValuePropIcon Icon={prop.icon} />
                  <h3 className="text-base font-semibold text-foreground">
                    {prop.title}
                  </h3>
                  <p className="text-sm text-muted">{prop.description}</p>
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
