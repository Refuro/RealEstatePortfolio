import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { PostHogGate } from "@/components/analytics/posthog-provider";
import { CookieConsentProvider } from "@/components/consent/cookie-consent-provider";
import { CookieConsentBanner } from "@/components/consent/cookie-consent-banner";
import { GoogleAdsGtagClient } from "@/components/analytics/google-ads-gtag";
import { GoogleAdsSignupConversion } from "@/components/analytics/google-ads-signup-conversion";
import { GoogleAdsUserData } from "@/components/analytics/google-ads-user-data";
import { VercelAnalyticsClient } from "@/components/analytics/vercel-analytics";
import { ThemeProvider } from "./(app)/settings/theme-provider";
import { getAppOrigin } from "@/lib/app-url";
import { PRICING_DISPLAY } from "@/lib/pricing-display";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = getAppOrigin();

export const viewport: Viewport = {
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Veld Portfolio — Portfolio Analytics for Real Estate Investors",
    template: "%s | Veld Portfolio",
  },
  description:
    "Know if your rentals are actually performing. Track equity, cash flow, rent vs market, and evaluate new deals — built for small landlords.",
  icons: {
    icon: [
      { url: "/favicon-96x96.png?v=2", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg?v=2", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: [{ url: "/apple-touch-icon.png?v=2", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Veld Portfolio — Portfolio Analytics for Real Estate Investors",
    description:
      "Know if your rentals are actually performing. Track equity, cash flow, rent vs market, and evaluate new deals.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Veld Portfolio — Know if your rentals are actually performing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Veld Portfolio — Portfolio Analytics for Real Estate Investors",
    description:
      "Know if your rentals are actually performing. Track equity, cash flow, rent vs market, and evaluate new deals.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Veld Portfolio — Know if your rentals are actually performing",
      },
    ],
  },
};

function JsonLdScript() {
  const APP_URL = getAppOrigin();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${APP_URL}/#organization`,
        name: "Veld Portfolio",
        url: APP_URL,
        logo: `${APP_URL}/favicon.svg`,
        description:
          "Portfolio analytics for real estate investors. Track equity, cash flow, and metrics. Replace spreadsheets.",
      },
      {
        "@type": "WebSite",
        "@id": `${APP_URL}/#website`,
        name: "Veld Portfolio",
        url: APP_URL,
        publisher: { "@id": `${APP_URL}/#organization` },
      },
      {
        "@type": "WebApplication",
        name: "Veld Portfolio",
        url: APP_URL,
        operatingSystem: "Web Browser",
        applicationCategory: "FinanceApplication",
        description:
          "Portfolio analytics for real estate investors. Track equity, cash flow, rent and value estimates. Replace spreadsheets with Veld.",
        // Rich-result offers: prices shown are monthly (USD). Annual billing and tier limits are on /pricing and /terms; keep FAQ + pricing page as source of truth for full detail.
        offers: [
          {
            "@type": "Offer",
            name: "Free",
            price: "0",
            priceCurrency: "USD",
            description: "Monthly equivalent; no charge. Annual billing N/A.",
          },
          {
            "@type": "Offer",
            name: "Investor",
            price: String(PRICING_DISPLAY.investorMonthly),
            priceCurrency: "USD",
            description:
              "Price shown is monthly billing in USD; lower annual pricing available on the pricing page.",
          },
          {
            "@type": "Offer",
            name: "Pro",
            price: String(PRICING_DISPLAY.proMonthly),
            priceCurrency: "USD",
            description:
              "Price shown is monthly billing in USD; lower annual pricing available on the pricing page.",
          },
        ],
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#6366f1",
          colorPrimaryForeground: "#ffffff",
          borderRadius: "0.5rem",
        },
        elements: {
          formButtonPrimary: "bg-accent hover:bg-accent-hover text-accent-foreground",
        },
      }}
    >
      <html lang="en">
        <head>
          <meta name="apple-mobile-web-app-title" content="Veld" />
          {process.env.NEXT_PUBLIC_CLERK_PRECONNECT_ORIGIN ? (
            <link
              rel="preconnect"
              href={process.env.NEXT_PUBLIC_CLERK_PRECONNECT_ORIGIN}
              crossOrigin="anonymous"
            />
          ) : (
            <link rel="dns-prefetch" href="https://clerk.accounts.dev" />
          )}
          <link rel="dns-prefetch" href="https://js.stripe.com" />
          {process.env.NEXT_PUBLIC_POSTHOG_KEY ? (
            <link
              rel="preconnect"
              href={
                process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"
              }
            />
          ) : null}
          <JsonLdScript />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <CookieConsentProvider>
            <PostHogGate>
              <ThemeProvider>{children}</ThemeProvider>
            </PostHogGate>
            <GoogleAdsGtagClient />
            <GoogleAdsSignupConversion />
            <GoogleAdsUserData />
            <VercelAnalyticsClient />
            <CookieConsentBanner />
          </CookieConsentProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
