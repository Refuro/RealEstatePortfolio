import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { LandingNav } from "@/components/landing-nav";
import { Footer } from "@/components/footer";
import { SupportContactInstructions } from "@/components/legal/support-contact-instructions";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://veldportfolio.com";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Veld Portfolio: using the portfolio analytics platform, accounts and data, Stripe subscriptions, refunds, cancellation, acceptable use, and liability limits.",
  alternates: { canonical: APP_URL + "/terms" },
  openGraph: {
    title: "Terms of Service | Veld Portfolio",
    description:
      "Terms of Service for Veld Portfolio: platform use, accounts, billing via Stripe, refunds, cancellation, and liability.",
    url: "/terms",
  },
};

export default async function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-muted">
          Last updated: March 2026
        </p>

        <div className="mt-8 space-y-6 text-base text-foreground">
          <section>
            <h2 className="text-lg font-semibold">Contracting party</h2>
            <p>
              The Service is operated by an individual doing business as{" "}
              <strong>Veld Portfolio</strong> (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;). You
              may see that name in the app, on Stripe receipts, and in these Terms. If the business is
              later operated through a registered entity (for example an LLC), we will update this
              section to name that entity.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Agreement</h2>
            <p>
              By signing up for or using Veld Portfolio (&quot;the Service&quot;), you agree to these Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Eligibility</h2>
            <p>
              You must be at least 18 years old to use this service. By using the Service, you represent that you meet this requirement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Description of Service</h2>
            <p>
              Veld Portfolio is a portfolio analytics platform for real estate investors. It helps you track properties, mortgages, and investment metrics. It is not property management software, tenant management, or financial advice. We do not guarantee the accuracy of estimates (e.g., rent or value estimates from third-party data) or investment outcomes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Account and Data</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and for the accuracy of data you enter. If you deactivate your account, we retain your data until you request permanent deletion. You can restore your account at any time by signing in and clicking &quot;Restore account.&quot; You can request permanent deletion at any time through the app; deletion is irreversible.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Subscriptions and Payments</h2>
            <p>
              Paid plans are billed through Stripe. You authorize us to charge your payment method (e.g., card) on a recurring basis according to your chosen plan. Prices are displayed in the app before checkout.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Refunds</h2>
            <p>
              Refund requests: contact support within 14 days of your first charge. Refunds are at our discretion. We do not refund partial months. For annual subscriptions, we may offer a prorated refund within 14 days of purchase if you contact support. Stripe processes refunds; we will initiate them when appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Cancellation</h2>
            <p>
              You may cancel your subscription at any time from Settings. If you cancel, you retain access until the end of your current billing period. We do not refund unused time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Acceptable Use</h2>
            <p>
              You agree not to use the Service for any illegal purpose, to violate any applicable laws, or to infringe on others&apos; rights. You may not attempt to gain unauthorized access to our systems or other users&apos; accounts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Limitation of Liability</h2>
            <p>
              The Service is provided &quot;as is.&quot; We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability is limited to the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Changes</h2>
            <p>
              We may update these Terms from time to time. We will post the updated Terms on this page and update the &quot;Last updated&quot; date. Continued use of the Service after changes constitutes acceptance. If you do not agree to changes, you may cancel your subscription and stop using the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Contact</h2>
            <p>
              For questions about these Terms,{" "}
              <SupportContactInstructions supportEmail={supportEmail} />
            </p>
          </section>
        </div>
      </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
