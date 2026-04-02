import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { PostHogGate } from "@/components/analytics/posthog-provider";
import { CookieConsentProvider } from "@/components/consent/cookie-consent-provider";
import { CookieConsentBanner } from "@/components/consent/cookie-consent-banner";
import { GoogleAdsGtagClient } from "@/components/analytics/google-ads-gtag";
import { VercelAnalyticsClient } from "@/components/analytics/vercel-analytics";
import { ThemeProvider } from "./(app)/settings/theme-provider";
import { getAppOrigin } from "@/lib/app-url";
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
    "Track and analyze your rental property portfolio. Equity, cash flow, rent and value estimates. Replace spreadsheets with Veld.",
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Veld Portfolio — Portfolio Analytics for Real Estate Investors",
    description:
      "Track and analyze your rental property portfolio. Equity, cash flow, rent and value estimates.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Veld Portfolio — Portfolio analytics for real estate investors",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Veld Portfolio — Portfolio Analytics for Real Estate Investors",
    description:
      "Track and analyze your rental property portfolio. Equity, cash flow, rent and value estimates.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Veld Portfolio — Portfolio analytics for real estate investors",
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
        logo: `${APP_URL}/logo.png`,
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
        applicationCategory: "FinanceApplication",
        description:
          "Portfolio analytics for real estate investors. Track equity, cash flow, rent and value estimates. Replace spreadsheets with Veld.",
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
          <link rel="preconnect" href="https://api.rentcast.io" />
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
            <VercelAnalyticsClient />
            <CookieConsentBanner />
          </CookieConsentProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
