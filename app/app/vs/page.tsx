import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { Footer } from "@/components/footer";
import { LandingNav } from "@/components/landing-nav";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import { COMPETITOR_VS } from "@/lib/marketing/competitor-data";
import { getAppOrigin } from "@/lib/app-url";

const APP_URL = getAppOrigin();

export const metadata: Metadata = {
  title: "Compare",
  description:
    "See how Veld Portfolio compares to spreadsheets and Excel-based rental trackers for portfolio and deal math.",
  alternates: { canonical: `${APP_URL}/vs` },
  openGraph: {
    title: "Compare | Veld Portfolio",
    description: "Veld vs spreadsheets for rental property investors.",
    url: "/vs",
  },
};

export default async function CompareHubPage() {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;
  const entries = Object.values(COMPETITOR_VS);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant="vs_hub_v1" />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <nav className="text-sm text-muted">
            <Link href="/" className="hover:text-foreground hover:underline">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Compare</span>
          </nav>
          <header className="mt-6">
            <p className="text-sm font-medium uppercase tracking-wide text-muted">Compare</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">
              Veld vs spreadsheets
            </h1>
            <p className="mt-3 text-base text-muted">
              Structured comparisons for investors moving off generic spreadsheets or Excel trackers.
            </p>
          </header>
          <ul className="mt-8 space-y-4">
            {entries.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/vs/${c.slug}`}
                  className="block rounded-lg border border-default bg-card p-5 transition-colors hover:bg-subtle"
                >
                  <span className="font-semibold text-foreground">{c.h1}</span>
                  <p className="mt-1 text-sm text-muted">{c.lede}</p>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center text-sm text-muted">
            <Link href="/alternatives" className="font-medium text-foreground hover:underline">
              Tool alternatives
            </Link>
            {" · "}
            <Link href="/tools" className="font-medium text-foreground hover:underline">
              Calculators
            </Link>
          </p>
        </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
