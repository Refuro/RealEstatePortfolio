import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { PostHogAnalyticsProvider } from "@/components/analytics/posthog-provider";
import { PostHogIdentify } from "@/components/analytics/posthog-identify";
import { PostHogPageView } from "@/components/analytics/posthog-page-view";
import { PostHogSignupOnce } from "@/components/analytics/posthog-signup-once";
import { ThemeProvider } from "./(app)/settings/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://veldportfolio.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Veld Portfolio — Portfolio Analytics for Real Estate Investors",
    template: "%s | Veld Portfolio",
  },
  description:
    "Track and analyze your rental property portfolio. Equity, cash flow, rent and value estimates. Replace spreadsheets with Veld.",
  // favicon.png exists in public/; favicon-512.png does not
  icons: {
    icon: "/favicon.png",
  },
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
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://veldportfolio.com";
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
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://api.rentcast.io" />
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
          <PostHogAnalyticsProvider>
            <PostHogIdentify />
            <PostHogSignupOnce />
            <PostHogPageView />
            <ThemeProvider>{children}</ThemeProvider>
          </PostHogAnalyticsProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
