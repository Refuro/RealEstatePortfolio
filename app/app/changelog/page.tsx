import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { Footer } from "@/components/footer";
import { LandingNav } from "@/components/landing-nav";
import { CHANGELOG_ENTRIES } from "@/lib/changelog-data";
import { getAppOrigin } from "@/lib/app-url";

const APP_URL = getAppOrigin();

/** Stagger delays for `reveal-up` (see globals.css); cycle when there are many entries. */
const REVEAL_STAGGER = [
  "reveal-up-d1",
  "reveal-up-d2",
  "reveal-up-d3",
  "reveal-up-d4",
  "reveal-up-d5",
] as const;

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
      <main className="flex-1 px-4 py-12 md:py-14">
        <article className="mx-auto min-w-0 max-w-2xl">
          <header className="hero-animate">
            <div className="mb-3 flex justify-start">
              <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                What&apos;s new
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Product updates for real estate investors
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted">
              Veld Portfolio helps you track rental properties, analyze deals, and
              model mortgages—without spreadsheet chaos. Below are notable
              releases and improvements.
            </p>
          </header>

          <ol className="relative mt-10 space-y-8 border-l-2 border-border pl-6 md:space-y-10">
            {CHANGELOG_ENTRIES.map((entry, index) => (
              <li
                key={`${entry.date}-${entry.title}`}
                className={`relative reveal-up ${REVEAL_STAGGER[index % REVEAL_STAGGER.length]}`}
              >
                <span
                  className="absolute -left-[1.9375rem] top-5 size-3 rounded-full bg-accent ring-2 ring-background"
                  aria-hidden="true"
                />
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm md:p-5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <time
                      dateTime={entry.date}
                      className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium tabular-nums text-muted shadow-sm"
                    >
                      {entry.date}
                    </time>
                    <h2 className="text-lg font-semibold text-foreground">
                      {entry.title}
                    </h2>
                  </div>
                  <ul className="mt-4 list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-foreground">
                    {entry.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-12 text-sm leading-relaxed text-muted">
            Questions? Use{" "}
            <Link
              href="/contact"
              className="rounded-sm px-1 py-2.5 font-medium text-accent underline underline-offset-2 transition-colors duration-150 hover:text-accent-hover sm:py-1.5"
            >
              Contact
            </Link>{" "}
            or see{" "}
            <Link
              href="/pricing"
              className="rounded-sm px-1 py-2.5 font-medium text-accent underline underline-offset-2 transition-colors duration-150 hover:text-accent-hover sm:py-1.5"
            >
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
