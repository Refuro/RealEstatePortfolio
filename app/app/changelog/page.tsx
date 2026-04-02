import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { Footer } from "@/components/footer";
import { LandingNav } from "@/components/landing-nav";
import { CHANGELOG_ENTRIES } from "@/lib/changelog-data";
import { getAppOrigin } from "@/lib/app-url";

const APP_URL = getAppOrigin();

const title = "Product updates & changelog — Veld Portfolio";
const description =
  "Release notes for Veld Portfolio: rental portfolio analytics, deal analysis, mortgage modeling, and investor-focused improvements. See what’s new.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: [
    "Veld Portfolio",
    "changelog",
    "real estate investor software",
    "rental portfolio analytics",
    "product updates",
  ],
  alternates: { canonical: `${APP_URL}/changelog` },
  openGraph: {
    title,
    description,
    url: "/changelog",
    type: "website",
    siteName: "Veld Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default async function ChangelogPage() {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNav userId={userId} />
      <main className="flex-1 px-4 py-12">
        <article className="mx-auto max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wide text-muted">
            What&apos;s new
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Product updates for real estate investors
          </h1>
          <p className="mt-3 text-base text-muted">
            Veld Portfolio helps you track rental properties, analyze deals, and
            model mortgages—without spreadsheet chaos. Below are notable
            releases and improvements.
          </p>

          <ol className="relative mt-10 space-y-10 border-l-2 border-border pl-6">
            {CHANGELOG_ENTRIES.map((entry) => (
              <li key={`${entry.date}-${entry.title}`} className="relative">
                <span
                  className="absolute -left-[1.9375rem] top-1.5 size-3 rounded-full bg-accent ring-2 ring-background"
                  aria-hidden="true"
                />
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <time
                    dateTime={entry.date}
                    className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-muted shadow-sm"
                  >
                    {entry.date}
                  </time>
                  <h2 className="text-lg font-semibold text-foreground">
                    {entry.title}
                  </h2>
                </div>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground">
                  {entry.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <p className="mt-12 text-sm text-muted">
            Questions? Use{" "}
            <Link href="/contact" className="font-medium text-accent underline">
              Contact
            </Link>{" "}
            or see{" "}
            <Link href="/pricing" className="font-medium text-accent underline">
              Pricing
            </Link>
            .
          </p>
        </article>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
