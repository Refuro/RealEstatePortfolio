import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { LandingNav } from "@/components/landing-nav";
import { Footer } from "@/components/footer";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://veldportfolio.com";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for Veld Portfolio — how we collect, use, and protect your data.",
  alternates: { canonical: APP_URL + "/privacy" },
  openGraph: {
    title: "Privacy Policy | Veld Portfolio",
    description:
      "Privacy policy for Veld Portfolio — how we collect, use, and protect your data.",
    url: "/privacy",
  },
};

export default async function PrivacyPage() {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNav userId={userId} />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <Link
            href={userId ? "/dashboard" : "/"}
            className="mb-8 inline-block text-sm text-muted hover:text-foreground"
          >
            ← {userId ? "Back to dashboard" : "Back to home"}
          </Link>
        <h1 className="text-2xl font-semibold text-foreground">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted">
          Last updated: March 2026
        </p>

        <div className="mt-8 space-y-6 text-base text-foreground">
          <section>
            <h2 className="text-lg font-semibold">Overview</h2>
            <p>
              Veld Portfolio (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is a portfolio analytics platform for real estate investors. This privacy policy explains what data we collect, how we use it, and your rights regarding your information. We are US-focused for now and do not target EU users specifically.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Data We Collect</h2>
            <p>
              We collect information you provide directly (e.g., property details, mortgage information, financial summaries) and data necessary to operate the service (e.g., account credentials, email, name). When you use our contact form, we collect your email, subject, and message to respond to your inquiry; we do not use this data for marketing. We use third-party services that process data on our behalf:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>
                <strong>Clerk</strong> — Authentication. Handles sign-in, sign-up, and account management. We receive your email, name, and Clerk user ID. Clerk uses cookies to store session tokens so you stay signed in; these cookies are required for the service to function and do not contain personally identifiable information by default.
              </li>
              <li>
                <strong>Stripe</strong> — Payments. When you subscribe, we process your payment through Stripe. We receive Stripe customer IDs and subscription status. Stripe handles card details; we do not store full payment card numbers.
              </li>
              <li>
                <strong>RentCast</strong> — Rent and value estimates. When you use &quot;Estimate rent&quot; or &quot;Estimate value,&quot; we send property addresses to RentCast for market data. We do not share your identity with RentCast.
              </li>
              <li>
                <strong>Vercel</strong> — Hosting. Our application runs on Vercel. Vercel may log requests and IP addresses for operational purposes.
              </li>
              <li>
                <strong>Neon</strong> — Database. We store your portfolio data (properties, mortgages, deals) in a PostgreSQL database hosted by Neon. Data is encrypted in transit and at rest.
              </li>
              <li>
                <strong>PostHog</strong> — Product analytics (e.g. page views, signup events).{" "}
                <strong>In the browser:</strong> we initialize PostHog only after you accept optional analytics via the in-app cookie banner; until then, no PostHog scripts load and no client analytics events are sent.{" "}
                <strong>On the server:</strong> when billing or account events occur, we may send a small number of product events to PostHog from our backend (e.g. after Stripe subscription updates) using your user id — these do not rely on the browser cookie banner. See also our cookie section below for client-side tracking.
              </li>
              <li>
                <strong>Google</strong> — When Google Ads is configured and you accept optional analytics/ads cookies, we load Google&apos;s tag (gtag.js) for measurement and conversion reporting. If you reject optional cookies, we do not load this tag. Google may use cookies or similar storage when the tag runs; see{" "}
                <a
                  href="https://policies.google.com/privacy"
                  className="text-primary underline underline-offset-2 hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google&apos;s Privacy Policy
                </a>
                {" "}and{" "}
                <a
                  href="https://policies.google.com/technologies/ads"
                  className="text-primary underline underline-offset-2 hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  how Google uses cookies in advertising
                </a>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Cookies</h2>
            <p>
              <strong>Essential.</strong> Our auth provider (Clerk) sets session cookies when you sign in so you remain signed in. These are required for the service and are not used for advertising analytics.
            </p>
            <p className="mt-4">
              <strong>Optional (analytics and ads measurement).</strong> We may set a first-party cookie recording your choice (accept or reject optional tracking). If you accept, we load PostHog and, when configured, Google Ads measurement scripts as described above. If you reject, those scripts do not load. You can change your choice anytime via the cookie banner (footer or Settings).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">How We Use Your Data</h2>
            <p>
              We use your data to provide the service, including calculating metrics, displaying charts, managing subscriptions, and responding to support requests. We do not sell your data to third parties. We may use aggregated, anonymized data for analytics or product improvement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Data Retention</h2>
            <p>
              We retain your data while your account is active. If you deactivate your account, we retain it until you request permanent deletion, as described in our Terms of Service. If you permanently delete your account, we remove your data from our systems and request deletion from Clerk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Your Rights</h2>
            <p>
              You can access, update, or delete your data through the app. You can export your portfolio data from Settings. You can deactivate your account (soft delete) or permanently delete it at any time. For requests we cannot fulfill in-app, contact us at the support email listed in the footer.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Security</h2>
            <p>
              We use industry-standard security practices: encryption in transit (HTTPS), secure storage of credentials, and access controls. We rely on our providers (Clerk, Stripe, Neon, Vercel) for their security commitments.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Changes</h2>
            <p>
              We may update this policy from time to time. We will post the updated policy on this page and update the &quot;Last updated&quot; date. Continued use of the service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Contact</h2>
            <p>
              For privacy-related questions, contact us at the support email in the app footer.
            </p>
          </section>
        </div>
      </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
