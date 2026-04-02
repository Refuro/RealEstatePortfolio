import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { ChevronLeft } from "lucide-react";
import { LandingNav } from "@/components/landing-nav";
import { Footer } from "@/components/footer";
import { ContactForm } from "./contact-form";
import { getAppOrigin } from "@/lib/app-url";

const APP_URL = getAppOrigin();

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Veld Portfolio — send us a message or email us directly.",
  robots: { index: false, follow: true },
  alternates: { canonical: APP_URL + "/contact" },
  openGraph: {
    title: "Contact | Veld Portfolio",
    description: "Contact Veld Portfolio — send us a message or email us directly.",
    url: "/contact",
  },
};

export default async function ContactPage() {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNav userId={userId} />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <Link
            href={userId ? "/dashboard" : "/"}
            className="mb-8 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" aria-hidden />
            {userId ? "Back to dashboard" : "Back to home"}
          </Link>
          <h1 className="text-2xl font-semibold text-foreground">Contact us</h1>
          <p className="mt-2 text-base text-muted">
            Have a question or feedback? Send us a message below. We aim to reply within{" "}
            <strong className="text-foreground">24 business hours</strong> (Monday–Friday, US
            business days, excluding holidays). We provide product and account support only—
            not tax, legal, or investment advice.
          </p>
          {!supportEmail?.trim() && (
            <p className="mt-3 text-sm text-muted">
              A public support email is not shown in every environment; this form is the reliable way
              to reach us when no mailto appears in the footer.
            </p>
          )}

          <div className="mt-8">
            <ContactForm />
          </div>

          {supportEmail && supportEmail.trim() && (
            <p className="mt-6 text-sm text-muted">
              Or email us directly at{" "}
              <a
                href={`mailto:${supportEmail.trim()}`}
                className="font-medium text-foreground hover:underline"
              >
                {supportEmail.trim()}
              </a>
            </p>
          )}
        </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
