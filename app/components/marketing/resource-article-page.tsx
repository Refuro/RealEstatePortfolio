import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { Footer } from "@/components/footer";
import { LandingNav } from "@/components/landing-nav";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import {
  CalculatorFaqJsonLd,
  CalculatorFaqSection,
} from "@/components/marketing/calculator-faq";
import type { ResourceArticle } from "@/lib/marketing/resource-data";
import { getResourceArticle } from "@/lib/marketing/resource-data";

const PublicCalculator = dynamic(
  () => import("@/components/marketing/public-calculator").then((m) => m.PublicCalculator),
  { loading: () => <div className="min-h-[240px]" aria-hidden /> }
);

const BrrrCalculator = dynamic(
  () => import("@/components/marketing/brrr-calculator").then((m) => m.BrrrCalculator),
  { loading: () => <div className="min-h-[240px]" aria-hidden /> }
);

function ArticleSections({ article }: { article: ResourceArticle }) {
  return (
    <div className="max-w-none">
      {article.sections.map((section) => {
        if (section.kind === "h2") {
          return (
            <section
              key={section.id}
              id={section.id}
              className="mt-10 border-t border-border/80 pt-10 first:mt-0 first:border-t-0 first:pt-0"
            >
              <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
              {section.paragraphs.map((p, i) => (
                <p key={i} className="mt-3 text-sm leading-relaxed text-muted md:text-base">
                  {p}
                </p>
              ))}
            </section>
          );
        }
        if (section.kind === "formula") {
          return (
            <section key={section.id} id={section.id} className="mt-10 border-t border-border/80 pt-10">
              <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
              <pre className="mt-4 overflow-x-auto rounded-lg border border-default bg-subtle p-4 font-mono text-sm text-foreground">
                {section.lines.join("\n")}
              </pre>
              {section.after?.map((p, i) => (
                <p key={i} className="mt-3 text-sm leading-relaxed text-muted md:text-base">
                  {p}
                </p>
              ))}
            </section>
          );
        }
        return (
          <section key={section.id} id={section.id} className="mt-10 border-t border-border/80 pt-10">
            <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
            <div className="mt-4 overflow-x-auto rounded-lg border border-default bg-card">
              <table className="w-full min-w-[280px] text-left text-sm">
                <thead>
                  <tr className="border-b border-default">
                    <th
                      scope="col"
                      className="px-3 py-3 text-sm font-semibold uppercase tracking-wide text-muted"
                    >
                      {section.headers[0]}
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-sm font-semibold uppercase tracking-wide text-muted"
                    >
                      {section.headers[1]}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row) => (
                    <tr key={row[0]} className="border-b border-default last:border-b-0">
                      <td className="px-3 py-3 align-top font-medium text-foreground">{row[0]}</td>
                      <td className="px-3 py-3 text-muted">{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {section.footnote ? (
              <p className="mt-3 text-xs text-muted">{section.footnote}</p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

export async function ResourceArticlePage({ article }: { article: ResourceArticle }) {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant={article.landingVariant} />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <CalculatorFaqJsonLd items={article.faqs} />

          <nav className="text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground hover:underline">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/resources" className="hover:text-foreground hover:underline">
              Resources
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{article.metaTitle}</span>
          </nav>

          <header className="mt-6">
            <p className="text-sm font-medium uppercase tracking-wide text-muted">
              Reference · {article.category}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">{article.h1}</h1>
          </header>

          <ArticleSections article={article} />

          {(article.calculatorEmbed === "public" || article.calculatorEmbed === "brrr") && (
            <section
              className="mt-12 border-t border-border/80 pt-10"
              aria-labelledby="try-calculator-heading"
            >
              <h2 id="try-calculator-heading" className="text-lg font-semibold text-foreground">
                Try the calculator
              </h2>
              <p className="mt-2 text-sm text-muted">
                Estimate with your own inputs—numbers are educational, not lender instructions.
              </p>
              <div className="mt-6 rounded-lg border border-default bg-card/50 p-4">
                {article.calculatorEmbed === "public" && (
                  <PublicCalculator compact showCta landingVariant={article.landingVariant} />
                )}
                {article.calculatorEmbed === "brrr" && (
                  <BrrrCalculator compact showCta landingVariant={article.landingVariant} />
                )}
              </div>
            </section>
          )}

          <CalculatorFaqSection items={article.faqs} heading="Frequently asked questions" />

          <section className="mt-10 border-t border-border/80 pt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Related</h2>
            <ul className="mt-3 space-y-2">
              {article.relatedSlugs.map((slug) => {
                const r = getResourceArticle(slug);
                if (!r) return null;
                return (
                  <li key={slug}>
                    <Link
                      href={`/resources/${slug}`}
                      className="text-sm font-medium text-foreground hover:underline"
                    >
                      {r.metaTitle}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 text-center text-sm text-muted">
              <Link href="/tools" className="font-medium text-foreground hover:underline">
                All calculators
              </Link>
              {" · "}
              <Link
                href="/investment-property-calculator"
                className="font-medium text-foreground hover:underline"
              >
                Investment property calculator
              </Link>
            </p>
          </section>
        </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
