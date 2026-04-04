import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { Footer } from "@/components/footer";
import { LandingNav } from "@/components/landing-nav";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";
import { COMPETITOR_ALTERNATIVES } from "@/lib/marketing/competitor-data";
import { getAppOrigin } from "@/lib/app-url";

const APP_URL = getAppOrigin();

export const metadata: Metadata = {
  title: "Alternatives",
  description:
    "Compare Veld Portfolio to other rental tracking tools—honest capability snapshots and links to full comparison pages.",
  alternates: { canonical: `${APP_URL}/alternatives` },
  openGraph: {
    title: "Alternatives | Veld Portfolio",
    description: "Compare Veld to other tools for rental investors.",
    url: "/alternatives",
  },
};

export default async function AlternativesHubPage() {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;
  const entries = Object.values(COMPETITOR_ALTERNATIVES);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant="alt_hub_v1" />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <nav className="text-sm text-muted">
            <Link href="/" className="hover:text-foreground hover:underline">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Alternatives</span>
          </nav>
          <header className="mt-6">
            <p className="text-sm font-medium uppercase tracking-wide text-muted">Compare</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">Alternatives</h1>
            <p className="mt-3 text-base text-muted">
              Side-by-side pages for investors evaluating Veld against other products. Each page
              lists capabilities honestly—confirm details against your own workflow.
            </p>
          </header>
          <ul className="mt-8 space-y-4">
            {entries.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/alternatives/${c.slug}`}
                  className="block rounded-lg border border-default bg-card p-5 transition-colors hover:bg-subtle"
                >
                  <span className="font-semibold text-foreground">
                    {c.competitorColumnLabel} alternative
                  </span>
                  <p className="mt-1 text-sm text-muted">{c.lede}</p>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center text-sm text-muted">
            <Link href="/tools" className="font-medium text-foreground hover:underline">
              All calculators
            </Link>
            {" · "}
            <FunnelCtaLink
              href="/pricing"
              placement="alternatives_hub_footer"
              ctaId="pricing"
              planIntent="free"
              landingVariant="alt_hub_v1"
              className="font-medium text-foreground hover:underline"
            >
              Pricing
            </FunnelCtaLink>
          </p>
        </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
