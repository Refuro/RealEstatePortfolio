import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { Footer } from "@/components/footer";
import { LandingNav } from "@/components/landing-nav";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import { RESOURCE_ARTICLES } from "@/lib/marketing/resource-data";
import { getAppOrigin } from "@/lib/app-url";

const APP_URL = getAppOrigin();

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Plain-language explainers on DSCR, cap rate, cash-on-cash, BRRRR, and rental metrics—plus free calculators. Educational only.",
  alternates: { canonical: `${APP_URL}/resources` },
  openGraph: {
    title: "Resources | Veld Portfolio",
    description: "Investor math reference guides and calculators.",
    url: "/resources",
  },
};

export default async function ResourcesHubPage() {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant="resources_hub_v1" />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <nav className="text-sm text-muted">
            <Link href="/" className="hover:text-foreground hover:underline">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Resources</span>
          </nav>
          <header className="mt-6 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-muted">Learn</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">
              Investor math & strategy
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted">
              Short reference articles—direct answers first, formulas you can scan, and links to free
              calculators. Not financial or lending advice; confirm with your own professionals.
            </p>
          </header>

          <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {RESOURCE_ARTICLES.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/resources/${a.slug}`}
                  className="flex h-full flex-col rounded-lg border border-default bg-card p-5 transition-colors hover:bg-subtle"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {a.category}
                  </span>
                  <span className="mt-2 font-semibold text-foreground">{a.metaTitle}</span>
                  <span className="mt-2 line-clamp-3 text-sm text-muted">{a.metaDescription}</span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-center text-sm text-muted">
            <Link href="/tools" className="font-medium text-foreground hover:underline">
              All calculators
            </Link>
            {" · "}
            <Link href="/pricing" className="font-medium text-foreground hover:underline">
              Pricing
            </Link>
          </p>
        </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
