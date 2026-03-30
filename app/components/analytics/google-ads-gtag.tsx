"use client";

import Script from "next/script";
import { useCookieConsent } from "@/components/consent/cookie-consent-provider";

/** Loads gtag only after analytics/ads consent (and when env is set). */
export function GoogleAdsGtagClient() {
  const { hasAnalyticsConsent } = useCookieConsent();
  const id = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  if (!id || !hasAnalyticsConsent) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-gtag-init" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(id)});
`}
      </Script>
    </>
  );
}
