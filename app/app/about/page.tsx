import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { Check, ChevronRight } from "lucide-react";
import { AboutProfileSidebar } from "@/components/about/about-profile-sidebar";
import { Footer } from "@/components/footer";
import { LandingNav } from "@/components/landing-nav";
import { AnimatedSection } from "@/components/marketing/animated-section";
import {
  ABOUT_INTRO_FIRST,
  ABOUT_INTRO_SECOND,
  ABOUT_LEDE,
  ABOUT_TITLE,
  ABOUT_WHY_VELD_BULLETS,
  ABOUT_WHY_VELD_CLOSING,
  ABOUT_WHY_VELD_TITLE,
} from "@/lib/about-content";
import { getAppOrigin } from "@/lib/app-url";

const APP_URL = getAppOrigin();

const title = "About — Christian Spencer & Veld Portfolio";
const description =
  "Why Veld Portfolio exists: one place for small landlords to track rentals and underwrite deals, built by founder Christian Spencer.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: [
    "Veld Portfolio",
    "founder",
    "rental portfolio software",
    "real estate investor",
    "Christian Spencer",
  ],
  alternates: { canonical: `${APP_URL}/about` },
  openGraph: {
    title,
    description,
    url: "/about",
    type: "website",
    siteName: "Veld Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default async function AboutPage() {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNav userId={userId} />
      <main className="flex-1 px-4 py-12 md:py-14">
        <article className="mx-auto min-w-0 max-w-4xl">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[260px_1fr] md:gap-12 md:items-start">
            <AboutProfileSidebar />
            <div className="min-w-0 space-y-8">
              <header className="space-y-4">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {ABOUT_TITLE}
                </h1>
                <p className="text-lg leading-relaxed text-foreground/80">{ABOUT_LEDE}</p>
              </header>

              <div className="space-y-6">
                <p className="text-base leading-relaxed text-foreground">{ABOUT_INTRO_FIRST}</p>
                <p className="border-l-2 border-border pl-4 text-base leading-relaxed text-muted">
                  {ABOUT_INTRO_SECOND}
                </p>
              </div>

              <section aria-labelledby="why-veld-heading">
                <AnimatedSection>
                  <div className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
                    <h2
                      id="why-veld-heading"
                      className="text-xl font-semibold text-foreground"
                    >
                      {ABOUT_WHY_VELD_TITLE}
                    </h2>
                    <ul className="mt-4 space-y-3">
                      {ABOUT_WHY_VELD_BULLETS.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <Check
                            className="mt-0.5 size-4 shrink-0 text-positive"
                            aria-hidden
                          />
                          <span className="text-sm leading-relaxed text-muted">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 text-sm leading-relaxed text-muted">
                      {ABOUT_WHY_VELD_CLOSING}
                    </p>
                  </div>
                </AnimatedSection>
              </section>

              {userId ? (
                <p className="text-sm text-muted">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 font-medium text-foreground transition-colors duration-150 hover:text-accent"
                  >
                    Back to your dashboard
                    <ChevronRight className="size-4" aria-hidden />
                  </Link>
                </p>
              ) : null}
            </div>
          </div>
        </article>
      </main>

      <Footer supportEmail={supportEmail} />
    </div>
  );
}
