import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Next.js 16+ uses proxy.ts (not middleware.ts) for the network boundary.
 * This file is the auth proxy: protects non-public routes via Clerk.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sitemap.xml",
  "/robots.txt",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy",
  "/terms",
  "/pricing",
  "/investment-property-calculator",
  "/tools(.*)", // hub, /tools/brrr, /tools/str-vs-ltr, /tools/fix-and-flip, …
  "/alternatives(.*)", // hub + /alternatives/[slug] comparison pages
  "/vs(.*)", // hub + /vs/[slug] spreadsheet / Excel comparison pages
  "/resources(.*)", // hub + /resources/[slug] reference articles
  "/lp/investment-property-calculator",
  "/changelog",
  "/contact",
  "/api/billing/webhook",
  "/api/cron/onboarding-emails",
  "/api/cron/trial-emails",
  "/api/cron/rate-limit-cleanup",
  "/api/contact",
  "/api/csp-report",
  "/api/health",
  "/api/unsubscribe",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ico|woff2?|ttf|otf)).*)",
    "/(api|trpc)(.*)",
  ],
};
